const { RichEmbed, WebhookClient } = require('discord.js');

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
      const embed = new RichEmbed()
        .setAuthor(storeName, null, storeUrl)
        .setColor(16167182)
        .setTitle(productName)
        .setURL(productUrl)
        .setThumbnail(image)
        .addField('Type', type, true)
        .addField('Price', price, true)
        .addField('Size(s)', sizes.forEach(s => s), false)
        .addField('Quick Tasks', 'Coming soon...')
        .addField('Full Size Run', 'Coming soon...')
        .setTimestamp()
        .setFooter(
          'Shopify Monitor | [@FlexEngines](https://twitter.com/flexengines)',
          'https://i.imgur.com/KelstZo.png',
        );

      return this.hook.send(embed);
    }
    return null;
  }
}
module.exports = Discord;
