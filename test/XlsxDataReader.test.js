/**
 * test/testReader.js
 */

const _process_events = require("./_processEvents");
const XlsxDataReader = require("../lib/XlsxDataReader");
const FormatJSON = require('../lib/FormatJSON');
const { finished } = require('stream/promises');
const fs = require("fs");
const path = require("path");
const compareFiles = require("./_compareFiles");

var count = 0;

async function test(options) {
  try {
    ++count;
    let outputName = path.parse(options.url).name + count;

    let reader = new XlsxDataReader(options);

    let transform = new FormatJSON();

    let outputFile = "./test/output/XlsxDataReader/" + outputName + ".json";
    console.log("output: " + outputFile);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    let writer = fs.createWriteStream(outputFile, { encoding: "utf-8", autoClose: false });

    reader.pipe(transform).pipe(writer);
    await finished(writer);

    let expectedFile = outputFile.replace("/output/", "/expected/");
    let exitCode = compareFiles(outputFile, expectedFile, 2);
    return exitCode;
  }
  catch (err) {
    console.error(err);
    return 1;
  }
}

(async () => {
  if (await test({ url: "./test/data/xlsx/HelloWorld.xlsx" })) return 1;
  if (await test({ url: "./test/data/xlsx/foofile.xlsx" })) return 1;
  if (await test({ url: "./test/data/xlsx/foofile.xls", sheetName: "foo", missingCells: true })) return 1;

  let retCode = await test({
    url: "http://dev.oby4.org/data/test/data/input/foofile.xlsx",
    http: {
      auth: "test:data"
    },
    missingCells: true
  });
  if (retCode) return 1;

  retCode = await test({
    url: "./test/data/xlsx/State_Voter_Registration_July_2024.xlsx",
    raw: true,
    cellDates: false
  });
  if (retCode) return 1;

})();
