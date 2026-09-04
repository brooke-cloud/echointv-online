import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { getActiveCompanyConfigs } from '@/lib/jobs/company-config';
import { verifyAllCompanySources } from '@/lib/jobs/source-verifier';

async function main() {
  const startedAt = Date.now();
  const companies = getActiveCompanyConfigs();
  console.log('='.repeat(80));
  console.log('Echo INTV Source Verification');
  console.log('='.repeat(80));
  console.log(`Companies: ${companies.length}`);
  console.log('');
  const results = await verifyAllCompanySources(companies);
  let verified = 0;
  let partial = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === 'VERIFIED') verified++;
    if (result.status === 'PARTIAL') partial++;
    if (result.status === 'FAILED') failed++;
    console.log('-'.repeat(80));
    console.log(`Company: ${result.company}`);
    console.log(`Slug: ${result.slug}`);
    console.log(`ATS: ${result.ats}`);
    console.log(`Status: ${result.status}`);
    console.log(`Source Complete: ${result.sourceComplete}`);
    console.log(`Source Total: ${result.sourceTotal}`);
    console.log(`Source Target: ${result.sourceTargetTotal}`);
    console.log(`Source Intern: ${result.sourceInternCount}`);
    console.log(`Source New Grad: ${result.sourceNewGradCount}`);
    console.log(`Database Target: ${result.databaseTargetTotal}`);
    console.log(`Database Intern: ${result.databaseInternCount}`);
    console.log(`Database New Grad: ${result.databaseNewGradCount}`);
    console.log(`Difference: ${result.difference}`);
    console.log(`Count Matched: ${result.countMatched}`);
    console.log(`URL Total: ${result.urlVerification.total}`);
    console.log(`URL Active: ${result.urlVerification.active}`);
    console.log(`URL Dead: ${result.urlVerification.dead}`);
    console.log(`URL Blocked: ${result.urlVerification.blocked}`);
    console.log(`URL Timeout: ${result.urlVerification.timeout}`);
    console.log(`URL Error: ${result.urlVerification.error}`);
    console.log(`URL Unknown: ${result.urlVerification.unknown}`);
    console.log(`Warnings: ${result.warnings.length}`);
    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.log(`  - ${warning}`);
      }
    }
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
  }
  console.log('');
  console.log('='.repeat(80));
  console.log('Verification Summary');
  console.log('='.repeat(80));
  console.log(`Total: ${results.length}`);
  console.log(`VERIFIED: ${verified}`);
  console.log(`PARTIAL: ${partial}`);
  console.log(`FAILED: ${failed}`);
  console.log(`Duration: ${Date.now() - startedAt}ms`);
  console.log('');
  console.log('Full JSON Result:');
  console.log(JSON.stringify(results, null, 2));
  if (failed > 0) {
    process.exitCode = 1;
  }
}
main()
  .catch((error: unknown) => {
    console.error('Source verification test failed.');
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });