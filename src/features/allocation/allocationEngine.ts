import { ALLOCATION_WEIGHTS, NETWORK_RADIUS_KM } from '@/app/constants';
import { isCompatible } from '@/features/compatibility/compatibilityEngine';
import { calculateDistanceKm, calculateEtaMinutes } from '@/utils/distance';
import { calculateFefoScore, assessExpiryRisk, getHoursUntilExpiry } from '@/features/expiry/expiryEngine';
import { calculateFreshnessStatus, calculateConfidenceScore, getElapsedHoursSinceConfirmation } from '@/features/freshness/freshnessEngine';
import type { BloodBank } from '@/types/bloodBank';
import type { InventoryRecord } from '@/types/inventory';
import type { BloodRequest, RequestOffer, AllocationExplanation } from '@/types/request';

export interface EvaluationCandidate {
  bank: BloodBank;
  inventory: InventoryRecord;
  distanceKm: number;
  etaMinutes: number;
  hardConstraintsPassed: boolean;
  failReason?: string;
  score: number;
  explanation: AllocationExplanation;
}

/**
 * Runs the full RaktFlow allocation engine pipeline:
 * Hard constraints first, then soft greedy multi-factor ranking.
 */
export function evaluateAllocationSources(
  request: BloodRequest,
  banks: BloodBank[],
  inventoryList: InventoryRecord[]
): RequestOffer[] {
  const isEmergency = request.urgency === 'emergency' || request.urgency === 'critical';
  const candidates: EvaluationCandidate[] = [];

  for (const bank of banks) {
    if (bank.status === 'offline') continue;

    // 1. Distance check (50 km radius)
    const distanceKm = calculateDistanceKm(
      request.latitude,
      request.longitude,
      bank.latitude,
      bank.longitude
    );

    if (distanceKm > NETWORK_RADIUS_KM) {
      continue;
    }

    const etaMinutes = calculateEtaMinutes(distanceKm, isEmergency);

    // 2. Find compatible inventory records in this bank
    const matchingRecords = inventoryList.filter(
      (inv) =>
        inv.bankId === bank.id &&
        inv.component === request.component &&
        isCompatible(inv.bloodGroup, request.bloodGroup, request.component)
    );

    if (matchingRecords.length === 0) {
      continue;
    }

    // Pick the most relevant inventory item (or combine them)
    for (const inv of matchingRecords) {
      const hoursUntilExpiry = getHoursUntilExpiry(inv.nearestExpiry);
      const freshness = calculateFreshnessStatus(inv.lastConfirmedAt);
      const confidence = calculateConfidenceScore(inv.lastConfirmedAt);
      const expiryRisk = assessExpiryRisk(inv.nearestExpiry, inv.component);
      const elapsedHours = getElapsedHoursSinceConfirmation(inv.lastConfirmedAt);

      // --- HARD CONSTRAINTS ---
      let hardConstraintsPassed = true;
      let failReason: string | undefined = undefined;

      // H1: Biological compatibility
      if (!isCompatible(inv.bloodGroup, request.bloodGroup, inv.component)) {
        hardConstraintsPassed = false;
        failReason = 'Biological incompatibility';
      }
      // H2: Expired stock
      else if (hoursUntilExpiry !== null && hoursUntilExpiry <= 0) {
        hardConstraintsPassed = false;
        failReason = 'Reported units have already expired';
      }
      // H3: Cannot arrive before expiry
      else if (hoursUntilExpiry !== null && (etaMinutes / 60) >= hoursUntilExpiry) {
        hardConstraintsPassed = false;
        failReason = `ETA (${etaMinutes}m) exceeds remaining shelf life (${hoursUntilExpiry}h)`;
      }
      // H4: Transferable stock must exist
      else if (inv.transferableUnits <= 0) {
        hardConstraintsPassed = false;
        failReason = `Insufficient transferable stock (Available: ${inv.availableUnits}, Protected: ${inv.protectedUnits})`;
      }

      // --- SOFT RANKING SCORE (0 to 100) ---
      let score = 0;
      const reasons: string[] = [];
      const warnings: string[] = [];

      if (hardConstraintsPassed) {
        // Factor 1: Expiry / FEFO score (favor using near-expiry safe units)
        const fefoScore = calculateFefoScore(inv.nearestExpiry);
        const expiryComponentScore = fefoScore * 100;
        if (hoursUntilExpiry !== null && hoursUntilExpiry <= 24) {
          reasons.push(`Near-expiry stock prioritized (${hoursUntilExpiry}h left — FEFO optimization)`);
        }

        // Factor 2: Surplus vs Request size
        const fulfillRatio = Math.min(1.0, inv.transferableUnits / request.unitsNeeded);
        const surplusScore = fulfillRatio * 100;
        if (inv.transferableUnits >= request.unitsNeeded) {
          reasons.push(`Sufficient transferable stock (${inv.transferableUnits} units available)`);
        } else {
          warnings.push(`Can only fulfill ${inv.transferableUnits} of ${request.unitsNeeded} units requested`);
        }

        // Factor 3: Source Supply Health (Days of Stock)
        // A bank with 5 days of stock is safer to take from than one with 1.1 days
        const daysScore = Math.min(100, (inv.daysOfStock / 5) * 100);
        if (inv.daysOfStock >= 2.5) {
          reasons.push(`Source has safe local coverage (${inv.daysOfStock} days of stock)`);
        } else {
          warnings.push(`Source has tight buffer (${inv.daysOfStock} days of stock remaining)`);
        }

        // Factor 4: Inventory Freshness
        let freshnessScore = 100;
        if (freshness === 'aging') freshnessScore = 75;
        if (freshness === 'stale') freshnessScore = 40;
        if (freshness === 'confirmation_required') freshnessScore = 20;

        if (freshness === 'fresh') {
          reasons.push(`Inventory verified recently (${elapsedHours < 1 ? 'just now' : `${elapsedHours}h ago`})`);
        } else if (freshness === 'stale') {
          warnings.push(`Inventory unverified for ${elapsedHours}h (confidence penalized)`);
        }

        // Factor 5: Stock Confidence Score
        const confidenceScoreVal = confidence;

        // Factor 6: ETA & Distance
        // 50km max -> 0km is 100, 50km is 0
        const distanceScore = Math.max(0, 100 - (distanceKm / NETWORK_RADIUS_KM) * 100);
        const etaScore = Math.max(0, 100 - (etaMinutes / 60) * 100);
        reasons.push(`Proximity: ${distanceKm} km · ETA ${etaMinutes} min`);

        // Weighted total calculation
        score =
          ALLOCATION_WEIGHTS.expiryRisk * expiryComponentScore +
          ALLOCATION_WEIGHTS.surplus * surplusScore +
          ALLOCATION_WEIGHTS.demand * daysScore +
          ALLOCATION_WEIGHTS.freshness * freshnessScore +
          ALLOCATION_WEIGHTS.confidence * confidenceScoreVal +
          ALLOCATION_WEIGHTS.eta * etaScore +
          ALLOCATION_WEIGHTS.distance * distanceScore;

        score = Math.round(score * 10) / 10;
      } else {
        score = 0;
        warnings.push(failReason || 'Constraint check failed');
      }

      const explanation: AllocationExplanation = {
        compatible: isCompatible(inv.bloodGroup, request.bloodGroup, inv.component),
        transferableUnits: inv.transferableUnits,
        sourceDaysOfStock: inv.daysOfStock,
        recipientDaysOfStock: 0.5,
        freshnessMinutes: Math.round(elapsedHours * 60),
        confidence,
        etaMinutes,
        expiryRisk,
        reasons,
        warnings,
        hardConstraintsPassed,
      };

      candidates.push({
        bank,
        inventory: inv,
        distanceKm,
        etaMinutes,
        hardConstraintsPassed,
        failReason,
        score,
        explanation,
      });
    }
  }

  // Sort candidates:
  // First valid passed sources sorted descending by score;
  // then ineligible sources sorted by distance
  candidates.sort((a, b) => {
    if (a.hardConstraintsPassed && !b.hardConstraintsPassed) return -1;
    if (!a.hardConstraintsPassed && b.hardConstraintsPassed) return 1;
    if (a.hardConstraintsPassed && b.hardConstraintsPassed) {
      return b.score - a.score;
    }
    return a.distanceKm - b.distanceKm;
  });

  // Map to RequestOffer structure
  return candidates.map((cand, index) => {
    return {
      id: `offer-${cand.bank.id}-${index}`,
      requestId: request.id,
      bankId: cand.bank.id,
      bankName: cand.bank.name,
      bloodGroup: cand.inventory.bloodGroup,
      component: cand.inventory.component,
      offeredUnits: Math.min(request.unitsNeeded, cand.inventory.transferableUnits),
      rank: index + 1,
      score: cand.score,
      distanceKm: cand.distanceKm,
      etaMinutes: cand.etaMinutes,
      transferableUnits: cand.inventory.transferableUnits,
      protectedUnits: cand.inventory.protectedUnits,
      sourceDaysOfStock: cand.inventory.daysOfStock,
      freshnessStatus: cand.inventory.freshnessStatus,
      confidenceScore: cand.explanation.confidence,
      expiryRisk: cand.explanation.expiryRisk,
      demandTrend: cand.inventory.demandTrend,
      explanation: cand.explanation,
      status: index === 0 && cand.hardConstraintsPassed ? 'sent' : 'pending',
      createdAt: new Date().toISOString(),
    };
  });
}
