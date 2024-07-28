/**
 * lib/XlsxDataParser
 *
 * Gets table cells and group them into rows.
 *
 * Output is an array of arrays.
 */
"use strict";

const fs = require('node:fs');
const path = require('node:path');
const httpRequest = require('./httpRequest');
const { Readable, Writable } = require('node:stream');
const { pipeline, finished } = require('node:stream/promises');
const EventEmitter = require('node:events');
require('colors');

module.exports = class XlsxDataParser extends EventEmitter {

  /**
   *
   * @param {object}  [options]
   * @param {string}   options.url          - the URL or local file name of the .xlsx
   * @param {Buffer|string} options.data    - XLSX file data as an array, instead of using url
   * @param {string}  [options.range]       - data selection, A1-style range, e.g. "A3:M24", default all rows/columns
   * @param {string}  [options.heading]     - PDF section heading or text before data table, default: none
   * @param {string}  [options.stopHeading] - PDF section heading or text after data table, default: none
   * @param {number|string} [options.cells] - minimum number cells in a row for output, or "min-max" e.g. "7-9"
   * @param {boolean} [options.repeating]   - indicates if table headers are repeated on each page, default: false
   * @param {boolean} [options.trim]        - trim cell values, default true
   */
  constructor(options = {}) {
    super({ captureRejections: true });

    this.options = Object.assign({ trim: true }, options);

    let range = Object.hasOwn(this.options, "range") ? options.range.split(":") : worksheet[ "!ref" ].split(":");
    if (range.length > 0)
      this.topLeft = this.getAddress(range[ 0 ]);
    if (range.length > 1)
      this.bottomRight = this.getAddress(range[ 1 ]);

    this.missingCells = options.missingCells;

    this.cells = {
      min: 1,
      max: 256,
      heading: 0  // RepeatHeading
    };

    if (options.cells) {
      if (typeof options.cells === "number") {
        this.cells.min = options.cells;
      }
      else if (typeof options.cells === "string") {
        let minmax = options.cells.split("-")
        if (minmax.length > 1)
          this.cells.min = parseInt(minmax[ 0 ]);
        if (minmax.length > 2)
          this.cells.max = parseInt(minmax[ 1 ]);
      }
    }

    let header = options.RepeatHeading?.header || options[ "RepeatHeading.header" ] || options.header;
    if (header)
      this.cells.heading = 1;

    // parsing properties
    this.worksheet;
    this.rows = []; // array of data values
    this.headingFound = Object.hasOwn(options, "heading") ? false : true;
    this.tableFound = this.headingFound;
    this.tableDone = false;
  }

  /**
   * Parse the worksheet cells.
   * @returns Rows an array containing arrays of data values.
   * If using an event listener the return value will be an empty array.
   */
  async parse() {

    try {
      await this.parseCells();

      this.push(null);
      // this.emit("end");
      // return this.rows;
    }
    catch (err) {
      console.error(err);
      this.destroy(err);
      //this.emit("error", err);
    }
  }


  getAddress(a1_address) {
    let addr = {}
    let rx = a1_address.match(/([A-Z]*)([0-9]*)/)
    addr.column = rx[ 1 ];
    addr.row = rx[ 2 ];
    return addr;
  }

  /**
   * determines if a1 is above-left of or equal to a2
   * @param {*} a1
   * @param {*} a2
   * @returns
   */
  compareAddress(a1, a2) {
    if (parseInt(a1.row) <= parseInt(a2.row) && a1.column <= a2.column)
      return true;
    else
      return false;
  }

  inRange(address) {
    if (!this.bottomRight)
      return true;  // no range specified

    if (this.compareAddress(this.topLeft, address) && this.compareAddress(address, this.bottomRight))
      return true;
    else
      return false;
  }

  ltCol(col1, col2) {
    return (col1.length < col2.length || (col1.length === col2.length && col1 < col2));
  }

  lteCol(col1, col2) {
    return (col1.length < col2.length || (col1.length === col2.length && col1 <= col2));
  }

  incCol(col) {
    const Z = 90;
    let chars = Array.from(col);

    let rollover = false;
    let i = chars.length - 1;
    while (i >= 0) {
      let c = chars[ i ].charCodeAt(0);
      c++;
      if (c <= Z) {
        chars[ i ] = String.fromCharCode(c);
        rollover = false;
        break;
      }
      else {
        chars[ i ] = 'A';
        rollover = true;
      }
      --i;
    }

    if (rollover)
      chars.push('A');
    return chars.join("");
  }

  /**
   *
   * @param {*} rowlen
   * @returns
   */
  inCellRange(rowlen) {
    return (rowlen >= this.cells.min && rowlen <= this.cells.max) || (rowlen === this.cells.heading);
  }

  /**
  *
  * @param {object} row - the row to check
  * @param {string} heading - text to compare against
  */
  compareHeading(row, heading) {
    if (row == null || row.length === 0)
      return false;

    if (Object.prototype.toString.call(heading).slice(8, -1) === "RegExp")
      return heading.test(row[ 0 ]);
    else
      return row[ 0 ] === heading;

  }

  rowsEqual(row1, row2) {
    if (!row1 || !row2) {
      console.log("row1 " + row1);
      console.log("row2 " + row2);
      return false;
    }

    var i = row1.length;
    if (i !== row2.length)
      return false;

    while (i--) {
      if (row1[ i ] !== row2[ i ])
        return false;
    }

    return true;
  }

  /**
   * Iterate the cells and determine rows.
   */
  async parseCells() {

    let row = [];
    this.count = 1;

    let prevAddress = this.topLeft;
    for (let [ a1_address, cell ] of Object.entries(this.worksheet)) {
      if (this.tableDone)
        break;

      if (a1_address[ 0 ] === '!') {
        if (a1_address === "!ref") {

        }
        continue;
      }

      let address = this.getAddress(a1_address);
      if (this.inRange(address)) {

        if (row.length >= 0 && (address.row !== prevAddress.row)) {
          if (this.missingCells && row.length >= this.cells.min) {
            // insert missing cells at end of row
            let col = this.incCol(prevAddress.column);
            while (this.lteCol(col, this.bottomRight.column)) {
              row.push(null);
              col = this.incCol(col);
            }
          }

          // done with this row
          if (this.filters(row))
            this.output(row);

          // start new row
          row = [];
          prevAddress.row = address.row;
          prevAddress.column = this.topLeft.column;
        }

        if (this.missingCells) {
          // insert missing cells into row
          let col = this.incCol(prevAddress.column);
          while (this.ltCol(col, address.column)) {
            row.push(null);
            col = this.incCol(col);
          }
        }

        // add cell value to row
        // https://docs.sheetjs.com/docs/csf/cell#cell-types
        switch (cell.t) {
          case "n": // numeric code
            if (XLSX.SSF.is_date(cell.z))
              // date format, take the text version; cellDates: false
              row.push(cell.w)
            else
              row.push(cell.v);
            break;

          case "s": // string text
            if ((Object.hasOwn(this.options, "trim") ? this.options.trim : true))
              row.push(cell.v.trim());
            else
              row.push(cell.v);
            break;

          case "d": // value converted to UTC string by Sheet.js; cellDates: true
          case "b": // boolean
            row.push(cell.v);
            break;

          case "e": // error
          case "z": // stub
          default:
            // do nothing
            break;
        }

        prevAddress = address;
      }
    }

    // push last row
    if (this.filters(row)) {
      this.output(row);
    }
  }

  /**
   * Performs row filtering.
   *
   * @param {*} row is an array of data values
   */
  filters(row) {
    if (!this.headingFound) {
      this.headingFound = this.compareHeading(row, this.options.heading);
    }
    else if (!this.tableFound) {
      this.tableFound = this.inCellRange(row.length);
    }
    else if (this.options.heading && !this.tableDone) {
      this.tableDone = !this.inCellRange(row.length) || this.compareHeading(row, this.options.stopHeading);
    }

    let output = this.headingFound && this.tableFound && !this.tableDone && this.inCellRange(row.length);

    if (output && (this.options.repeatingHeaders || this.options.repeating)) {
      // skip repeating header rows
      if (!this._headersRow)
        this._headersRow = row;
      else
        output = !this.rowsEqual(this._headersRow, row);
    }

    return output;
  }

  /**
   * Emits or appends data to output.
   *
   * @param {*} row is an array of data values
   */
  output(row) {
    this.push(row);
    /*
    if (this.listenerCount("data") > 0) {
      this.emit("data", row);
    }
    else
      this.rows.push(row);
    */
    this.count++;
  }

  /**
   * Emits or appends data to output.
   *
   * @param {*} row is an array of data values
   */
  output(row) {
    if (!this.inCellRange(row.length))
      return;

    if (this.listenerCount("data") > 0)
      this.emit("data", row);
    else
      this._rows.push(row);

    this.rowNum++;
  }

  /**
  *
  * @param {object} pattern - options.heading value
  * @param {string} text - text to compare
  */
  compareText(pattern, text) {
    if (!text)
      return false;

    if (Object.prototype.toString.call(pattern).slice(8, -1) === "RegExp")
      return pattern.test(text);
    else
      return text === pattern;

  }

  /**
   * Load and parse the XLSX document.
   * @returns Rows an array containing arrays of data values.
   * If using an event listener the return value will be an empty array.
   */
  async parseHTML() {

    // parsing properties
    let findHeading = Object.hasOwn(this.options, "heading");
    let foundHeading = false; // Object.hasOwn(this.options, "heading") ? false : true;
    let findTableId = Object.hasOwn(this.options, "id");
    let foundTable = false;   // foundHeading;

    //// table processing
    const tagOpen = {}; // track state of tag open elements

    let headingText = "";
    let cellText = "";
    let row = [];

    this._rows = [];
    this.rowNum = 0;
    let self = this;

    try {
      // pipe is supported, and it's readable/writable
      // same chunks coming in also go out.
      var rs;
      if (this.options.data)
        rs = Readable.from(this.options.data);
      else if (this.options.url.toLowerCase().startsWith("http"))
        rs = await httpRequest.createReadStream(this.options.url, this.options.http);
      else
        rs = fs.createReadStream(this.options.url);

      const strict = false; // set to false for XLSX mode
      const saxStream = sax.createStream(strict, this.saxOptions);

      saxStream.on("opentag", function (node) {
        // node object with name, attributes, isSelfClosing
        //console.log("opentag: " + JSON.stringify(node) + "\r\n");
        tagOpen[ node.name ] = tagOpen[ node.name ] ? ++tagOpen[ node.name ] : 1;
        switch (node.name) {
          case "TABLE":
            if (findTableId)
              foundTable = self.compareText(self.options.id, node.attributes[ "ID" ]);
            else if (findHeading)
              foundTable = foundHeading;
            else
              foundTable = true;
            break;
          case "TR":
            row = [];
            break;
          case "TH":
          case "TD":
            cellText = "";
            break;
        }
      });

      saxStream.on("closetag", function (tag) {
        // tag name
        //console.log("closetag: " + tag + "\r\n");
        --tagOpen[ tag ];
        switch (tag) {
          case "TABLE":
            foundTable = false;
            foundHeading = false;
            break;
          case "TR":
            if (foundTable && row.length > 0)
              self.output(row);
            break;
          case "TH":
          case "TD":
            if (foundTable) {
              if (!self.options.newlines)
                cellText = cellText.replace(/[\r|\n]\s+/g, " ");
              row.push(cellText);
            }
            break;
        }
      });

      saxStream.on("text", function (s) {
        // inner text string
        //console.log("text: " + s + "\r\n");
        if (tagOpen.H1 || tagOpen.H2 || tagOpen.H3 || tagOpen.H4 || tagOpen.H5 || tagOpen.H6) {
          headingText = s;
          if (findHeading && self.compareText(self.options.heading, headingText))
            foundHeading = true;
        }

        else if (tagOpen.TH || tagOpen.TD)
          if (foundTable)
            cellText += cellText ? " " + s : s;
      });


      saxStream.on("doctype", function (s) {
        // doctype string
        //console.log("doctype: " + JSON.stringify(s) + "\r\n");
      });

      saxStream.on("opentagstart", function (node) {
        // node object with name, attributes (empty)
        //console.log("opentagstart: " + JSON.stringify(node) + "\r\n");
      });

      saxStream.on("attribute", function (attr) {
        // attribute object with name, value
        //console.log("attribute: " + JSON.stringify(attr) + "\r\n");
      });

      saxStream.on("processinginstruction", function (o) {
        // object with "name", "body"
        //console.log("processinginstruction: " + JSON.stringify(o) + "\r\n");
      });

      saxStream.on("comment", function (s) {
        // comment string
        //console.log("comment: " + JSON.stringify(s) + "\r\n");
      });

      saxStream.on("script", function (s) {
        // script contents as string
        //console.log("script: " + JSON.stringify(s) + "\r\n");
      });

      saxStream.on("opencdata", function (tag) {
        // tag name
        //console.log("opencdata: " + tag + "\r\n");
      });

      saxStream.on("cdata", function (s) {
        // inner text string
        //console.log("cdata: " + s + "\r\n");
      });

      saxStream.on("closecdata", function (tag) {
        // tag name
        //console.log("closecdata: " + tag + "\r\n");
      });

      saxStream.on("end", function () {
        // stream has closed
        //console.log("end:" + "\r\n");
      });

      saxStream.on("ready", function () {
        // parser reset, ready to be reused.
        //console.log("ready:" + "\r\n");
      });

      saxStream.on("error", function (e) {
        // unhandled error
        console.error("error: ", e)
        // clear the error
        this._parser.error = null
        this._parser.resume()
      });

      // create a data sink, because saxStream doesn't see to be a proper async Writable
      let ws = new Writable({
        write(chunk, encoding, callback) {
          callback();
        }
      });

      let pipes = [];
      pipes.push(rs);
      pipes.push(saxStream);
      pipes.push(ws);
      pipeline(pipes);

      await finished(ws);

      this.emit("end");
      return this._rows;
    }
    catch (err) {
      console.error(err);
      this.emit("error", err);
    }
  }

};
