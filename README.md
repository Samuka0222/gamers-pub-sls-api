# API Rest Serverless para o Projeto Gamers' Pub

Esse meu primeiro grande projeto pessoal utilizando a arquitetura serverless com o Serverless Framework e o AWS. Apesar do front-end do meu projeto da Gamers' Pub ser feito no Next.js, eu optei por não utilizar as server actions, pelo motivo que elas são basicamente Lambda Functions da AWS com um preço um pouco mais caro. Então preferi aperfeiçoar meus conhecimentos em AWS e principalmente em DynamoDB, com o objetivo de aprender o "Single-Table Design" para um banco de dados mais otimizado e eficaz!

Outra grande implementação foi de um chatbot com IA utilizando a API do Google Gemini para criar um bot de recomendação de jogos. Além disso, também pude aperfeiçoar meus conhecimentos com o AWS Cognito para autenticação e upload/download de arquivos com o AWS S3.

Estou muito satisfeito com o resultado, foi um belo passo para minha evolução como um desenvolvedor web full-stack, acredito que estou pronto para criar minhas próprias aplicações e lança-las para o mundo!

Outro pequeno detalhe, é que esse é meu primeiro projeto utilizando o Biome.js para Linting e devo admitir que estou bem satisfeito com a ferramenta, até a próxima ESLINT 👋

Você pode conferir o Front-end desse projeto no seguinte repositório: ['https://github.com/Samuka0222/gamers-pub'](https://github.com/Samuka0222/gamers-pub)

## Tecnologias e Ferramentas

### Base:
- Node.js
- Serverless Framework V4;
- Lambda Functions;
- Typescript;
- Pnpm

### Linting:
- Biome.js
- Lint-staged
- Commitlinting
- Husky
- EditorConfig

### Banco de Dados:
- DynamoDB utilizando Single-Table Design
- Istância PostgreSQL com o Supabase (para obter reviews aleatórias)

### Autenticação:
- AWS Cognito

### Armazenamento de arquivos:
- AWS S3

### Testar a API
- Yaak

## Funcionalidade e como testar

Para testar essa API, primeiramente vai precisar baixar o Serverless CLI, configurar o Serverless para conectar com sua conta na AWS,
clonar esse repositório e rodar o comando:

```javascript
npm install
```
Agora com o serverless configurado, rode o comando:
````serverless
serverless deploy
````

Agora você precisará de algumas variaveis de ambiente:
- API Key do Google Gemini (GEMINI_API_KEY utilizada na Lambda "/src/functions/chatbot/sendChatbotMessage.ts")
- URL da API do Supabase (utilizada nas Lambdas "/src/lib/supabaseClient.ts")
- role-secret do Supabase para permissionamento RLS (SUPABASE_KEY utilizada nas Lambdas "/src/lib/supabaseClient.ts")
- Criar uma tabela chamada "reviews" com o seguinte schema:
```javascript
 {
  id: string;
  gameId: number;
  gameName: string;
  gameCoverUrl: string;
  status: string;
  reviewText: string;
  spoilers: boolean;
  platform?: string;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
  timePlayed?: string;
  mastered?: boolean;
  author: string;
}
```

Aguarde ser feito o deploy do projeto para a AWS e depois é só usar o insomnia, postman ou Yaak para testar a API.

### Sinta-se livre para deixar seu feedback, sugestões e reportar bugs!

---

# English version.

# Gamers' Pub Serverless API Rest

"This is my first major personal project using serverless architecture with the Serverless Framework and AWS. Although the front-end of my project, Gamers' Pub, is built with Next.js, I chose not to use server actions because they're essentially AWS Lambda Functions with a slightly higher price. So, I preferred to improve my knowledge of AWS and especially DynamoDB, with the goal of learning the 'Single-Table Design' for a more optimized and efficient database!

Another major implementation was a chatbot with AI using the Google Gemini API to create a game recommendation bot. Additionally, I was able to improve my skills with AWS Cognito for authentication and file upload/download with AWS S3.

I'm very satisfied with the results. It was a great step in my evolution as a full-stack web developer, and I believe I'm ready to create my own applications and release them to the world!

As a small detail, this is my first project using Biome.js for linting, and I must admit that I'm quite satisfied with the tool. Farewell, ESLint 👋

## Technologies and Tools

### Base:
- Node.js
- Serverless Framework V4;
- Lambda Functions;
- Typescript;
- Pnpm

### Linting:
- Biome.js
- Lint-staged
- Commitlinting
- Husky
- EditorConfig

### DataBase:
- DynamoDB usign Single-Table Design
- PostgreSQL instance hosted on Supabase (for getting random reviews)

### Authentication:
- AWS Cognito

### File storage:
- AWS S3

### Testing the API:
- Yaak

## Functionality and how to test

To test this API, you will first need to download the Serverless CLI, configure Serverless to connect to your AWS account, clone this repository, and run the following command:

```javascript
npm install
```
Now, with Serverless configured, run the following command:
````serverless
serverless deploy
````

Now, you will need some Enviroment variables:
- Google Gemini API Key (GEMINI_API_KEY on "/src/functions/chatbot/sendChatbotMessage.ts")
- Supabase API URL (on the support file: "/src/lib/supabaseClient.ts")
- Role-secret from Supabase for RLS permission (SUPABASE_KEY on "/src/lib/supabaseClient.ts")
- Create the table"reviews" with this schema:
```javascript
 {
  id: string;
  gameId: number;
  gameName: string;
  gameCoverUrl: string;
  status: string;
  reviewText: string;
  spoilers: boolean;
  platform?: string;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
  timePlayed?: string;
  mastered?: boolean;
  author: string;
}
```

Wait for the project deployment to AWS to complete, and then use Insomnia, Postman and Yaak to test the API.

### Feel free to leave your feedback and suggestions!
