// lib/jobs/adapters/types.ts

export type SupportedAts =
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'custom';

export type AtsFetchStatus =
  | 'COMPLETE'
  | 'PARTIAL'
  | 'FAILED';

export interface NormalizedJob {
  reqId: string;
  externalJobId: string;

  company: string;
  companyName: string;
  companySlug: string;

  title: string;

  location: string;
  locations?: string[];

  isRemote: boolean;

  department?: string;
  team?: string;

  employmentType?: string;

  category: string;
  track: string;

  level?: string;

  salary?: string;

  description?: string;

  jobUrl?: string;
  applyUrl: string;

  postedAt: Date;

  source: string;
  ats: string;
}

/**
 * ATS 数据源的一次完整抓取结果。
 *
 * 这个对象和 NormalizedJob[] 不同：
 *
 * NormalizedJob[]:
 *   只表示“我们拿到了哪些职位”
 *
 * AtsFetchResult:
 *   除了职位，还表示：
 *   - 请求是否成功
 *   - 数据是否完整
 *   - 是否发生分页
 *   - 是否还有下一页
 *   - 实际抓取数量
 *   - 原始数据数量（如果 ATS 提供）
 *
 * 只有 sourceComplete === true，
 * sync 层才允许把“本次结果”当作完整官方快照，
 * 从而安全地进行 missing-job reconciliation。
 */
export interface AtsFetchResult {
  /**
   * 标准化后的职位。
   */
  jobs: NormalizedJob[];

  /**
   * 本次抓取状态。
   *
   * COMPLETE:
   *   已确认拿到完整数据。
   *
   * PARTIAL:
   *   请求成功，但无法证明数据完整，
   *   或分页没有全部完成。
   *
   * FAILED:
   *   数据源请求失败或响应无效。
   */
  status: AtsFetchStatus;

  /**
   * 是否确认拿到了完整的官方职位集合。
   *
   * 这是最重要的安全开关。
   *
   * false 时：
   *   绝对不能因为某个职位“不在本次结果里”
   *   就直接把数据库职位关闭。
   */
  sourceComplete: boolean;

  /**
   * ATS 返回的原始职位数量。
   *
   * 如果 API 没有提供独立 raw count，
   * 可以使用最终抓取数量。
   */
  rawCount?: number;

  /**
   * 实际成功标准化的职位数量。
   */
  fetchedCount: number;

  /**
   * 本次请求是否发生分页。
   */
  paginated?: boolean;

  /**
   * 是否还有下一页。
   *
   * 对支持 cursor/offset pagination 的 ATS，
   * 最终完成时应该是 false。
   */
  hasMore?: boolean;

  /**
   * 下一页 cursor。
   *
   * 如果最终已经完成，可以为空。
   */
  nextCursor?: string;

  /**
   * 数据源返回的错误信息。
   */
  error?: string;

  /**
   * 本次抓取完成时间。
   */
  fetchedAt: Date;
}

/**
 * ATS Adapter 的基础接口。
 *
 * 为了兼容目前已经存在的 adapter，
 * fetchJobs 仍然保留。
 *
 * 新的完整同步逻辑使用 fetchJobsDetailed。
 */
export interface AtsAdapter {
  /**
   * 旧接口：
   * 返回标准化职位数组。
   */
  fetchJobs(
    companyName: string,
    companySlug: string,
    identifier: string
  ): Promise<NormalizedJob[]>;

  /**
   * 新接口：
   * 返回包含完整性信息的 ATS 抓取结果。
   *
   * Adapter 应该优先实现这个接口。
   */
  fetchJobsDetailed?(
    companyName: string,
    companySlug: string,
    identifier: string
  ): Promise<AtsFetchResult>;
}