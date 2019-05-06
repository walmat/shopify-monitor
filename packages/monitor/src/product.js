class Product {
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
    this.id = id;
    this.url = url;
    this.site = site;
    this.name = name;
    this.image = image;
    this.variants = variants;
    this.price = price;
    this.timestamp = timestamp;
    this.notifiedWebhooks = notifiedWebhooks;
    this.monitorInfoId = monitorInfoId;
  }
}

module.exports = Product;
