import { getActiveCompanyConfigs } from '@/lib/jobs/company-config';
import { verifyAllCompanySources } from '@/lib/jobs/source-verifier';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationPage() {
  const companies = getActiveCompanyConfigs();
  const results = await verifyAllCompanySources(companies);
  const verifiedCount = results.filter((item) => item.status === 'VERIFIED').length;
  const partialCount = results.filter((item) => item.status === 'PARTIAL').length;
  const failedCount = results.filter((item) => item.status === 'FAILED').length;
  const totalSourceJobs = results.reduce((sum, item) => sum + item.sourceTargetTotal, 0);
  const totalDatabaseJobs = results.reduce((sum, item) => sum + item.databaseTargetTotal, 0);
  const totalDeadLinks = results.reduce((sum, item) => sum + item.urlVerification.dead, 0);
  const totalWarnings = results.reduce((sum, item) => sum + item.warnings.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Source Verification
        </h1>
        <p className="text-sm text-gray-500">
          检查官网岗位源、数据库岗位数量、New Grad / Intern 分类以及职位链接状态。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Verified
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {verifiedCount}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Partial
          </div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {partialCount}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Failed
          </div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {failedCount}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Warnings
          </div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {totalWarnings}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">
            Source Target Jobs
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {totalSourceJobs}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">
            Database Target Jobs
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {totalDatabaseJobs}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">
            Difference
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {totalSourceJobs - totalDatabaseJobs}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">
            Dead URLs
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {totalDeadLinks}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        {results.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-lg font-bold text-gray-900">
              没有可验证的公司
            </div>
            <div className="mt-2 text-sm text-gray-500">
              当前没有启用的公司配置。
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    ATS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Source
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Database
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Difference
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Intern
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    New Grad
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Dead URLs
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Warnings
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {results.map((result) => {
                  const statusClass =
                    result.status === 'VERIFIED'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : result.status === 'PARTIAL'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <tr
                      key={`${result.slug}-${result.ats}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900">
                          {result.company}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {result.slug}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-xs font-semibold text-gray-600">
                        {result.ats}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
                        >
                          {result.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right font-semibold text-gray-900">
                        {result.sourceTargetTotal}
                      </td>

                      <td className="px-6 py-5 text-right font-semibold text-gray-900">
                        {result.databaseTargetTotal}
                      </td>

                      <td
                        className={`px-6 py-5 text-right font-bold ${
                          result.difference === 0
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {result.difference > 0
                          ? `+${result.difference}`
                          : result.difference}
                      </td>

                      <td className="px-6 py-5 text-right text-gray-700">
                        {result.sourceInternCount}
                        <span className="text-gray-300"> / </span>
                        {result.databaseInternCount}
                      </td>

                      <td className="px-6 py-5 text-right text-gray-700">
                        {result.sourceNewGradCount}
                        <span className="text-gray-300"> / </span>
                        {result.databaseNewGradCount}
                      </td>

                      <td
                        className={`px-6 py-5 text-right font-semibold ${
                          result.urlVerification.dead > 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {result.urlVerification.dead}
                      </td>

                      <td className="px-6 py-5 text-right">
                        {result.warnings.length === 0 ? (
                          <span className="font-semibold text-green-600">
                            0
                          </span>
                        ) : (
                          <span className="font-semibold text-orange-600">
                            {result.warnings.length}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {results.some((result) => result.warnings.length > 0) && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="text-lg font-bold text-orange-900">
            Verification Warnings
          </h2>
          <div className="mt-4 space-y-4">
            {results
              .filter((result) => result.warnings.length > 0)
              .map((result) => (
                <div
                  key={`${result.slug}-warnings`}
                  className="rounded-2xl border border-orange-200 bg-white p-4"
                >
                  <div className="font-bold text-gray-900">
                    {result.company}
                  </div>
                  <div className="mt-2 space-y-1">
                    {result.warnings.map((warning, index) => (
                      <div
                        key={`${result.slug}-warning-${index}`}
                        className="text-sm text-orange-800"
                      >
                        • {warning}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}