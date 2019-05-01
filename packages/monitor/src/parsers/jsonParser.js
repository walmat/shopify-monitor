const { format, userAgent } = require('../utils/constants').Utils;
const Parser = require('./parser');

class JsonParser extends Parser {
  /**
   * Construct a new JsonParser
   *
   * @param {Class} request request.js constructor
   * @param {Object} data the data we want to parse and match
   * @param {Proxy} the proxy to use when making requests
   */
  constructor(request, site, data, proxy) {
    super(request, site, data, proxy, 'JsonParser');
  }

  async run() {
    let products;
    const { url } = this._site;
    try {
      const response = await this._request({
        method: 'GET',
        uri: `${url}/products.json`,
        proxy: format(this._proxy) || undefined,
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
    const matchedProducts = super.match(products);

    if (!matchedProducts) {
      throw new Error('unable to match products');
    }
    return matchedProducts;
  }
}

module.exports = JsonParser;
