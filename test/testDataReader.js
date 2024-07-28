/**
 * test/testReader.js
 */

const HtmlDataReader = require("../lib/HtmlDataReader");
const FormatJSON = require('../lib/FormatJSON');
const { finished } = require('stream/promises');
const fs = require("fs");
const path = require("path");
const compareFiles = require("./_compareFiles");

async function test(options) {
  let outputName = path.parse(options.url || options.data).name;

  if (options.data) {
    options.data = fs.readFileSync(options.data);
    outputName += "_data";
  }

  let reader = new HtmlDataReader(options);

  let transform = new FormatJSON();

  let outputFile = "./test/output/HtmlDataReader/" + outputName + ".json";
  console.log("output: " + outputFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  let writer = fs.createWriteStream(outputFile, { encoding: "utf-8", autoClose: false });

  reader.pipe(transform).pipe(writer);
  await finished(writer);

  let expectedFile = outputFile.replace("/output/", "/expected/");
  let exitCode = compareFiles(outputFile, expectedFile, 2);
  return exitCode;
}

(async () => {
  if (await test({ url: "./test/data/html/helloworld.html", id: "global" })) return 1;
  if (await test({ url: "https://www.census.gov/library/reference/code-lists/ansi.html" })) return 1;
  if (await test({ url: "https://www.sos.state.tx.us/elections/historical/jan2024.shtml" })) return 1;

  if (await test({ data: "./test/data/html/helloworld.html", id: /co..ic/ })) return 1;
  if (await test({ data: "./test/data/html/ansi.html", heading: "Congressional Districts" })) return 1;
  if (await test({ data: "./test/data/html/texas_jan2024.shtml" })) return 1;

})();
