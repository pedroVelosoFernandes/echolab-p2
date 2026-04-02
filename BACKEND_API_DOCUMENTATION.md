# EchoLab - Documentação Completa da API Backend

**Versão:** 1.0  
**Data:** Abril 2026  
**Stack:** FastAPI + AWS Lambda (Mangum) + API Gateway HTTP API v2

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura e Infraestrutura](#arquitetura-e-infraestrutura)
3. [Autenticação e Autorização](#autenticação-e-autorização)
4. [Base URL e Configuração](#base-url-e-configuração)
5. [Tipos e Modelos de Dados](#tipos-e-modelos-de-dados)
6. [Endpoints da API](#endpoints-da-api)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Cliente API Frontend](#cliente-api-frontend)
9. [Queries React Query](#queries-react-query)
10. [Endpoints Mockados (Pendentes de Implementação)](#endpoints-mockados-pendentes-de-implementação)

---

## 🎯 Visão Geral

O EchoLab é uma plataforma SaaS de síntese de voz (Text-to-Speech) que permite:
- Sintetizar áudios com diferentes vozes e configurações
- Gerenciar presets de voz personalizados
- Criar e gerenciar pacotes de mensagens (Message Packs)
- Selecionar vozes preferidas por idioma e gênero
- Agendar anúncios e transmissões ao vivo
- Gerenciar dispositivos receptores

### Stack Backend
- **Framework:** FastAPI (Python)
- **Deploy:** AWS Lambda + Mangum (adaptador ASGI)
- **API Gateway:** AWS HTTP API v2
- **Autenticação:** AWS Cognito User Pool (JWT)
- **Storage:** Amazon S3 (cache de áudios sintetizados)
- **TTS Provider:** Amazon Polly (outros providers planejados)

---

## 🏗️ Arquitetura e Infraestrutura

### API Gateway
- **Tipo:** AWS HTTP API v2 (não REST API v1)
- **Nome:** `echolabHttpApi`
- **Região:** `us-east-1`
- **URL Base:** `https://l96n27atrc.execute-api.us-east-1.amazonaws.com/`

### Cognito User Pool
- **Pool ID:** `us-east-1_KcdRH7ClW`
- **Client ID:** `3jkq5toihlqtivrrvnchk5v8i9`
- **Identity Pool:** `us-east-1:fd30521e-882c-4517-8d61-95e0db394c62`
- **Região:** `us-east-1`
- **Atributos Obrigatórios:** `email`
- **Username:** Email é usado como username
- **MFA:** Desabilitado
- **Custom Attributes:** `custom:tenantId` (usado para multi-tenancy)

### Configuração no Frontend
A configuração é lida de `/src/imports/amplify_outputs.json`:

```json
{
  "custom": {
    "API": {
      "echolabHttpApi": {
        "endpoint": "https://l96n27atrc.execute-api.us-east-1.amazonaws.com/",
        "region": "us-east-1",
        "apiName": "echolabHttpApi"
      }
    }
  }
}
```

---

## 🔐 Autenticação e Autorização

### Níveis de Acesso

#### 1. Pública
- **Rotas:** `GET /health`
- **Autenticação:** Nenhuma

#### 2. Usuário Autenticado
- **Rotas:** Todas exceto `/admin/*` e `/health`
- **Autenticação:** JWT Bearer Token do Cognito
- **Header:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`

#### 3. Admin
- **Rotas:** `/admin/*`
- **Autenticação:** JWT Bearer Token + grupo Cognito `admin`
- **Verificação:** Backend valida se usuário está no grupo `admin`

### Fluxo de Autenticação

```typescript
// 1. Frontend obtém token do Cognito via Amplify
import { fetchAuthSession } from 'aws-amplify/auth';

const session = await fetchAuthSession();
const token = session.tokens?.accessToken?.toString();

// 2. Envia token no header da requisição
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Claims do JWT

O backend extrai as seguintes informações do JWT:

```python
{
  "sub": "user-uuid",                    # userId
  "cognito:username": "user@example.com", # email
  "cognito:groups": ["admin"],           # grupos do usuário
  "custom:tenantId": "tenant-123",       # ID do tenant (multi-tenancy)
  "email": "user@example.com"
}
```

### Multi-Tenancy

- **Claim:** `custom:tenantId`
- **Fallback:** Se ausente, usa `"default"`
- **Escopo:** Dados isolados por tenant (presets, message packs, voice selections)

---

## 🌐 Base URL e Configuração

### Obtenção da Base URL (Frontend)

```typescript
// /src/lib/api-client.ts
const getBaseUrl = (): string => {
  // 1. Lê de amplify_outputs.json
  const endpoint = outputs?.custom?.API?.echolabHttpApi?.endpoint;
  if (endpoint) return endpoint;
  
  // 2. Fallback para variável de ambiente
  const envUrl = import.meta.env.VITE_ECHOLAB_API_URL;
  if (envUrl) return envUrl;
  
  throw new Error('EchoLab API endpoint not configured');
};
```

### Variáveis de Ambiente

```bash
# .env (opcional, se não usar amplify_outputs.json)
VITE_ECHOLAB_API_URL=https://l96n27atrc.execute-api.us-east-1.amazonaws.com/
```

---

## 📦 Tipos e Modelos de Dados

### UserContext

```typescript
interface UserContext {
  userId: string;        // Cognito sub
  tenantId: string;      // custom:tenantId ou "default"
  isAdmin: boolean;      // true se usuário está no grupo "admin"
  groups: string[];      // Lista de grupos Cognito
}
```

**Endpoint:** `GET /me`

---

### Voice (Catálogo de Vozes)

```typescript
interface Voice {
  voiceId: string;       // UUID gerado pelo backend
  provider: string;      // "polly", "elevenlabs", "google", etc.
  voiceKey: string;      // ID da voz no provider (ex: "Joanna" no Polly)
  language: string;      // ISO 639-1 + país (ex: "pt-BR", "en-US")
  gender: string;        // "male", "female", "neutral"
  qualities: string[];   // ["conversational", "news", "neural", etc.]
  displayName?: string;  // Nome amigável (ex: "Joanna - Americana Neural")
  enabled: boolean;      // Se está disponível para uso
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}

interface VoiceCreate {
  provider: string;
  voiceKey: string;
  language: string;
  gender: string;
  qualities?: string[];
  displayName?: string;
  enabled: boolean;
}

interface VoiceUpdate {
  provider?: string;
  voiceKey?: string;
  language?: string;
  gender?: string;
  qualities?: string[];
  displayName?: string;
  enabled?: boolean;
}
```

**Endpoints:**
- `GET /voices` - Lista vozes (somente `enabled=true`)
- `GET /voices/{voice_id}` - Detalhes de uma voz
- `GET /admin/voices` - Admin: lista todas (incluindo `enabled=false`)
- `POST /admin/voices` - Admin: criar voz
- `PUT /admin/voices/{voice_id}` - Admin: atualizar voz
- `DELETE /admin/voices/{voice_id}` - Admin: deletar voz

---

### Preset (Configurações de Síntese)

```typescript
interface Preset {
  presetId: string;      // UUID gerado pelo backend
  userId: string;        // Dono do preset
  name: string;          // Nome amigável (ex: "Voz Formal", "Anúncio Rápido")
  language: string;      // ISO 639-1 + país (ex: "pt-BR")
  gender: string;        // "male", "female", "neutral"
  rate: number;          // Velocidade [0.5, 1.5] - 1.0 é normal
  pitch: number;         // Tom [0.5, 1.5] - 1.0 é normal
  intonation: number;    // Entonação [0.5, 1.5] - 1.0 é normal
}

interface PresetCreate {
  name: string;
  language: string;
  gender: string;
  rate: number;          // Validação: [0.5, 1.5]
  pitch: number;         // Validação: [0.5, 1.5]
  intonation: number;    // Validação: [0.5, 1.5]
}
```

**Validações:**
- `rate`, `pitch`, `intonation` devem estar no intervalo **[0.5, 1.5]**
- `name` deve ter pelo menos 1 caractere
- `language` deve ser código válido (ex: "pt-BR", "en-US")
- `gender` deve ser "male", "female" ou "neutral"

**Endpoints:**
- `GET /me/presets` - Lista presets do usuário
- `POST /me/presets` - Criar preset
- `DELETE /me/presets/{preset_id}` - Deletar preset

---

### MessagePack (Pacotes de Mensagens)

```typescript
interface MessagePackMessage {
  messageName: string;   // ID único dentro do pack
  presetId: string;      // Referência ao preset
  messageText: string;   // Texto a ser sintetizado
}

interface MessagePack {
  packId: string;                     // UUID gerado pelo backend
  userId: string;                     // Dono do pack
  name: string;                       // Nome do pack (ex: "Anúncios da Manhã")
  messages: MessagePackMessage[];     // Lista de mensagens
  createdAt: string;                  // ISO 8601
  updatedAt: string;                  // ISO 8601
}

interface MessagePackCreate {
  name: string;
  messages: MessagePackMessage[];
}

interface MessagePackUpdate {
  name?: string;                      // Opcional: atualizar nome
  messages?: MessagePackMessage[];    // Opcional: substituir todas as mensagens
}
```

**Validações:**
- `messageName` deve ser único dentro do pack
- `presetId` deve existir e pertencer ao usuário
- `messages` não pode ser vazio ao criar

**Endpoints:**
- `GET /me/message-packs` - Lista packs do usuário
- `GET /me/message-packs/{pack_id}` - Detalhes de um pack
- `POST /me/message-packs` - Criar pack
- `PUT /me/message-packs/{pack_id}` - Atualizar pack
- `DELETE /me/message-packs/{pack_id}` - Deletar pack
- `DELETE /me/message-packs/{pack_id}/messages/{message_name}` - Deletar mensagem específica

---

### VoiceSelection (Seleção de Vozes do Usuário)

```typescript
interface VoiceSelection {
  language: string;      // ex: "pt-BR"
  gender: string;        // "male", "female", "neutral"
  voiceId: string;       // Referência ao Voice.voiceId
}

interface UserVoiceSelectionsResponse {
  userId: string;
  tenantId: string;
  selections: VoiceSelection[];
}

interface UserVoiceSelectionsUpsertRequest {
  selections: VoiceSelection[];
}
```

**Validações:**
- `voiceId` deve existir no catálogo de vozes
- Cada combinação `(language, gender)` pode ter apenas 1 seleção

**Endpoints:**
- `GET /me/voice-selections` - Lista seleções do usuário
- `PUT /me/voice-selections` - Atualiza todas as seleções de uma vez

---

### TenantDefaultVoice (Defaults do Tenant)

```typescript
interface TenantDefaultVoice {
  language: string;
  gender: string;
  voiceId: string;
}

interface TenantDefaultsResponse {
  tenantId: string;
  defaults: TenantDefaultVoice[];
}

interface TenantDefaultsUpsertRequest {
  tenantId?: string;                    // Opcional: se omitido, usa tenant do token
  defaults: TenantDefaultVoice[];
}
```

**Endpoints:**
- `GET /tenant/voice-defaults` - Lista defaults do tenant atual
- `PUT /admin/tenant/voice-defaults` - Admin: atualizar defaults

---

### Synthesize (Síntese de Áudio)

```typescript
interface SynthesizeRequest {
  text: string;                         // Texto a sintetizar
  
  // Modo 1: Usar preset existente
  presetId?: string;
  
  // Modo 2: Parâmetros diretos (se presetId não fornecido)
  language?: string;
  gender?: string;
  rate?: number;                        // [0.5, 1.5]
  pitch?: number;                       // [0.5, 1.5]
  intonation?: number;                  // [0.5, 1.5]
}

interface SynthesizeResponse {
  url: string;                          // URL assinada (S3) do arquivo de áudio
  cached: boolean;                      // true se áudio já existia no cache
}
```

**Fluxo de Síntese:**

1. **Frontend envia requisição** com texto + preset ou parâmetros diretos
2. **Backend calcula cache key:** `{userId}/{sha256(text + settings)}.mp3`
3. **Backend verifica S3:** Se áudio existe, retorna URL (cached=true)
4. **Backend sintetiza:** Se não existe, chama provider (Polly), salva no S3, retorna URL (cached=false)
5. **Frontend recebe URL assinada** válida por tempo limitado (ex: 1 hora)

**Validações:**
- `text` deve ter pelo menos 1 caractere
- Se `presetId` fornecido: preset deve existir e pertencer ao usuário
- Se parâmetros diretos: todos obrigatórios e dentro dos limites

**Limitações Atuais:**
- ✅ Provider **Polly** implementado
- ❌ Outros providers (ElevenLabs, Google, etc.) resultam em erro

**Endpoint:**
- `POST /me/synthesize` - Sintetizar áudio

---

## 🛣️ Endpoints da API

### 1. Health Check

#### `GET /health`

**Autenticação:** Pública (sem token)

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200` - API funcionando

---

### 2. User Context

#### `GET /me`

**Autenticação:** Usuário autenticado

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "userId": "abc123...",
  "tenantId": "tenant-456",
  "isAdmin": false,
  "groups": ["users"]
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado
- `403` - Token inválido

---

### 3. Voices (Catálogo)

#### `GET /voices`

**Autenticação:** Usuário autenticado

**Query Parameters:**
- `language` (opcional): Filtrar por idioma (ex: `pt-BR`)
- `gender` (opcional): Filtrar por gênero (`male`, `female`, `neutral`)

**Response:**
```json
{
  "items": [
    {
      "voiceId": "voice-001",
      "provider": "polly",
      "voiceKey": "Joanna",
      "language": "en-US",
      "gender": "female",
      "qualities": ["neural", "conversational"],
      "displayName": "Joanna - American English Neural",
      "enabled": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Notas:**
- Retorna apenas vozes com `enabled=true`

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado

---

#### `GET /voices/{voice_id}`

**Autenticação:** Usuário autenticado

**Path Parameters:**
- `voice_id`: UUID da voz

**Response:**
```json
{
  "voiceId": "voice-001",
  "provider": "polly",
  "voiceKey": "Joanna",
  "language": "en-US",
  "gender": "female",
  "qualities": ["neural"],
  "displayName": "Joanna",
  "enabled": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado
- `404` - Voz não encontrada

---

### 4. Voices Admin

#### `GET /admin/voices`

**Autenticação:** Admin

**Query Parameters:**
- `language` (opcional): Filtrar por idioma
- `gender` (opcional): Filtrar por gênero

**Response:**
```json
{
  "items": [
    {
      "voiceId": "voice-001",
      "provider": "polly",
      "voiceKey": "Joanna",
      "language": "en-US",
      "gender": "female",
      "qualities": ["neural"],
      "displayName": "Joanna",
      "enabled": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    },
    {
      "voiceId": "voice-002",
      "provider": "elevenlabs",
      "voiceKey": "adam",
      "language": "en-US",
      "gender": "male",
      "qualities": ["premium"],
      "displayName": "Adam - Premium",
      "enabled": false,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Notas:**
- Inclui vozes com `enabled=false`

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado
- `403` - Não é admin

---

#### `POST /admin/voices`

**Autenticação:** Admin

**Request Body:**
```json
{
  "provider": "polly",
  "voiceKey": "Joanna",
  "language": "en-US",
  "gender": "female",
  "qualities": ["neural", "conversational"],
  "displayName": "Joanna - American English Neural",
  "enabled": true
}
```

**Response:**
```json
{
  "voiceId": "voice-001",
  "provider": "polly",
  "voiceKey": "Joanna",
  "language": "en-US",
  "gender": "female",
  "qualities": ["neural", "conversational"],
  "displayName": "Joanna - American English Neural",
  "enabled": true,
  "createdAt": "2026-04-01T10:00:00Z",
  "updatedAt": "2026-04-01T10:00:00Z"
}
```

**Status Codes:**
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Não é admin
- `409` - Voz já existe (mesma combinação provider + voiceKey)

---

#### `PUT /admin/voices/{voice_id}`

**Autenticação:** Admin

**Path Parameters:**
- `voice_id`: UUID da voz

**Request Body:**
```json
{
  "displayName": "Joanna - Updated Name",
  "enabled": false
}
```

**Response:**
```json
{
  "voiceId": "voice-001",
  "provider": "polly",
  "voiceKey": "Joanna",
  "language": "en-US",
  "gender": "female",
  "qualities": ["neural"],
  "displayName": "Joanna - Updated Name",
  "enabled": false,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-04-01T10:30:00Z"
}
```

**Status Codes:**
- `200` - Atualizado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Não é admin
- `404` - Voz não encontrada

---

#### `DELETE /admin/voices/{voice_id}`

**Autenticação:** Admin

**Path Parameters:**
- `voice_id`: UUID da voz

**Response:**
```json
{
  "deleted": true
}
```

**Notas:**
- Deve verificar se a voz está sendo usada em voice selections ou tenant defaults
- Se estiver, pode retornar erro ou remover as referências

**Status Codes:**
- `200` - Deletado com sucesso
- `401` - Não autenticado
- `403` - Não é admin
- `404` - Voz não encontrada
- `409` - Voz em uso (se implementar validação)

---

### 5. Tenant Voice Defaults

#### `GET /tenant/voice-defaults`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "tenantId": "tenant-456",
  "defaults": [
    {
      "language": "pt-BR",
      "gender": "female",
      "voiceId": "voice-001"
    },
    {
      "language": "pt-BR",
      "gender": "male",
      "voiceId": "voice-002"
    },
    {
      "language": "en-US",
      "gender": "female",
      "voiceId": "voice-003"
    }
  ]
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado

---

#### `PUT /admin/tenant/voice-defaults`

**Autenticação:** Admin

**Request Body:**
```json
{
  "tenantId": "tenant-456",
  "defaults": [
    {
      "language": "pt-BR",
      "gender": "female",
      "voiceId": "voice-001"
    },
    {
      "language": "pt-BR",
      "gender": "male",
      "voiceId": "voice-002"
    }
  ]
}
```

**Notas:**
- `tenantId` é opcional. Se omitido, usa o tenant do token do admin
- Valida se cada `voiceId` existe no catálogo
- Substitui completamente os defaults anteriores (não é merge)

**Response:**
```json
{
  "tenantId": "tenant-456",
  "defaults": [
    {
      "language": "pt-BR",
      "gender": "female",
      "voiceId": "voice-001"
    },
    {
      "language": "pt-BR",
      "gender": "male",
      "voiceId": "voice-002"
    }
  ]
}
```

**Status Codes:**
- `200` - Atualizado com sucesso
- `400` - Dados inválidos (voiceId não existe, etc.)
- `401` - Não autenticado
- `403` - Não é admin

---

### 6. User Voice Selections

#### `GET /me/voice-selections`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "userId": "user-123",
  "tenantId": "tenant-456",
  "selections": [
    {
      "language": "pt-BR",
      "gender": "female",
      "voiceId": "voice-001"
    },
    {
      "language": "en-US",
      "gender": "male",
      "voiceId": "voice-003"
    }
  ]
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado

---

#### `PUT /me/voice-selections`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "selections": [
    {
      "language": "pt-BR",
      "gender": "female",
      "voiceId": "voice-001"
    },
    {
      "language": "pt-BR",
      "gender": "male",
      "voiceId": "voice-002"
    },
    {
      "language": "en-US",
      "gender": "female",
      "voiceId": "voice-003"
    }
  ]
}
```

**Notas:**
- Substitui completamente as seleções anteriores
- Valida se cada `voiceId` existe no catálogo
- Cada combinação `(language, gender)` pode aparecer apenas 1 vez

**Response:**
```json
{
  "userId": "user-123",
  "tenantId": "tenant-456",
  "selections": [
    {
      "language": "pt-BR",
      "gender": "female",
      "voiceId": "voice-001"
    },
    {
      "language": "pt-BR",
      "gender": "male",
      "voiceId": "voice-002"
    },
    {
      "language": "en-US",
      "gender": "female",
      "voiceId": "voice-003"
    }
  ]
}
```

**Status Codes:**
- `200` - Atualizado com sucesso
- `400` - Dados inválidos (voiceId não existe, duplicatas, etc.)
- `401` - Não autenticado

---

### 7. Presets

#### `GET /me/presets`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "items": [
    {
      "presetId": "preset-001",
      "userId": "user-123",
      "name": "Voz Formal",
      "language": "pt-BR",
      "gender": "female",
      "rate": 1.0,
      "pitch": 1.0,
      "intonation": 1.2
    },
    {
      "presetId": "preset-002",
      "userId": "user-123",
      "name": "Anúncio Rápido",
      "language": "en-US",
      "gender": "male",
      "rate": 1.3,
      "pitch": 1.1,
      "intonation": 0.9
    }
  ]
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado

---

#### `POST /me/presets`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "name": "Voz Formal",
  "language": "pt-BR",
  "gender": "female",
  "rate": 1.0,
  "pitch": 1.0,
  "intonation": 1.2
}
```

**Validações:**
- `rate`, `pitch`, `intonation` devem estar em [0.5, 1.5]
- `name` deve ter pelo menos 1 caractere
- `language` deve ser código válido
- `gender` deve ser "male", "female" ou "neutral"

**Response:**
```json
{
  "presetId": "preset-003",
  "userId": "user-123",
  "name": "Voz Formal",
  "language": "pt-BR",
  "gender": "female",
  "rate": 1.0,
  "pitch": 1.0,
  "intonation": 1.2
}
```

**Status Codes:**
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado

---

#### `DELETE /me/presets/{preset_id}`

**Autenticação:** Usuário autenticado

**Path Parameters:**
- `preset_id`: UUID do preset

**Response:**
```json
{
  "deleted": true
}
```

**Notas:**
- Deve verificar se o preset pertence ao usuário
- Pode verificar se está sendo usado em message packs e retornar erro ou orphanar

**Status Codes:**
- `200` - Deletado com sucesso
- `401` - Não autenticado
- `403` - Preset não pertence ao usuário
- `404` - Preset não encontrado
- `409` - Preset em uso (se implementar validação)

---

### 8. Synthesize

#### `POST /me/synthesize`

**Autenticação:** Usuário autenticado

**Request Body (Modo 1: Usando Preset):**
```json
{
  "text": "Olá, bem-vindo ao EchoLab!",
  "presetId": "preset-001"
}
```

**Request Body (Modo 2: Parâmetros Diretos):**
```json
{
  "text": "Olá, bem-vindo ao EchoLab!",
  "language": "pt-BR",
  "gender": "female",
  "rate": 1.0,
  "pitch": 1.0,
  "intonation": 1.2
}
```

**Validações:**
- `text` obrigatório, mínimo 1 caractere
- Se `presetId`: preset deve existir e pertencer ao usuário
- Se parâmetros diretos: todos obrigatórios e dentro dos limites

**Response:**
```json
{
  "url": "https://echolab-audio-bucket.s3.amazonaws.com/user-123/abc123def456.mp3?X-Amz-...",
  "cached": false
}
```

**Notas:**
- `url` é uma URL assinada do S3 (tempo de expiração configurável, ex: 1h)
- `cached=true` se áudio já existia no S3
- `cached=false` se áudio foi sintetizado agora
- Cache key: `{userId}/{sha256(text + language + gender + rate + pitch + intonation)}.mp3`

**Limitações:**
- Atualmente apenas provider **Polly** funciona
- Vozes de outros providers (ElevenLabs, Google) resultam em erro

**Status Codes:**
- `200` - Sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `404` - Preset não encontrado
- `500` - Erro ao sintetizar (problema com Polly, S3, etc.)

---

### 9. Message Packs

#### `GET /me/message-packs`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "items": [
    {
      "packId": "pack-001",
      "userId": "user-123",
      "name": "Anúncios da Manhã",
      "messages": [
        {
          "messageName": "bom_dia",
          "presetId": "preset-001",
          "messageText": "Bom dia a todos!"
        },
        {
          "messageName": "reuniao",
          "presetId": "preset-002",
          "messageText": "Reunião às 10h na sala principal."
        }
      ],
      "createdAt": "2026-04-01T08:00:00Z",
      "updatedAt": "2026-04-01T09:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado

---

#### `GET /me/message-packs/{pack_id}`

**Autenticação:** Usuário autenticado

**Path Parameters:**
- `pack_id`: UUID do pack

**Response:**
```json
{
  "packId": "pack-001",
  "userId": "user-123",
  "name": "Anúncios da Manhã",
  "messages": [
    {
      "messageName": "bom_dia",
      "presetId": "preset-001",
      "messageText": "Bom dia a todos!"
    }
  ],
  "createdAt": "2026-04-01T08:00:00Z",
  "updatedAt": "2026-04-01T09:00:00Z"
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autenticado
- `403` - Pack não pertence ao usuário
- `404` - Pack não encontrado

---

#### `POST /me/message-packs`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "name": "Anúncios da Manhã",
  "messages": [
    {
      "messageName": "bom_dia",
      "presetId": "preset-001",
      "messageText": "Bom dia a todos!"
    },
    {
      "messageName": "reuniao",
      "presetId": "preset-002",
      "messageText": "Reunião às 10h."
    }
  ]
}
```

**Validações:**
- `name` obrigatório
- `messages` não pode ser vazio
- `messageName` deve ser único dentro do pack
- `presetId` deve existir e pertencer ao usuário

**Response:**
```json
{
  "packId": "pack-002",
  "userId": "user-123",
  "name": "Anúncios da Manhã",
  "messages": [
    {
      "messageName": "bom_dia",
      "presetId": "preset-001",
      "messageText": "Bom dia a todos!"
    },
    {
      "messageName": "reuniao",
      "presetId": "preset-002",
      "messageText": "Reunião às 10h."
    }
  ],
  "createdAt": "2026-04-01T10:00:00Z",
  "updatedAt": "2026-04-01T10:00:00Z"
}
```

**Status Codes:**
- `201` - Criado com sucesso
- `400` - Dados inválidos (messageName duplicado, preset não existe, etc.)
- `401` - Não autenticado

---

#### `PUT /me/message-packs/{pack_id}`

**Autenticação:** Usuário autenticado

**Path Parameters:**
- `pack_id`: UUID do pack

**Request Body:**
```json
{
  "name": "Anúncios Atualizados",
  "messages": [
    {
      "messageName": "bom_dia",
      "presetId": "preset-001",
      "messageText": "Bom dia a todos! Texto atualizado."
    },
    {
      "messageName": "nova_mensagem",
      "presetId": "preset-003",
      "messageText": "Nova mensagem adicionada."
    }
  ]
}
```

**Notas:**
- `name` e `messages` são opcionais (atualiza apenas o que for enviado)
- Se `messages` for enviado, substitui completamente a lista anterior
- Validações iguais ao `POST`

**Response:**
```json
{
  "packId": "pack-001",
  "userId": "user-123",
  "name": "Anúncios Atualizados",
  "messages": [
    {
      "messageName": "bom_dia",
      "presetId": "preset-001",
      "messageText": "Bom dia a todos! Texto atualizado."
    },
    {
      "messageName": "nova_mensagem",
      "presetId": "preset-003",
      "messageText": "Nova mensagem adicionada."
    }
  ],
  "createdAt": "2026-04-01T08:00:00Z",
  "updatedAt": "2026-04-01T11:00:00Z"
}
```

**Status Codes:**
- `200` - Atualizado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Pack não pertence ao usuário
- `404` - Pack não encontrado

---

#### `DELETE /me/message-packs/{pack_id}`

**Autenticação:** Usuário autenticado

**Path Parameters:**
- `pack_id`: UUID do pack

**Response:**
```json
{
  "deleted": true
}
```

**Status Codes:**
- `200` - Deletado com sucesso
- `401` - Não autenticado
- `403` - Pack não pertence ao usuário
- `404` - Pack não encontrado

---

#### `DELETE /me/message-packs/{pack_id}/messages/{message_name}`

**Autenticação:** Usuário autenticado

**Path Parameters:**
- `pack_id`: UUID do pack
- `message_name`: Nome da mensagem (ex: "bom_dia")

**Response:**
```json
{
  "packId": "pack-001",
  "userId": "user-123",
  "name": "Anúncios da Manhã",
  "messages": [
    {
      "messageName": "reuniao",
      "presetId": "preset-002",
      "messageText": "Reunião às 10h."
    }
  ],
  "createdAt": "2026-04-01T08:00:00Z",
  "updatedAt": "2026-04-01T12:00:00Z"
}
```

**Notas:**
- Retorna o pack atualizado (sem a mensagem deletada)
- Se a mensagem não existir, retorna 404

**Status Codes:**
- `200` - Deletado com sucesso
- `401` - Não autenticado
- `403` - Pack não pertence ao usuário
- `404` - Pack ou mensagem não encontrada

---

## ⚠️ Tratamento de Erros

### Formato de Erro Padrão

```json
{
  "detail": "Mensagem de erro amigável",
  "status": 400,
  "type": "validation_error"
}
```

### Códigos HTTP

| Código | Significado | Quando Usar |
|--------|-------------|-------------|
| `200` | OK | Sucesso em GET, PUT, DELETE |
| `201` | Created | Sucesso em POST (criação) |
| `400` | Bad Request | Dados inválidos, validação falhou |
| `401` | Unauthorized | Token ausente ou inválido |
| `403` | Forbidden | Usuário não tem permissão (não é admin, não é dono do recurso) |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Conflito (ex: voz duplicada, messageName duplicado) |
| `422` | Unprocessable Entity | Erro de validação de schema (Pydantic) |
| `500` | Internal Server Error | Erro no servidor (Polly, S3, etc.) |

### Exemplos de Erros

**Validação (400):**
```json
{
  "detail": "rate must be between 0.5 and 1.5",
  "status": 400,
  "type": "validation_error"
}
```

**Não Autenticado (401):**
```json
{
  "detail": "Missing or invalid authentication token",
  "status": 401,
  "type": "authentication_error"
}
```

**Forbidden (403):**
```json
{
  "detail": "Admin access required",
  "status": 403,
  "type": "authorization_error"
}
```

**Not Found (404):**
```json
{
  "detail": "Preset not found",
  "status": 404,
  "type": "not_found"
}
```

**Conflito (409):**
```json
{
  "detail": "Message name 'bom_dia' already exists in this pack",
  "status": 409,
  "type": "conflict"
}
```

---

## 🔧 Cliente API Frontend

### Implementação (`/src/lib/api-client.ts`)

```typescript
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../imports/amplify_outputs.json';

const getBaseUrl = (): string => {
  const endpoint = outputs?.custom?.API?.echolabHttpApi?.endpoint;
  if (endpoint) return endpoint;
  
  const envUrl = import.meta.env.VITE_ECHOLAB_API_URL;
  if (envUrl) return envUrl;
  
  throw new Error('EchoLab API endpoint not configured');
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      throw new ApiError(response.status, errorMessage, errorData);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, errorMessage);
    }
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

export const apiClient = {
  async get<T>(path: string, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers,
    });
    
    return handleResponse<T>(response);
  },
  
  async post<T>(path: string, data?: any, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return handleResponse<T>(response);
  },
  
  async put<T>(path: string, data: any, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    return handleResponse<T>(response);
  },
  
  async delete<T>(path: string, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers,
    });
    
    return handleResponse<T>(response);
  },
};
```

### Uso no Componente

```typescript
import { apiClient } from '../lib/api-client';
import { Preset, PresetCreate } from '../lib/types';

// GET
const response = await apiClient.get<{ items: Preset[] }>('/me/presets');
const presets = response.items;

// POST
const newPreset: PresetCreate = {
  name: 'Minha Voz',
  language: 'pt-BR',
  gender: 'female',
  rate: 1.0,
  pitch: 1.0,
  intonation: 1.2,
};
const created = await apiClient.post<Preset>('/me/presets', newPreset);

// PUT
await apiClient.put('/me/voice-selections', {
  selections: [{ language: 'pt-BR', gender: 'female', voiceId: 'voice-001' }]
});

// DELETE
await apiClient.delete(`/me/presets/${presetId}`);

// Tratamento de erro
try {
  await apiClient.post('/me/presets', invalidData);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Status: ${error.status}, Message: ${error.message}`);
    toast.error(error.message);
  }
}
```

---

## 📊 Queries React Query

### Implementação (`/src/hooks/queries.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { Preset, Voice, MessagePack, VoiceSelection } from '../lib/types';

export function usePresets() {
  return useQuery({
    queryKey: ['presets'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Preset[] }>('/me/presets');
      return response.items || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Voice[] }>('/voices');
      return response.items || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (catálogo muda raramente)
  });
}

export function useMessagePacks() {
  return useQuery({
    queryKey: ['messagePacks'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: MessagePack[] }>('/me/message-packs');
      return response.items || [];
    },
  });
}

export function useUserVoiceSelections() {
  return useQuery({
    queryKey: ['userVoiceSelections'],
    queryFn: async () => {
      const response = await apiClient.get<{ 
        userId: string; 
        tenantId: string; 
        selections: VoiceSelection[] 
      }>('/me/voice-selections');
      return response.selections || [];
    },
  });
}
```

### Uso nos Componentes

```typescript
import { usePresets, useVoices, useMessagePacks, useUserVoiceSelections } from '../../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  
  // Queries
  const { data: presets = [], isLoading, error } = usePresets();
  const { data: voices = [] } = useVoices();
  const { data: messagePacks = [] } = useMessagePacks();
  const { data: selectedVoices = [] } = useUserVoiceSelections();
  
  // Mutation com invalidação
  async function handleCreatePreset(data: PresetCreate) {
    await apiClient.post('/me/presets', data);
    queryClient.invalidateQueries({ queryKey: ['presets'] });
    toast.success('Preset created!');
  }
  
  // Mutation com atualização otimista
  async function handleUpdateVoiceSelection(newSelections: VoiceSelection[]) {
    // Salva estado anterior
    const previous = selectedVoices;
    
    // Atualiza otimisticamente
    queryClient.setQueryData(['userVoiceSelections'], newSelections);
    
    try {
      // Envia para API
      await apiClient.put('/me/voice-selections', { selections: newSelections });
      
      // Invalida para refetch em background
      queryClient.invalidateQueries({ queryKey: ['userVoiceSelections'] });
    } catch (error) {
      // Reverte em caso de erro
      queryClient.setQueryData(['userVoiceSelections'], previous);
      toast.error('Failed to update');
    }
  }
  
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {presets.map(preset => (
        <div key={preset.presetId}>{preset.name}</div>
      ))}
    </div>
  );
}
```

---

## 🚧 Endpoints Mockados (Pendentes de Implementação)

As seguintes funcionalidades estão **mockadas no frontend** e precisam de implementação no backend:

### 1. Live Announcements (Anúncios ao Vivo)

**Arquivo:** `/src/app/pages/LiveAnnouncements.tsx`

#### Endpoints Necessários:

##### `POST /announcements/send`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "type": "text" | "message-pack",
  "content": {
    "text"?: "Texto do anúncio",
    "presetId"?: "preset-001",
    "messagePackId"?: "pack-001"
  },
  "delivery": {
    "method": "callback" | "recipients",
    "callbackUrl"?: "https://api.example.com/callback",
    "recipients"?: ["device-001", "device-002"],
    "sendToAll"?: boolean
  }
}
```

**Response:**
```json
{
  "announcementId": "announcement-001",
  "status": "sent" | "delivered" | "failed",
  "sentAt": "2026-04-01T10:00:00Z",
  "recipients": ["device-001", "device-002"]
}
```

---

##### `GET /announcements/recipients`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "items": [
    {
      "id": "device-001",
      "name": "Reception Display",
      "deviceId": "dev-001",
      "isOnline": true,
      "lastSeen": "2026-04-01T09:55:00Z"
    }
  ]
}
```

---

##### `GET /announcements/history`

**Autenticação:** Usuário autenticado

**Query Parameters:**
- `limit` (opcional): Número de registros (padrão: 50)
- `offset` (opcional): Paginação

**Response:**
```json
{
  "items": [
    {
      "id": "announcement-001",
      "type": "text",
      "content": "Emergency announcement test",
      "deliveryMethod": "recipients",
      "recipients": ["Reception Display", "Main Hall Speaker"],
      "timestamp": "2026-04-01T10:30:00Z",
      "status": "delivered"
    }
  ],
  "total": 100
}
```

---

### 2. Scheduling (Agendamento de Anúncios)

**Arquivo:** `/src/app/pages/Scheduling.tsx`

#### Endpoints Necessários:

##### `GET /schedules`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "items": [
    {
      "id": "schedule-001",
      "name": "Morning Promotion",
      "startDate": "2026-04-01",
      "startTime": "08:00",
      "endDate": "2026-12-31",
      "endTime": "18:00",
      "timezone": "America/New_York",
      "callbackUrl": "https://api.example.com/callback",
      "playbackSchedule": {
        "type": "specific-times",
        "times": ["08:00", "12:00", "17:00"]
      },
      "daysSelection": {
        "type": "week",
        "weekDays": [1, 2, 3, 4, 5]
      },
      "playbackAreas": ["Area A", "Area B"],
      "messagePacks": ["pack-001"],
      "canBeInterrupted": false,
      "priority": 5,
      "status": "active"
    }
  ]
}
```

---

##### `POST /schedules`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "name": "Morning Promotion",
  "startDate": "2026-04-01",
  "startTime": "08:00",
  "endDate": "2026-12-31",
  "endTime": "18:00",
  "timezone": "America/New_York",
  "callbackUrl": "https://api.example.com/callback",
  "playbackSchedule": {
    "type": "specific-times",
    "times": ["08:00", "12:00", "17:00"]
  },
  "daysSelection": {
    "type": "week",
    "weekDays": [1, 2, 3, 4, 5]
  },
  "playbackAreas": ["Area A", "Area B"],
  "messagePacks": ["pack-001"],
  "canBeInterrupted": false,
  "priority": 5
}
```

**Response:**
```json
{
  "id": "schedule-002",
  "name": "Morning Promotion",
  "status": "scheduled",
  "createdAt": "2026-04-01T10:00:00Z"
}
```

---

##### `PUT /schedules/{schedule_id}`

**Autenticação:** Usuário autenticado

**Request Body:** Mesmo formato do POST

**Response:** Schedule atualizado

---

##### `DELETE /schedules/{schedule_id}`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "deleted": true
}
```

---

##### `POST /schedules/{schedule_id}/toggle`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "status": "active" | "paused"
}
```

**Response:** Schedule atualizado

---

### 3. Receiver (Dispositivos Receptores)

**Arquivo:** `/src/app/pages/Receiver.tsx`

#### Endpoints Necessários:

##### `GET /devices`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "items": [
    {
      "id": "device-001",
      "name": "Reception Display",
      "deviceId": "dev-001",
      "userId": "user-123",
      "physicalDeviceId": "device_1648569600_abc123",
      "registeredAt": "2026-03-28T10:00:00Z",
      "lastSeen": "2026-04-01T09:55:00Z"
    }
  ]
}
```

---

##### `POST /devices/register`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "name": "Reception Display",
  "physicalDeviceId": "device_1648569600_abc123"
}
```

**Notas:**
- `physicalDeviceId` é gerado no frontend via `localStorage` para identificar o navegador/dispositivo físico
- Cada `physicalDeviceId` pode ter apenas 1 dispositivo registrado

**Response:**
```json
{
  "id": "device-002",
  "name": "Reception Display",
  "deviceId": "dev-002",
  "userId": "user-123",
  "physicalDeviceId": "device_1648569600_abc123",
  "registeredAt": "2026-04-01T10:00:00Z",
  "websocketUrl": "wss://echolab-ws.example.com/connect?token=<JWT>",
  "apiKey": "device-api-key-abc123"
}
```

---

##### `PUT /devices/{device_id}`

**Autenticação:** Usuário autenticado

**Request Body:**
```json
{
  "name": "New Device Name"
}
```

**Response:** Device atualizado

---

##### `DELETE /devices/{device_id}`

**Autenticação:** Usuário autenticado

**Response:**
```json
{
  "deleted": true
}
```

---

##### WebSocket: `/ws/devices/{device_id}`

**Autenticação:** Query param `?token=<JWT>` ou header `Authorization`

**Protocolo:**

**Client → Server (Heartbeat):**
```json
{
  "type": "heartbeat",
  "timestamp": "2026-04-01T10:00:00Z"
}
```

**Server → Client (Audio Announcement):**
```json
{
  "type": "audio_announcement",
  "announcementId": "announcement-001",
  "audioUrl": "https://s3.amazonaws.com/echolab-audio/abc123.mp3",
  "metadata": {
    "name": "Emergency Alert",
    "priority": 5,
    "canBeInterrupted": false
  }
}
```

**Client → Server (Status Update):**
```json
{
  "type": "status",
  "announcementId": "announcement-001",
  "status": "playing" | "completed" | "failed",
  "timestamp": "2026-04-01T10:01:00Z"
}
```

---

## 📝 Resumo de Implementação

### ✅ Implementado (Backend Funcionando)

1. ✅ **Health Check** - `GET /health`
2. ✅ **User Context** - `GET /me`
3. ✅ **Voices** - Catálogo completo (GET, GET by ID)
4. ✅ **Admin Voices** - CRUD completo (GET, POST, PUT, DELETE)
5. ✅ **Tenant Defaults** - GET e PUT
6. ✅ **User Voice Selections** - GET e PUT
7. ✅ **Presets** - GET, POST, DELETE
8. ✅ **Synthesize** - POST (somente Polly)
9. ✅ **Message Packs** - CRUD completo (GET, GET by ID, POST, PUT, DELETE, DELETE message)

### 🚧 Mockado (Precisa Implementar)

1. 🚧 **Live Announcements**
   - `POST /announcements/send`
   - `GET /announcements/recipients`
   - `GET /announcements/history`

2. 🚧 **Scheduling**
   - `GET /schedules`
   - `POST /schedules`
   - `PUT /schedules/{id}`
   - `DELETE /schedules/{id}`
   - `POST /schedules/{id}/toggle`

3. 🚧 **Receiver/Devices**
   - `GET /devices`
   - `POST /devices/register`
   - `PUT /devices/{id}`
   - `DELETE /devices/{id}`
   - WebSocket: `/ws/devices/{id}`

---

## 🎯 Checklist para Implementação Backend

### Autenticação
- [ ] Configurar Cognito authorizer no API Gateway
- [ ] Implementar middleware para extrair JWT e validar
- [ ] Implementar verificação de grupo `admin` para rotas `/admin/*`
- [ ] Implementar extração de `custom:tenantId` com fallback para `"default"`

### Database
- [ ] Definir schema de tabelas (DynamoDB ou RDS)
- [ ] Tabelas: `voices`, `presets`, `message_packs`, `voice_selections`, `tenant_defaults`, `schedules`, `devices`, `announcements_history`
- [ ] Índices: por `userId`, por `tenantId`, por `(language, gender)`

### Storage
- [ ] Configurar S3 bucket para cache de áudios
- [ ] Implementar geração de URLs assinadas (expiration 1h)
- [ ] Implementar lógica de cache key: `{userId}/{sha256(text+settings)}.mp3`

### TTS Providers
- [ ] Implementar abstração de provider (interface/classe base)
- [ ] Implementar Polly provider (já funcionando)
- [ ] Implementar ElevenLabs provider
- [ ] Implementar Google TTS provider

### WebSocket (Devices)
- [ ] Configurar API Gateway WebSocket API
- [ ] Implementar `$connect` route (autenticação)
- [ ] Implementar `$disconnect` route (cleanup)
- [ ] Implementar `$default` route (mensagens)
- [ ] Implementar envio de anúncios via WebSocket
- [ ] Implementar tracking de status (playing, completed, failed)

### Live Announcements
- [ ] Implementar endpoint `POST /announcements/send`
- [ ] Implementar callback HTTP (se delivery method = callback)
- [ ] Implementar envio WebSocket (se delivery method = recipients)
- [ ] Implementar histórico de anúncios
- [ ] Implementar tracking de status de entrega

### Scheduling
- [ ] Implementar CRUD de schedules
- [ ] Implementar scheduler (EventBridge + Lambda ou cron job)
- [ ] Implementar resolução de timezone
- [ ] Implementar lógica de recorrência (dias da semana, dias do mês)
- [ ] Implementar lógica de prioridade e interrupção

### Monitoring & Logs
- [ ] Implementar logging estruturado (CloudWatch Logs)
- [ ] Implementar métricas (CloudWatch Metrics)
- [ ] Implementar alertas (CloudWatch Alarms)
- [ ] Implementar tracing (X-Ray)

---

## 📞 Contato e Suporte

**Desenvolvido por:** EchoLab Team  
**Versão da Documentação:** 1.0  
**Última Atualização:** Abril 2026

---

**Fim da Documentação** 🎉
