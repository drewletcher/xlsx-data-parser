declare const _exports: {
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
        /**
         * Internal call from streamWriter to process an object
         * @param {*} row
         * @param {*} encoding
         * @param {*} callback
         */
        _transform(row: any, encoding: any, callback: any): void;
    };
};
export = _exports;
//# sourceMappingURL=RepeatHeadingTransform.d.ts.map