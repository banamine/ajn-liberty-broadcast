import { CHANNEL_REGISTRY } from './channelRegistry';

export const constructHourlyURL = (channelKey: string, hour: number, dateOverride: Date | null = null): string => {
  const channel = CHANNEL_REGISTRY[channelKey];
  if (!channel || !channel.urlPattern) throw new Error(`Invalid channel: ${channelKey}`);
  
  // Use provided date or default to today
  let targetDate = dateOverride || new Date();
  
  // Format date as YYYYMMDD_Ddd (e.g., 20260729_Wed)
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()];
  const dateStr = `${year}${month}${day}_${dayName}`;
  
  return channel.urlPattern
    .replace('{DATE}', dateStr)
    .replace('{HOUR}', hour.toString());
};

// Generates 48-hour window of URLs (today + yesterday, all hours)
export const generate48hWindow = (channelKey: string): string[] => {
  const urls: string[] = [];
  const channel = CHANNEL_REGISTRY[channelKey];
  
  if (!channel || !channel.hours) return urls;

  // Today
  for (const hour of channel.hours) {
    urls.push(constructHourlyURL(channelKey, hour, new Date()));
  }
  
  // Yesterday
  const yesterday = new Date(Date.now() - 86400000);
  for (const hour of channel.hours) {
    urls.push(constructHourlyURL(channelKey, hour, yesterday));
  }
  
  return urls;
};
