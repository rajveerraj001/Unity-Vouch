const {
  Client,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const VOUCH_CHANNEL_ID = "1485300520473067771";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

client.once("ready", () => {
  console.log(`${client.user.tag} is online`);
});

const cooldown = new Set();

function cleanText(text) {
  return String(text || "")
    .replace(/[`"'“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    const content = cleanText(message.content);

    if (!content.toLowerCase().startsWith(",vouch")) return;

    if (cooldown.has(message.id)) return;
    cooldown.add(message.id);

    const exchanger = message.mentions.users.first();

    if (!exchanger) {
      return message.reply("Mention exchanger properly.");
    }

    const amountMatch = content.match(/\[\$\d+(?:\.\d+)?\]/i);

    const amount = amountMatch
      ? amountMatch[0]
      : "[$0]";

    let exchangeType = "";

    const typeMatch = content.match(/\]\s*(.+)$/i);

    if (typeMatch && typeMatch[1]) {
      exchangeType = typeMatch[1]
        .replace(/i2c/gi, "")
        .replace(/c2i/gi, "")
        .replace(/i2i/gi, "")
        .replace(/c2c/gi, "")
        .trim()
        .toUpperCase();
    }

    if (!exchangeType) {
      exchangeType = "EXCHANGE";
    }

    const finalVouch =
      `+rep <@${message.author.id}> ${amount} ${exchangeType}`;

    const recentMessages =
      await message.channel.messages.fetch({
        limit: 10
      });

    const alreadyExists = recentMessages.some(
      m =>
        m.author.id === client.user.id &&
        m.content === finalVouch
    );

    if (alreadyExists) return;

    await message.channel.send(finalVouch);

    await message.channel.send(
      `${exchanger} copy paste this in this channel <#${VOUCH_CHANNEL_ID}>`
    );

  } catch (err) {
    console.log(err);
  }
});

client.login(process.env.TOKEN);
