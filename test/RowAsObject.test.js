/**
 * test/testObjectTransform.js
 */

import { XlsxDataReader, RowAsObjectTransform } from "../lib/index.js";
import FormatJSON from '../lib/FormatJSON.js';
import { pipeline } from 'node:stream/promises';
import fs from "node:fs";
import path from "node:path";
import compareFiles from "./_compareFiles.js";

var count = 0;

async function test(options) {
  ++count;
  let outputName = path.parse(options.url).name + count;

  let reader = new XlsxDataReader(options);

  let transform1 = new RowAsObjectTransform(options);
  let transform2 = new FormatJSON();

  let outputFile = "./test/output/RowAsObjectTransform/" + outputName + ".json";
  console.log("output: " + outputFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  let writer = fs.createWriteStream(outputFile, { encoding: "utf-8", autoClose: false });

  await pipeline(reader, transform1, transform2, writer);

  let expectedFile = outputFile.replace("/output/", "/expected/");
  let exitCode = compareFiles(outputFile, expectedFile, 2);
  return exitCode;
}

(async () => {
  if (await test({ url: "./test/data/xlsx/HelloWorld.xlsx", headers: ["Greating"] })) return 1;
  if (await test({ url: "./test/data/xlsx/foofile.xlsx" })) return 1;
  if (await test({ url: "./test/data/xlsx/foofile.xls", sheetName: "foo", missingCells: true })) return 1;

  if (await test({ url: "http://dev.oby4.org/data/test/_data/foofile.xlsx", http: { auth: "test:data" }, missingCells: true })) return 1;

  if (await test({
    url: "./test/data/xlsx/State_Voter_Registration_July_2024.xlsx",
    range: "A6:R70",
    cells: "9-10",
    hasHeader: true,
    missingCells: false,
    cellDates: false,
  })) return 1;
})();
