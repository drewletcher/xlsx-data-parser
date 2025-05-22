/**
 * test/testParser.js
 */

import "./_processEvents.js";
import XlsxDataParser from "../lib/XlsxDataParser.js";
import fs from "node:fs";
import path from "node:path";
import compareFiles from "./_compareFiles.js";

var count = 0;

async function test(options) {
  try {
    ++count;
    let outputName = path.parse(options.url).name + count;

    let parser = new XlsxDataParser(options);

    let rows = await parser.parse();

    parser.removeAllListeners('error');

    let outputFile = "./test/output/XlsxDataParser/" + outputName + ".json";
    console.log("output: " + outputFile);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(rows, null, 2));

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
  if (await test({ url: "./test/data/xlsx/foofile.xls", sheetName: "foo" })) return 1;

  let retCode = await test({
    url: "http://dev.oby4.org/data/test/_data/foofile.xlsx",
    http: {
      auth: "test:data"
    }
  });
  if (retCode) return 1;

  retCode = await test({
    url: "./test/data/xlsx/State_Voter_Registration_July_2024.xlsx",
    raw: false,
    cellDates: false
  });
  if (retCode) return 1;

})();
