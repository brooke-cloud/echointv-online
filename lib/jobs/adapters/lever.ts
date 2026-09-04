// lib/jobs/adapters/lever.ts

import {
  AtsAdapter,
  AtsFetchResult,
  NormalizedJob,
} from "./types";

import { classifyJobLevel } from "../classifier";


interface LeverLocation {
  name?: string;
}


interface LeverJob {
  id?: string;

  text?: string;

  hostedUrl?: string;

  applyUrl?: string;

  createdAt?: number;

  updatedAt?: number;

  categories?: {
    commitment?: string;
    department?: string;
    team?: string;
    level?: string;
    location?: string;
  };

  descriptionPlain?: string;

  description?: string;

  lists?: unknown[];
}


interface LeverResponseJob {
  id?: string;
  text?: string;

  hostedUrl?: string;
  applyUrl?: string;

  createdAt?: number;
  updatedAt?: number;

  categories?: {
    commitment?: string;
    department?: string;
    team?: string;
    location?: string;
    level?: string;
  };

  descriptionPlain?: string;
  description?: string;
}


const TIMEOUT = 30000;



function createResult(
  jobs: NormalizedJob[],
  status: AtsFetchResult["status"],
  complete: boolean,
  extra: Partial<AtsFetchResult> = {}
): AtsFetchResult {

  return {

    jobs,

    status,

    sourceComplete: complete,

    rawCount:
      extra.rawCount ?? jobs.length,

    fetchedCount:
      jobs.length,

    paginated:
      extra.paginated ?? false,

    hasMore:
      extra.hasMore ?? false,

    nextCursor:
      extra.nextCursor,

    error:
      extra.error,

    fetchedAt:
      new Date(),
  };
}



function validJob(
  job: LeverResponseJob
) {

  return Boolean(
    job.id &&
    job.text &&
    job.hostedUrl
  );

}



function normalizeLocation(
  job: LeverResponseJob
): string {

  return (
    job.categories?.location ||
    "US"
  );

}



function normalizeDate(
  timestamp?: number
): Date {

  if (!timestamp) {
    return new Date();
  }


  const date =
    new Date(timestamp);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return new Date();

  }


  return date;

}




function detectRemote(
  job: LeverResponseJob
) {

  const text =
    [
      job.text,
      job.descriptionPlain,
      job.categories?.location,
    ]
      .join(" ")
      .toLowerCase();


  return (
    text.includes("remote") ||
    text.includes("work from home")
  );

}



function normalizeJob(
  job: LeverResponseJob,
  companyName: string,
  companySlug: string
): NormalizedJob {


  const title =
    job.text ||
    "Untitled Position";


  const description =
    job.descriptionPlain ||
    job.description ||
    "";


  const classification =
    classifyJobLevel(
      title,
      description
    );


  const department =
    job.categories?.department;


  return {


    reqId:
      job.id!,


    externalJobId:
      job.id!,


    company:
      companyName,


    companyName,


    companySlug,


    title,


    location:
      normalizeLocation(job),


    locations:
      [
        normalizeLocation(job)
      ],


    isRemote:
      detectRemote(job),


    department,


    team:
      job.categories?.team,


    employmentType:
      classification.category === "INTERN"
        ? "Intern"
        : classification.category === "NG"
          ? "New Grad"
          : undefined,


    category:
      classification.category,


    track:
      job.categories?.team ||
      "Software",


    level:
      classification.level,


    salary:
      undefined,


    description,


    jobUrl:
      job.hostedUrl!,


    applyUrl:
      job.applyUrl ||
      job.hostedUrl!,


    postedAt:
      normalizeDate(
        job.createdAt
      ),


    source:
      "lever",


    ats:
      "lever",

  };

}





export class LeverAdapter
implements AtsAdapter {



  async fetchJobs(
    companyName:string,
    companySlug:string,
    identifier:string
  ):Promise<NormalizedJob[]> {


    const result =
      await this.fetchJobsDetailed(
        companyName,
        companySlug,
        identifier
      );


    return result.jobs;

  }





  async fetchJobsDetailed(
    companyName:string,
    companySlug:string,
    identifier:string
  ):Promise<AtsFetchResult>{



    const controller =
      new AbortController();



    const timeout =
      setTimeout(
        ()=>controller.abort(),
        TIMEOUT
      );



    try {


      const url =
        `https://api.lever.co/v0/postings/${encodeURIComponent(identifier)}?mode=json&limit=100`;



      const response =
        await fetch(
          url,
          {
            headers:{
              Accept:
                "application/json",

              "User-Agent":
                "EchoIntv Jobs Sync/1.0"
            },

            cache:
              "no-store",

            signal:
              controller.signal
          }
        );




      if(!response.ok){

        return createResult(
          [],
          "FAILED",
          false,
          {
            error:
              `Lever HTTP ${response.status}`
          }
        );

      }




      const data =
        await response.json();



      if(!Array.isArray(data)){


        return createResult(
          [],
          "FAILED",
          false,
          {
            error:
              "Lever response invalid"
          }
        );


      }





      const rawJobs =
        data as LeverResponseJob[];




      const valid =
        rawJobs.filter(
          validJob
        );




      const jobs =
        valid.map(
          job =>
            normalizeJob(
              job,
              companyName,
              companySlug
            )
        );




      const unique =
        Array.from(
          new Map(
            jobs.map(
              job=>[
                job.externalJobId,
                job
              ]
            )
          ).values()
        );





      /*
       Lever API 如果返回满 limit，
       不证明一定结束。

       因此:
       100 条 = suspicious
       但不能直接判失败。

       标记 PARTIAL，
       防止误关闭职位。
      */


      if(rawJobs.length >= 100){


        return createResult(
          unique,
          "PARTIAL",
          false,
          {

            rawCount:
              rawJobs.length,


            paginated:
              true,


            hasMore:
              true,


            error:
              "Lever returned maximum page size. Pagination verification required."

          }
        );


      }





      return createResult(
        unique,
        "COMPLETE",
        true,
        {

          rawCount:
            rawJobs.length,


          paginated:
            false,


          hasMore:
            false

        }
      );





    }catch(error:any){


      return createResult(
        [],
        "FAILED",
        false,
        {
          error:
            error?.message ||
            "Lever fetch failed"
        }
      );


    }finally{


      clearTimeout(
        timeout
      );


    }



  }



}