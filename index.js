const {
  Client,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

const TOKEN = process.env.TOKEN;

const VOUCH_CHANNEL_ID = "1485300520473067771";

const cooldown = new Set();

client.once("ready", () => {
  console.log(`${client.user.tag} is online`);
});

function clean(text) {
  return String(text || "")
    .replace(/[`"'']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

client.on("messageCreate", async (message) => {

  try {

    if (message.author.bot) return;

    const content = clean(message.content);

    if (!content.toLowerCase().startsWith(",vouch")) return;

    // anti duplicate
    if (cooldown.has(message.id)) return;
    cooldown.add(message.id);

    // client detect
    const clientUser = message.mentions.users.first();

    if (!clientUser) {
      return message.reply("Mention a client.");
    }

    // amount detect
    let amount = "$0";

    const amountMatch =
      content.match(/\$(\d+(\.\d+)?)/i) ||
      content.match(/(\d+(\.\d+)?)\$/i);

    if (amountMatch) {
      amount = `$${amountMatch[1]}`;
    }

    // remove command / mention / amount
    const cleaned = content
      .replace(",vouch", "")
      .replace(/<@!?\d+>/g, "")
      .replace(/\$(\d+(\.\d+)?)/i, "")
      .replace(/(\d+(\.\d+)?)\$/i, "")
      .trim();

    // detect TO
    const split = cleaned.split(/\s+to\s+/i);

    let fromType = "EXCHANGE";
    let toType = "";

    if (split.length >= 2) {
      fromType = split[0].trim().toUpperCase();
      toType = split[1].trim().toUpperCase();
    }

    // exchanger
    const exchanger = message.author;

    const finalVouch =
      `+rep ${exchanger} [${amount}] ${fromType} TO ${toType}`;

    // anti duplicate send
    const recentMessages =
      await message.channel.messages.fetch({
        limit: 10
      });

    const alreadySent =
      recentMessages.some(
        m =>
          m.author.id === client.user.id &&
          m.content === finalVouch
      );

    if (alreadySent) return;

    // FIRST MESSAGE
    await message.channel.send(finalVouch);

    // SECOND MESSAGE
    await message.channel.send(
      `${clientUser} copy paste this in this channel <#${VOUCH_CHANNEL_ID}>`
    );

  } catch (err) {
    console.log(err);
  }

});

client.login(TOKEN);
