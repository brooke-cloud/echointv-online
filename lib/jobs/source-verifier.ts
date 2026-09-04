// lib/jobs/source-verifier.ts

import { prisma } from '@/lib/prisma';

import { CompanyConfig } from './company-config';

import { fetchJobsByAts } from './adapters';

import {
  fetchAmazonJobs,
  fetchMicrosoftJobs,
  fetchGoogleJobs,
  fetchMetaJobs,
  fetchByteDanceJobs,
  fetchNvidiaJobs,
  fetchTeslaJobs,
  fetchAppleJobs,
} from './custom-fetchers';

import { classifyTargetJob } from './target-classifier';

import {
  verifyJobUrls,
  BatchVerificationResult,
} from './verifier';



export type SourceHealthStatus =
  | 'VERIFIED'
  | 'PARTIAL'
  | 'FAILED';



export interface SourceVerificationResult {

  company:string;

  slug:string;

  ats:string;


  status:SourceHealthStatus;


  sourceTotal:number;

  sourceTargetTotal:number;

  sourceInternCount:number;

  sourceNewGradCount:number;


  databaseTargetTotal:number;

  databaseInternCount:number;

  databaseNewGradCount:number;


  countMatched:boolean;


  urlVerification:BatchVerificationResult;


  sourceComplete:boolean;


  difference:number;


  warnings:string[];


  checkedAt:string;


  error?:string;

}




function emptyUrlVerification()
:BatchVerificationResult {

  return {

    total:0,

    active:0,

    dead:0,

    blocked:0,

    timeout:0,

    error:0,

    unknown:0,

    results:[],

  };

}




function classifyJobs(
  jobs:any[]
){

  let targetCount = 0;

  let internCount = 0;

  let newGradCount = 0;



  for(
    const job of jobs
  ){

    const result =
      classifyTargetJob({

        title:
          job.title || '',


        description:
          job.description || '',


        department:
          job.department || '',


        employmentType:
          job.employmentType || '',


        level:
          job.level || '',

      });



    if(!result.isTarget){

      continue;

    }



    targetCount++;



    if(result.type === 'Intern'){

      internCount++;

    }



    if(result.type === 'New Grad'){

      newGradCount++;

    }


  }



  return {

    targetCount,

    internCount,

    newGradCount,

  };

}




async function fetchCustomSourceJobs(
  company: CompanyConfig
): Promise<any[]> {


  const slug =
    company.slug.toLowerCase();


  const name =
    company.name.toLowerCase();



  if(
    slug.includes('amazon') ||
    name.includes('amazon')
  ){

    return fetchAmazonJobs(company);

  }



  if(
    slug.includes('microsoft') ||
    name.includes('microsoft')
  ){

    return fetchMicrosoftJobs(company);

  }



  if(
    slug.includes('google') ||
    name.includes('google')
  ){

    return fetchGoogleJobs(company);

  }



  if(
    slug.includes('meta') ||
    name.includes('meta') ||
    name.includes('facebook')
  ){

    return fetchMetaJobs(company);

  }



  if(
    slug.includes('bytedance') ||
    slug.includes('tiktok')
  ){

    return fetchByteDanceJobs(company);

  }



  if(
    slug.includes('nvidia') ||
    name.includes('nvidia')
  ){

    return fetchNvidiaJobs(company);

  }



  if(
    slug.includes('tesla') ||
    name.includes('tesla')
  ){

    return fetchTeslaJobs(company);

  }



  if(
    slug.includes('apple') ||
    name.includes('apple')
  ){

    return fetchAppleJobs(company);

  }



  return [];

}

function buildWarnings(params:{
  sourceComplete:boolean;
  countMatched:boolean;

  hasDeadLinks:boolean;

  sourceCount:number;

  databaseCount:number;

  sourceInternCount:number;

  databaseInternCount:number;

  sourceNewGradCount:number;

  databaseNewGradCount:number;

  sourceError?:string;

}):string[] {


  const warnings:string[]=[];



  if(!params.sourceComplete){

    warnings.push(
      'Source was not confirmed complete.'
    );

  }



  if(!params.countMatched){

    warnings.push(
      `Count mismatch. Source=${params.sourceCount}, Database=${params.databaseCount}.`
    );

  }



  if(params.hasDeadLinks){

    warnings.push(
      'Some job URLs are inactive.'
    );

  }



  if(params.sourceError){

    warnings.push(
      params.sourceError
    );

  }



  return warnings;

}




export async function verifyCompanySource(
  company:CompanyConfig
):Promise<SourceVerificationResult>{


  const checkedAt =
    new Date().toISOString();



  try{


    let sourceJobs:any[]=[];



    if(
      company.ats.toUpperCase()==='CUSTOM'
    ){

      sourceJobs =
        await fetchCustomSourceJobs(
          company
        );


    }else{


      const result =
        await fetchJobsByAts(
          company.name,
          company.slug,
          company.ats.toLowerCase() as any,
          company.identifier
        );


      sourceJobs =
        result.jobs || [];


    }




    const sourceStats =
      classifyJobs(
        sourceJobs
      );





    const databaseJobs =
      await prisma.job.findMany({

        where:{

          companySlug:
            company.slug,

          isActive:true,

        },


        select:{

          title:true,

          description:true,

          department:true,

          employmentType:true,

          level:true,

          applyUrl:true,

          jobUrl:true,

        },

      });





    const databaseStats =
      classifyJobs(
        databaseJobs
      );






    const targetUrls =
      databaseJobs

        .filter(
          job => {

            const result =
              classifyTargetJob({

                title:
                  job.title || '',

                description:
                  job.description || '',

                department:
                  job.department || '',

                employmentType:
                  job.employmentType || '',

                level:
                  job.level || '',

              });


            return result.isTarget;

          }
        )


        .map(
          job =>
            job.applyUrl ||
            job.jobUrl
        )


        .filter(Boolean);






    const urlVerification =
      await verifyJobUrls(
        targetUrls,
        8
      );





    const hasDeadLinks =
      urlVerification.dead > 0;






    const countMatched =

      sourceStats.targetCount ===
      databaseStats.targetCount

      &&

      sourceStats.internCount ===
      databaseStats.internCount

      &&

      sourceStats.newGradCount ===
      databaseStats.newGradCount;






    const sourceComplete =
      sourceJobs.length > 0;






    const warnings =
      buildWarnings({

        sourceComplete,

        countMatched,

        hasDeadLinks,

        sourceCount:
          sourceStats.targetCount,

        databaseCount:
          databaseStats.targetCount,

        sourceInternCount:
          sourceStats.internCount,

        databaseInternCount:
          databaseStats.internCount,

        sourceNewGradCount:
          sourceStats.newGradCount,

        databaseNewGradCount:
          databaseStats.newGradCount,

      });






    let status:'VERIFIED'|'PARTIAL'|'FAILED';



    if(

      sourceComplete

      &&

      countMatched

      &&

      !hasDeadLinks

    ){

      status='VERIFIED';


    }else{


      status='PARTIAL';


    }





    return {


      company:
        company.name,


      slug:
        company.slug,


      ats:
        company.ats,



      status,



      sourceTotal:
        sourceJobs.length,


      sourceTargetTotal:
        sourceStats.targetCount,


      sourceInternCount:
        sourceStats.internCount,


      sourceNewGradCount:
        sourceStats.newGradCount,



      databaseTargetTotal:
        databaseStats.targetCount,


      databaseInternCount:
        databaseStats.internCount,


      databaseNewGradCount:
        databaseStats.newGradCount,



      countMatched,



      urlVerification,



      sourceComplete,



      difference:

        sourceStats.targetCount -
        databaseStats.targetCount,



      warnings,



      checkedAt,



      ...(warnings.length>0
        ? {
            error:
              warnings.join(' ')
          }
        : {})

    };



  }catch(error:any){



    const message =
      error instanceof Error
        ? error.message
        : String(error);




    return {


      company:
        company.name,


      slug:
        company.slug,


      ats:
        company.ats,


      status:
        'FAILED',


      sourceTotal:0,


      sourceTargetTotal:0,


      sourceInternCount:0,


      sourceNewGradCount:0,



      databaseTargetTotal:0,


      databaseInternCount:0,


      databaseNewGradCount:0,



      countMatched:false,



      urlVerification:
        emptyUrlVerification(),



      sourceComplete:false,



      difference:0,



      warnings:[
        message
      ],



      checkedAt,



      error:
        message,

    };

  }

}

export async function verifyAllCompanySources(
  companies:CompanyConfig[]
):Promise<SourceVerificationResult[]> {


  const enabledCompanies =
    companies.filter(
      company =>
        company.enabled
    );



  const results =
    await Promise.all(

      enabledCompanies.map(
        company =>
          verifyCompanySource(
            company
          )
      )

    );



  return results;

}