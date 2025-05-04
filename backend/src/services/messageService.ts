import { getFilteredMatches, getFilteredTimeline } from "../cache/furiaData";
import { cohere } from "../config/cohere";
import { Message } from "./conversationService";

type QuestionType = "matches" | "timeline" | "default" | "unknown";
type Period = `${number}-${number}` | "desconhecido";
type Classification = {
    questionType: QuestionType,
    period: Period,
    message: string
}

export const messageService = {
    async classify(message: string) {
        const currentYear = new Date().getFullYear();
        try {
            const prompt = `
            Classifique a mensagem em:matches(perguntas sobre resultados),timeline(lineup do time),default(genérica),unknown(insuficiente; só conhece jogos e lineup).Responda só assim:<categoria>;<época>.Use formato ANO-ANO ou "desconhecido Lembrando que o ano atual é ${currentYear}".
            Exemplos:{text:"Qual foi o resultado da última partida da FURIA?",output:"matches;${currentYear}-${currentYear}"},{text:"Quem é o lineup da FURIA atualmente?",output:"timeline;${currentYear}-${currentYear}"},{text:"Como foi o desempenho da FURIA no Major 2021?",output:"matches;2021-2021"},{text:"Quem jogou pelo time da FURIA no campeonato passado?",output:"unknown;desconhecido"},{text:"Qual é a line da FURIA para o próximo torneio?",output:"timeline;${currentYear}-${currentYear}"},{text:"O que aconteceu no campeonato de 2022?",output:"matches;2022-2022"},{text:"Quem venceu a última partida da FURIA?",output:"matches;${currentYear}-${currentYear}"},{text:"Quando foi a última vez que a FURIA venceu um campeonato?",output:"matches;2023-${currentYear}"},{text:"Qual a formação atual da FURIA?",output:"timeline;${currentYear}-${currentYear}"},{text:"Qual a escalação da FURIA para o próximo Major?",output:"timeline;${currentYear}-${currentYear}"},{text:"Eu joguei contra a FURIA ontem!",output:"default;desconhecido"},{text:"Qual o próximo torneio da FURIA?",output:"unknown;desconhecido"},{text:"Eu sou fã da FURIA!",output:"default;desconhecido"},{text:"A FURIA vai competir em algum torneio esse mês?",output:"unknown;${currentYear}-${currentYear}"},{text:"Qual foi o resultado do jogo da FURIA contra a Liquid?",output:"matches;${currentYear}-${currentYear}"}
            Mensagem:"${message}"
            `;
            const response = await cohere.chat({
                model: 'command-a-03-2025',
                messages: [
                    { role: "system", content: "Você é um classificador de mensagens." },
                    { role: "user", content: prompt },
                ]
            });

            const output = response.message?.content?.[0]?.text;
        
            if (!output || !output.includes(";")) {
                throw new Error("Resposta inesperada da OpenAI.");
            }

            const splited = output.split(";")
            const questionType = splited[0]
            const period = splited[1]
            const validTypes = ["matches", "timeline", "default", "unknown"];
            const periodRegex = /^\d{4}-\d{4}$|^desconhecido$/;

            if (!validTypes.includes(questionType) || !periodRegex.test(period)) {
                throw new Error("Formato inválido de resposta.");
            }
        
            return {
                questionType: questionType as QuestionType,
                period: period as Period,
                message
            };
          } catch (error) {
            console.error("Erro ao classificar:", error);
            throw new Error("Erro ao classificar a mensagem.");
          }
    },

    async generateAnswer({questionType, period, message}: Classification, conversationHistory: Message[] = []) {
        if (questionType == "unknown") {
            return "Eita! Essa eu ainda não sei responder... Só manjo dos jogos e do histórico da galera da FURIA no CS. Bora falar disso?"
        }

        if (period == "desconhecido" && questionType != "default") {
            return `Eu até queria te ajudar com isso, mas preciso saber de qual época você tá falando. 
            Me diz o ano ou período, que eu corro atrás das infos pra você!`
        }

        const system = `Você é um assistente virtual e o mascote da Organização de Esports chamada Furia. 
        O seu nome é Furico e você é um bebê pantera negra muito carismático que sabe apenas sobre os resultados das partidas
        e os membros que passaram pelo time de CS da Fúria. Não force muito o personagem, 
        apenas seja gentíl e se apresente quando for possível. Responda sem utilizar Markdown, apenas texto normal.`

        let infos = null

        if (questionType == "matches" && period != "desconhecido") {
            const filteredMatches = await getFilteredMatches(period)
            infos = JSON.stringify(filteredMatches)
        }
        if (questionType == "timeline" && period != "desconhecido") {
            const filteredTimeline = await getFilteredTimeline()
            infos = JSON.stringify(filteredTimeline)
        }

        const formattedHistory: Array<{role: "user" | "assistant", content: string}> = conversationHistory
        .slice(-10) 
        .map(msg => ({ 
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const, 
            content: msg.content 
        }));

        // Initialize with system message
        const cohereMessages: Array<{role: "system" | "user" | "assistant", content: string}> = [
            { role: "system", content: system }
        ];
        
        if (formattedHistory.length > 0) {
            cohereMessages.push(...formattedHistory);
        }

        let prompt = message;
        if (infos) {
            prompt = `
                Responda essa mensagem que um usuário está te enviando: 
                ${message}

                com base nesses dados e que devem ser interpretados como conhecimento seu:
                ${infos}
            `;
        }

        cohereMessages.push({ role: "user", content: prompt });

        const response = await cohere.chat({
            model: 'command-a-03-2025',
            messages: cohereMessages
        });

        const answer = response.message?.content?.[0]?.text;
        
        if (!answer) {
            throw new Error("Resposta inesperada da OpenAI.");
        }
        
        return answer;
    }
}