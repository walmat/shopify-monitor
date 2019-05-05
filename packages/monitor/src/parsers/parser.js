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
  static getFullProductInfo(productUrl, request) {
    console.log(productUrl);
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
          res =>
            // {productUrl}.js contains the format we need -- just return it
            JSON.parse(res),
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
              title: json.title,
              vendor: json.provider,
              handle: json.product_id,
              variants: json.offers.map(offer => ({
                title: offer.title,
                id: offer.offer_id,
                price: `${offer.price}`,
                available: offer.in_stock || false,
              })),
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
      const { positive, negative } = pair;
      const matches = matchKeywords(products, { pos: positive, neg: negative });

      if (matches) {
        matchedProducts.push(matches);
      }
    });
    // console.log(`[DEBUG]: %s Matched products: %j`, this._name, matchedProducts);
    return matchedProducts;
  }
}

module.exports = Parser;
