import { syncCompany } from '@/lib/jobs/sync';
import { COMPANY_CONFIGS } from '@/lib/jobs/company-config';

async function test() {
  const stripe = COMPANY_CONFIGS.find(c => c.name === 'Stripe');
  if (stripe) {
    const result = await syncCompany(stripe);
    console.log('Sync result:', result);
  }
}

test();