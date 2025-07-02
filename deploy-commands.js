// deploy-commands.js
// Script para registrar os slash commands na API do Discord.

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

// .env
dotenv.config();

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId || !token) {
    console.error("Erro: CLIENT_ID ou DISCORD_TOKEN não encontrados! Verifique seu arquivo .env");
    process.exit(1);
}

const commands = [];
// Pega todos os arquivos de comando do diretório de comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Pega a saída SlashCommandBuilder#toJSON() dos dados de cada comando para deploy
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`);
        }
    }
}

const rest = new REST().setToken(token);

// e faz o deploy dos seus comandos!
(async () => {
    try {
        console.log(`Iniciando a atualização de ${commands.length} comando(s) de aplicação (/).`);

        // O método put
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`\x1b[32mSucesso!\x1b[0m ${data.length} comando(s) de aplicação (/) foram recarregados.`);
    } catch (error) {
        // Erros também né? São capturados.
        console.error(error);
    }
})();
