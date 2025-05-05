## 🧠 Desafio 1: Criar uma Experiência Conversacional de Verdade
Para esse desafio técnico decidi fazer algumas coisas diferentes. Como a ideia do desafio é vocês entenderem como eu penso, aprendo e resolvo problemas, eu quis documentar todo o meu processo criativo desde quando eu comecei a pensar o projeto. Então esse começo do readme será focado justamente nisso, documentei todas minhas ideias, dificuldades e como consegui resolver os problemas que foram surgindo no desenvolvimento do projeto.

### 💡 Ideia Inicial

- Como meu foco é mais backend, queria usar a IA da v0 como aliada na parte de prototipação e frontend.
- A ideia era criar um oráculo/assistente virtual que soubesse "tudo" sobre a FURIA de CS:GO.
- Fugir daquele padrão batido de CRUD.
- Dar personalidade pro assistente, transformando ele no "Furico", o mascote da FURIA.

---

### ⚠️ Problema 1: Informações atuais ou em tempo real

- Primeira tentativa: usar alguma IA pra acessar a internet direto e buscar os dados. Spoiler: nenhuma que encontrei oferecia isso via API.
- HLTV? Nada de API pública.
- Liquipedia? Até tem algo, mas sem documentação clara e com termos de uso chatinhos.
- Segunda alternativa: montar meu próprio *web scraper* e alimentar uma IA com os dados extraídos.

Decidi seguir com o scraper, focado na página da FURIA na HLTV. Sabia que isso traria alguns desafios:

- Escopo limitado de perguntas que poderiam ser respondidas.
- Respostas imprecisas.
- Comunicação meio complicada entre os dados brutos e a IA.

Mesmo assim, parecia o caminho mais viável. Já tinha experiência com a API da OpenAI, então o grande desafio seria mesmo fazer um scraper robusto com dados bons e atualizados.

---

### 🔧 Criação do Scraper

- A ideia: montar um scraper que pegasse dados da FURIA e dos players na HLTV, salvando tudo em cache no Redis pra ficar rápido e poder rodar o scraper separado da API principal.
- Bati de frente com a proteção da Cloudflare da HLTV. Aí veio o plano B: Liquipedia.
- Liquipedia tinha dados bem diretos e menos proteção. Consegui fazer um scraper que pegasse:
  - Todos os resultados de partidas da FURIA.
  - A timeline de entrada e saída dos membros da equipe.

Assumi que isso já era suficiente pra um MVP.
**Melhorias futuras**: trazer estatísticas das partidas, dados dos jogadores e até infos da organização como um todo.

---

### 🧠 Como usar essas informações de forma inteligente?

Beleza, dados coletados e salvos. Agora vinha a parte de como usar isso de forma otimizada para cobrir ao máximo a escolha de utilizar um scraper:

- A ideia era não sobrecarregar a API da OpenAI com dados desnecessários.
- Então pensei: cada mensagem do usuário deveria ser **classificada**, pra saber que tipo de informação ela exige e de qual período ela deve ser buscada.

#### Categorias que defini:
- `matches`: perguntas sobre resultados de partidas.
- `timeline`: perguntas sobre lineup ou mudanças na equipe.
- `unknown`: perguntas sem dados suficientes pra responder.
- `default`: mensagens que não precisam consultar a base de dados.

Com isso, a IA pode simplesmente classificar a pergunta do usuário e estimar um intervalo temporal pra busca.

##### Exemplo:
- Pergunta: “Qual era a line da FURIA em 2020?”
- A IA responde com: timeline;2020-2020
- A partir disso, faço a busca para encontrar os dados relevantes, e passo a pergunta somada com os dados refinados para o Furico.

Essa abordagem ajuda a economizar chamadas e tokens desnecessárias à IA e torna a conversa bem mais fluida e precisa. Caso eu não utiliza-se um sistema de classificação das perguntas eu teria que passar sempre todos os dados que foram coletados para a Cohere, o que não iria funcionar pelas proprías restrições de caractéres da plataforma.

> *Pequeno plot twist*: Acabou meu plano grátis da OpenAI 😓  
> Encontrei a Cohere e comecei a testar. Tá dando conta do recado!

Consegui montar essa estrutura do jeitinho que imaginei. Funcionando liso!

---

### 🧑‍💻 Desafio 2: Sessão do Usuário (sem login chato)

- Não queria forçar o usuário a criar conta ou logar para utilizar a plataforma.
- Resolvi usar um UUID gerado e salvo em cookie como identificador da sessão.
- Essa sessão dura 24 horas e guarda o histórico de conversa.
- Implementei:
  - Armazenamento no Redis.
  - Middleware que gerencia a criação/verificação do cookie e UUID.
- Resultado: cada usuário tem uma conversa isolada e contínua (por 24h), sem precisar digitar um único dado previamente.

---

### ✅ Conclusão

No fim das contas, esse projeto acabou sendo mais do que só um desafio técnico sobre a FURIA — virou um laboratório pra testar ideias diferentes de como construir uma experiência de conversa mais natural e inteligente, fugindo do clássico CRUD. Apliquei várias ideias diferentes de como utilizar algumas ferramentas e técnologias que nunca tinha pensado antes.

Consegui validar que dá pra usar scraping, cache, classificação de mensagens e IA de forma integrada, sem pesar pro usuário e mantendo uma performance legal. Ainda tem bastante coisa pra melhorar, mas como MVP, o Furico já mostra que tem potencial.

Por falta de tempo, não consegui cobrir as possíveis fragilidades do projeto, não consegui implementar features que tinha planejado inicialmente como testes e documentação da API com swagger, mas acredito que alcancei um resultado muito satisfatório e essas melhorias ficarão para o futuro.

Próximos passos? Adicionar mais dados, refinar as interações, explorar outras IAs, testes, documentação com swagger e desacoplar melhor algumas integrações no código para que o projeto sejá mais facilmente escalável.

--- 

## 🛠 Documentação do Backend

### 📦 Tecnologias utilizadas

- Node.js + Express  
- TypeScript  
- Redis  
- Puppeteer (para scraping)  
- Cohere (API de linguagem)  
- Redis para cache e armazenamento temporário  
- Docker (para subir o Redis)  
- ts-node + concurrently (para rodar API e tarefas agendadas em paralelo)

---

### 🚀 Como rodar o projeto do zero

#### 1. Entre na pasta do backend
```bash
cd backend
```

#### 2. Instale as dependências
```bash
npm install
```

#### 3. Crie um arquivo `.env` baseado no `.env.example`
```bash
cp .env.example .env
```

Edite o `.env` com a sua chave da API da Cohere:
```bash
API_KEY=suachaveaqui
PORT=8080
```

#### 4. Suba o Redis com Docker
Você precisa ter o Docker instalado. Depois, é só rodar:
```bash
docker-compose up -d
```

#### 5. Inicie a aplicação em modo desenvolvimento
O projeto já está preparado pra rodar a API e o cron (que atualiza os dados com scraping) ao mesmo tempo:
```bash
npm run dev
```
Esse comando executa dois serviços simultâneos:

- `start:server`: inicia o servidor Express

- `start:cron`: roda o job de scraping periódico

---

### 📂 Estrutura de rotas
**POST** `/message`
Recebe uma mensagem do usuário e responde com base no histórico e dados salvos.

**GET** `/message`
Retorna a conversa atual do usuário, com base no UUID da sessão salva via cookie.

---

📄 Scripts principais (`package.json`)
- `npm run start:server` – Inicia apenas o servidor Express
- `npm run start:cron` – Roda apenas os scrapers
- `npm run dev` – Roda os dois ao mesmo tempo com o concurrently

---

### 💾 Redis
Utilizado para:
- Cache de dados do scraper
- Armazenamento temporário de sessões de usuário (identificadas via UUID em cookies)

---

## 🎨 Documentação do Frontend

### 📦 Tecnologias utilizadas

- Next.js 15  
- React 19  
- TypeScript  
- TailwindCSS  
- Radix UI (design system completo)  
- React Hook Form + Zod (validações)  
- Recharts (gráficos)  
- Embla Carousel  

---

### 🚀 Como rodar o projeto do zero

#### 1. Entre na pasta do frontend
```bash
cd frontend
```

#### 2. Instale as dependências
```bash
npm install
```

#### 3. Crie um arquivo `.env` baseado no `.env.example`
```bash
cp .env.example .env
```

Edite o valor da variável `NEXT_PUBLIC_API_URL` com a URL da sua API (backend):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### 4. Rode o projeto localmente
```bash
npm run dev
```

---

### 📄 Scripts principais (`package.json`)
- `npm run dev` – Inicia o projeto em modo desenvolvimento
- `npm run build` – Gera a versão de produção
- `npm start` – Inicia o app já buildado
- `npm run lint` – Roda o linter

---

### 🧵 Integrações importantes
- Consome os endpoints do backend via NEXT_PUBLIC_API_URL
- Usa cookies para identificar sessões de usuários
- Interface personalizável e responsiva com Radix UI + Tailwind