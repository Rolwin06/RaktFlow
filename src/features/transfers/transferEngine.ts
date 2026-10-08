import { isCompatible } from '@/features/compatibility/compatibilityEngine';
import { calculateDistanceKm, calculateEtaMinutes } from '@/utils/distance';
import { getHoursUntilExpiry } from '@/features/expiry/expiryEngine';
import type { BloodBank } from '@/types/bloodBank';
import type { InventoryRecord } from '@/types/inventory';
import type { TransferRecommendation } from '@/types/transfer';

/**
 * Finds optimal proactive transfer recommendations across the blood bank network:
 * Pairs banks with surplus / expiring stock with banks projecting shortages.
 */
export function findTransferRecommendations(
  banks: BloodBank[],
  inventoryList: InventoryRecord[]
): TransferRecommendation[] {
  const recommendations: TransferRecommendation[] = [];
  const bankMap = new Map<string, BloodBank>(banks.map((b) => [b.id, b]));

  // 1. Identify shortage banks: daysOfStock < 1.5 and availableUnits < 4
  const shortageRecords = inventoryList.filter(
    (inv) => inv.daysOfStock < 1.5 && inv.availableUnits < 5
  );

  // 2. Identify surplus banks: transferableUnits >= 2 and (daysOfStock >= 2.5 or expiring within 36h)
  const surplusRecords = inventoryList.filter(
    (inv) => inv.transferableUnits >= 2
  );

  for (const shortage of shortageRecords) {
    const recipientBank = bankMap.get(shortage.bankId);
    if (!recipientBank || recipientBank.status === 'offline') continue;

    for (const surplus of surplusRecords) {
      if (surplus.bankId === shortage.bankId) continue;

      const sourceBank = bankMap.get(surplus.bankId);
      if (!sourceBank || sourceBank.status === 'offline') continue;

      // Must be same component and compatible blood group
      if (surplus.component !== shortage.component) continue;
      if (!isCompatible(surplus.bloodGroup, shortage.bloodGroup, surplus.component)) continue;

      // Distance & transit
      const distanceKm = calculateDistanceKm(
        sourceBank.latitude,
        sourceBank.longitude,
        recipientBank.latitude,
        recipientBank.longitude
      );

      if (distanceKm > 50) continue; // within 50 km network

      const etaMinutes = calculateEtaMinutes(distanceKm, false);
      const sourceExpiryHours = getHoursUntilExpiry(surplus.nearestExpiry);

      // Verify transit ETA is well before expiry
      if (sourceExpiryHours !== null && (etaMinutes / 60) >= sourceExpiryHours) {
        continue;
      }

      // Quantity to transfer: up to 3 units, or what surplus allows
      const transferUnits = Math.min(3, surplus.transferableUnits);
      if (transferUnits <= 0) continue;

      // Reason computation
      const isExpiringSoon = sourceExpiryHours !== null && sourceExpiryHours <= 36;
      let reason = `Projected surplus at ${sourceBank.shortName}`;
      if (isExpiringSoon) {
        reason += ` (${sourceExpiryHours}h until expiry — salvage priority)`;
      }
      reason += ` + severe shortage at ${recipientBank.shortName} (${shortage.daysOfStock}d coverage)`;

      const score = Math.round(
        (100 - distanceKm) * 0.4 +
        (isExpiringSoon ? 50 : 20) +
        (1.5 - shortage.daysOfStock) * 20
      );

      recommendations.push({
        sourceBankId: sourceBank.id,
        sourceBankName: sourceBank.name,
        destinationBankId: recipientBank.id,
        destinationBankName: recipientBank.name,
        bloodGroup: surplus.bloodGroup,
        component: surplus.component,
        units: transferUnits,
        reason,
        sourceTransferable: surplus.transferableUnits,
        sourceExpiry: sourceExpiryHours,
        recipientDaysOfStock: shortage.daysOfStock,
        distanceKm,
        etaMinutes,
        score,
        expectedImpact: {
          unitsSaved: transferUnits,
          shortageRiskReduced: true,
          wastageReduced: isExpiringSoon ? transferUnits : 0,
        },
      });
    }
  }

  // Sort by highest score first
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations;
}
