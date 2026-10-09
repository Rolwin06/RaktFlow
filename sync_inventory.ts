import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { seedInventory } from './src/data/seed/inventory';

// Simple .env.local parser
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncInventory() {
  console.log('Clearing existing inventory...');
  
  // Delete all rows
  const { error: deleteError } = await supabase.from('inventory').delete().neq('id', 'DUMMY_ID_NEVER_MATCHES');
  
  if (deleteError) {
    console.error('Failed to delete existing inventory:', deleteError);
    return;
  }
  
  console.log('Existing inventory cleared.');
  console.log(`Inserting ${seedInventory.length} seed records...`);

  for (const record of seedInventory) {
    const row = {
      id: record.id,
      bank_id: record.bankId,
      blood_group: record.bloodGroup,
      component: record.component,
      available_units: record.availableUnits,
      reserved_units: record.reservedUnits,
      protected_units: record.protectedUnits,
      transferable_units: record.transferableUnits,
      average_daily_usage: record.averageDailyUsage,
      average_daily_donations: record.averageDailyDonations,
      days_of_stock: record.daysOfStock,
      stock_status: record.stockStatus,
      freshness_status: record.freshnessStatus,
      confidence_score: record.confidenceScore,
      last_confirmed_at: record.lastConfirmedAt,
      nearest_expiry: record.nearestExpiry,
      expiring_within_24h: record.expiringWithin24h,
      expiring_within_48h: record.expiringWithin48h,
      demand_trend: record.demandTrend,
      updated_at: record.updatedAt,
    };

    const { error: insertError } = await supabase.from('inventory').insert(row);
    if (insertError) {
      console.error(`Failed to insert record ${record.id}:`, insertError);
    } else {
      console.log(`Inserted ${record.id}`);
    }
  }

  console.log('Inventory sync completed successfully.');
}

syncInventory();
