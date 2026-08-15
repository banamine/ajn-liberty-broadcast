const AJN_LIVE = {
  channelId: "ch-ajn-live",
  num: 1,
  name: "AJN Live",
  category: "Live Channels",
  logo: "https://archive.org/download/daily-highlights/lmbsa.png",
  streamType: "live_hls",
  type: "live_hls",
  source: "https://rumble.com/embed/v77ywh4/?pub=4pef68",
  hlsSource: "https://rumble.com/embed/v77ywh4/?pub=4pef68",
  description: "AJN Live Continuous Broadcast"
};

const WARROOM = {
  channelId: "ch-warroom",
  num: 2,
  name: "Warroom",
  category: "Live Channels",
  logo: "https://archive.org/download/daily-highlights/warroom.png",
  type: "rss",
  source: "https://rss.alexjones.media/WarRoom.xml",
  description: "War Room with Harrison Smith"
};

const AJN_HOURLY = {
  channelId: "ch-ajn-hourly",
  num: 3,
  name: "AJN Hourly",
  category: "Live Channels",
  logo: "https://archive.org/download/daily-highlights/lmbsa.png",
  type: "rss",
  source: "https://rss.alexjones.media/AJNHourlyVideo.xml",
  description: "Network Feed Hourly Video"
};

const ARCHIVE_CHANNEL = {
  channelId: "ch-archive",
  num: 4,
  name: "Archive Channel",
  category: "Archive",
  logo: "https://archive.org/download/daily-highlights/lmbsa.png",
  type: "ia_collection",
  source: "https://rumble.com/embed/v77ywh4/?pub=4pef68",
  description: "AJN Archives"
};

const SURVIVAL = {
  channelId: "ch-survival",
  num: 5,
  name: "Survival Impossible Odds",
  category: "Documentary",
  logo: "https://archive.org/download/daily-highlights/lmbsa.png",
  streamType: "live_hls",
  type: "live_hls",
  source: "https://rumble.com/embed/v77ywh4/?pub=4pef68",
  hlsSource: "https://rumble.com/embed/v77ywh4/?pub=4pef68",
  description: "Survival Against Impossible Odds Documentary Series"
};

const HONEYMOONERS = {
  id: "the-honeymooners-classic",
  title: "The Honeymooners",
  category: "Classic TV / Movies",
  streamUrl: "https://archive.org/download/daily-highlights/honeymooner%20classic%20movies.m3u",
  manifestFallbackUrl: "https://archive.org/download/daily-highlights/honey%20mooners%20classic%20movies.json",
  provider: "Archive.org (Daily Highlights)"
};

export const DefaultChannelManifests = [
  AJN_LIVE,
  WARROOM,
  AJN_HOURLY,
  ARCHIVE_CHANNEL,
  SURVIVAL,
  HONEYMOONERS
];

export const LiveChannelManifests: any[] = [];
