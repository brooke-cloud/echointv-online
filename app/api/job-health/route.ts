// app/api/job-health/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveCompanyConfigs,
} from '@/lib/jobs/company-config';
import {
  verifyCompanySource,
} from '@/lib/jobs/source-verifier';

export const dynamic = 'force-dynamic';

export const maxDuration = 120;

export async function GET(
  req: NextRequest
) {
  const authHeader =
    req.headers.get('authorization');

  const cronSecret =
    process.env.CRON_SECRET;

  const token =
    req.nextUrl.searchParams.get(
      'token'
    );

  if (cronSecret) {
    const authorized =
      authHeader ===
        `Bearer ${cronSecret}` ||
      token === cronSecret ||
      req.headers
        .get('user-agent')
        ?.includes('vercel-cron');

    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }
  }

  try {
    const companies =
      getActiveCompanyConfigs();

    const results =
      await Promise.all(
        companies.map((company) =>
          verifyCompanySource(
            company
          )
        )
      );

    const verified =
      results.filter(
        (item) =>
          item.status ===
          'VERIFIED'
      ).length;

    const partial =
      results.filter(
        (item) =>
          item.status ===
          'PARTIAL'
      ).length;

    const failed =
      results.filter(
        (item) =>
          item.status ===
          'FAILED'
      ).length;

    const success =
      failed === 0 &&
      partial === 0;

    return NextResponse.json({
      success,

      timestamp:
        new Date().toISOString(),

      summary: {
        totalCompanies:
          results.length,

        verified,
        partial,
        failed,

        accuracyRate:
          results.length === 0
            ? 0
            : Number(
                (
                  (verified /
                    results.length) *
                  100
                ).toFixed(2)
              ),
      },

      companies: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'Job health check failed',
      },
      { status: 500 }
    );
  }
}