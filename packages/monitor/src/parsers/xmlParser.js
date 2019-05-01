const Parser = require('./parser');
const { ParseType, convertToJson } = require('../utils/parse');
const { format, userAgent } = require('../utils/constants').Utils;

class XmlParser extends Parser {
  /**
   * Construct a new XmlParser
   *
   * @param {Object} data the data we want to parse and match
   * @param {Proxy} the proxy to use when making requests
   */
  constructor(request, site, data, proxy) {
    super(request, site, data, proxy, 'XmlParser');
  }

  async run() {
    const { url } = this._site;
    let responseJson;
    try {
      const response = await this._request({
        method: 'GET',
        uri: `${this._data.site.url}/sitemap_products_1.xml?from=1&to=299999999999999999`,
        proxy: format(this._proxy) || undefined,
        rejectUnauthorized: false,
        json: false,
        simple: true,
        gzip: true,
        headers: {
          'User-Agent': userAgent,
        },
      });
      responseJson = await convertToJson(response);
    } catch (error) {
      const rethrow = new Error('unable to make request');
      rethrow.status = error.statusCode || 404; // Use the status code, or a 404 if no code is given
      throw rethrow;
    }
    const responseItems = responseJson.urlset.url.filter(i => i['image:image']);
    const products = responseItems.map(item => ({
      url: item.loc[0],
      updated_at: item.lastmod[0],
      title: item['image:image'][0]['image:title'][0],
      handle: item.loc[0].substring(item.loc[0].lastIndexOf('/')),
    }));
    const matchedProduct = super.match(products);

    if (!matchedProduct) {
      throw new Error('unable to match the product');
    }
    let fullProductInfo = null;
    try {
      await matchedProducts.forEach(async product => {
        const info = await Parser.getFullProductInfo(product.url, this._request);

        if (!info) {
          // TODO: should we throw here?
          throw new Error('Unable to get full product info!');
        }
        fullProductsInfo.push(info);
      });
      return fullProductsInfo;
    } catch (errors) {
      throw new Error('unable to get full product info');
    }
  }
}
module.exports = XmlParser;
