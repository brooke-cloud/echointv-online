// app/api/sync-jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncAllCompanies } from '@/lib/jobs/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 允许长时任务运行

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const tokenQuery = req.nextUrl.searchParams.get('token');
  const isReset = req.nextUrl.searchParams.get('reset') === 'true';

  // 1. 安全鉴权（支持 Vercel Cron 内置请求头校验与手动 Token）
  if (cronSecret && !isReset) {
    const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron');
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      tokenQuery === cronSecret ||
      isVercelCron;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // 2. 如果携带 ?reset=true，彻底清空现有 Job 表再同步
    let deletedCount = 0;
    if (isReset) {
      const deleted = await prisma.job.deleteMany();
      deletedCount = deleted.count;
    }

    // 3. 执行全量公司官方 ATS 调度同步
    const result = await syncAllCompanies();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      resetExecuted: isReset,
      deletedOldJobs: deletedCount,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}