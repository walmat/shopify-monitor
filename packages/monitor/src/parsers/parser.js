/* eslint-disable class-methods-use-this */
const { ParseType, getParseType, matchVariant, matchKeywords } = require('../monitor/parse');
const { ErrorCodes, format, userAgent, rfrl } = require('../constants').Utils;

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
    const genRequestPromise = uri =>
      request({
        method: 'GET',
        uri,
        proxy: format(this._proxy) || undefined,
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
  constructor(request, task, proxy, name) {
    this._name = name || 'Parser';
    this._proxy = proxy;
    this._request = request;
    this._task = task;
    this._type = getParseType(task.product);
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
    switch (this._type) {
      case ParseType.Variant: {
        const product = matchVariant(products, this._task.product.variant, this._logger);
        if (!product) {
          const error = new Error('ProductNotFound');
          error.status = ErrorCodes.ProductNotFound;
          throw error;
        }
        return product;
      }
      case ParseType.Keywords: {
        const keywords = {
          pos: this._task.product.pos_keywords,
          neg: this._task.product.neg_keywords,
        };
        const product = matchKeywords(products, keywords, this._logger); // no need to use a custom filter at this point...
        if (!product) {
          // TODO: Maybe replace with a custom error object?
          const error = new Error('ProductNotFound');
          error.status = ErrorCodes.ProductNotFound;
          throw error;
        }
        return product;
      }
      default: {
        // TODO: Create an ErrorCode for this
        throw new Error('InvalidParseType');
      }
    }
  }
}

module.exports = Parser;
