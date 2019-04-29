class Product {
  get site() {
    return this._site;
  }

  get url() {
    return this._url;
  }

  get name() {
    return this._name;
  }

  get image() {
    return this._image;
  }

  get variants() {
    return this._variants;
  }

  get price() {
    return this._price;
  }

  get timestamp() {
    return this._timestamp;
  }

  constructor(site, url, name, image, variants, price) {
    this._site = site;
    this._url = url;
    this._name = name;
    this._image = image;
    this._variants = variants;
    this._price = price;
    this._timestamp = new Date();
  }
}
module.exports = Product;
