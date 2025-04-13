# xlsx-data-parser 1.0.x

Parse and stream tabular data from XLSX, XLS and ODS documents using Node.js and [SheetJS Community Edition](https://sheetjs.com/).

This readme explains how to use xlsx-data-parser in your code or as a stand-alone program.

Related projects: [html-data-parser](https://gitlab.com/drewletcher/html-data-parser#readme), [pdf-data-parser](https://gitlab.com/drewletcher/pdf-data-parser#readme), [text-data-parser](https://gitlab.com/drewletcher/text-data-parser#readme)

## Installation

For use as command line utility. Requires Node.js 18+.

```bash
npm -g install xlsx-data-parser
```

For use as module in a Node.js project. See Developers Guide below.

```bash
npm install xlsx-data-parser
```

## CLI Program

---

Parse tabular data from a sheet in an XLSX workbook document.

```bash
xdp <filename|URL> <output-file> --options=filename.json --sheet=sheetname --range="A1:Z9" --heading=title --cells=# --headers=name1,name2,... --format=csv|json|rows

  `filename|URL` - path name or URL of XLSX file to process, required.
  `output-file`  - local path name for output of parsed data, default stdout.
  `--options`    - json or jsonc file containing JSON object with xdp options, default xdp.options.json.
  `--sheet`      - sheet name (tab) in workbook to process, default none (first sheet in workbook).
  `--range`      - data selection, A1-style range, e.g. "A3:M24", default all rows/columns.
  `--heading`    - text of heading to find in worksheet that precedes desired data, default none.
  `--cells`      - number of cells for a data row, minimum or "min-max", default = "1-256".
  `--headers`    - comma separated list of column names for data, default none the first row contains names.
  `--format`     - output data format CSV, JSON, or ROWS (JSON array of arrays), default JSON.
```

Note: If the `xdp` command conflicts with another program on your system use `xlsxdataparser` instead.

### Options File

The options file supports options for all xlsx-data-parser modules. Parser will read plain JSON files or JSONC files with Javascript style comments.

```javascript
{
  /* XlsxDataParser options */

  // url - local path name or URL of XLSX file to process, required.
  "url": "",
  // output - local path name for output of parsed data, default stdout.
  "output": "",
  // format - output data format CSV, JSON or rows, default JSON, rows is JSON array of arrays (rows).
  "format": "json",
  // sheetName - name of sheet (tab) to processing in workbook, default none (first sheet in workbook).
  "sheetName": null,
  // range - data selection, A1-style range, e.g. \"A3:M24\", default all rows/columns.
  "range": null,
  // heading - text of heading to find in first column that precedes desired data, default none.
  "heading": null,
  // stopHeading - text of heading to find in first column that follows desired data, default none.
  "stopHeading": null,
  // cells - number of cells for a data row, minimum or "min-max", default = "1-256".
  "cells": "1-256",
  // missingCells - insert null value into output row for missing cells
  "missingCells": false,
  // trim whitespace from output values, default: true.
  "trim": true,
  // output raw worksheet cell values, one big object with property for each cell
  "raw": false,

  /* RowAsObjectTransform options */

  // hasHeaders - data has a header row, if true and headers set then headers overrides header row.
  "RowAsObject.hasHeader": true
  // headers - comma separated list of column names for data, default none. When not defined the first row encountered will be treated as column names.
  "RowAsObject.headers": []

  /* RepeatCellTransform options */

  // column - column index of cell to repeat, default 0.
  "RepeatCell.column": 0

  /* RepeatHeadingTransform options */

  // hasHeaders - data has a header row, if true and headers set then headers overrides header row.
  "RepeatHeading.hasHeader": true
  // header - column name for the repeating heading field. Can optionally contain suffix :m:n with index for inserting into header and data rows.
  "RepeatHeading.header": "subheading:0:0"

  /* XLSX options */
  // see XLSX Options below

  /* HTTP options */
  // see HTTP Options below

}
```

Note: Transform property names can be shortened to `hasHeader`, `headers`, `column` and `header`.

### Examples

```bash
xdp ./test/data/xlsx/helloworld.xlsx --headers="Greeting" --format=csv
```

```bash
xdp ./test/data/xlsx/ansi.xlsx  --heading="Congressional Districts"
```

```bash
xdp https://www.sos.state.tx.us/elections/historical/jan2024.xlsx ./test/output/xdp/tx_voter_reg.json
```

```bash
xdp --options="./test/RepeatCell.options.json"

RepeatCell.options.json:
{
  "url": "./test/data/xlsx/texas_jan2024.xlsx",
  "output": "./test/output/xdp/repeat_cell.json",
  "format": "json",
  "cells": 7,
  "RepeatCell.column": 0
}
```

## Developer Guide

---

### XlsxDataParser

XlsxDataParser given a XLSX document or worksheet will output an array of arrays (rows). Additionally, use the streaming classes XlsxDataReader and RowAsObjectTransform transform to convert the arrays to Javascript objects.  With default settings XlsxDataParser will output __all__ rows found in the worksheet. Using [XlsxDataParser Options](#xlsx-data-parser-options) `heading` the parser can filter content to retrieve data from the desired rows in the worksheet.

Some rows may have more cells than other rows. For example a heading or description paragraph will be a row (array) with one cell (string) value.  See [Notes](#notes) below.

### Basic Usage

```javascript
const { XlsxDataParser } = require("xlsx-data-parser");

let parser = new XlsxDataParser({url: "filename.xlsx"});

async function parseDocument() {
  var rows = await parser.parse();
  // process the rows
}
```

### XlsxDataParser Options

XlsxDataParser constructor takes an options object with the following fields. One of `url` or `worksheet` arguments is required.

`{String|URL} url` - The local path or URL of the XLSX document.

`{String} worksheet` - XLSX worksheet object, the module using XlsxDataParser opens the XLSX workbook and choses the worksheet.

Common Options:

`{String|regexp} heading` - Heading in the worksheet after which the parser will look for data; optional, default: none. The parser does a string comparison or regexp match looking for first occurrence of `heading` value in first column. If `heading` is not specified then data output contains all rows found in the worksheet.

`{Number} cells` - Minimum number of cells in tabular data; optional, default: 1. The parser will NOT output rows with less than `cells` number of cells.

`{Boolean} newlines` - Preserve new lines in cell data; optional, default: false. When false newlines will be replaced by spaces. Preserving newlines characters will keep the formatting of multiline text such as descriptions. Though, newlines are problematic for cells containing multi-word identifiers and keywords that might be wrapped in the cell text.

`{Boolean} trim` - trim whitespace from output values, default: true.

### XLSX Options

`{Object} xlsx` - options to pass thru to XLSX.readfile()
`{Boolean} xlsx.cellDates` = return date values instead of text representation, default true.

* [XLSX.readFile() options](https://docs.sheetjs.com/docs/api/parse-options)

### HTTP options

HTTP requests are mode using Node.js HTTP modules. See the source code file lib/httpRequest.js for more details.

`{Object} http` - options to pass thru to HTTP request
`{String} http.method` - HTTP method, default is "GET"
`{Object} http.params` - object containing URL querystring parameters.
`{Object} http.headers` - object containing HTTP headers
`{Array}  http.cookies` - array of HTTP cookie strings
`{String} http.auth` - string for Basic Authentication (Authorization header), i.e. "user:password".

## Streaming Usage

---

### XlsxDataReader

XlsxDataReader is a Node.js stream reader implemented with the Object mode option. It uses XlsxDataParser to stream one data row (array) per chunk.

```javascript
const { XlsxDataReader } = require("xlsx-data-parser");

let reader = new XlsxDataReader({url: "filename.xlsx"});
var rows = [];

reader.on('data', (row) => {
  rows.push(row)
});

reader.on('end', () => {
  // do something with the rows
});

reader.on('error', (err) => {
  // log error
})
```

### XlsxDataReader Options

XlsxDataReader constructor options are the same as [XlsxDataParser Options](#xlsx-data-parser-options).

### RowAsObjectTransform

XlsxDataReader operates in Object Mode. The reader outputs arrays (rows). To convert rows into Javascript objects use the RowAsObjectTransform transform.  XlsxDataReader operates in Object mode where a chunk is a Javascript Object of <name,value> pairs.

```javascript
const { XlsxDataReader, RowAsObjectTransform } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new XlsxDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RowAsObjectTransform Options

RowAsObjectTransform constructor takes an options object with the following fields.

`{array} headers` - array of cell property names; optional, default: none. If a headers array is not specified then parser will assume the first row found contains cell property names.

`{Boolean} hasHeaders` - data has a header row, if true and headers options is set then provided headers override header row. Default is true.

If a row is encountered with more cells than in the headers array then extra cell property names will be the ordinal position. For example if the data contains five cells, but only three headers where specified.  Specifying `options = { headers: [ 'name', 'type', 'info' ] }` then the Javascript objects in the stream will contain `{ "name": "value1", "type": "value2", "info": "value3", "4": "value4", "5": "value5" }`.

### RepeatCellTransform

The RepeatCellTransform will normalize data the was probably generated by a report writer. The specified cell will be repeated in following rows that contain one less cell. In the following example "Dewitt" will be repeated in rows 2 and 3.

**XLSX Worksheet**

```
County   Precincts  Date/Period   Total
Dewitt          44  JUL 2023     52,297
                44  OCT 2023     52,017
                44  JAN 2024     51,712
```

**Output**

```
[ "County", "Precincts", "Date/Period", "Total" ]
[ "Dewitt", "44", "JUL 2023", "52,297" ]
[ "Dewitt", "44", "OCT 2023", "52,017" ]
[ "Dewitt", "44", "JAN 2024", "51,712" ]
```

### Example Usage

```javascript
const { XlsxDataReader, RepeatCellTransform } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new XlsxDataReader(options);
let transform1 = new RepeatCellTransform({ column: 0 });
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RepeatCellTransform Options

RepeatCellTransform constructor takes an options object with the following fields.

`{Number} column` - column index of cell to repeat, default 0.

### RepeatHeadingTransform

The RepeatHeadingTransform will normalize data the was probably generated by a report writer. Subheadings are rows containing a single cell interspersed in data rows. The header name is inserted in to the header row. The subheading value will be repeated in rows that follow until another subheading is encountered. In the following example `options = {header: "County:1:0"}`.

**XLSX Worksheet**

```
District  Precincts    Total

Congressional District 5
Maricopa        120  403,741
Pinal            30  102,512
Total:          150  506,253
```

**Output**

```
[ "District", "County", "Precincts", "Total" ]
[ "Congressional District 5", "Maricopa", "120", "403,741" ]
[ "Congressional District 5", "Pinal", "30", "102,512" ]
[ "Congressional District 5", "Total:", "150", "506,253" ]
```

```javascript
const { XlsxDataReader, RepeatHeadingTransform } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new XlsxDataReader(options);
let transform1 = new RepeatHeadingTransform({header: "County:1:0"});
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RepeatHeadingTransform Options

RepeatHeadingTransform constructor takes an options object with the following fields.

`{String} header` - column name for the repeating heading field. Can optionally contain an index of where to insert the header in the header row. Default "heading:0".

`{Boolean} hasHeaders` - data has a header row, if true and headers options is set then provided headers override header row. Default is true.

### FormatCSV and FormatJSON

The `xdpdataparser` CLI program uses the FormatCSV and FormatJSON transforms to covert Javascript Objects into strings that can be saved to a file.

```javascript
const { XlsxDataReader, RowAsObjectTransform, FormatCSV } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new XlsxDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let transform2 = new FormatCSV();

await pipeline(reader, transform1, transform2, process.stdout);
```

## Examples

---

In the source code the xlsx-data-parser.js program and the Javascript files in the /test folder are good examples of using the library modules.

### Hello World

[HelloWorld.xlsx](./test/data/xlsx/helloworld.xlsx) is a XLSX document containing a single worksheet with a single cell containing the string "Hello, world!". The XlsxDataParser output is one row with one cell.

```json
[
  ["Hello, world!"]
]
```

To transform the row array into an object specify the headers option to RowAsObjectTransform transform.

```javascript
let transform = new RowAsObjectTransform({
  headers: [ "Greeting" ]
})
```

Output as JSON objects:

```json
[
  { "Greeting": "Hello, world!" }
]
```

## Notes

---

* Does not support identification of titles, headings, column headers, etc. by using style information for a cell.
* Vertical spanning cells are parsed with first row where the cell is encountered. Subsequent rows will not contain the cell and have one less cell. Currently, vertical spanning cells must be at the end of the row otherwise the ordinal position of cells in the following rows will be incorrect, i.e. missing values are not supported.
