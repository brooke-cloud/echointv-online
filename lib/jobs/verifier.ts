// lib/jobs/verifier.ts

/**
 * 官方岗位链接存活探测器 (Liveness Probe)
 * 使用极轻量的 HEAD 请求探测目标官网是否仍然返回 200 OK
 */
export async function verifyJobUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4秒超时

    const resp = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // 200-399 视为有效链接，404/410/500 则视为死链
    return resp.status >= 200 && resp.status < 400;
  } catch (error) {
    // 若对方服务器禁用了 HEAD 请求，降级返回 true，避免误杀
    return true;
  }
}