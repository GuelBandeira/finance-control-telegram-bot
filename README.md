# Bot de Controle Financeiro - Telegram

Este bot do Telegram integrado com Google Sheets permite controlar suas despesas e visualizar seu orçamento mensal.

## Funcionalidades

### 📊 Comandos Disponíveis

- **`ajuda`** - Mostra menu com todas as opções disponíveis
- **`orçamento`** ou **`visualizar orçamento`** - Mostra o orçamento do mês atual e quanto ainda resta
- **`categorias`** - Lista todas as categorias disponíveis para despesas
- **`gráfico mensal`** ou **`grafico mensal`** - Envia um gráfico de pizza com as despesas do mês atual

### 💰 Adicionar Despesas

Para adicionar uma despesa, use o formato:
```
Data - Descrição - Valor - Categoria
```

**Exemplos:**
- `15/12/2024 - Almoço - 25.50 - Comida`
- `Supermercado - 150.00 - Comida` (usa data atual automaticamente)

### 📈 Gráfico Mensal

A nova funcionalidade de gráfico mensal:
- Cria um gráfico de pizza 3D usando Google Charts API
- Mostra as despesas agrupadas por categoria
- Inclui valores totais e legendas
- Envia a imagem diretamente no Telegram
- Filtra automaticamente apenas as despesas do mês atual

## Configuração

1. **Token do Bot**: Configure seu token do Telegram em `var token`
2. **ID da Planilha**: Configure o ID da sua planilha do Google Sheets em `var id_planilha`
3. **Webhook**: Configure o link do webhook em `var link_planilha`

## Estrutura da Planilha

### Aba "Despesas"
- Coluna A: Data/Hora do registro
- Coluna B: Data da compra
- Coluna C: Descrição
- Coluna D: Valor
- Coluna E: Categoria

### Aba "Resumo mensal"
- Coluna N: Orçamento mensal
- Coluna O: Orçamento restante

## Como Usar

1. Envie `/start` ou `ajuda` para ver o menu
2. Use os botões inline para navegar pelas opções
3. Para adicionar despesas, digite no formato especificado
4. Para ver o gráfico, clique em "Gráfico Mensal" ou digite `gráfico mensal`

## Tecnologias

- Google Apps Script
- Google Sheets API
- Telegram Bot API
- Google Charts API

## Suporte

Para dúvidas ou problemas, verifique:
- Se o bot está ativo no Telegram
- Se as permissões da planilha estão corretas
- Se o webhook está configurado corretamente