/* eslint-disable class-methods-use-this */
const cheerio = require('cheerio');

const DsmParser = require('./dsmParser');
const { format, userAgent } = require('../../constants').Utils;

class DsmUkParser extends DsmParser {
  constructor(request, task, proxy) {
    super(request, task, proxy, 'DsmUkParser');
  }

  _parseForCustomJsLink($) {
    // Search for all script tags in the <head> element that:
    // 1. have a src attribute
    // 2. contain `custom.js` in the src
    const customJsLinks = [];
    $('script', 'head').each((_, e) => {
      const srcAttr = $(e).attr('src');
      if (srcAttr && /custom\.js/.test(srcAttr)) {
        // Perform a quick replace to make sure we use https
        if (srcAttr.startsWith('//')) {
          customJsLinks.push(`https://${srcAttr.substr(2)}`);
        } else {
          customJsLinks.push(srcAttr);
        }
      }
    });
    const [customJsLink] = customJsLinks;
    if (!customJsLink) {
      throw new Error('no custom js links found!');
    }

    return customJsLink;
  }

  _getCustomJsContent(uri) {
    return this._request({
      method: 'GET',
      uri,
      proxy: format(this._proxy) || undefined,
      rejectUnauthorized: false,
      resolveWithFullResponse: false,
      json: false,
      simple: true,
      gzip: true,
      headers: {
        'User-Agent': userAgent,
      },
    });
  }

  _parseCustomJsContent(content) {
    // Parse for the specific code in question, capturing the
    // `input` tag that is being inserted.
    // Example:
    // $('form.product-form').append('<input type="hidden" value="ee3e8f7a9322eaa382e04f8539a7474c11555" name="properties[_hash]" />');
    const regex = /\$\(\s*'form\.product-form'\s*\)\s*\.\s*append\(\s*'(.*)'\s*\)/;
    const matches = regex.exec(content);
    if (!matches) {
      throw new Error("Couldn't find input tag in response!");
    }

    // Load the input tag into cheerio to easily get the name and value attributes
    // (cheerio is used so we don't have to worry about the order of attributes)
    const tag = cheerio.load(matches[1]);
    const name = tag('input').attr('name');
    const value = tag('input').attr('value');

    // Check for correct name
    if (name !== 'properties[_hash]') {
      throw new Error(
        `Invalid name property was used ("${name}" , but was expecting "properties[_hash]").`,
      );
    }
    // Check for valid value
    if (!value) {
      throw new Error('No hash value was given!');
    }
    return value;
  }

  async parseInitialPageForHash($) {
    try {
      const customJsLink = this._parseForCustomJsLink($);
      const body = await this._getCustomJsContent(customJsLink);
      const hash = this._parseCustomJsContent(body);
      return hash;
    } catch (err) {
      return null;
    }
  }

  async parseProductInfoPageForHash($) {
    if (this._hashIds.__default__) {
      return null;
    }

    try {
      const customJsLink = this._parseForCustomJsLink($);
      const body = await this._getCustomJsContent(customJsLink);
      const hash = this._parseCustomJsContent(body);
      return hash;
    } catch (err) {
      return null;
    }
  }
}

module.exports = DsmUkParser;
