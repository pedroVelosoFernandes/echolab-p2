# EchoLab — Lambda Console Route Tests (HTTP API v2)

Este arquivo tem eventos prontos (JSON) para colar no **AWS Lambda Console → Test** e executar o handler `index.handler` (Mangum/FastAPI) simulando chamadas do **API Gateway HTTP API (payload format 2.0)**.

> Importante
> - No Console da Lambda, você **não passa pelo JWT Authorizer** do API Gateway. Para rotas autenticadas, você precisa **simular o authorizer** preenchendo `requestContext.authorizer.jwt.claims`.
> - Esses testes vão chamar seu FastAPI de verdade. Rotas de criação/edição vão **gravar no DynamoDB** do ambiente.

---

## Claims (usuário normal vs admin)

### Claims de usuário normal
Use este bloco em `requestContext.authorizer.jwt.claims`:

```json
{
  "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613",
  "username": "pedrohenrique.veloso.fernandes@gmail.com",
  "custom:tenantId": "default",
  "cognito:groups": []
}
```

### Claims de admin

```json
{
  "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613",
  "username": "pedrohenrique.veloso.fernandes@gmail.com",
  "custom:tenantId": "default",
  "cognito:groups": ["admin"]
}
```

---

## Template base (HTTP API v2)

Copie este template e só troque `routeKey`, `rawPath`, `rawQueryString`, `requestContext.http.method`, `requestContext.http.path` e `body`.

```json
{
  "version": "2.0",
  "routeKey": "GET /health",
  "rawPath": "/health",
  "rawQueryString": "",
  "headers": {
    "host": "example.execute-api.us-east-1.amazonaws.com",
    "user-agent": "lambda-console-test",
    "accept": "application/json"
  },
  "requestContext": {
    "accountId": "000000000000",
    "apiId": "example",
    "domainName": "example.execute-api.us-east-1.amazonaws.com",
    "domainPrefix": "example",
    "http": {
      "method": "GET",
      "path": "/health",
      "protocol": "HTTP/1.1",
      "sourceIp": "127.0.0.1",
      "userAgent": "lambda-console-test"
    },
    "requestId": "test-request-id",
    "routeKey": "GET /health",
    "stage": "$default",
    "time": "02/Apr/2026:00:00:00 +0000",
    "timeEpoch": 1775088000000
  },
  "body": "",
  "isBase64Encoded": false
}
```

---

## 1) Pública

### GET /health

```json
{
  "version": "2.0",
  "routeKey": "GET /health",
  "rawPath": "/health",
  "rawQueryString": "",
  "headers": {
    "accept": "application/json"
  },
  "requestContext": {
    "http": {
      "method": "GET",
      "path": "/health",
      "protocol": "HTTP/1.1",
      "sourceIp": "127.0.0.1",
      "userAgent": "lambda-console-test"
    },
    "routeKey": "GET /health",
    "stage": "$default",
    "timeEpoch": 1775088000000
  },
  "body": "",
  "isBase64Encoded": false
}
```

---

## 2) Autenticadas (simular JWT claims)

> Para todas abaixo: inclua `requestContext.authorizer.jwt.claims` (usuário normal).

### Ordem recomendada (pra evitar erros por falta de dados)

1. `GET /me`
2. `POST /me/presets` (copie o `presetId` retornado)
3. `GET /me/presets`
4. (Admin) `POST /admin/voices` (copie o `voiceId` retornado)
5. `GET /voices` (agora deve listar vozes)
6. `POST /me/synthesize` (use `presetId` ou os campos diretos)
7. `POST /me/message-packs` (usa `presetId` existente)

Onde você vir `PRESET_ID_HERE`, `PACK_ID_HERE`, `VOICE_ID_HERE`, substitua pelo valor real retornado pelos testes anteriores.

### GET /me

```json
{
  "version": "2.0",
  "routeKey": "GET /me",
  "rawPath": "/me",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/me", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /me",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### GET /me/presets

```json
{
  "version": "2.0",
  "routeKey": "GET /me/presets",
  "rawPath": "/me/presets",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/me/presets", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /me/presets",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### POST /me/presets

```json
{
  "version": "2.0",
  "routeKey": "POST /me/presets",
  "rawPath": "/me/presets",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "POST", "path": "/me/presets", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "POST /me/presets",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "{\"name\":\"Preset 1\",\"language\":\"pt-BR\",\"gender\":\"female\",\"rate\":1.0,\"pitch\":1.0,\"intonation\":1.0}",
  "isBase64Encoded": false
}
```

### DELETE /me/presets/{presetId}
Troque `preset-abc` por um preset existente.

```json
{
  "version": "2.0",
  "routeKey": "DELETE /me/presets/{preset_id}",
  "rawPath": "/me/presets/preset-abc",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "DELETE", "path": "/me/presets/preset-abc", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "DELETE /me/presets/{preset_id}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### GET /me/message-packs

```json
{
  "version": "2.0",
  "routeKey": "GET /me/message-packs",
  "rawPath": "/me/message-packs",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/me/message-packs", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /me/message-packs",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### POST /me/message-packs

> Requer `presetId` válido existente para cada mensagem.

```json
{
  "version": "2.0",
  "routeKey": "POST /me/message-packs",
  "rawPath": "/me/message-packs",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "POST", "path": "/me/message-packs", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "POST /me/message-packs",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "{\"name\":\"Pack 1\",\"messages\":[{\"messageName\":\"hello\",\"presetId\":\"PRESET_ID_HERE\",\"messageText\":\"Olá!\"}]}",
  "isBase64Encoded": false
}
```

### GET /me/message-packs/{packId}

```json
{
  "version": "2.0",
  "routeKey": "GET /me/message-packs/{pack_id}",
  "rawPath": "/me/message-packs/pack-abc",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/me/message-packs/pack-abc", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /me/message-packs/{pack_id}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### PUT /me/message-packs/{packId}

```json
{
  "version": "2.0",
  "routeKey": "PUT /me/message-packs/{pack_id}",
  "rawPath": "/me/message-packs/pack-abc",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "PUT", "path": "/me/message-packs/pack-abc", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "PUT /me/message-packs/{pack_id}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "{\"name\":\"Pack 1 (updated)\",\"messages\":[{\"messageName\":\"hello\",\"presetId\":\"PRESET_ID_HERE\",\"messageText\":\"Olá de novo!\"}]}",
  "isBase64Encoded": false
}
```

### DELETE /me/message-packs/{packId}

```json
{
  "version": "2.0",
  "routeKey": "DELETE /me/message-packs/{pack_id}",
  "rawPath": "/me/message-packs/pack-abc",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "DELETE", "path": "/me/message-packs/pack-abc", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "DELETE /me/message-packs/{pack_id}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### DELETE /me/message-packs/{packId}/messages/{messageName}

```json
{
  "version": "2.0",
  "routeKey": "DELETE /me/message-packs/{pack_id}/messages/{message_name}",
  "rawPath": "/me/message-packs/pack-abc/messages/hello",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "DELETE", "path": "/me/message-packs/pack-abc/messages/hello", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "DELETE /me/message-packs/{pack_id}/messages/{message_name}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### GET /me/voice-selections

```json
{
  "version": "2.0",
  "routeKey": "GET /me/voice-selections",
  "rawPath": "/me/voice-selections",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/me/voice-selections", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /me/voice-selections",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### PUT /me/voice-selections

```json
{
  "version": "2.0",
  "routeKey": "PUT /me/voice-selections",
  "rawPath": "/me/voice-selections",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "PUT", "path": "/me/voice-selections", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "PUT /me/voice-selections",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "{\"selections\":[{\"language\":\"pt-BR\",\"gender\":\"female\",\"voiceId\":\"VOICE_ID_HERE\"}]}",
  "isBase64Encoded": false
}
```

### POST /me/synthesize

```json
{
  "version": "2.0",
  "routeKey": "POST /me/synthesize",
  "rawPath": "/me/synthesize",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "POST", "path": "/me/synthesize", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "POST /me/synthesize",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "{\"text\":\"Olá, mundo!\",\"language\":\"pt-BR\",\"gender\":\"female\",\"rate\":1.0,\"pitch\":1.0,\"intonation\":1.0}",
  "isBase64Encoded": false
}
```

### POST /me/synthesize (comandos especiais + velocidade)

> Valida se `pause[]`, `characters[]`, `numbers[]` e `rate` estão surtindo efeito.

```json
{
  "version": "2.0",
  "routeKey": "POST /me/synthesize",
  "rawPath": "/me/synthesize",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "POST", "path": "/me/synthesize", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "POST /me/synthesize",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "{\"text\":\"Atenção pause[500ms] SENHA: characters[ABC] e o código numbers[123].\",\"language\":\"pt-BR\",\"gender\":\"female\",\"rate\":1.2,\"pitch\":1.0,\"intonation\":1.0}",
  "isBase64Encoded": false
}
```

### GET /voices?language=pt-BR&gender=female

```json
{
  "version": "2.0",
  "routeKey": "GET /voices",
  "rawPath": "/voices",
  "rawQueryString": "language=pt-BR&gender=female",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/voices", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /voices",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### GET /voices/{voiceId}

```json
{
  "version": "2.0",
  "routeKey": "GET /voices/{voice_id}",
  "rawPath": "/voices/VOICE_ID_HERE",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/voices/VOICE_ID_HERE", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /voices/{voice_id}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### GET /tenant/voice-defaults

```json
{
  "version": "2.0",
  "routeKey": "GET /tenant/voice-defaults",
  "rawPath": "/tenant/voice-defaults",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/tenant/voice-defaults", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /tenant/voice-defaults",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": [] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

---

## 3) Admin (simular cognito:groups contendo "admin")

> Para todas abaixo: use claims de admin.

### GET /admin/voices

```json
{
  "version": "2.0",
  "routeKey": "GET /admin/voices",
  "rawPath": "/admin/voices",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "GET", "path": "/admin/voices", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "GET /admin/voices",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": ["admin"] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### POST /admin/voices

```json
{
  "version": "2.0",
  "routeKey": "POST /admin/voices",
  "rawPath": "/admin/voices",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "POST", "path": "/admin/voices", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "POST /admin/voices",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": ["admin"] } } }
  },
  "body": "{\"provider\":\"polly\",\"voiceKey\":\"Camila\",\"language\":\"pt-BR\",\"gender\":\"female\",\"qualities\":[],\"displayName\":\"Camila\",\"enabled\":true}",
  "isBase64Encoded": false
}
```

### PUT /admin/voices/{voiceId}

```json
{
  "version": "2.0",
  "routeKey": "PUT /admin/voices/{voice_id}",
  "rawPath": "/admin/voices/VOICE_ID_HERE",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "PUT", "path": "/admin/voices/VOICE_ID_HERE", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "PUT /admin/voices/{voice_id}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": ["admin"] } } }
  },
  "body": "{\"displayName\":\"Camila (updated)\",\"enabled\":true}",
  "isBase64Encoded": false
}
```

### DELETE /admin/voices/{voiceId}

```json
{
  "version": "2.0",
  "routeKey": "DELETE /admin/voices/{voice_id}",
  "rawPath": "/admin/voices/VOICE_ID_HERE",
  "rawQueryString": "",
  "headers": { "accept": "application/json" },
  "requestContext": {
    "http": { "method": "DELETE", "path": "/admin/voices/VOICE_ID_HERE", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "DELETE /admin/voices/{voice_id}",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": ["admin"] } } }
  },
  "body": "",
  "isBase64Encoded": false
}
```

### PUT /admin/tenant/voice-defaults

```json
{
  "version": "2.0",
  "routeKey": "PUT /admin/tenant/voice-defaults",
  "rawPath": "/admin/tenant/voice-defaults",
  "rawQueryString": "",
  "headers": { "content-type": "application/json", "accept": "application/json" },
  "requestContext": {
    "http": { "method": "PUT", "path": "/admin/tenant/voice-defaults", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "lambda-console-test" },
    "routeKey": "PUT /admin/tenant/voice-defaults",
    "stage": "$default",
    "timeEpoch": 1775088000000,
    "authorizer": { "jwt": { "claims": { "sub": "c45834c8-4011-70bf-ff11-0d02a74d6613", "username": "pedrohenrique.veloso.fernandes@gmail.com", "custom:tenantId": "default", "cognito:groups": ["admin"] } } }
  },
  "body": "{\"tenantId\":\"default\",\"defaults\":[{\"language\":\"pt-BR\",\"gender\":\"female\",\"voiceId\":\"VOICE_ID_HERE\"}]}",
  "isBase64Encoded": false
}
```

---

## Interpretação rápida de falhas

- `401 Unauthorized`: faltou `requestContext.authorizer.jwt.claims` (ou faltou `sub`).
- `403 Admin access required`: claims sem `cognito:groups` contendo `admin`.
- `422 Validation error`: JSON do `body` inválido ou faltando campos do schema.
- `404 ... not found`: você usou um `voice-abc` / `pack-abc` / `preset-abc` que não existe.
- `500`: geralmente erro de infra/env var (tabelas/bucket) ou permissão (Polly/S3) no role da Lambda.
