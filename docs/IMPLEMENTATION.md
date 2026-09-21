# Incremento: histórico de questões e feedback de discursivas

Este incremento implementa **duas funcionalidades** sobre o Next.js Turso Starter, mantendo docs/PRD.md como visão do produto completo.

## O que funciona

- /questoes: lançamentos externos agregados por disciplina, histórico e resumo com SUM(correct) / [SUM(correct) + SUM(wrong)]. Não armazena enunciados, alternativas ou gabaritos.
- /discursivas: formulário de prática de **questão** com comando, critérios de treinamento (um por linha), referência opcional e resposta; preserva a resposta original, solicita feedback estruturado da OpenAI, persiste o resultado e exibe atendimento dos critérios, omissões, erros conceituais e linguísticos, sugestões, espelho e resposta-modelo.
- /discursivas/{id}: histórico da tentativa e feedback após envio. Espelho e resposta-modelo são material de treino, nunca oficial; **não há pontuação numérica nesta entrega**.

## Requisitos para usar

1. Configurar a integração Turso e aplicar as migrations ao banco correto com npm run db:migrate. **O build não executa mais migrações automaticamente.**
2. Definir APP_ACCESS_USER e APP_ACCESS_PASSWORD para habilitar a proteção temporária por HTTP Basic Auth; na ausência das duas variáveis a aplicação responde 503 (falha fechada). Usar somente sob HTTPS.
3. Para feedback: definir OPENAI_API_KEY e OPENAI_MODEL_FEEDBACK com ID de modelo habilitado na conta e compatível com Responses API Structured Outputs. Se faltar configuração, a resposta é preservada com status failed, sem inventar feedback.
4. Segredos são server-side; nunca usar NEXT_PUBLIC_ para chaves. Usar ambientes separados para Preview e Production.

## Limites desta entrega

- O edital oficial verticalizado ainda não foi importado; o nome da disciplina e os critérios são digitados manualmente. Futuras alterações devem associá-los a IDs oficiais.
- Autenticação Google OAuth do PRD ainda não foi implementada; a proteção Basic Auth é temporária, para **um único usuário**. Não liberar acesso compartilhado ou público sem identidade individual e autorização por usuário.
- O editor controla no máximo 20 linhas **digitadas**, ainda não corresponde a linhas físicas do caderno de prova.
- A peça técnica Informação depende da ingestão do Manual de Redação Oficial TCDF, portanto não foi habilitada.
- A presente correção qualitativa não executa a dupla avaliação A/B/C nem calcula NC, NE, TL, NQ ou NPD para fins de nota. Isso continua nas fases posteriores do PRD.
- OpenAI e Turso geram custos conforme uso, e o processamento de feedback é síncrono nesta versão; em caso de timeout, a resposta permanecerá salva para inspeção.

## Validações

Executar npm ci, npm run test, npm run typecheck, npm run lint e npm run build em ambiente com Node 22+, acesso às dependências e env de desenvolvimento. Não apresentar build/deploy como validado sem execução efetiva.
