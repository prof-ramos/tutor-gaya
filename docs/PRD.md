# PRD — Tutor Gaya

**Versão:** 1.3 · **Data:** 21/09/2026 · **Status:** especificação de produto para implementação  
**Produto:** webapp pessoal de preparação para o concurso do TCDF  
**Concurso:** Analista Administrativo de Controle Externo — Área de Gestão — Serviços Técnico-Administrativos  
**Repositório:** prof-ramos/tutor-gaya

> Este documento consolida o PRD da versão 1.2 e as correções subsequentes de pontuação. Descreve requisitos e decisões de produto; não implica que as funcionalidades já estejam implementadas. O código inicial do repositório é o Next.js Turso Starter.

## 1. Objetivo e visão

Apoiar a preparação da Gaya por meio de três módulos vinculados ao mesmo edital verticalizado:

1. **Edital:** conteúdo oficial hierárquico e acompanhamento de estudo.
2. **Questões:** registro agregado de acertos e erros de exercícios feitos fora do webapp, sem armazenar enunciados, alternativas ou gabaritos.
3. **Discursiva:** geração de tema e espelho, editor, correção simulada auditável e histórico de evolução.

A IA será usada para gerar propostas, espelhos, avaliações de conteúdo, apontamentos linguísticos e feedback; cálculos, validações e regras do concurso pertencem ao código da aplicação. O edital oficial prevalece sobre JSONs estruturados e dados derivados.

## 2. Fonte normativa e dados de referência

- Fonte principal: Edital nº 1 — TCDF/ANACE, de 8/7/2026, conforme retificação do Edital nº 2, de 29/7/2026.
- O arquivo edital(1).json é insumo de estruturação, não fonte normativa independente.
- Preservar numeração, texto original, hierarquia e versão da fonte; não alterar o edital automaticamente.
- Novas retificações deverão ser importadas com revisão e versionamento explícitos.
- Não incluir no banco conteúdos inferidos como se fossem itens oficiais. Subdivisões pedagógicas opcionais devem ser marcadas como derivadas.
- Para a peça técnica, é indispensável obter e ingerir o **Manual de Redação Oficial do TCDF (2ª edição)**; não presumir que ele já se encontre no repositório.

## 3. Usuários, acesso e privacidade

**Estudante:** consultar o edital, atualizar progresso, lançar resultados de questões, gerar e enviar discursivas, receber correções e acompanhar histórico.

**Administrador:** importar edital e fontes, configurar modelos, verificar consumo e inspecionar falhas.

Autenticação via Auth.js + Google OAuth; acesso por lista de e-mails autorizados no servidor, sem cadastro público. O produto é inicialmente pessoal, mas as entidades deverão conter user_id e validar autorização para impedir leitura/escrita entre usuários. Não implementar times, planos nem billing.

## 4. Fora de escopo do MVP

Banco de questões, geração/correção de questões objetivas, enunciados/alternativas/gabaritos, aulas, flashcards, planejamento automático, ranking, comunidade, gamificação, aplicativo nativo, pagamentos, assinatura, chatbot genérico ou fine-tuning de modelos.

## 5. Navegação e dashboard

~~~text
Dashboard
├── Edital
│   ├── Conhecimentos Básicos
│   ├── Conhecimentos Específicos
│   └── Conhecimentos Especializados
├── Questões
│   ├── Novo registro
│   ├── Desempenho
│   └── Histórico
└── Discursiva
    ├── Gerar tema
    ├── Questão discursiva
    ├── Informação
    ├── Correções
    └── Evolução
~~~

Dashboard: progresso do edital, total de questões, taxa global de acertos, última discursiva, médias por modalidade e evolução ao longo do tempo. Interface responsiva em desktop e celular.

## 6. Edital verticalizado

Hierarquia: seção → disciplina → tópico → subtópico (com profundidade variável). Cada nó guarda id estável, section_id, discipline_id, parent_id, número original, texto original, ordem, profundidade e versão da fonte.

Estados de estudo por item terminal: não iniciado, estudando, estudado; também última data de estudo e observações pessoais. Progresso de cada disciplina/seção = itens terminais estudados ÷ total de itens terminais aplicáveis. Itens superiores têm progresso derivado, não status que contradiga os descendentes. Questões e notas não mudam automaticamente o status de estudo.

Buscar e filtrar por seção, disciplina, texto e estado; permitir árvore expansível e navegação entre os tópicos e seus registros de desempenho.

## 7. Controle de questões — apenas agregados

Campos de registro: data, disciplina obrigatória, tópico/subtópico opcional, acertos inteiros não negativos e erros inteiros não negativos. O tópico, quando informado, deve pertencer à disciplina e existir no edital.

~~~text
total = acertos + erros
total > 0
percentual = 100 × acertos / total
~~~

Exibir total e percentual automaticamente. Registrar, editar, excluir e filtrar histórico por data, disciplina e tópico. Estatísticas gerais, por disciplina e por tópico, além de evolução temporal.

**Importante:** percentual consolidado = 100 × soma(acertos) ÷ [soma(acertos) + soma(erros)]. Nunca tirar média simples das porcentagens de registros com tamanhos diferentes. Não armazenar enunciado, alternativa, resposta individual ou gabarito.

## 8. Discursiva: modalidades e limites

O edital prevê, na prova P4 de 50 pontos:

| Componente | Conteúdo | Limite | Nota máxima |
|---|---|---:|---:|
| Questão discursiva | Conhecimentos Especializados | 20 linhas | 15 |
| Peça técnica — Informação | Conhecimentos Especializados e estrutura do Manual TCDF | 50 linhas | 35 |

Permitir praticar cada componente isoladamente e executar **simulado completo** com os dois componentes vinculados. Não gerar tema principal com base em Conhecimentos Básicos ou Específicos.

A simulação não é uma correção oficial; nomenclatura e interface deverão explicitar **nota simulada segundo os critérios do edital**. Um espelho gerado por IA será chamado de *espelho de treinamento*, jamais de espelho oficial da banca.

## 9. Gerador de temas

Parâmetros: modalidade, seleção aleatória de tópicos especializados ou disciplina/tópicos escolhidos. O servidor consulta o edital estruturado, envia ao modelo somente o recorte relevante e, para Informação, recupera o contexto pertinente do Manual TCDF.

A saída deve ser JSON estruturado validado por schema e regra de domínio, contendo modalidade, comando, ids de tópicos válidos, pontos esperados e pesos, espelho de treinamento, eventual resposta-modelo e limite de linhas. A soma dos pesos do espelho de treinamento deve ser **15 para a questão e 35 para a Informação**; rejeitar/regenerar saída inválida. Essa distribuição interna é uma **decisão do produto**, não um espelho oficial divulgado pelo TCDF.

Antes do envio da resposta, ocultar espelho, pesos, pontos esperados e modelo de resposta; liberar após a correção. Persistir tema/espelho/versionamento antes de começar uma tentativa.

## 10. Editor e interpretação operacional de linhas

Editor com 20 ou 50 posições de linha, representando visualmente o espaço físico da prova. Cada linha é persistida individualmente. O texto não pode transbordar visualmente para uma segunda linha sem ocupar outra posição; implementar quebra controlada, tratamento de colagem e validação de comprimento para evitar divergência entre linha visual e linha persistida. Nunca truncar silenciosamente.

**TL:** número de linhas efetivamente escritas na resposta, contabilizado na aplicação como quantidade de posições com ao menos um caractere não branco, após normalização dos espaços. Linhas vazias entre trechos não elevam TL. Essa é a convenção operacional do simulador para representar o termo editalício; não afirmar que substitui aferição física da banca.

Se TL = 0, trata-se de ausência de texto: atribuir zero ao componente **sem executar fórmula que divida por TL**.

Após envio, preservar resposta original imutável. Nova edição constitui nova tentativa; corretores não sobrescrevem o texto apresentado.

## 11. Conteúdo: avaliadores independentes e consolidação de NC

Executar duas avaliações independentes A e B; B não recebe notas ou parecer de A. Cada resultado possui nota de conteúdo, pontuação por item do espelho de treinamento, justificativas, omissões, erros conceituais e possível fuga ao tema. Validar NC_A/NC_B dentro de [0, 15] ou [0, 35], conforme modalidade.

O edital prevê convergência quando a diferença entre duas notas não excede **25% do máximo de conteúdo**, inclusive no limite:

~~~text
limite = 0,25 × NC_MAX
convergente(a,b) = |a-b| ≤ limite

questão:     NC_MAX = 15 → limite = 3,75
Informação:  NC_MAX = 35 → limite = 8,75
~~~

Se A e B forem convergentes: **NC = (A + B) / 2**. Caso contrário, executar avaliação independente C e calcular diferenças entre AB, AC e BC. Selecionar o par convergente com menor diferença e tirar sua média. Se nenhum par convergir, ou dois pares igualmente próximos conduzirem a médias diferentes, retornar **needs_review** e **NC = null**, sem inventar desempate ou nota. Se pares empatados produzirem a mesma média, pode-se consolidar essa média de forma determinística, com registro da ambiguidade de pares.

A aplicação reproduz a regra de convergência do edital em contexto simulado por IA; não equivale a dupla correção humana oficial.

## 12. Fuga ao tema e ausência de resposta

Ausência de texto (TL = 0) ou fuga ao tema confirmada implica nota zero no respectivo componente, sem uso das fórmulas. Para fuga ao tema, usar avaliações independentes A/B; divergência aciona C, com decisão por maioria e justificativa auditável. Na falta de decisão inequívoca, marcar needs_review e não gerar nota. Não confundir erro conceitual parcial com fuga integral ao tema.

## 13. Língua Portuguesa e NE

A análise linguística identifica ocorrências individuais, incluindo grafia, morfossintaxe e propriedade vocabular, com linha, trecho exato, categoria, explicação e sugestão. Cada ocorrência recebe status candidate, confirmed, rejected ou uncertain; rejeitadas e incertas não contam como erro, mas as incertas devem ser resolvidas antes da nota final.

~~~text
NE = número de ocorrências linguísticas distintas e confirmadas
NE ≥ 0, inteiro
~~~

Não contar duas vezes uma mesma ocorrência apontada em categorias diferentes. Não apresentar NE sem mostrar as ocorrências que o originaram. As sugestões de correção não substituem a resposta original.

## 14. Papel opcional do JevAI

OpenAI gera, avalia e explica; JevAI/TypeSafe AI pode validar decisões atômicas (critério atendido/parcial/não atendido, candidato a erro linguístico etc.). O Jev não produz texto livre, não cria tema ou espelho e não calcula notas. Em divergências materiais, submeter o ponto a adjudicação independente em vez de aceitar probabilidade como prova de erro.

~~~text
JEV_ENABLED=true|false
~~~

A indisponibilidade do Jev não pode impedir o funcionamento principal; fallback com validação adicional pela OpenAI e registro do caminho de decisão. Confirmar a API/SDK efetivamente disponível na conta antes da implementação.

## 15. Fórmulas — única implementação determinística

Variáveis por componente:

- **NC:** nota de conteúdo consolidada, dentro do limite da modalidade.
- **NE:** quantidade inteira de erros linguísticos confirmados.
- **TL:** número positivo de linhas efetivamente escritas.
- **NQ:** nota final da questão; **NPNT:** nota final da Informação.
- **NPD:** nota conjunta da prova discursiva P4.

A ordem é: verificar ausência de texto → verificar fuga ao tema → consolidar NC e NE → validar TL → aplicar fórmula da modalidade → aplicar piso zero. Não usar fórmula se algum dado necessário estiver ausente/inconclusivo.

~~~text
Questão:
NQ_raw = NC - (3 × NE / TL)
NQ     = max(0, NQ_raw)

Informação:
NPNT_raw = NC - (7 × NE / TL)
NPNT     = max(0, NPNT_raw)

Prova completa:
NPD = NQ + NPNT
~~~

Apenas **simulado completo** com NQ e NPNT válidos terá NPD e indicação de comparação com o mínimo editalício de **30/50**. Em prática isolada, NPD = null e não se mostra "aprovada/reprovada". Mesmo no simulado completo, utilizar "acima/abaixo do mínimo editalício na simulação", não declarar aprovação no concurso.

Não arredondar valores intermediários. Apresentar duas casas decimais apenas na interface; conservar precisão suficiente no cálculo e na persistência para reproduzir a nota. Utilizar funções puras e uma só implementação compartilhada entre backend e testes.

**Exemplo auditável:** NC = 12,5; NE = 3; TL = 19 → NQ_raw = 12,5 − 9/19 = 12,026315789… → exibir **12,03/15**.

## 16. Resultado da correção e histórico

Exibir modalidade, NC, erros confirmados NE com todas as ocorrências, TL, penalidade, nota bruta e final, critérios atendidos/parciais/não atendidos, omissões, erros conceituais, feedback, espelho de treinamento e resposta-modelo. Exibir versão de prompt/modelo e identificação da correção simulada. Em needs_review, não exibir nota final provisória como definitiva.

Histórico por tentativa: tema, tipo, tópicos, data, linhas originais, TL, NC, NE, resultado da modalidade, status, avaliações A/B/C, decisões de fuga, ocorrências linguísticas, modelo, prompt e custo aproximado. Permitir consulta, filtros, comparação e nova tentativa sobre o mesmo tema. Para dados inaplicáveis/inconclusivos usar null, **não zero**.

## 17. Arquitetura e template-base

**Plataforma oficial:** Vercel. **Template inicial:** Next.js Turso Starter, já presente neste repositório. Manter quando adequado Next.js App Router, TypeScript, Turso/libSQL, Drizzle, Server Actions e Tailwind; adicionar shadcn/ui, Auth.js/Google OAuth, integrações de IA e funcionalidades TCDF. Verificar e atualizar dependências compatíveis antes de desenvolver o domínio. Remover o CRUD de Todo de exemplo quando a substituição real estiver pronta; não manter código do starter sem finalidade.

~~~text
Browser
   ↓
Next.js / Vercel (Node.js runtime)
   ├── Turso / Drizzle
   ├── OpenAI API
   └── JevAI, se habilitado
~~~

Chaves privadas nunca são acessadas pelo navegador. Não adotar arquitetura de chatbot, SaaS, Stripe, times ou microserviços sem requisito.

## 18. Operações de IA e execução durável

Usar operações server-side e saídas estruturadas validadas por schema (por exemplo, Zod). Modelos configuráveis por ambiente; **não fixar IDs não verificados no código**. Conteúdo A, conteúdo B e análise linguística podem começar em paralelo; C só se divergência justificar.

Como o corretor exige várias chamadas e o usuário pode fechar a página, persistir correction_run e estados por etapa (pending, processing, completed, failed, needs_review). Requisições devem ser idempotentes. Antes de usar chamadas de longa duração, verificar os limites reais de execução do plano Vercel; se excederem, implementar orquestração compatível com a plataforma, sem presumir que uma Function sobreviverá ao fechamento da conexão. Uma etapa concluída não deve ser cobrada/executada de novo sem necessidade.

## 19. Banco — esquema conceitual

~~~text
users
syllabus_sections
disciplines
syllabus_topics
study_progress
question_logs
discursive_prompts
prompt_topics
discursive_attempts
discursive_exams
correction_runs
content_reviews
language_errors
source_documents
ai_usage
~~~

Campos essenciais:

- **syllabus_topics:** id, discipline_id, parent_id, number, text, level, order, source_version.
- **study_progress:** user_id, topic_id, status, last_studied_at, notes.
- **question_logs:** id, user_id, date, discipline_id, topic_id nullable, correct, wrong.
- **discursive_prompts:** id, type, command, max_lines, expected_points_json, reference_answer, generation_model, prompt_version.
- **prompt_topics:** prompt_id, topic_id.
- **discursive_attempts:** id, user_id, prompt_id, lines_json, line_count, submitted_at, status.
- **correction_runs:** id, attempt_id, status, content_score nullable, language_error_count nullable, line_count, raw_score nullable, final_score nullable, off_topic nullable, created_at, completed_at.
- **content_reviews:** id, correction_run_id, reviewer, model, score, criteria_json, conceptual_errors_json, omissions_json, off_topic.
- **language_errors:** id, correction_run_id, line, original_text, category, subcategory, explanation, suggestion, status.
- **discursive_exams:** id, user_id, question_attempt_id, technical_attempt_id, NQ nullable, NPNT nullable, NPD nullable.
- **source_documents:** id, name, version, type, provider_file_id, vector_store_id, active.
- **ai_usage:** id, operation, provider, model, input_tokens, output_tokens, estimated_cost, created_at.

O diagrama é conceitual; migrations, constraints, índices e nomes finais serão definidos na especificação técnica. Não armazenar informações sensíveis em logs.

## 20. Ambientes, segurança e deploy

GitHub integrado à Vercel: branches/PRs → **Preview Deployments**; main → **Production**; **Development** local. Segredos em variáveis server-side distintas por ambiente:

~~~text
OPENAI_API_KEY
TYPESAFE_API_KEY
OPENAI_MODEL_GENERATOR
OPENAI_MODEL_CORRECTOR
OPENAI_MODEL_LANGUAGE
JEV_ENABLED
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
AUTH_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
~~~

Nunca publicar chaves por variáveis NEXT_PUBLIC_ ou commitá-las. Usar .env.local ignorado no Git e .env.example sem segredos. Preview não pode usar por acidente banco ou credenciais sensíveis de produção. Proteger rotas e verificar autorização na camada de dados. Evitar registrar conteúdo integral das respostas; logs contêm IDs, etapa, duração, modelo e status. Registrar consumo/tokens/custo estimado em ai_usage.

A Vercel será responsável por hosting, Functions, previews, production e Runtime Logs. Exigir build, typecheck e testes antes de mudanças críticas; deployment rastreável a commit e possibilidade de rollback. Não afirmar que o deploy foi realizado antes de verificar status de projeto e ambientes.

## 21. Tratamento de falhas

Falha na geração: não apresentar tema parcial como válido. Falha em parte da correção: manter etapas concluídas e sinalizar **correção incompleta**. Nunca calcular nota se NC ou NE estiver ausente/inconclusivo ou TL inválido. Usar estados funcionais na interface ("avaliando conteúdo", "avaliando língua", "conciliando notas", "calculando resultado"), sem expor raciocínio interno dos modelos.

## 22. Testes, calibração e critérios de aceite

**Unitários:** total/percentual ponderado; limites; TL; piso zero; NQ, NPNT, NPD; convergência inclusiva; terceiro avaliador e casos inconclusivos; ausência de texto; distinção prática isolada versus prova completa; progresso por itens terminais.

Casos mínimos:

~~~text
Questão sem erros: NC=15; NE=0; TL=20 → NQ=15
Questão com erros: NC=12,5; NE=3; TL=19 → NQ≈12,026315789
Informação sem erros: NC=35; NE=0; TL=50 → NPNT=35
Convergência questão: A=10; B=13,75 → sim
Divergência questão: A=10; B=13,76 → aciona C
Terceira correção: A=5; B=14; C=12 → NC=13
Ausência de texto: TL=0 → nota=0, sem divisão
Simulado completo: NQ=12; NPNT=25 → NPD=37
~~~

**Integração:** Turso, Auth.js, OpenAI, Jev opcional, recuperação documental. **E2E:** autenticação → edital/progresso; lançamento de questões → estatísticas; geração → resposta → correção → histórico, também nos previews.

**Qualidade do corretor:** conjunto fixo de redações para regressão após troca de modelo/prompt/regra; avaliar estabilidade, falsos erros gramaticais, omissões e divergências. Sem corpus humano/oficial fornecido, não declarar equivalência com a banca.

**Aceite do MVP:** funcionamento integral dos três módulos; nenhum texto de questão objetiva armazenado; editor coerente com limites; tema/espelho associados a itens válidos; notas reproduzíveis; erros auditáveis; proteção de chaves; previews e produção operacionais; manual TCDF ingerido antes de liberar correção completa de Informação.

## 23. Etapas de implementação

1. Revisar o starter já instalado, atualizar dependências, verificar Vercel/env, autenticação e base de dados.
2. Importar e validar edital; implementar árvore, estados e dashboard.
3. Implementar registros e estatísticas de questões.
4. Implementar gerador de temas com espelho de treinamento oculto.
5. Implementar editor de 20 linhas, correção da questão e NQ.
6. Ingerir Manual TCDF; implementar editor de 50 linhas, Informação e NPNT.
7. Implementar simulado P4 completo e NPD; integrar validação opcional Jev.
8. Implementar testes, regressão de IA, observabilidade, previews e validação de produção.

## 24. Definição de pronto

Gaya consegue autenticar-se, consultar/marcar edital, lançar acertos e erros externos, consultar desempenho, gerar tema especializado, redigir dentro do limite, receber correção simulada explicada, consultar espelho/histórico e acompanhar evolução. A aplicação pode ser implantada e verificada na Vercel com dados e credenciais segregados por ambiente.

**Princípios:** edital é fonte normativa; IA avalia e código calcula; nota simulada não é resultado oficial; nenhum erro integra NE sem ocorrência rastreável; trabalho do usuário e correções concluídas devem sobreviver à atualização da página; manter a solução simples e adequada ao uso pessoal.