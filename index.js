const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

const processed = new Set();

client.on("messageCreate", async (message) => {
  try {
    if (!message.author.bot) return;
    if (message.author.id === client.user.id) return;

    if (processed.has(message.id)) return;
    processed.add(message.id);

    const text = [
      message.content || "",
      ...message.embeds.map(e => e.description || "")
    ].join("\n");

    const match = text.match(/\+rep\s+<@!?\d+>\s+\[\$?[\d.]+\].+/i);
    if (!match) return;

    let vouchLine = match[0];

    // REMOVE unwanted quotes if any
    vouchLine = vouchLine.replace(/[`"'']/g, "").trim();

    const userIdMatch = vouchLine.match(/<@!?(\d+)>/);
    if (!userIdMatch) return;

    const userId = userIdMatch[1];

    // SINGLE CLEAN MESSAGE
    await message.channel.send(
      `${vouchLine}\n<@${userId}> copy paste this in this channel <#1485300520473067771>`
    );

  } catch (err) {
    console.log(err);
  }
});

client.login(process.env.TOKEN);