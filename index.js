const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (!message.author.bot) return;

    const text = [
      message.content || "",
      ...message.embeds.map(e => e.description || "")
    ].join("\n");

    // Match vouch line
    const match = text.match(/\+rep\s+<@!?\d+>\s+\[\$?[\d.]+\].+/i);
    if (!match) return;

    const vouchLine = match[0];

    // Extract user ID from mention
    const userIdMatch = vouchLine.match(/<@!?(\d+)>/);
    if (!userIdMatch) return;

    const userId = userIdMatch[1];

    // Send vouch (copyable)
    await message.channel.send(vouchLine);

    // Send instruction message with ping
    await message.channel.send(
      `<@${userId}> copy paste this in this channel <#1485300520473067771>`
    );

  } catch (err) {
    console.log(err);
  }
});

client.login(process.env.TOKEN);