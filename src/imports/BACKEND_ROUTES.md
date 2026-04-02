# Backend Routes (FastAPI monolith)

Este documento lista as rotas HTTP expostas pelo backend (FastAPI rodando em uma única Lambda via Mangum) e como autenticar/autorizar cada uma.

## Base URL

- A API é um **API Gateway HTTP API (v2)** criado em `amplify/backend.ts` com nome `echolabHttpApi`.
- O endpoint (URL base) é exportado via `backend.addOutput({ custom: { API: { echolabHttpApi: { endpoint }}}})`.

## Autenticação e Autorização

- **Pública**: apenas `GET /health`.
- **Autenticada (Cognito User Pool JWT)**: todas as demais rotas exigem header `Authorization: Bearer <JWT>`.
- **Admin-only**: rotas sob `/admin/*` exigem que o usuário esteja no grupo Cognito `admin` (verificação feita no backend em `require_admin`).
- **Tenant**: o backend resolve `tenantId` a partir do claim `custom:tenantId` (se ausente, usa `default`).

## Rotas

### Health

- `GET /health`
  - Auth: **pública**
  - Response: `{ "status": "ok" }`

### Me (contexto do usuário autenticado)

Prefixo: `/me`

- `GET /me`
  - Auth: **usuário autenticado**
  - Response: `{ userId: string, tenantId: string, isAdmin: boolean, groups: string[] }`
  - Notas:
    - `isAdmin` é derivado do grupo Cognito `admin` (mesma lógica usada para proteger `/admin/*`).
    - Use este endpoint no frontend para ajustar a UI (ex.: mostrar/ocultar ações de admin).

### Voices (catálogo, defaults do tenant e seleção do usuário)

- `GET /voices`
  - Auth: **usuário autenticado**
  - Query params (opcionais): `language`, `gender`
  - Response: `{ items: Voice[] }` (somente vozes `enabled=true`)

- `GET /voices/{voice_id}`
  - Auth: **usuário autenticado**
  - Response: `Voice`

#### Admin: catálogo de vozes

- `GET /admin/voices`
  - Auth: **admin**
  - Query params (opcionais): `language`, `gender`
  - Response: `{ items: Voice[] }` (inclui enabled/disabled)

- `POST /admin/voices`
  - Auth: **admin**
  - Body: `VoiceCreate` (ex.: provider, providerVoiceId, language, gender, name, enabled, etc.)
  - Response: `Voice`

- `PUT /admin/voices/{voice_id}`
  - Auth: **admin**
  - Body: `VoiceUpdate` (campos atualizáveis do catálogo)
  - Response: `Voice`

- `DELETE /admin/voices/{voice_id}`
  - Auth: **admin**
  - Response: `{ "deleted": true }`

#### Tenant defaults

- `GET /tenant/voice-defaults`
  - Auth: **usuário autenticado**
  - Response: `{ tenantId: string, defaults: TenantDefaultVoice[] }`

- `PUT /admin/tenant/voice-defaults`
  - Auth: **admin**
  - Body: `TenantDefaultsUpsertRequest`
    - `tenantId` (opcional; se omitido, usa o tenant do token)
    - `defaults`: lista de `{ language, gender, voiceId }`
  - Response: `{ tenantId: string, defaults: TenantDefaultVoice[] }`
  - Notas:
    - Valida se cada `voiceId` referenciado existe no catálogo.

#### Seleções do usuário

- `GET /me/voice-selections`
  - Auth: **usuário autenticado**
  - Response: `{ userId: string, tenantId: string, selections: UserVoiceSelection[] }`

- `PUT /me/voice-selections`
  - Auth: **usuário autenticado**
  - Body: `UserVoiceSelectionsUpsertRequest`
    - `selections`: lista de `{ language, gender, voiceId }`
  - Response: `{ userId: string, tenantId: string, selections: UserVoiceSelection[] }`
  - Notas:
    - Valida se cada `voiceId` referenciado existe no catálogo.

### Presets (por usuário)

Prefixo: `/me`

- `GET /me/presets`
  - Auth: **usuário autenticado**
  - Response: `{ items: Preset[] }`

- `POST /me/presets`
  - Auth: **usuário autenticado**
  - Body: `PresetCreate`
    - Campos típicos: `name`, `language`, `gender`, `intonation`, `pitch`, `rate`
    - Restrições: `intonation`, `pitch`, `rate` devem estar no intervalo **[0.5, 1.5]**
  - Response: `Preset`

- `DELETE /me/presets/{preset_id}`
  - Auth: **usuário autenticado**
  - Response: `{ "deleted": true }`

### Synthesis (cache em S3 + Polly)

Prefixo: `/me`

- `POST /me/synthesize`
  - Auth: **usuário autenticado**
  - Body: `SynthesizeRequest`
    - `text`: string
    - E um dos modos:
      - **por preset**: `presetId`
      - **por settings diretos**: `language`, `gender`, `rate`, `pitch`, `intonation`
  - Response: `{ url: string, cached: boolean }`
  - Notas:
    - Cache key em S3: `{userId}/{sha256(text + settings)}.mp3`.
    - No momento, somente provider **Polly** está implementado; vozes de outros providers resultam em erro.

### Message Packs (por usuário)

Prefixo: `/me`

- `GET /me/message-packs`
  - Auth: **usuário autenticado**
  - Response: `{ items: MessagePack[] }`

- `POST /me/message-packs`
  - Auth: **usuário autenticado**
  - Body: `MessagePackCreate`
    - `name`: string
    - `messages`: lista de `{ messageName, presetId, messageText }`
  - Response: `MessagePack`
  - Notas:
    - Valida `messageName` único dentro do pack.
    - Valida que cada `presetId` pertence ao usuário.

- `GET /me/message-packs/{pack_id}`
  - Auth: **usuário autenticado**
  - Response: `MessagePack`

- `PUT /me/message-packs/{pack_id}`
  - Auth: **usuário autenticado**
  - Body: `MessagePackUpdate` (atualiza nome e/ou lista completa de mensagens, conforme schema)
  - Response: `MessagePack`

- `DELETE /me/message-packs/{pack_id}`
  - Auth: **usuário autenticado**
  - Response: `{ "deleted": true }`

- `DELETE /me/message-packs/{pack_id}/messages/{message_name}`
  - Auth: **usuário autenticado**
  - Response: `MessagePack` (pack atualizado)
  - Notas:
    - Remove apenas a mensagem com `messageName == {message_name}`.
    - Se a mensagem não existir no pack, retorna 404.
