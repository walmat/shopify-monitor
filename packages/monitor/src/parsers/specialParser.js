/* eslint-disable class-methods-use-this */
const cheerio = require('cheerio');
const Parser = require('./parser');
const { ParseType } = require('../monitor/parse');
const { ErrorCodes, format, userAgent } = require('../utils/constants').Utils;

class SpecialParser extends Parser {
  constructor(request, data, proxy, name) {
    super(request, data, proxy, name || 'SpecialParser');
  }

  /**
   * Getter to determine if the parser is special or not
   */
  get isSpecial() {
    return true;
  }

  async run() {
    // If parse type is url, use the product's url, otherwise use the site url
    const { url: siteUrl } = this._data.site;
    let initialUrl = siteUrl;
    if (this._type === ParseType.Url) {
      initialUrl = this._data.product.url;
    }

    // Make initial request to site
    let response;
    try {
      response = await this._request({
        method: 'GET',
        uri: initialUrl,
        proxy: format(this._proxy) || undefined,
        json: false,
        simple: true,
        followRedirect: false,
        rejectUnauthorized: false,
        gzip: true,
        headers: {
          'User-Agent': userAgent,
        },
        transform2xxOnly: true,
        transform: body =>
          cheerio.load(body, {
            normalizeWhitespace: true,
            xmlMode: true,
          }),
      });
    } catch (error) {
      // Handle Redirect response (wait for refresh delay)
      if (error.statusCode === 302) {
        // TODO: Maybe replace with a custom error object?
        const rethrow = new Error('RedirectDetected');
        rethrow.status = 500; // Use a 5xx status code to trigger a refresh delay
        throw rethrow;
      }
      // Handle other error responses
      const rethrow = new Error('unable to make request');
      rethrow.status = error.statusCode || 404; // Use the status code, or a 404 is no code is given
      throw rethrow;
    }

    // Check if we need to parse the response as an initial page, or if we should treat is as
    // a direct link (when the parse type is url)
    let matchedProduct;
    if (this._type !== ParseType.Url) {
      let products;
      if (this.initialPageContainsProducts) {
        // Attempt to parse the initial page for product data
        try {
          products = await this.parseInitialPageForProducts.call(this, response);
        } catch (error) {
          // TODO: Maybe replace with a custom error object?
          const rethrow = new Error('unable to parse initial page');
          rethrow.status = error.statusCode || error.status || 404;
          throw rethrow;
        }
      } else {
        // Generate Product Pages to Visit
        let productsToVisit;
        try {
          productsToVisit = await this.parseInitialPageForUrls.call(this, response);
        } catch (error) {
          // TODO: Maybe replace with a custom error object?
          const rethrow = new Error('unable to parse initial page');
          rethrow.status = error.statusCode || error.status || 404;
          throw rethrow;
        }
        // Visit Product Pages and Parse them for product info
        products = (await Promise.all(
          productsToVisit.map(async url => {
            try {
              const $ = await this.getProductInfoPage(url);
              const productInfo = await this.parseProductInfoPageForProduct.call(this, $);
              return {
                url, // Attach product url for restocking purposes
                ...productInfo,
              };
            } catch (err) {
              return null;
            }
          }),
        )).filter(p => p);
      }

      // Attempt to Match Product
      try {
        matchedProduct = super.match(products);
      } catch (error) {
        // TODO: Maybe replace with a custom error object?
        const rethrow = new Error(error.message);
        rethrow.status = error.status || 404;
        throw rethrow;
      }
    } else {
      // Attempt to parse the response as a product page and get the product info
      try {
        matchedProduct = await this.parseProductInfoPageForProduct.call(this, response);
      } catch (error) {
        // TODO: Maybe replace with a custom error object?
        const rethrow = new Error(error.message);
        rethrow.status = error.status || 404;
        throw rethrow;
      }
    }

    if (!matchedProduct) {
      // TODO: Maybe replace with a custom error object?
      const rethrow = new Error('unable to match the product');
      rethrow.status = ErrorCodes.ProductNotFound;
      throw rethrow;
    }
    return {
      // Backup method to add product url for restocking purposes
      url: `${siteUrl}/products/${matchedProduct.handle}`,
      ...matchedProduct,
    };
  }

  /**
   * Getter to signify whether or not the specific site has product info in the
   * initial site page, or if product specific pages need to be parsed.
   *
   * If this is set to true, then `parseInitialPageForProducts()` will get called
   * If this is set to false, then `parseInitialPageForUrls()` will get called
   */
  get initialPageContainsProducts() {
    throw new Error('Not Implemented! This should be implemented by subclasses!');
  }

  /**
   * Parse the given html (loaded by cheerio) for a list of
   * products available. This is a site dependent method, so it should be
   * implemented by subclasses of this class
   *
   * This method should return a list of products that should be matched
   *
   * NOTE: This method is only run if `this.initialPageContainsProducts` is true
   *
   * @param {Cheerio Instance} $ - Instance of cheerio loaded with html content
   */
  // eslint-disable-next-line no-unused-vars
  parseInitialPageForProducts($) {
    throw new Error('Not Implemented! This should be implemented by subclasses!');
  }

  /**
   * Parse the given html (loaded by cheerio) for a list of
   * product pages to visit. This is a site dependent method, so it should be
   * implemented by subclasses of this class
   *
   * This method should return a list of product urls that should be visited for more info
   *
   * NOTE: This method is only run if `this.initialPageContainsProducts` is true
   *
   * @param {Cheerio Instance} $ - Instance of cheerio loaded with html content
   */
  // eslint-disable-next-line no-unused-vars
  parseInitialPageForUrls($) {
    throw new Error('Not Implemented! This should be implemented by subclasses!');
  }

  /**
   * Parse the given html (loaded by cheerio) as the product info page
   * for one product of interest. This is a site dependent method, so it should be
   * implemented by subclasses of this class
   *
   * This method should a valid product object that can be further matched
   *
   * @param {Cheerio Instance} $ - Instance of cheerio loaded with html content
   */
  // eslint-disable-next-line no-unused-vars
  parseProductInfoPageForProduct($) {
    throw new Error('Not Implemented! This should be implemented by subclasses!');
  }

  getProductInfoPage(productUrl) {
    return this._request({
      method: 'GET',
      uri: productUrl,
      proxy: format(this._proxy) || undefined,
      rejectUnauthorized: false,
      json: false,
      simple: true,
      transform2xxOnly: true,
      gzip: true,
      headers: {
        'User-Agent': userAgent,
      },
      transform: body =>
        cheerio.load(body, {
          normalizeWhitespace: true,
          xmlMode: true,
        }),
    });
  }
}

module.exports = SpecialParser;
