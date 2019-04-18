// Top Level Export for parsers
const Parser = require('./parser');
const AtomParser = require('./atomParser');
const JsonParser = require('./jsonParser');
const XmlParser = require('./xmlParser');

// Special Parsers
const DsmParser = require('./dsmParser');
const YeezyParser = require('./yeezyParser');

function getSpecialParser(site) {
  switch (site.name) {
    case site.name.indexOf('DSM') > -1: {
      return (...params) => new DsmParser(...params);
    }
    case site.name.indexOf('Yeezy Supply') > -1: {
      return (...params) => new YeezyParser(...params);
    }
    default: {
      return (...params) => new YeezyParser(...params);
    }
  }
}

module.exports = {
  Parser,
  AtomParser,
  JsonParser,
  XmlParser,
  getSpecialParser,
};
