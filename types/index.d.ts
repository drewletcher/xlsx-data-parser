export const XlsxDataParser: {
    new (options?: {
        url?: string | URL | undefined;
        worksheet?: Object | undefined;
        sheetName?: string | undefined;
        range?: string | undefined;
        cells?: string | number | undefined;
        missingCells?: boolean | undefined;
        heading?: string | undefined;
        stopHeading?: string | undefined;
        repeating?: boolean | undefined;
        trim?: boolean | undefined;
        raw?: boolean | undefined;
        xlsx?: Object | undefined;
        http?: Object | undefined;
    }): import("./XlsxDataParser.js");
};
export const XlsxDataReader: {
    new (options: {
        url?: string | URL | undefined;
        worksheet?: Object | undefined;
        sheetName?: string | undefined;
        range?: string | undefined;
        cells?: string | number | undefined;
        missingCells?: boolean | undefined;
        heading?: string | undefined;
        stopHeading?: string | undefined;
        repeating?: boolean | undefined;
        trim?: boolean | undefined;
        raw?: boolean | undefined;
        xlsx?: Object | undefined;
        http?: Object | undefined;
    }): import("./XlsxDataReader.js");
};
export const RowAsObjectTransform: {
    new (options?: {
        hasHeader?: Object | undefined;
        headers?: string[] | undefined;
    } | undefined): {
        headers: any;
        hasHeader: any;
        _transform(row: Object, encoding: string, callback: Function): void;
        _headers: Object | undefined;
    };
};
export const RepeatCellTransform: {
    new (options?: {
        column?: number | undefined;
    } | undefined): {
        column: any;
        repeatValue: string;
        prevLen: number;
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export const RepeatHeadingTransform: {
    new (options?: {
        header?: string | undefined;
        hasHeader?: boolean | undefined;
    } | undefined): {
        header: any;
        headerIndex: any;
        dataIndex: any;
        hasHeader: any;
        subHeading: string;
        count: number;
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export const FormatCSV: {
    new (options: any): {
        first: boolean;
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export const FormatJSON: {
    new (options: any): {
        first: boolean;
        _transform(row: Object, encoding: string, callback: Function): void;
        _flush(callback: Function): void;
    };
};
//# sourceMappingURL=index.d.ts.map