const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder
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

client.once("ready", () => {
  console.log(`${client.user.tag} is online`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (!message.content.toLowerCase().startsWith(",vouch")) return;

  const clientUser = message.mentions.users.first();

  if (!clientUser) {
    return message.reply("Mention a client.");
  }

  const exchanger = message.author;

  // amount detect
  let amount = "$0";

  const amountMatch =
    message.content.match(/\$(\d+(\.\d+)?)/i) ||
    message.content.match(/(\d+(\.\d+)?)\$/i);

  if (amountMatch) {
    amount = `$${amountMatch[1]}`;
  }

  // clean text
  const cleaned = message.content
    .replace(",vouch", "")
    .replace(/<@!?\d+>/g, "")
    .replace(/\$(\d+(\.\d+)?)/i, "")
    .replace(/(\d+(\.\d+)?)\$/i, "")
    .trim();

  const split = cleaned.split(/\s+to\s+/i);

  let fromType = "EXCHANGE";
  let toType = "";

  if (split.length >= 2) {
    fromType = split[0].trim().toUpperCase();
    toType = split[1].trim().toUpperCase();
  }

  const vouchText =
    `+rep ${exchanger} [${amount}] ${fromType} TO ${toType}`;

  // EMBED
  const embed = new EmbedBuilder()
    .setColor("#a020f0")
    .setAuthor({
      name: "Unity Exchange"
    })
    .setTitle("Thank You!")
    .setDescription(
`Thank you for using our service!
We hope you liked your exchange experience.

Copy the line below and paste it in <#${VOUCH_CHANNEL_ID}> to vouch:

\`\`\`
${vouchText}
\`\`\``
    );

  // FIRST MESSAGE
  await message.channel.send({
    embeds: [embed]
  });

  // SECOND MESSAGE
  await message.channel.send(
    `${clientUser} copy paste this in this channel <#${VOUCH_CHANNEL_ID}>`
  );

});

client.login(TOKEN);
