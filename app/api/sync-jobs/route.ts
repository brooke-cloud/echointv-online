// app/api/sync-jobs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncAllCompanies } from '@/lib/jobs/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handleSync(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  const authHeader = req.headers.get('authorization');
  const tokenQuery = req.nextUrl.searchParams.get('token');
  const isReset = req.nextUrl.searchParams.get('reset') === 'true';

  /*
   * 安全保护：
   * reset=true 暂时禁止通过 API 执行，避免误删整个 Job 表。
   */
  if (isReset) {
    return NextResponse.json(
      {
        success: false,
        error: 'Reset is disabled for safety.',
      },
      { status: 400 }
    );
  }

  /*
   * CRON_SECRET 存在时必须进行鉴权。
   */
  if (cronSecret) {
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      tokenQuery === cronSecret;

    if (!isAuthorized) {
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
    const startedAt = Date.now();

    /*
     * 执行全部公司的岗位同步。
     */
    const result = await syncAllCompanies();

    /*
     * result 本身已经包含 success。
     * 所以这里不要再写：
     *
     * success: result.success
     *
     * 否则 TypeScript 会报 TS2783。
     */
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error || 'Sync failed');

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}