/**
 * test/optionsRepeatCell.js
 */

const { XlsxDataReader, RowAsObjectTransform, RepeatCellTransform } = require("../lib");
const FormatJSON = require('../lib/FormatJSON');
const { pipeline } = require('node:stream/promises');
const fs = require("fs");
const path = require("path");
const compareFiles = require("./_compareFiles");

async function test(options) {

  let reader = new XlsxDataReader(options);

  let transform1 = new RepeatCellTransform(options);
  let transform2 = new RowAsObjectTransform(options);
  let transform3 = new FormatJSON();

  let outputFile = "./test/output/RepeatCell/" + path.parse(options.url).name + ".json";
  console.log("output: " + outputFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  let writer = fs.createWriteStream(outputFile, { encoding: "utf-8", autoClose: false });

  await pipeline(reader, transform1, transform2, transform3, writer);

  let expectedFile = outputFile.replace("/output/", "/expected/");
  let exitCode = compareFiles(outputFile, expectedFile, 2);
  return exitCode;
}

(async () => {
  if (await test({
    url: "./test/data/xlsx/State_Voter_Registration_July_2024.xlsx",
    hasHeader: true,
    heading: "Active",
    cells: 9,
    "RepeatCell.column": 0
  })) return 1;
})();
