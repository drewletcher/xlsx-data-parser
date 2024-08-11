/**
 * httpRequest
 * Takes some Axios style request config options.
 * These request options are converted to Node.js options for HTTP, HTTPS, HTTP/2
 *
 * @param {URL|string} url The absolute or relative input URL to options.
 * @param {object} options HTTP options parameters.
 * @param {string} options.base URL to use as base for requests if url is relative.
 * @param {object} options.params object containing URL querystring parameters.
 * @param {string} options.httpVersion HTTP version to use 1.0, 1.1, 2
 * @param {string} options.method HTTP options method, default is GET
 * @param {number} options.timeout options timeout ms, default 5000ms
 * @param {object} options.headers HTTP options headers
 * @param {object} options.cookies array of HTTP cookies strings
 * @param {string} options.auth Basic authentication i.e. 'user:password' to compute an Authorization header.
 * @param {string} options.responseType If set to 'stream' the response will be returned when headers are received.
 * @param {TypedArray|string} [data]
 * @returns
 */
declare function _exports(url: URL | string, options: {
    base: string;
    params: object;
    httpVersion: string;
    method: string;
    timeout: number;
    headers: object;
    cookies: object;
    auth: string;
    responseType: string;
}, data?: TypedArray | string): Promise<any>;
declare namespace _exports {
    export { createReadStream };
}
export = _exports;
/**
 * Create an object mode readstream from the URL.
 * @param {string} url Override smt.schema with a filename in the same locus.
 * @param {object} options http request options, see httpRequest
 * @returns a node.js readstream if successful.
*/
declare function createReadStream(url: string, options: object): Promise<any>;
//# sourceMappingURL=httpRequest.d.ts.map