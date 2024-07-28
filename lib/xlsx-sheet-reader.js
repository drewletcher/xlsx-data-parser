/**
 * storage/junctions/xlsx-data-parser
 *
 * Iterates worksheet cells groups the cells into rows.
 *
 * Output is an stream of arrays.
 */
"use strict";

const { contentTypeIsJSON } = require('@dictadata/lib');
const { Readable } = require('node:stream');

const XLSX = require('xlsx');

module.exports = class XlsxSheetReader extends Readable {

  /**
   *
   * @param {object}  worksheet XLSX worksheet object with cell properties
   * @param {object}  [options]
   * @param {string}  [options.range]       - data selection, A1-style range, e.g. "A3:M24", default all rows/columns
   * @param {string}  [options.heading]     - PDF section heading or text before data table, default: none
   * @param {string}  [options.stopHeading] - PDF section heading or text after data table, default: none
   * @param {number|string} [options.cells] - minimum number cells in a row for output, or "min-max" e.g. "7-9"
   * @param {boolean} [options.repeating]   - indicates if table headers are repeated on each page, default: false
   * @param {boolean} [options.trim]        - trim cell values, default true
   */
  constructor(worksheet, options = {}) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 64,
      autoDestroy: false
    };
    super(streamOptions);
    //super({ captureRejections: true });

    this.worksheet = worksheet;
    this.options = Object.assign({}, options);

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
    this.rows = []; // array of data values
    this.headingFound = Object.hasOwn(options, "heading") ? false : true;
    this.tableFound = this.headingFound;
    this.tableDone = false;
    this._headersRow;
  }

  async _construct(callback) {
    this.started = false;
    callback();
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

  inCellRange(rowlen) {
    return (rowlen >= this.cells.min && rowlen <= this.cells.max) || (rowlen === this.cells.heading);
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

  _destroy() {
    this.options.tableDone = true;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    // ignore size
    try {
      if (!this.started) {
        this.started = true;
        this.parse();
      }
    }
    catch (err) {
      this.destroy(err);
    }
  }

};
