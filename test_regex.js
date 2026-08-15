const regex = /^.*?m3u[ _]split[ _]shows[ _]\d{4}-\d{2}-\d{2}\s*\(\d+\)[/\\_]+(?:split[ _]shows[/\\_]+)?/i;

const tests = [
  "m3u_split_shows_2026-08-05 (1)/split_shows/Columbo - S01E01.mp4",
  "m3u_split_shows_2026-08-05 (1)/split shows/Columbo - S01E01.mp4",
  "m3u split shows 2026-08-05 (1)/split shows/Columbo - S01E01.mp4",
  "m3u_split_shows_2026-08-05 (4)/split_shows/Other_Content/The Movies.mp4"
];

for (const t of tests) {
  console.log(t.replace(regex, ''));
}
