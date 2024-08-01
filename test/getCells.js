/**
 * test/saxStream
 *
 * Test SAX.js stream.
 */

const XLSX = require('xlsx');
const fs = require("node:fs");

let options = {
  raw: true,
  cellFormula: false, // .f
  cellHTML: false, // .h
  cellNF: true, // .z Number (cell) Format
  cellStyles: false, // .s
  cellText: true,  // .w
  cellDates: true // t:"d" and .v as UTC date string, instead of t:"n" and v. as number
};

let workbook = XLSX.readFile("./test/data/xlsx/foofile.xlsx", options);
let worksheet = workbook.Sheets[ "foo" ];

var output = fs.openSync("./test/output/XLSX/getCells.json", "w");
fs.writeSync(output, "{\n");

let count = 0;
for (let [ a1_address, cell ] of Object.entries(worksheet)) {
  fs.writeSync(output, (count > 0 ? ",\n" : "") + '"' + a1_address + '": ' + JSON.stringify(cell) );
  ++count;
}

fs.writeSync(output, "\n}\n");
fs.closeSync(output);
