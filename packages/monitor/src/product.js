class Product {
  get id() {
    return this._id;
  }

  get url() {
    return this._url;
  }

  get site() {
    return this._site;
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

  get notifiedWebhooks() {
    return this._notifiedWebhooks;
  }

  get monitorInfoId() {
    return this._monitorInfoId;
  }

  constructor({
    id,
    url,
    site,
    name,
    image,
    variants,
    price,
    timestamp,
    notifiedWebhooks,
    monitorInfoId,
  }) {
    this._id = id;
    this._url = url;
    this._site = site;
    this._name = name;
    this._image = image;
    this._variants = variants;
    this._price = price;
    this._timestamp = timestamp;
    this._notifiedWebhooks = notifiedWebhooks;
    this._monitorInfoId = monitorInfoId;
  }
}
module.exports = Product;
