const Discord = require('./discord');

// Manager to cache webhook clients and send webhooks
class WebhookManager {
  constructor() {
    this.clients = {};
  }

  sendWebhook(productData, type, site, webhookUrl) {
    if (!this.clients[webhookUrl]) {
      // TODO: Support slack hooks as well
      this.clients[webhookUrl] = new Discord(webhookUrl);
    }

    const { title, price, image, url, variants } = productData;
    const product = { title, url, image, price };

    this.clients[webhookUrl].build({
      product,
      store: site,
      variants,
      type,
    });
  }
}

module.exports = WebhookManager;
