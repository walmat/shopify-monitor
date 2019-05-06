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

    const { name, site, price, image, url, variants } = productData;

    const product = { name, url, image, price };

    this.clients[webhookUrl].build({
      product,
      site,
      variants,
      type,
    });
  }
}

module.exports = WebhookManager;
