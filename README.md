# Bot de Controle Financeiro para Telegram

Este bot permite controlar despesas e receitas através do Telegram, integrando com uma planilha do Google Sheets.

## Funcionalidades

### 📝 Despesas
- **Adicionar despesas** no formato: `Data - Descrição - Valor - Categoria`
- **Exemplos:**
  - `15/12/2024 - Almoço - 25,50 - Comida`
  - `Farmácia - 45,80 - Farmácia` (sem data = hoje)

### 💰 Receitas
- **Adicionar receitas** no formato: `Data - Categoria - Descrição - Valor`
- **Exemplos:**
  - `15/12/2024 - Trabalho - Salário - 3000,00`
  - `Trabalho - Freelance - 500,00` (sem data = hoje)

### 📊 Relatórios e Consultas
- **Listar despesas do mês:** `despesas mês 12`
- **Listar despesas por categoria:** `despesas categoria Comida`
- **Listar despesas por categoria no mês:** `despesas categoria 12 Comida`
- **Ver categorias existentes:** `categorias`

### 💰 Orçamento
- **Visualizar orçamento atual:** `orçamento`
- **Editar orçamento:** `editar orçamento 12 1500`
- **Visualizar orçamento por mês:** `orçamento 12`

### 📈 Gráficos
- Gráfico mensal de despesas
- Gráfico anual de receitas
- Gráfico de categorias
- Gráfico semanal

## 🆕 Nova Funcionalidade: Criação Automática de Colunas

### Resumo Mensal Automático
Quando você adiciona uma despesa com uma categoria que não existe no "Resumo Mensal", o bot automaticamente:

1. **Cria uma nova coluna** no "Resumo Mensal" com o nome da categoria
2. **Aplica a fórmula correta** para calcular a soma das despesas da categoria por mês
3. **Atualiza todos os meses** (Janeiro a Dezembro) com a fórmula

### Fórmula Utilizada
A fórmula aplicada segue o padrão:
```
=SUMIFS(Despesas!$D$1:$D; Despesas!$B$1:$B; ">="&$B7; Despesas!$B$1:$B; "<"&(EOMONTH($B7; 0)+1); Despesas!$E$1:$E; "="&L$1)
```

Onde:
- `Despesas!$D$1:$D` = coluna de valores na aba Despesas
- `Despesas!$B$1:$B` = coluna de datas na aba Despesas
- `$B7` = célula com a data do mês no Resumo mensal
- `Despesas!$E$1:$E` = coluna de categorias na aba Despesas
- `L$1` = cabeçalho da categoria no Resumo mensal

### Estrutura da Planilha
O bot assume a seguinte estrutura:

**Aba "Despesas":**
- Coluna A: Data/Hora
- Coluna B: Data da compra
- Coluna C: Descrição
- Coluna D: Valor
- Coluna E: Categoria

**Aba "Resumo mensal":**
- Linha 1: Cabeçalhos (incluindo categorias)
- Linha 2: Janeiro
- Linha 3: Fevereiro
- ...
- Linha 13: Dezembro

## Configuração

1. Configure o token do bot no arquivo `index.js`
2. Configure o ID da planilha do Google Sheets
3. Configure o link do webhook
4. Deploy no Google Apps Script

## Comandos Disponíveis

- `ajuda` - Mostra menu principal
- `categorias` - Lista categorias existentes
- `orçamento` - Mostra orçamento atual
- `gráfico mensal` - Envia gráfico mensal
- `gráfico receitas` - Envia gráfico de receitas
- `gráfico categorias` - Envia gráfico por categorias
- `gráfico semanal` - Envia gráfico semanal

## Estrutura de Arquivos

- `index.js` - Código principal do bot
- `README.md` - Documentação

## Suporte

Para dúvidas ou problemas, verifique:
1. Se a planilha está acessível
2. Se as abas "Despesas", "Receitas" e "Resumo mensal" existem
3. Se as colunas estão na ordem correta
4. Se o bot tem permissões para editar a planilha
