// delete-commands.js
// ATENÇÃO: Este script apaga TODOS os comandos globais da sua aplicação.
// Use-o para limpar comandos conflitantes antes de um novo deploy.

const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('Erro: CLIENT_ID ou DISCORD_TOKEN não encontrados no arquivo .env!');
    process.exit(1);
}

const rest = new REST().setToken(token);

// Apaga todos os comandos globais...
(async () => {
    try {
        console.log('Iniciando a exclusão de todos os comandos de aplicação (/) globais.');

        // Para apagar, enviamos um array vazio para a rota de comandos da aplicação.
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] },
        );

        console.log('\x1b[32mSucesso!\x1b[0m Todos os comandos globais foram excluídos.');
        console.log('Agora você pode executar "npm run deploy" para registrar os novos comandos.');

    } catch (error) {
        console.error('Ocorreu um erro ao tentar apagar os comandos:');
        console.error(error);
    }
})();
