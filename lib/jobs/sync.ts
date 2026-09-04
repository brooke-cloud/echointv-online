// lib/jobs/sync.ts
import { prisma } from '@/lib/prisma';
import { CompanyConfig, getActiveCompanyConfigs } from './company-config';
import { fetchJobsByAts, NormalizedJob } from './adapters';
import { classifyTargetJob } from './target-classifier';
import { fetchMetaJobs, fetchByteDanceJobs, fetchNvidiaJobs, fetchTeslaJobs, fetchAppleJobs } from './custom-fetchers';
export interface CompanySyncResult {
  company:string;
  slug:string;
  ats:string;
  status:'SUCCESS'|'FAILED'|'SKIPPED';
  fetchedCount:number;
  newCount:number;
  updatedCount:number;
  unchangedCount:number;
  closedCount:number;
  skippedCloseCount:number;
  warningCount:number;
  warnings:string[];
  error?:string;
  durationMs:number;
}
export interface SyncResult {
  success:boolean;
  totalCompanies:number;
  succeededCompanies:number;
  failedCompanies:number;
  totalFetched:number;
  totalNew:number;
  totalUpdated:number;
  totalUnchanged:number;
  totalClosed:number;
  totalSkippedClose:number;
  totalDurationMs:number;
  details:CompanySyncResult[];
}
const FETCH_TIMEOUT_MS = 15000;
const NEVER_CLOSE_ON_EMPTY_RESULT = true;
const OFFICIAL_ATS = new Set(['GREENHOUSE','LEVER','ASHBY']);
const BROWSER_HEADERS = {
  'User-Agent':'Mozilla/5.0 Chrome/128 Safari/537',
  Accept:'application/json,text/plain,*/*',
  'Accept-Language':'en-US,en;q=0.9',
};
function normalizeAts(value:string|null|undefined){
  return String(value || '').trim().toUpperCase();
}
function getJobExternalId(job:NormalizedJob){
  return String(job.externalJobId || job.reqId || '').trim();
}
function normalizeDate(value:unknown){
  if(value instanceof Date){
    return value;
  }
  if(typeof value === 'string' || typeof value === 'number'){
    const date = new Date(value);
    if(!Number.isNaN(date.getTime())){
      return date;
    }
  }
  return new Date();
}
function normalizeString(value:unknown){
  return String(value || '').trim();
}
function normalizeLocations(locations:string[]|undefined,fallback:string){
  return Array.from(new Set([...(locations || []),fallback].map(item => String(item || '').trim()).filter(Boolean)));
}
function normalizeJobClassification(job:NormalizedJob):NormalizedJob{
  const result = classifyTargetJob({
    title:job.title || '',
    description:job.description || '',
    department:job.department || '',
    employmentType:job.employmentType || '',
    level:job.level || '',
  });
  if(result.type === 'Intern'){
    return {...job,employmentType:'Intern',level:'Intern'};
  }
  if(result.type === 'New Grad'){
    return {...job,employmentType:'New Grad',level:'New Grad'};
  }
  return {...job,employmentType:job.employmentType || undefined,level:job.level || undefined};
}
function isUsableIncomingJob(job:NormalizedJob){
  if(!job){
    return false;
  }
  return Boolean(normalizeString(job.title) && getJobExternalId(job) && normalizeString(job.applyUrl || job.jobUrl));
}
interface SourceFetchResult {
  jobs:NormalizedJob[];
  sourceComplete:boolean;
  sourceSucceeded:boolean;
  error?:string;
}
async function fetchWithTimeout(company:CompanyConfig):Promise<SourceFetchResult>{
  const ats = normalizeAts(company.ats);
  try{
    const fetchPromise = ats === 'CUSTOM' ? fetchCustomCompanyJobs(company) : fetchJobsByAts(company.name,company.slug,company.ats.toLowerCase() as any,company.identifier);
    const result = await Promise.race([fetchPromise,new Promise<any>((_,reject) => { setTimeout(() => { reject(new Error(`Job source timeout after ${FETCH_TIMEOUT_MS}ms`)); },FETCH_TIMEOUT_MS); })]);
    const jobs = Array.isArray(result) ? result : result.jobs || [];
    const map = new Map<string,NormalizedJob>();
    for(const raw of jobs){
      if(!isUsableIncomingJob(raw)){
        continue;
      }
      const normalized = normalizeJobClassification(raw);
      map.set(getJobExternalId(normalized),normalized);
    }
    const normalizedJobs = Array.from(map.values());
    const sourceComplete = OFFICIAL_ATS.has(ats) && !(NEVER_CLOSE_ON_EMPTY_RESULT && normalizedJobs.length === 0);
    return {jobs:normalizedJobs,sourceComplete,sourceSucceeded:true};
  }catch(error:any){
    return {jobs:[],sourceComplete:false,sourceSucceeded:false,error:error.message || 'Fetch failed'};
  }
}
async function fetchCustomCompanyJobs(company:CompanyConfig):Promise<NormalizedJob[]>{
  const slug = normalizeString(company.slug).toLowerCase();
  const name = normalizeString(company.name).toLowerCase();
  if(slug.includes('google') || name.includes('google')){
    return fetchGoogleJobs(company);
  }
  if(slug.includes('amazon') || name.includes('amazon')){
    return fetchAmazonJobs(company);
  }
  if(slug.includes('microsoft') || name.includes('microsoft')){
    return fetchMicrosoftJobs(company);
  }
  if(slug.includes('meta') || name.includes('meta') || name.includes('facebook')){
    return fetchMetaJobs(company);
  }
  if(slug.includes('bytedance') || slug.includes('tiktok') || name.includes('tiktok')){
    return fetchByteDanceJobs(company);
  }
  if(slug.includes('nvidia') || name.includes('nvidia')){
    return fetchNvidiaJobs(company);
  }
  if(slug.includes('tesla') || name.includes('tesla')){
    return fetchTeslaJobs(company);
  }
  if(slug.includes('apple') || name.includes('apple')){
    return fetchAppleJobs(company);
  }
  return [];
}
async function fetchGoogleJobs(company:CompanyConfig):Promise<NormalizedJob[]>{
  const response = await fetch('https://careers.google.com/api/v3/search/?j=Software%20Engineer&location=United%20States',{headers:BROWSER_HEADERS});
  if(!response.ok){
    throw new Error(`Google API ${response.status}`);
  }
  const data = await response.json();
  return (data?.jobs || []).map((job:any) => {
    const id = String(job.id || '');
    const url = job.apply_url || `https://careers.google.com/jobs/results/${id}`;
    return {
      reqId:id,
      externalJobId:id,
      company:company.name,
      companyName:company.name,
      companySlug:company.slug,
      title:job.title || '',
      location:job.locations?.[0]?.display_name || 'United States',
      locations:[],
      isRemote:false,
      department:'Engineering',
      team:'Engineering',
      employmentType:job.employmentType || job.employment_type || job.jobType || job.job_type || undefined,
      category:'Engineering',
      track:'Fullstack',
      level:job.level || job.jobLevel || job.experienceLevel || job.experience_level || undefined,
      description:job.summary || '',
      jobUrl:url,
      applyUrl:url,
      postedAt:normalizeDate(job.created),
      source:'custom',
      ats:'custom',
    };
  });
}
async function fetchAmazonJobs(company:CompanyConfig):Promise<NormalizedJob[]>{
  const response = await fetch('https://www.amazon.jobs/en/search.json?category[]=software-development&country[]=USA',{headers:BROWSER_HEADERS});
  if(!response.ok){
    throw new Error(`Amazon API ${response.status}`);
  }
  const data = await response.json();
  return (data?.jobs || []).map((job:any) => {
    const id = String(job.id || job.id_icims || '');
    const url = job.job_path ? `https://www.amazon.jobs${job.job_path}` : 'https://www.amazon.jobs';
    return {
      reqId:id,
      externalJobId:id,
      company:company.name,
      companyName:company.name,
      companySlug:company.slug,
      title:job.title || '',
      location:job.location || 'United States',
      locations:[],
      isRemote:false,
      department:job.department || job.category || 'Software Development',
      team:job.team || 'Engineering',
      employmentType:job.employmentType || job.employment_type || job.jobType || job.job_type || undefined,
      category:'Engineering',
      track:'Fullstack',
      level:job.level || job.jobLevel || job.experienceLevel || job.experience_level || undefined,
      description:job.description || '',
      jobUrl:url,
      applyUrl:url,
      postedAt:normalizeDate(job.posted_date),
      source:'custom',
      ats:'custom',
    };
  });
}
async function fetchMicrosoftJobs(company:CompanyConfig):Promise<NormalizedJob[]>{
  const response = await fetch('https://gcsservices.careers.microsoft.com/search/api/v1/search?lc=United%20States&p=Software%20Engineering',{headers:BROWSER_HEADERS});
  if(!response.ok){
    throw new Error(`Microsoft API ${response.status}`);
  }
  const data = await response.json();
  const jobs = data?.operationResult?.result?.jobs || [];
  return jobs.map((job:any) => {
    const id = String(job.jobId || job.id || '');
    const url = `https://jobs.careers.microsoft.com/global/en/job/${id}`;
    return {
      reqId:id,
      externalJobId:id,
      company:company.name,
      companyName:company.name,
      companySlug:company.slug,
      title:job.title || job.properties?.title || '',
      location:job.properties?.primaryLocation || job.primaryLocation || job.location || 'United States',
      locations:job.properties?.locations || [],
      isRemote:false,
      department:job.properties?.department || job.properties?.jobFamily || 'Software Engineering',
      team:job.properties?.team || 'Engineering',
      employmentType:job.properties?.employmentType || job.properties?.employment_type || job.employmentType || job.employment_type || job.jobType || job.type || undefined,
      category:'Engineering',
      track:'Fullstack',
      level:job.properties?.level || job.properties?.jobLevel || job.properties?.job_level || job.properties?.experienceLevel || job.level || job.levelName || undefined,
      description:job.properties?.description || '',
      jobUrl:url,
      applyUrl:url,
      postedAt:normalizeDate(job.postingDate || job.properties?.postingDate || job.postedDate),
      source:'custom',
      ats:'custom',
    };
  });
}
function hasJobChanged(existing:any,incoming:NormalizedJob){
  return existing.title !== incoming.title || existing.location !== normalizeString(incoming.location) || existing.department !== (incoming.department || null) || existing.team !== (incoming.team || null) || existing.employmentType !== (incoming.employmentType || null) || existing.level !== (incoming.level || null) || existing.description !== (incoming.description || null) || existing.applyUrl !== incoming.applyUrl || existing.isActive === false;
}
export async function syncCompany(company:CompanyConfig):Promise<CompanySyncResult>{
  const startTime = Date.now();
  const warnings:string[]=[];
  if(!company.enabled){
    return {company:company.name,slug:company.slug,ats:company.ats,status:'SKIPPED' as const,fetchedCount:0,newCount:0,updatedCount:0,unchangedCount:0,closedCount:0,skippedCloseCount:0,warningCount:0,warnings:[],durationMs:0};
  }
  try{
    const sourceResult = await fetchWithTimeout(company);
    if(!sourceResult.sourceSucceeded){
      await prisma.company.updateMany({where:{slug:company.slug},data:{syncStatus:'FAILED',lastError:sourceResult.error || 'Source failed'}});
      return {company:company.name,slug:company.slug,ats:company.ats,status:'FAILED' as const,fetchedCount:0,newCount:0,updatedCount:0,unchangedCount:0,closedCount:0,skippedCloseCount:0,warningCount:0,warnings:[],error:sourceResult.error,durationMs:Date.now()-startTime};
    }
    const incomingJobs = sourceResult.jobs;
    if(incomingJobs.length===0){
      warnings.push('Source returned 0 jobs. Close operation skipped.');
    }
    const existingJobs = await prisma.job.findMany({where:{companySlug:company.slug}});
    const existingMap = new Map<string,any>();
    for(const job of existingJobs){
      if(job.externalJobId){
        existingMap.set(String(job.externalJobId),job);
      }
    }
    const incomingMap = new Map<string,NormalizedJob>();
    for(const job of incomingJobs){
      const id = getJobExternalId(job);
      if(id){
        incomingMap.set(id,job);
      }
    }
    const uniqueIncomingJobs = Array.from(incomingMap.values());
    const incomingIds = new Set(uniqueIncomingJobs.map(getJobExternalId));
    const now = new Date();
    const jobsToCreate:any[]=[];
    const jobsToUpdate:any[]=[];
    let unchangedCount=0;
    for(const incoming of uniqueIncomingJobs){
      const id = getJobExternalId(incoming);
      const existing = existingMap.get(id);
      const data = {
        externalJobId:id,
        ats:incoming.ats || company.ats.toLowerCase(),
        companyName:company.name,
        companySlug:company.slug,
        title:incoming.title,
        location:incoming.location || 'United States',
        locations:normalizeLocations(incoming.locations,incoming.location || 'United States'),
        isRemote:Boolean(incoming.isRemote),
        department:incoming.department || null,
        team:incoming.team || null,
        employmentType:incoming.employmentType || null,
        level:incoming.level || null,
        description:incoming.description || null,
        jobUrl:incoming.jobUrl || incoming.applyUrl,
        applyUrl:incoming.applyUrl || incoming.jobUrl,
        postedAt:normalizeDate(incoming.postedAt),
        lastSeenAt:now,
        isActive:true,
      };
      if(!existing){
        jobsToCreate.push({...data,firstSeenAt:now});
        continue;
      }
      if(hasJobChanged(existing,incoming)){
        jobsToUpdate.push({id:existing.id,data});
      }else{
        unchangedCount++;
        await prisma.job.update({where:{id:existing.id},data:{lastSeenAt:now,isActive:true}});
      }
    }
    if(jobsToCreate.length>0){
      await prisma.job.createMany({data:jobsToCreate,skipDuplicates:true});
    }
    if(jobsToUpdate.length>0){
      for(const item of jobsToUpdate){
        await prisma.job.update({where:{id:item.id},data:item.data});
      }
    }
    let closedCount=0;
    let skippedCloseCount=0;
    if(sourceResult.sourceComplete){
      const activeJobs = existingJobs.filter(job => job.isActive && job.externalJobId);
      const jobsToClose = activeJobs.filter(job => !incomingIds.has(String(job.externalJobId)));
      if(jobsToClose.length>0){
        closedCount = jobsToClose.length;
        await prisma.job.updateMany({where:{companySlug:company.slug,isActive:true,externalJobId:{in:jobsToClose.map(job => String(job.externalJobId))}},data:{isActive:false}});
      }
    }else{
      skippedCloseCount = existingJobs.filter(job => job.isActive).length;
      warnings.push('Source incomplete. Existing jobs were preserved.');
    }
    await prisma.company.updateMany({where:{slug:company.slug},data:{syncStatus:sourceResult.sourceComplete ? 'SUCCESS' : 'PARTIAL',lastSyncedAt:now,lastError:null}});
    return {company:company.name,slug:company.slug,ats:company.ats,status:'SUCCESS' as const,fetchedCount:uniqueIncomingJobs.length,newCount:jobsToCreate.length,updatedCount:jobsToUpdate.length,unchangedCount,closedCount,skippedCloseCount,warningCount:warnings.length,warnings,durationMs:Date.now()-startTime};
  }catch(error:any){
    const message = error instanceof Error ? error.message : String(error);
    return {company:company.name,slug:company.slug,ats:company.ats,status:'FAILED',fetchedCount:0,newCount:0,updatedCount:0,unchangedCount:0,closedCount:0,skippedCloseCount:0,warningCount:0,warnings:[],error:message,durationMs:Date.now()-startTime};
  }
}
export async function syncAllCompanies(customConfigs?:CompanyConfig[]):Promise<SyncResult>{
  const start = Date.now();
  const configs = customConfigs || getActiveCompanyConfigs();
  const results = await Promise.allSettled(configs.map(company => syncCompany(company)));
  const details:CompanySyncResult[] = results.map((result,index) => {
    if(result.status==='fulfilled'){
      return result.value;
    }
    const company = configs[index];
    return {company:company.name,slug:company.slug,ats:company.ats,status:'FAILED' as const,fetchedCount:0,newCount:0,updatedCount:0,unchangedCount:0,closedCount:0,skippedCloseCount:0,warningCount:1,warnings:['Sync promise rejected'],error:String(result.reason || 'Unknown error'),durationMs:0} satisfies CompanySyncResult;
  });
  const failedCompanies = details.filter(item => item.status==='FAILED').length;
  return {success:failedCompanies===0,totalCompanies:configs.length,succeededCompanies:details.filter(item => item.status==='SUCCESS').length,failedCompanies,totalFetched:details.reduce((sum,item) => sum+item.fetchedCount,0),totalNew:details.reduce((sum,item) => sum+item.newCount,0),totalUpdated:details.reduce((sum,item) => sum+item.updatedCount,0),totalUnchanged:details.reduce((sum,item) => sum+item.unchangedCount,0),totalClosed:details.reduce((sum,item) => sum+item.closedCount,0),totalSkippedClose:details.reduce((sum,item) => sum+item.skippedCloseCount,0),totalDurationMs:Date.now()-start,details};
}
