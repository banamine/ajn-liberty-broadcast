export type ArchiveSplitShowEntry = {
  title?: string;
  url: string;
  sourceM3uUrl: string;
  groupTitle?: string;
};

export type ArchiveSplitShowAudit = {
  sourceM3uUrl: string;
  entryCount: number;
  entries: ArchiveSplitShowEntry[];
  duplicateUrls: string[];
  archiveIdentifiers: string[];
};

export function parseM3UProvenance(text: string, sourceM3uUrl: string): ArchiveSplitShowEntry[] {
  const entries: ArchiveSplitShowEntry[] = [];
  let pendingTitle: string | undefined;
  let pendingGroup: string | undefined;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const comma = line.indexOf(",");
      pendingTitle = comma >= 0 ? line.slice(comma + 1).trim() : undefined;
      const group = line.match(/group-title="([^"]+)"/i);
      pendingGroup = group?.[1]?.trim() || undefined;
      continue;
    }

    if (line.startsWith("#")) continue;

    let url = line;
    try {
      url = new URL(line, sourceM3uUrl).toString();
    } catch {
      // Preserve malformed/non-URL entries for audit visibility.
    }

    entries.push({
      title: pendingTitle,
      url,
      sourceM3uUrl,
      groupTitle: pendingGroup
    });

    pendingTitle = undefined;
    pendingGroup = undefined;
  }

  return entries;
}

export function extractArchiveIdentifier(url: string): string | undefined {
  const match = url.match(/archive\.org\/download\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function auditM3UProvenance(text: string, sourceM3uUrl: string): ArchiveSplitShowAudit {
  const entries = parseM3UProvenance(text, sourceM3uUrl);
  const seen = new Set<string>();
  const duplicateUrls = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry.url)) duplicateUrls.add(entry.url);
    seen.add(entry.url);
  }

  const archiveIdentifiers = Array.from(new Set(
    entries.map(entry => extractArchiveIdentifier(entry.url)).filter(Boolean) as string[]
  ));

  return {
    sourceM3uUrl,
    entryCount: entries.length,
    entries,
    duplicateUrls: Array.from(duplicateUrls),
    archiveIdentifiers
  };
}
