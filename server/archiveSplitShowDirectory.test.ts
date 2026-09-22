import { strict as assert } from "node:assert";
import {
  ARCHIVE_SPLIT_SHOW_DIRECTORY,
  ARCHIVE_SPLIT_SHOW_DIRECTORY_EXPECTED_SHOW_COUNT,
  ARCHIVE_SPLIT_SHOW_DIRECTORY_VERIFIED_URL_COUNT,
  validateArchiveSplitShowDirectory
} from "../src/data/archiveSplitShowDirectory.ts";

const errors = validateArchiveSplitShowDirectory();

assert.equal(errors.length, 0, errors.join("\n"));
assert.equal(
  ARCHIVE_SPLIT_SHOW_DIRECTORY.filter(source => source.kind === "show").length,
  ARCHIVE_SPLIT_SHOW_DIRECTORY_EXPECTED_SHOW_COUNT
);
assert.equal(
  ARCHIVE_SPLIT_SHOW_DIRECTORY.filter(source => source.url).length,
  ARCHIVE_SPLIT_SHOW_DIRECTORY_VERIFIED_URL_COUNT
);
assert.equal(
  ARCHIVE_SPLIT_SHOW_DIRECTORY.filter(source => source.kind === "show" && source.url).length,
  9
);

console.log("Archive split-show directory contract: PASS");
