import {
  buildArchiveNewsSearchUrl,
  discoverArchiveNews,
  getArchiveCollectionCandidates,
  discoverPlayableArchiveNews,
  PAGE_ROWS
} from "./archiveNewsDiscovery.ts";

const NOW = Date.parse("2026-09-22T12:00:00Z");
const collectionCandidates = getArchiveCollectionCandidates("TV-CNNW");
if (collectionCandidates.join("|") !== "CNNW|TV-CNNW") throw new Error("collection alias normalization failed");
const id=(i:number,n:string)=>{ const d=new Date(NOW-i*30*60*1000); const z=(v:number)=>String(v).padStart(2,"0"); return "CNNW_"+d.getUTCFullYear()+z(d.getUTCMonth()+1)+z(d.getUTCDate())+"_"+z(d.getUTCHours())+z(d.getUTCMinutes())+"00_"+n; };
const freshDocs=Array.from({length:75},(_,i)=>({
  identifier:id(i,"SHOW_"+i),
  title:"Show "+i,
  publicdate:new Date(NOW-i*30*60*1000).toISOString()
}));
freshDocs.push({
  identifier:"CNNW_20260920_10000000_TOO_OLD",
  title:"Old",
  publicdate:"2026-09-20T10:00:00Z"
});

let searchCalls=0;
let mediaCalls=0;
const fetcher=async (url:string,init?:RequestInit):Promise<Response>=>{
  if(url.includes("advancedsearch.php")){
    searchCalls++;
    const u=new URL(url);
    const start=Number(u.searchParams.get("start")||0);
    const docs=freshDocs.slice(start,start+PAGE_ROWS);
    return new Response(JSON.stringify({response:{docs,numFound:freshDocs.length}}),{status:200});
  }
  if(url.includes("/metadata/")){
    mediaCalls++;
    const identifier=decodeURIComponent(url.split("/metadata/")[1]);
    if(identifier.endsWith("SHOW_1")) {
      return new Response(JSON.stringify({files:[{name:"episode.mp4",format:"MPEG4"}]}),{status:200});
    }
    return new Response(JSON.stringify({files:[{name:"episode.mp4",format:"MPEG4"}]}),{status:200});
  }
  if(init?.method==="HEAD"){
    if(url.includes("SHOW_2")) return new Response("",{status:403});
    return new Response("",{status:206});
  }
  throw new Error("unexpected URL "+url);
};

const url=buildArchiveNewsSearchUrl("CNNW",NOW,50);
if(!url.includes("start=50")) throw new Error("pagination start parameter missing");
const discovered=await discoverArchiveNews("CNNW",NOW,fetcher);
if(searchCalls < 2) throw new Error("expected pagination beyond first Archive page");
if (!buildArchiveNewsSearchUrl("CNNW", NOW, 0).includes("collection%3ACNNW")) {
  throw new Error("canonical collection query missing");
}
if(discovered.length !== 75) throw new Error("expected 75 fresh records after pagination, got "+discovered.length);
if(discovered[0].airTime < discovered[discovered.length-1].airTime) throw new Error("newest-first ordering failed");
if(discovered.some(x=>x.identifier.includes("TOO_OLD"))) throw new Error("48-hour freshness filtering failed");

const playable=await discoverPlayableArchiveNews("CNNW",NOW,fetcher);
if(playable.some(x=>x.identifier.includes("SHOW_2"))) throw new Error("403 media must be excluded");
if(playable.length !== 74) throw new Error("one 403 item should be skipped while others continue");
if(mediaCalls === 0) throw new Error("metadata/media validation did not execute");

console.log("AJN Archive behavioral integration tests: PASS");
