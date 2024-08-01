/**
 * test/testObjectTransform.js
 */

const { XlsxDataReader, RowAsObjectTransform } = require("../lib");
const FormatJSON = require('../lib/FormatJSON');
const { pipeline } = require('node:stream/promises');
const fs = require("fs");
const path = require("path");
const compareFiles = require("./_compareFiles");

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

  if (await test({ url: "http://dev.dictadata.net/dictadata/test/data/input/foofile.xlsx", http: { auth: "dicta:data" }, missingCells: true })) return 1;

  if (await test({
    url: "./test/data/xlsx/State_Voter_Registration_July_2024.xlsx",
    range: "A6:R70",
    cells: "9-10",
    hasHeader: true,
    missingCells: false,
    cellDates: false,
  })) return 1;
})();
