// lib/jobs/adapters/index.ts

import { AshbyAdapter } from "./ashby";
import { GreenhouseAdapter } from "./greenhouse";
import { LeverAdapter } from "./lever";

import {
  AtsAdapter,
  AtsFetchResult,
  NormalizedJob,
  SupportedAts,
} from "./types";


// =====================================================
// 保持旧代码兼容
// 允许:
//
// import { NormalizedJob } from "./adapters";
//
// =====================================================

export type {
  NormalizedJob,
  AtsFetchResult,
  SupportedAts,
} from "./types";


// =====================================================
// ATS Adapter Registry
// =====================================================

const adapters: Record<
  SupportedAts,
  AtsAdapter
> = {


  greenhouse:
    new GreenhouseAdapter(),


  lever:
    new LeverAdapter(),


  ashby:
    new AshbyAdapter(),



  custom: {

    async fetchJobs(
      _companyName: string,
      _companySlug: string,
      _identifier: string,
    ): Promise<NormalizedJob[]> {

      return [];

    },

  },


};



// =====================================================
// 判断是否支持详细同步结果
// =====================================================

type DetailedAdapter =
  AtsAdapter & {

    fetchJobsDetailed(
      companyName:string,
      companySlug:string,
      identifier:string,
    ):Promise<AtsFetchResult>;

  };



function hasDetailedFetch(
  adapter:AtsAdapter,
): adapter is DetailedAdapter {


  return (
    typeof (
      adapter as Partial<DetailedAdapter>
    )
      .fetchJobsDetailed
      === "function"
  );


}



// =====================================================
// Legacy Adapter fallback
// =====================================================

function createLegacyResult(
  jobs:NormalizedJob[],
):AtsFetchResult {


  return {

    jobs,


    status:
      "COMPLETE",


    sourceComplete:
      true,


    rawCount:
      jobs.length,


    fetchedCount:
      jobs.length,


    paginated:
      false,


    hasMore:
      false,


    nextCursor:
      undefined,


    error:
      undefined,


    fetchedAt:
      new Date(),

  };


}



// =====================================================
// Error Result
// =====================================================

function createFailedResult(
  ats:SupportedAts,
  error:unknown,
):AtsFetchResult {


  return {

    jobs:[],


    status:
      "FAILED",


    sourceComplete:
      false,


    rawCount:
      0,


    fetchedCount:
      0,


    paginated:
      false,


    hasMore:
      false,


    nextCursor:
      undefined,


    error:
      `[${ats}] ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,


    fetchedAt:
      new Date(),

  };


}



// =====================================================
// Main ATS Fetch Function
//
// 保持旧调用:
//
// fetchJobsByAts(
//   company.name,
//   company.ats,
//   company.slug
// )
//
// =====================================================


export async function fetchJobsByAts(

  companyName:string,

  companySlug:string,

  ats:SupportedAts,

  identifier?:string,

):Promise<AtsFetchResult>{



  const adapter =
    adapters[ats];



  if(!adapter){


    return {


      jobs:[],


      status:
        "FAILED",


      sourceComplete:
        false,


      rawCount:
        0,


      fetchedCount:
        0,


      paginated:
        false,


      hasMore:
        false,


      nextCursor:
        undefined,


      error:
        `Unsupported ATS: ${ats}`,


      fetchedAt:
        new Date(),


    };


  }




  try {



    /*
     *
     * 新 ATS:
     *
     * greenhouse
     * lever
     * ashby
     *
     * 使用完整验证流程
     *
     */


    if(
      hasDetailedFetch(adapter)
    ){



      return await adapter.fetchJobsDetailed(

        companyName,


        companySlug,


        identifier ||
        companySlug,


      );


    }





    /*
     *
     * 老 adapter 兼容
     *
     */


    const jobs =

      await adapter.fetchJobs(

        companyName,


        companySlug,


        identifier ||
        companySlug,


      );



    return createLegacyResult(
      jobs,
    );




  }catch(error){



    return createFailedResult(

      ats,

      error,

    );


  }



}



// =====================================================
// 外部直接获取 Adapter
// =====================================================

export function getAdapter(

  ats:SupportedAts,

):AtsAdapter | undefined {


  return adapters[ats];


}