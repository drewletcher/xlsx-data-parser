export = XlsxDataReader;
declare class XlsxDataReader {
    /**
     *
     * @param {object}     options
     * @param {URL|string} options.url
     * @param {object}     options.worksheet
     * @param {any}        see XlsxDataParser for all options
     */
    constructor(options: {
        url: URL | string;
        worksheet: object;
    });
    options: {
        url: URL | string;
        worksheet: object;
    };
    _construct(callback: any): Promise<void>;
    parser: XlsxDataParser | undefined;
    /**
     * Fetch data from the underlying resource.
     * @param {*} size <number> Number of bytes to read asynchronously
     */
    _read(size: any): Promise<void>;
}
import XlsxDataParser = require("./XlsxDataParser");
//# sourceMappingURL=XlsxDataReader.d.ts.map