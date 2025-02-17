import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';

import {run} from "./src/bot/run.js";
import {autobuy} from "./src/bot/buy.js";
import {registerCommands, handleCommands} from "./src/bot/commands.js";

const mySearches = JSON.parse(fs.readFileSync('./config/channels.json', 'utf8'));
const tokens = JSON.parse(fs.readFileSync('./config/autobuy.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
let processedArticleIds = new Set();

//connect the bot to the server
client.login(config.bot_token);

//launch the bot
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands(client, config);
    run(client, processedArticleIds, mySearches, config)
});

//listen to buy button clicks
client.on('interactionCreate', async (interaction) => {
    if (interaction.customId == 'autobuy') {
        const [sellerId, itemId] = interaction.message.embeds[0].footer.text.split('-');
        autobuy(interaction, itemId, sellerId, tokens);
    } else if (interaction.isCommand()) {
        handleCommands(interaction);
    } else {
        console.log('Unknown interaction type');
    }
});