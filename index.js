const { Client, GatewayIntentBits, Partials } = require("discord.js");

const VOUCH_CHANNEL_ID = "1485300520473067771";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

const processed = new Set();

function cleanText(text) {
  return String(text || "")
    .replace(/[`"'“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function findClientId(message, vouchLine) {
  const exchangerIdMatch = vouchLine.match(/<@!?(\d+)>/);
  const exchangerId = exchangerIdMatch ? exchangerIdMatch[1] : null;

  const mentionedUsers = [...message.mentions.users.values()];

  for (const user of mentionedUsers) {
    if (user.id !== exchangerId && user.id !== message.client.user.id) {
      return user.id;
    }
  }

  const channelName = message.channel.name || "";
  let possibleName = "";

  const claimedMatch = channelName.match(/claimed-by-(.+)/i);
  if (claimedMatch) {
    possibleName = claimedMatch[1];
  }

  if (!possibleName) return null;

  possibleName = possibleName.toLowerCase().replace(/[^a-z0-9]/g, "");

  try {
    const members = await message.guild.members.fetch();

    const found = members.find(member => {
      const username = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, "");
      const displayName = member.displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
      return username.includes(possibleName) || displayName.includes(possibleName);
    });

    return found ? found.user.id : null;
  } catch {
    return null;
  }
}

client.on("messageCreate", async (message) => {
  try {
    if (!message.author.bot) return;
    if (message.author.id === client.user.id) return;
    if (processed.has(message.id)) return;

    processed.add(message.id);

    const embedText = message.embeds.map(embed => {
      const fields = embed.fields?.map(f => `${f.name} ${f.value}`).join("\n") || "";
      return [
        embed.title || "",
        embed.description || "",
        fields,
        embed.footer?.text || ""
      ].join("\n");
    }).join("\n");

    const fullText = `${message.content || ""}\n${embedText}`;

    const match = fullText.match(/\+rep\s+<@!?\d+>\s+\[\$?[\d.]+\]\s+[A-Z0-9\s]+TO\s+[A-Z0-9\s]+/i);
    if (!match) return;

    const vouchLine = cleanText(match[0]);

    const recentMessages = await message.channel.messages.fetch({ limit: 15 });
    const alreadySent = recentMessages.some(m =>
      m.author.id === client.user.id && m.content.includes(vouchLine)
    );

    if (alreadySent) return;

    const clientId = await findClientId(message, vouchLine);

    await message.channel.send(vouchLine);

    if (clientId) {
      await message.channel.send(
        `<@${clientId}> copy paste this in this channel <#${VOUCH_CHANNEL_ID}>`
      );
    } else {
      await message.channel.send(
        `Client copy paste this in this channel <#${VOUCH_CHANNEL_ID}>`
      );
    }

  } catch (err) {
    console.log("Error:", err);
  }
});

client.login(process.env.TOKEN);
