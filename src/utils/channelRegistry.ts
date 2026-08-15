export interface ChannelEntry {
  title: string;
  type: string;
  url?: string;
  urlPattern?: string;
  backupUrl?: string;
  hours?: number[];
  dateFormat?: string;
  parser: string;
  fallbackBehavior: string;
  filePattern?: string;
}

export const CHANNEL_REGISTRY: Record<string, ChannelEntry> = {
  "AJN Live": {
    title: "AJN Live",
    type: "live_hls",
    url: "https://rumble.com/embed/v77ywh4/?pub=4pef68",
    parser: "m3u8", // player handles internally
    fallbackBehavior: "none" // no stale content allowed
  },
  
  "Warroom": {
    title: "Warroom",
    type: "archive-hourly",
    urlPattern: "https://ajn.archives.pub/hourly-m4v/{DATE}_WarRoom-Hr{HOUR}.m4v",
    hours: [1, 2, 3],
    dateFormat: "YYYYMMDD_Ddd", // e.g., 20260729_Wed
    parser: "direct-m4v",
    fallbackBehavior: "48h-window"
  },
  
  "AJN Hourly": {
    title: "AJN Hourly",
    type: "archive-hourly",
    urlPattern: "https://ajn.archives.pub/hourly-m4v/{DATE}_Alex-Hr{HOUR}.m4v",
    hours: [1, 2, 3],
    dateFormat: "YYYYMMDD_Ddd",
    parser: "direct-m4v",
    fallbackBehavior: "48h-window"
  },
  
  "Big Western Zone": {
    title: "Big Western Zone",
    type: "m3u-playlist",
    url: "https://archive.org/download/daily-highlights/BIG%20WESTERN%20ZONE.m3u",
    parser: "m3u", // player handles internally
    fallbackBehavior: "static"
  },
  
  "INFOWARS Special Report": {
    title: "INFOWARS Special Report",
    type: "archive-vod",
    url: "https://archive.org/download/20101113-alex-cocoanut-oct-24",
    parser: "archive-directory",
    fallbackBehavior: "static"
  },
  
  "INFOWARS Nightly News": {
    title: "INFOWARS Nightly News",
    type: "archive-vod",
    url: "https://archive.org/download/infowars-nightly-news-sd",
    parser: "archive-directory",
    fallbackBehavior: "static"
  },
  
  "Comedy Collection": {
    title: "Comedy Collection",
    type: "archive-vod",
    url: "https://archive.org/download/comedy-collection",
    parser: "archive-directory",
    filePattern: "*.mp4", // NOT *.ia.mp4
    fallbackBehavior: "static"
  }
};
