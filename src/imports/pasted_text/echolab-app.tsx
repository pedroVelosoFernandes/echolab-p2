Gere um novo frontend React (Vite + TypeScript) para um app chamado EchoLab, usando APENAS as rotas HTTP descritas abaixo (não invente endpoints). O app deve ter layout e densidade visual inspirados em ferramentas SaaS modernas (ex.: Linear) — minimalista, tipografia limpa, espaçamento compacto, bordas sutis, foco em produtividade — mas sem copiar assets, HTML, CSS ou componentes proprietários. Produza um design original.

Restrições de escopo (muito importante):

Não adicionar páginas extras além das já existentes na navegação atual: Home, Vozes, Presets, Sintetizar, Message Packs, Configurações, e páginas públicas (Landing/Pricing/Docs/Contact) + Auth (Sign in/Sign up).
Não adicionar “features extras” (sem filtros novos, sem dashboards novos, sem páginas admin separadas). Só implementar o que está mapeado nas rotas.
Não hardcode cores novas: use tokens/classes já existentes do projeto (Tailwind + variáveis do tema).
Segurança: todas as rotas exceto /health exigem Authorization Bearer JWT (Cognito). O frontend deve usar Amplify Auth para obter JWT e anexar no header.
Stack e padrões:

React 18 + Vite + TypeScript.
Tailwind CSS (já configurado) e componentes simples (sem criar um design system novo).
Auth via Amplify v6: aws-amplify/auth (signIn, signUp, fetchAuthSession, getCurrentUser, signOut).
API via fetch com um client central que:
Lê a base URL do amplify_outputs.json em custom.API.echolabHttpApi.endpoint
Fallback opcional: VITE_ECHOLAB_API_URL
Anexa Authorization: Bearer <JWT>
Lida com erros retornando mensagens amigáveis.
O app atual usa React Router com rotas:
/ (landing layout): Landing, Pricing, Docs, Contact
/signin, /signup
/app (dashboard layout): Home, Voices, Presets, Synthesize, Message Packs, Settings
Mantenha essa organização.
Requisitos de UX/funcionalidade por página (derivados do backend):

Auth
Sign in / Sign up funcionais via Cognito (Amplify).
Se já estiver logado, redirecionar para /app.
Dentro do app deve existir um botão “Sair” (Sign out) que desloga e volta para /signin.
Contexto do usuário / Admin
Implementar GET /me para obter: userId, tenantId, isAdmin, groups.
O frontend deve usar isso para:
Mostrar um pequeno indicador “Admin” no menu/Settings se isAdmin = true.
Habilitar ações admin-only na página de Vozes (ver abaixo).
Mesmo com UI escondendo ações, sempre tratar 403/401 com mensagem clara.
Vozes (/app/voices)
Listar vozes usando GET /voices (autenticado).
Mostrar colunas: displayName (ou voiceKey se displayName vazio), language, gender, provider, enabled.
Se o usuário for admin (GET /me isAdmin = true):
Exibir botão “Nova voz”
Abrir modal simples para criar voz via POST /admin/voices
Campos do modal: provider, voiceKey, language, gender, qualities[], displayName (opcional), enabled
Ao criar, recarregar lista.
Não criar uma página admin separada.
Presets (/app/presets)
Listar presets via GET /me/presets
Criar preset via POST /me/presets (valida rate/pitch/intonation entre 0.5 e 1.5 no front e deixa o backend validar também)
Deletar preset via DELETE /me/presets/{preset_id}
UI compacta estilo SaaS, com modal de criação como já existe hoje.
Sintetizar (/app/synthesize) — MUITO IMPORTANTE
Não ter duas abas (“Preset” vs “Ajuste direto”). Deve ser UMA única página com um único fluxo.
Deve existir um seletor “Fonte” (dropdown) que permite:
Selecionar um preset existente (se houver)
Ou escolher “Configurar manualmente”
Se o usuário não tiver preset:
A tela já deve permitir configurar manualmente
Deve ter botão “Salvar preset” para salvar as configurações atuais criando um preset via POST /me/presets (pedir apenas um nome do preset em modal).
Ao clicar “Gerar áudio”, chamar POST /me/synthesize:
Se fonte for preset: { text, presetId }
Se manual: { text, language, gender, rate, pitch, intonation } (clamp 0.5–1.5)
Mostrar player de áudio com a URL retornada e badge cached/fresh.
Message Packs (/app/message-packs)
Listar via GET /me/message-packs
Criar via POST /me/message-packs
Deletar pack via DELETE /me/message-packs/{pack_id}
Deletar mensagem individual via DELETE /me/message-packs/{pack_id}/messages/{message_name}
Para criar pack, permitir adicionar múltiplas mensagens (messageName único), escolher presetId (carregar presets via GET /me/presets).
Rotas do backend (NÃO inventar outras):

GET /health (pública)
GET /me (autenticada) -> { userId, tenantId, isAdmin, groups[] }
GET /voices (autenticada) -> { items: Voice[] }
GET /voices/{voice_id} (autenticada) -> Voice
GET /tenant/voice-defaults (autenticada)
PUT /me/voice-selections (autenticada)
GET /me/voice-selections (autenticada)
GET /me/presets (autenticada) -> { items: Preset[] }
POST /me/presets (autenticada) -> Preset
DELETE /me/presets/{preset_id} (autenticada)
POST /me/synthesize (autenticada) -> { url, cached }
GET /me/message-packs (autenticada) -> { items: MessagePack[] }
POST /me/message-packs (autenticada) -> MessagePack
GET /me/message-packs/{pack_id} (autenticada) -> MessagePack
PUT /me/message-packs/{pack_id} (autenticada) -> MessagePack
DELETE /me/message-packs/{pack_id} (autenticada)
DELETE /me/message-packs/{pack_id}/messages/{message_name} (autenticada) -> MessagePack
Admin-only:
GET /admin/voices
POST /admin/voices
PUT /admin/voices/{voice_id}
DELETE /admin/voices/{voice_id}
PUT /admin/tenant/voice-defaults
Tipos (use estes campos, sem inventar):
Voice:

voiceId, provider, voiceKey, language, gender, qualities[], displayName?, enabled, createdAt, updatedAt
Preset:
presetId, userId, name, language, gender, rate, pitch, intonation
MessagePack:
packId, userId, name, messages[{ messageName, presetId, messageText }], createdAt, updatedAt
Entrega:

Gere os arquivos React/TS necessários para implementar tudo acima.
Inclua um client de API central e hooks simples para /me.
Mantenha a navegação existente (Sidebar + Header + Layouts).
Garanta que build e lint não quebrem.
Não inclua texto explicativo longo; foque no código.