# API REST - Personal Finance

Esta documentação descreve como usar a API REST do Personal Finance para integrar com sistemas externos.

## 🔑 Autenticação

A API utiliza autenticação via API Key no header `x-api-key`. Cada usuário possui uma API key única que é gerada automaticamente no cadastro.

### Como obter sua API Key

1. Faça login no aplicativo
2. Na página inicial (Home), sua API Key será exibida em destaque
3. Clique no botão de copiar para copiar a chave
4. Use esta chave no header `x-api-key` de suas requisições

## 📡 Endpoints

### POST /api/expenses

Cria uma nova despesa para o usuário autenticado.

#### Headers
```
Content-Type: application/json
x-api-key: sua_api_key_aqui
```

#### Body
```json
{
  "description": "Descrição da despesa (máximo 100 caracteres)",
  "value": 25.50,
  "type": "food"
}
```

#### Tipos de Despesa
- `food` - Alimentação
- `study` - Estudo
- `transport` - Transporte
- `fun` - Diversão
- `other` - Outros

#### Resposta de Sucesso (201)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_mail": "usuario@exemplo.com",
    "description": "Almoço no restaurante",
    "value": 25.50,
    "type": "food",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "user_ip": "api-request"
  }
}
```

#### Resposta de Erro (400)
```json
{
  "success": false,
  "error": "Descrição é obrigatória",
  "status": 400
}
```

#### Resposta de Erro (401)
```json
{
  "success": false,
  "error": "API key inválida ou revogada",
  "status": 401
}
```

#### Resposta de Erro (500)
```json
{
  "success": false,
  "error": "Erro interno do servidor",
  "status": 500
}
```

## 🔧 Exemplos de Uso

### JavaScript/Node.js
```javascript
const createExpense = async (apiKey, expenseData) => {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify(expenseData)
  });
  
  return await response.json();
};

// Exemplo de uso
const expense = await createExpense('sua_api_key_aqui', {
  description: 'Compra no supermercado',
  value: 150.75,
  type: 'food'
});
```

### Python
```python
import requests

def create_expense(api_key, expense_data):
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': api_key
    }
    
    response = requests.post('/api/expenses', 
                           json=expense_data, 
                           headers=headers)
    
    return response.json()

# Exemplo de uso
expense = create_expense('sua_api_key_aqui', {
    'description': 'Compra no supermercado',
    'value': 150.75,
    'type': 'food'
})
```

### cURL
```bash
curl -X POST '/api/expenses' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: sua_api_key_aqui' \
  -d '{
    "description": "Compra no supermercado",
    "value": 150.75,
    "type": "food"
  }'
```

## 🛡️ Segurança

- **API Keys**: Cada usuário possui uma API key única e revogável
- **Validação**: Todos os dados são validados antes de serem salvos
- **Rate Limiting**: Implementado para prevenir abuso
- **HTTPS**: Todas as comunicações devem ser feitas via HTTPS em produção

## 📊 Códigos de Status

| Código | Significado | Descrição |
|--------|-------------|-----------|
| 201 | Created | Despesa criada com sucesso |
| 400 | Bad Request | Dados inválidos ou faltando |
| 401 | Unauthorized | API key inválida ou ausente |
| 500 | Internal Server Error | Erro interno do servidor |

## 🔍 Validações

### Descrição
- **Obrigatória**: Sim
- **Tipo**: String
- **Tamanho**: 1-100 caracteres
- **Exemplo**: "Almoço no restaurante"

### Valor
- **Obrigatório**: Sim
- **Tipo**: Number (decimal)
- **Formato**: Decimal com até 2 casas decimais
- **Mínimo**: 0.01
- **Exemplo**: 25.50

### Tipo
- **Obrigatório**: Sim
- **Tipo**: String
- **Valores aceitos**: food, study, transport, fun, other
- **Exemplo**: "food"

## 🚀 Integração com Webhooks

Em breve, será possível configurar webhooks para receber notificações quando despesas forem criadas, atualizadas ou excluídas.

## 📞 Suporte

Para dúvidas sobre a API:
1. Consulte a documentação do aplicativo
2. Verifique os logs de erro
3. Entre em contato com o suporte técnico

---

**Nota**: Esta API está em constante evolução. Novos endpoints e funcionalidades serão adicionados regularmente.
