const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();
const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error("Erro: O token do bot não foi encontrado! Verifique seu arquivo .env");
    process.exit(1);
}

// Cria uma nova instância do cliente
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Cria uma coleção para armazenar os comandos
client.commands = new Collection();

// Constrói o caminho para a pasta de comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Carrega dinamicamente os arquivos de comando
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Define um novo item na Coleção com a chave sendo o nome do comando e o valor sendo o módulo exportado
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[INFO] O comando em ${filePath} foi carregado com sucesso.`);
        } else {
            console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`);
        }
    }
}

// Evento que é acionado quando o bot está pronto e online
client.once(Events.ClientReady, readyClient => {
    console.log(`Pronto! Logado como ${readyClient.user.tag}`);
    console.log(`O bot está em ${client.guilds.cache.size} servidor(es).`);
});

// Listener de interações para lidar com slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
    // ephemeral: true | Só para você
        console.error('Erro ao executar o comando:', error);
        const errorMessage = { content: 'Ocorreu um erro ao executar este comando!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

client.login(token);
