const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

let newContent = content.replace(
/if \(\!archive\.preserveGroup\) \{\n\s*groupedText = text\.replace\(\/#EXTINF:\(\[\^,\]\*\),\/g, \`#EXTINF:\$1 group-title="\$\{archive\.name\}",\`\);\n\s*\} else \{\n\s*\/\/ For Movies, we want to force all into a single channel regardless of what extractSeriesName does later\n\s*groupedText = text\.replace\(\/#EXTINF:\(\[\^,\]\*\),\/g, \`#EXTINF:\$1 group-title="\$\{archive\.name\}",\`\);\n\s*\}/,
\`if (!archive.preserveGroup) {
  groupedText = text.replace(/#EXTINF:([^,]*),/g, \\ \`#EXTINF:$1 group-title="\${archive.name}",\\ \`);
} else {
  // If preserveGroup is true, we keep original group titles OR conditionally map.
  // Wait, for movies we actually DO want to combine them under "Classic & Documentary Movies".
  // Let's just leave it as text, unless we need to force it.
  if (archive.name === "Classic & Documentary Movies") {
      groupedText = text.replace(/#EXTINF:([^,]*),/g, \\\`#EXTINF:$1 group-title="\${archive.name}",\\\`);
  }
}\`
);

fs.writeFileSync('src/App.tsx', newContent);
console.log('fixed');
