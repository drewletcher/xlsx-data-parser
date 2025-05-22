/**
 * test/saxStream
 *
 * Test SAX.js stream.
 */

import XLSX from 'xlsx';
import fs from "node:fs";

console.log("getCells");

let options = {
  raw: true,
  cellFormula: false, // .f
  cellHTML: false, // .h
  cellNF: true, // .z Number (cell) Format
  cellStyles: false, // .s
  cellText: true,  // .w
  cellDates: true // t:"d" and .v as UTC date string, instead of t:"n" and v. as number
};

let data = fs.readFileSync("./test/data/xlsx/foofile.xlsx");
let workbook = XLSX.read(data, options);
let worksheet = workbook.Sheets[ "foo" ];

console.log("output => ./test/output/XLSX/getCells.json");
var output = fs.openSync("./test/output/XLSX/getCells.json", "w");
fs.writeSync(output, "{\n");

let count = 0;
for (let [ a1_address, cell ] of Object.entries(worksheet)) {
  fs.writeSync(output, (count > 0 ? ",\n" : "") + '"' + a1_address + '": ' + JSON.stringify(cell) );
  ++count;
}

fs.writeSync(output, "\n}\n");
fs.closeSync(output);

console.log("completed");
