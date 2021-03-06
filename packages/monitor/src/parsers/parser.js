/* eslint-disable class-methods-use-this */
const { matchKeywords } = require('../utils/parse');
const { format, userAgent, rfrl } = require('../utils/constants').Utils;

class Parser {
  /**
   * Retrieve the full product info for a given product
   *
   * This method takes a given single product url and attempts to
   * get the full info for the product, filling in the gaps missed
   * by xml or atom parsing. This method sends out two requests,
   * one for the `.js` file and one for the `.oembed` file. The
   * first request to complete returns the full product info. If
   * both requests error out, a list of errors is returned.
   *
   * @param {String} productUrl
   */
  static getFullProductInfo(productUrl, currency, request) {
    const genRequestPromise = uri =>
      request({
        method: 'GET',
        uri,
        proxy: format(this._proxy),
        rejectUnauthorized: false,
        json: false,
        simple: true,
        gzip: true,
        headers: {
          'User-Agent': userAgent,
        },
      });

    return rfrl(
      [
        genRequestPromise(`${productUrl}.js`).then(
          res => {
            // {productUrl}.js contains the format we need -- just return it
            const json = JSON.parse(res);

            return {
              name: json.title,
              url: productUrl,
              price: `${json.price}`.endsWith('00')
                ? `${`${json.price}`.slice(0, -2)} ${currency}`
                : `${json.price}`,
              image: json.featured_image.startsWith('//')
                ? `https://${json.featured_image.slice(2, json.featured_image.length)}`
                : json.featured_image,
              variants: json.variants.reduce(
                (result, { id, title, available }) => [
                  ...result,
                  ...(available
                    ? [
                        {
                          id,
                          name: title,
                        },
                      ]
                    : []),
                ],
                [],
              ),
              timestamp: new Date(),
            };
          },
          error => {
            // Error occured, return a rejection with the status code attached
            const err = new Error(error.message);
            err.status = error.statusCode || 404;
            throw err;
          },
        ),
        genRequestPromise(`${productUrl}.oembed`).then(
          res => {
            // {productUrl}.oembed requires a little transformation before returning:
            const json = JSON.parse(res);

            return {
              name: json.title,
              url: productUrl,
              price: `${json.offers[0].price}`.endsWith('00')
                ? `${`${json.offers[0].price}`.slice(0, -2)} ${currency}`
                : `${json.offers[0].price}`,
              image: json.thumbnail_url.startsWith('//')
                ? `https://${json.thumbnail_url.slice(2, json.thumbnail_url.length)}`
                : json.thumbnail_url,
              variants: json.offers.reduce(
                (result, { offer_id: id, title, in_stock: available }) => [
                  ...result,
                  ...(available
                    ? [
                        {
                          id,
                          name: title,
                        },
                      ]
                    : []),
                ],
                [],
              ),
              timestamp: new Date(),
            };
          },
          error => {
            // Error occured, return a rejection with the status code attached
            const err = new Error(error.message);
            err.status = error.statusCode || 404;
            throw err;
          },
        ),
      ],
      `productInfo - ${productUrl}`,
    );
  }

  /**
   * Construct a new parser
   */
  constructor(request, data, proxy, name) {
    this._request = request;
    this._data = data;
    this._proxy = proxy;
    this._name = name || 'Parser';
  }

  /**
   * Getter to determine if the parser is special or not
   */
  get isSpecial() {
    return false;
  }

  async run() {
    throw new Error('Not Implemented! This should be implemented by subclasses!');
  }

  /**
   * Perform Product Matching based on the parse type
   */
  match(products) {
    const matchedProducts = [];
    // TODO: When we support multiple parsing "types", switch based on that.
    this._data.keywords.forEach(pair => {
      const { positive, negative, monitorInfoId } = pair;
      const matches = matchKeywords(products, { pos: positive, neg: negative });

      if (matches) {
        matchedProducts.push({ monitorInfoId, matches });
      }
    });
    return matchedProducts;
  }
}

module.exports = Parser;
