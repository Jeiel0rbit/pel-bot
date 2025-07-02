// commands/utility/check.js
// Lógica do comando /check

const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Verifica o destino final de uma URL após redirecionamentos.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('A URL que você deseja verificar.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const initialUrl = interaction.options.getString('url');

        // Validação simples da URL
        if (!initialUrl.startsWith('http://') && !initialUrl.startsWith('https://')) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // Vermelho
                .setTitle('URL Inválida')
                .setDescription('Por favor, forneça uma URL válida que comece com `http://` ou `https://`.');
            
            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 15000); // Timeout de 15 segundos

        try {
            // Cabeçalho User-Agent para simular um navegador comum
            const options = {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                redirect: 'follow'
            };

            console.log(`[INFO] Verificando a URL: ${initialUrl}`);
            const response = await fetch(initialUrl, options);
            const finalUrl = response.url;

            console.log(`[INFO] URL original: ${initialUrl} | URL final: ${finalUrl}`);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF) // Azul
                .setTitle('🔍 Verificador de Redirecionamento de URL');

            embed.addFields(
                { name: '🔗 URL Original', value: `\`\`\`${initialUrl}\`\`\`` },
                { name: '🏁 Destino Final', value: `\`\`\`${finalUrl}\`\`\`` }
            );

            if (initialUrl === finalUrl) {
                embed.setDescription('Esta URL não redireciona para nenhum outro lugar.');
            } else {
                embed.setDescription('A URL foi redirecionada com sucesso.');
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`[ERRO] Timeout ao tentar verificar a URL "${initialUrl}".`);
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000) // Vermelho
                    .setTitle('❌ Erro de Timeout')
                    .setDescription(`A verificação da URL demorou muito para responder (mais de 15 segundos) e foi cancelada.`);
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                console.error(`[ERRO] Falha ao tentar verificar a URL "${initialUrl}". Erro:`, error.message);
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000) // Vermelho
                    .setTitle('❌ Erro na Verificação')
                    .setDescription(`Não foi possível acessar a URL fornecida. Verifique se o link está correto e acessível.\n\n**Detalhe do erro:**\n\`\`\`${error.message}\`\`\``);
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        } finally {
            clearTimeout(timeout);
        }
    },
};
