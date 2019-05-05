const Discord = require('./discord');

// Manager to cache webhook clients and send webhooks
class WebhookManager {
  constructor() {
    this.clients = {};
  }

  sendWebhook(productData, type, webhookUrl) {
    if (!this.clients[webhookUrl]) {
      // TODO: Support slack hooks as well
      this.clients[webhookUrl] = new Discord(webhookUrl);
    }

    const { name, price, image, url, site: store, variants } = productData;
    const product = { name, url, image, price };

    const stock = variants
      .filter(({ inStock }) => inStock)
      .map(({ id, size }) => ({ name: size, variant: id }));

    this.clients[webhookUrl].build({
      product,
      store,
      stock,
      type,
    });
  }
}

module.exports = WebhookManager;
