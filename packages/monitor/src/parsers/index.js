// Top Level Export for parsers
const Parser = require('./parser');
const AtomParser = require('./atomParser');
const JsonParser = require('./jsonParser');
const XmlParser = require('./xmlParser');

// Special Parsers
const { DsmParser, DsmUsParser, DsmUkParser } = require('./dsm');
const YeezyParser = require('./yeezyParser');

function getSpecialParser(site) {
  // TODO: Figure out a better way to do this!
  switch (site.name) {
    case 'DSM SG':
    case 'DSM JP': {
      return (...params) => new DsmParser(...params);
    }
    case 'DSM US': {
      return (...params) => new DsmUsParser(...params);
    }
    case 'DSM UK': {
      return (...params) => new DsmUkParser(...params);
    }
    case 'Yeezy Supply':
    case 'Yeezy Supply 350':
    case 'Yeezy Supply 700':
    case 'Yeezy Supply (Asia)':
    case 'Yeezy Supply (Europe)': {
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
