const { RichEmbed, WebhookClient } = require('discord.js');
const QuickTasks = require('../../_assets/quick_tasks.json');

class Discord {
  constructor(hook) {
    if (hook) {
      const [, , , , , id, token] = hook.split('/');
      this.hook = new WebhookClient(id, token);
    }
  }

  build({
    product: { name: productName, url: productUrl, image, price, timestamp },
    site: { name: siteName, url: siteUrl },
    variants,
    type,
  }) {
    if (this.hook) {
      const sizes = variants.length
        ? variants.map(v => `[${v.name}](${siteUrl}/cart/${v.id}:1)`)
        : 'OOS';
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

      // TODO: .catch() any errors from quickTasks.length > 1024
      const embed = new RichEmbed()
        .setAuthor(siteName, null, siteUrl)
        .setColor(16167182)
        .setTitle(productName)
        .setURL(productUrl)
        .setThumbnail(image)
        .addField('Type', type, true)
        .addField('Price', price, true)
        .addField('Size(s)', sizes, false)
        .addField('Quick Tasks', quickTasks.trim(), false)
        .setTimestamp(timestamp)
        .setFooter('Shopify Monitor | @FlexEngines', 'https://i.imgur.com/5kOFBB3.png');

      return this.hook.send(embed).catch(() => {});
    }
    return null;
  }
}
module.exports = Discord;
