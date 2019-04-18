const { formatProxy, userAgent } = require('../monitor').Utils;
const Parser = require('./parser');

class JsonParser extends Parser {
  /**
   * Construct a new JsonParser
   *
   * @param {Class} request request.js constructor
   * @param {Object} data the data we want to parse and match
   * @param {Proxy} the proxy to use when making requests
   */
  constructor(request, data, proxy) {
    super(request, data, proxy, 'JsonParser');
  }

  async run() {
    const { url } = this._data.site;
    let products;
    try {
      const response = await this._request({
        method: 'GET',
        uri: `${url}/products.json`,
        proxy: formatProxy(this._proxy) || undefined,
        rejectUnauthorized: false,
        json: false,
        simple: true,
        gzip: true,
        headers: {
          'User-Agent': userAgent,
        },
      });
      ({ products } = JSON.parse(response));
    } catch (error) {
      const rethrow = new Error('unable to make request');
      rethrow.status = error.statusCode || 404; // Use the status code, or a 404 if no code is given
      throw rethrow;
    }
    const matchedProduct = super.match(products);

    if (!matchedProduct) {
      throw new Error('unable to match the product');
    }
    return {
      ...matchedProduct,
      url: `${url}/products/${matchedProduct.handle}`,
    };
  }
}

module.exports = JsonParser;
