const { RichEmbed, WebhookClient } = require('discord.js');
const QuickTasks = require('./_assets/quick_tasks.json');

class Discord {
  constructor(hook) {
    if (hook) {
      const [, , , , , id, token] = hook.split('/');
      this.hook = new WebhookClient(id, token);
    }
  }

  build({
    product: { name: productName, url: productUrl, image, price },
    store: { name: storeName, url: storeUrl },
    stock,
    type,
  }) {
    if (this.hook) {
      const sizes = stock.map((s, i) => {
        const size = `[${s.name}](${storeUrl}/cart/${s.variant}:1)`;
        if (i % 2 === 0) {
          return `${size}\t\t`;
        }
        return `${size}\n`;
      });
      let quickTasks = ''; // has to be a string in order to keep on same line
      Object.entries(QuickTasks).forEach(([key, value]) => {
        if (key.indexOf('Eve') > -1) {
          quickTasks += `\t[${key}](${value}${productUrl})\t`;
        } else if (key.indexOf('TKS') > -1) {
          quickTasks += `\t[${key}](${value}${productUrl}&autostart=true&isatclink=false)\t/`;
        } else {
          quickTasks += `\t[${key}](${value}${productUrl})\t/`;
        }
      });

      const embed = new RichEmbed()
        .setAuthor(storeName, null, storeUrl)
        .setColor(16167182)
        .setTitle(productName)
        .setURL(productUrl)
        .setThumbnail(image)
        .addField('Type', type, true)
        .addField('Price', price, true)
        .addField('Size(s)', sizes, false)
        .addField('Quick Tasks', quickTasks.trim(), true)
        .addField('Full Size Run', 'Coming soon!')
        .setTimestamp()
        .setFooter('Shopify Monitor | @nebulabots', 'https://i.imgur.com/KelstZo.png');

      return this.hook.send(embed);
    }
    return null;
  }
}
module.exports = Discord;
