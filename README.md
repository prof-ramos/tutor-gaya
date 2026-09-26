# Tutor Gaya

Webapp pessoal de preparação para o concurso TCDF. Código inicial baseado no Next.js Turso Starter.

## Implementado neste incremento

- **/questoes:** registro de acertos e erros em questões externas e histórico agrupado por disciplina. A taxa é calculada como soma dos acertos dividida pela soma de acertos e erros.
- **/discursivas:** envio de resposta a questão discursiva e feedback estruturado pela OpenAI, com critérios atendidos/parciais/não atendidos, omissões, erros conceituais e linguísticos, sugestões, espelho e resposta-modelo de treinamento.
- **/discursivas/{id}:** consulta ao texto original e ao feedback persistido.

O histórico começa vazio; não há dados de questões ou respostas fictícios. Para usar o feedback, são necessários comando e critérios de treinamento informados pelo usuário. **O espelho e a resposta-modelo não são oficiais** e a correção numérica completa do PRD ainda não foi implementada.

## Configuração

Node.js 22+, conta Turso e chave OpenAI com acesso a modelo que aceite Responses API Structured Outputs:

~~~sh
npm ci
cp .env.example .env.local
# Preencha os valores server-side em .env.local.
npm run db:migrate
npm run dev
~~~

Configure **APP_ACCESS_USER** e **APP_ACCESS_PASSWORD**; sem ambos o app devolve HTTP 503 para proteger os dados pessoais. O acesso HTTP Basic é temporário para uso individual em HTTPS; a autenticação Google OAuth prevista no PRD é uma etapa futura.

No deploy Vercel, configure Development, Preview e Production separadamente, aplique as migrations ao banco correto antes de publicar e configure OPENAI_API_KEY e OPENAI_MODEL_FEEDBACK no ambiente do servidor. O build **não** migra banco automaticamente.

~~~sh
npm run test
npm run typecheck
npm run lint
npm run build
~~~

## Documentação

- [PRD completo](docs/PRD.md)
- [Implementação, configuração e limites deste incremento](docs/IMPLEMENTATION.md)

A peça técnica Informação, a integração com o edital verticalizado, a validação JevAI e a nota numérica simulada serão implementadas nas fases seguintes do PRD.
