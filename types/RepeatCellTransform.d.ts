declare const _exports: {
    new (options?: {
        column?: number | undefined;
    } | undefined): {
        column: any;
        repeatValue: string;
        prevLen: number;
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
//# sourceMappingURL=RepeatCellTransform.d.ts.map