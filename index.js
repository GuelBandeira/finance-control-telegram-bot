//CONFIGURAÇÕES ---------------------------------------------------------------------------------------------
var token = '8349029222:AAFTND93tS8KYmhsC4NsST0HMngKaf9MSq0';
var id_planilha = '137Dkv4F-98yBUwOZwq6kj1YZZNF3Y7RQ_ml6J11PjOQ';
var link_planilha = 'https://script.google.com/macros/s/AKfycbwZtWCMfEI9-xCg60tD2osR2gz6iz99guI1nBicXM8RtWm0DjvyTfZ6bWzYd0Ay5d9a/exec';
//FIM CONFIGURAÇÕES ---------------------------------------------------------------------------------------------



var telegram_url = 'https://api.telegram.org/bot' + token;

function setWebhook() {
   var url = telegram_url + "/setWebhook?url=" + link_planilha;
   var response = UrlFetchApp.fetch(url);
}

function sendMessage(id, text, keyBoard = null) {
   var data = {
      method: "post",
      payload: {
         method: "sendMessage",
         chat_id: String(id),
         text: text,
         parse_mode: "Markdown",
         reply_markup: (keyBoard ? JSON.stringify(keyBoard) : null)
      }
   };
   UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}

function sendPhoto(id, photoUrl, caption = "") {
   var data = {
      method: "post",
      payload: {
         method: "sendPhoto",
         chat_id: String(id),
         photo: photoUrl,
         caption: caption,
         parse_mode: "HTML"
      }
   };
   UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}

function doPost(e) {
   var contents = JSON.parse(e.postData.contents);


   if (contents.callback_query) {
      var id = contents.callback_query.from.id;
      var textoMensagem = contents.callback_query.data;

      // Tratar callbacks dos botões inline
      if (textoMensagem == "grafico_mensal") {
         enviarGraficoMensal(id);
         return;
      } else if (textoMensagem == "grafico_receitas") {
         enviarGraficoReceitas(id);
         return;
      } else if (textoMensagem == "grafico_categorias") {
         enviarGraficoCategorias(id);
         return;
      } else if (textoMensagem == "grafico_semanal") {
         enviarGraficoSemanal(id);
         return;
      } else if (textoMensagem == "orcamento") {
         // Mostrar orçamento atual e submenu de opções
         var dateNow = new Date();
         var month = parseInt(String(dateNow.getMonth() + 1).padStart(2, '0'));
         var year = dateNow.getFullYear();

         var dadosOrcamento = buscarOrcamentoPorColuna(id_planilha, month);
         var orcamento = dadosOrcamento ? dadosOrcamento.orcamento : 0;
         var orcamento_sobrando = dadosOrcamento ? dadosOrcamento.orcamentoSobrando : 0;

         // Nomes dos meses para exibição
         var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "✏️ Editar Orçamento",
                  "callback_data": "editar_orcamento"
               }],
               [{
                  "text": "📅 Visualizar por Mês",
                  "callback_data": "orcamento_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         if (orcamento && orcamento > 0) {
            sendMessage(id, `💰 *Orçamento - ${nomesMeses[month]} ${year}*\n\n*Orçamento:* R$ ${(orcamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Orçamento Sobrando:* R$ ${(orcamento_sobrando || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, opcoes);
         } else {
            sendMessage(id, `💰 *Orçamento - ${nomesMeses[month]} ${year}*\n\n*Nenhum orçamento definido para este mês.*\n\nUse a opção "Editar Orçamento" para definir um orçamento.`, opcoes);
         }
         return;
      } else if (textoMensagem == "editar_orcamento") {
         // Mostrar instruções para editar orçamento
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "✏️ Editar Orçamento",
                  "callback_data": "editar_orcamento"
               }],
               [{
                  "text": "📅 Visualizar por Mês",
                  "callback_data": "orcamento_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "✏️ *Editar Orçamento*\n\nPara editar o orçamento, envie uma mensagem no formato:\n\n`editar orçamento MÊS VALOR`\n\n*Exemplo:*\n`editar orçamento 12 1500`\n\n*Mês:* 1 a 12 (Janeiro = 1, Dezembro = 12)\n*Valor:* Valor em reais (sem R$)", opcoes);
         return;
      } else if (textoMensagem == "orcamento_mes") {
         // Mostrar instruções para visualizar orçamento por mês
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "✏️ Editar Orçamento",
                  "callback_data": "editar_orcamento"
               }],
               [{
                  "text": "📅 Visualizar por Mês",
                  "callback_data": "orcamento_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "📅 *Orçamento por Mês*\n\nPara visualizar o orçamento de um mês específico, envie uma mensagem no formato:\n\n`orçamento MÊS`\n\n*Exemplo:*\n`orçamento 12`\n\n*Mês:* 1 a 12 (Janeiro = 1, Dezembro = 12)", opcoes);
         return;
      } else if (textoMensagem == "listar_gastos_mes") {
         // Mostrar instruções para listar gastos do mês
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "📊 *Listar Despesas do Mês*\n\nPara listar todas as despesas de um mês específico, envie uma mensagem no formato:\n\n`despesas mês MÊS`\n\n*Exemplo:*\n`despesas mês 12`\n\n*Mês:* 1 a 12 (Janeiro = 1, Dezembro = 12)", opcoes);
         return;
      } else if (textoMensagem == "listar_gastos_categoria") {
         // Mostrar instruções para listar gastos por categoria
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "🏷️ *Listar Despesas por Categoria*\n\nPara listar todas as despesas de uma categoria específica, envie uma mensagem no formato:\n\n`despesas categoria NOME_CATEGORIA`\n\n*Exemplo:*\n`despesas categoria Comida`\n\n*Dica:* Use o comando 'categorias' para ver as categorias disponíveis", opcoes);
         return;
      } else if (textoMensagem == "listar_gastos_categoria_mes") {
         // Mostrar instruções para listar gastos por categoria no mês
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "📈 *Despesas por Categoria no Mês*\n\nPara listar despesas de uma categoria específica em um mês específico, envie uma mensagem no formato:\n\n`despesas categoria MÊS NOME_CATEGORIA`\n\n*Exemplo:*\n`despesas categoria 12 Comida`\n\n*Mês:* 1 a 12 (Janeiro = 1, Dezembro = 12)\n*Dica:* Use o comando 'categorias' para ver as categorias disponíveis", opcoes);
         return;
      } else if (textoMensagem == "ajuda") {
         // Mostrar menu de ajuda
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "💰 Orçamento",
                  "callback_data": "orcamento"
               }],
               [{
                  "text": "📝 Despesas",
                  "callback_data": "despesas"
               }],
               [{
                  "text": "💰 Receitas",
                  "callback_data": "receitas"
               }],
               [{
                  "text": "📊 Gráficos",
                  "callback_data": "graficos"
               }]
            ]
         }
         sendMessage(id, "🤖 *Comandos Disponíveis:*", opcoes);
         return;
      } else if (textoMensagem == "categorias") {
         // Buscar categorias existentes da planilha
         var categorias = buscarCategoriasExistentes(id_planilha);

         if (categorias && categorias.length > 0) {
            var mensagem = "📋 *Categorias de Despesas Existentes:*\n\n";
            for (var i = 0; i < categorias.length; i++) {
               mensagem += "• " + categorias[i] + "\n";
            }

            var opcoes = {
               "inline_keyboard": [
                  [{
                     "text": "💰 Orçamento",
                     "callback_data": "orcamento"
                  }],
                  [{
                     "text": "📝 Despesas",
                     "callback_data": "despesas"
                  }],
                  [{
                     "text": "Adicionar Receita",
                     "callback_data": "receita"
                  }],
                  [{
                     "text": "📊 Gráficos",
                     "callback_data": "graficos"
                  }]
               ]
            }
            sendMessage(id, mensagem, opcoes);
         } else {
            var opcoes = {
               "inline_keyboard": [
                  [{
                     "text": "💰 Orçamento",
                     "callback_data": "orcamento"
                  }],
                  [{
                     "text": "📝 Despesas",
                     "callback_data": "despesas"
                  }],
                  [{
                     "text": "Adicionar Receita",
                     "callback_data": "receita"
                  }],
                  [{
                     "text": "📊 Gráficos",
                     "callback_data": "graficos"
                  }]
               ]
            }
            sendMessage(id, "📋 *Categorias:*\n\nNenhuma categoria encontrada na planilha.\n\nAs categorias são criadas automaticamente quando você adiciona despesas.", opcoes);
         }
         return;
      } else if (textoMensagem == "graficos") {
         // Mostrar submenu de gráficos
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "📈 Gráfico Mensal",
                  "callback_data": "grafico_mensal"
               }],
               [{
                  "text": "💰 Gráfico de Receitas",
                  "callback_data": "grafico_receitas"
               }],
               [{
                  "text": "📊 Gráfico de Categorias",
                  "callback_data": "grafico_categorias"
               }],
               [{
                  "text": "📅 Gráfico Semanal",
                  "callback_data": "grafico_semanal"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "📊 *Escolha o tipo de gráfico:*", opcoes);
         return;
      } else if (textoMensagem == "despesas") {
         // Mostrar submenu de despesas
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "📝 *Menu de Despesas:*\n\nEscolha uma opção ou envie uma despesa no formato:\n\n`Data - Descrição - Valor - Categoria`\n\n*Exemplos:*\n• `15/12/2024 - Almoço - 25,50 - Comida`\n• `Farmácia - 45,80 - Farmácia` (sem data = hoje)", opcoes);
         return;
      } else if (textoMensagem == "receitas") {
         // Mostrar submenu de receitas
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Receita",
                  "callback_data": "adicionar_receita"
               }],
               [{
                  "text": "📊 Listar Receitas do Mês",
                  "callback_data": "listar_receitas_mes"
               }],
               [{
                  "text": "🏷️ Listar Receitas por Categoria",
                  "callback_data": "listar_receitas_categoria"
               }],
               [{
                  "text": "📈 Receitas por Categoria no Mês",
                  "callback_data": "listar_receitas_categoria_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "💰 *Menu de Receitas:*\n\nEscolha uma opção ou envie uma receita no formato:\n\n 📝 *Como Adicionar uma Receita:*\n\nUse o formato:\n`Data - Categoria da Receita - Descrição - Valor`\n\n*Exemplos:*\n• `15/12/2024 - Trabalho - Salário - 3000,00`\n• `Trabalho - Freelance - 500,00` (sem data = hoje)", opcoes);
         return;
      } else if (textoMensagem == "adicionar_receita") {
         // Mostrar instruções para adicionar receita
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Receita",
                  "callback_data": "adicionar_receita"
               }],
               [{
                  "text": "📊 Listar Receitas do Mês",
                  "callback_data": "listar_receitas_mes"
               }],
               [{
                  "text": "🏷️ Listar Receitas por Categoria",
                  "callback_data": "listar_receitas_categoria"
               }],
               [{
                  "text": "📈 Receitas por Categoria no Mês",
                  "callback_data": "listar_receitas_categoria_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "➕ *Adicionar Receita*\n\nPara adicionar uma receita, envie uma mensagem no formato:\n\n`Data - Categoria da Receita - Descrição - Valor`\n\n*Exemplos:*\n• `15/12/2024 - Trabalho - Salário - 3000,00`\n• `Trabalho - Freelance - 500,00` (sem data = hoje)\n\n*Categorias disponíveis:*\n• Trabalho", opcoes);
         return;
      } else if (textoMensagem == "adicionar_despesa") {
         // Mostrar instruções para adicionar despesa
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "➕ *Adicionar Despesa*\n\nPara adicionar uma despesa, envie uma mensagem no formato:\n\n`Data - Descrição - Valor - Categoria`\n\n*Exemplos:*\n• `15/12/2024 - Almoço - 25,50 - Comida`\n• `Farmácia - 45,80 - Farmácia` (sem data = hoje)\n\n*Dica:* Use o comando 'categorias' para ver as categorias disponíveis", opcoes);
         return;
      } else if (textoMensagem == "listar_receitas_mes") {
         // Mostrar instruções para listar receitas do mês
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Receita",
                  "callback_data": "adicionar_receita"
               }],
               [{
                  "text": "📊 Listar Receitas do Mês",
                  "callback_data": "listar_receitas_mes"
               }],
               [{
                  "text": "🏷️ Listar Receitas por Categoria",
                  "callback_data": "listar_receitas_categoria"
               }],
               [{
                  "text": "📈 Receitas por Categoria no Mês",
                  "callback_data": "listar_receitas_categoria_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "📊 *Listar Receitas do Mês*\n\nPara listar todas as receitas de um mês específico, envie uma mensagem no formato:\n\n`receitas mês MÊS`\n\n*Exemplo:*\n`receitas mês 12`\n\n*Mês:* 1 a 12 (Janeiro = 1, Dezembro = 12)", opcoes);
         return;
      } else if (textoMensagem == "listar_receitas_categoria") {
         // Mostrar instruções para listar receitas por categoria
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Receita",
                  "callback_data": "adicionar_receita"
               }],
               [{
                  "text": "📊 Listar Receitas do Mês",
                  "callback_data": "listar_receitas_mes"
               }],
               [{
                  "text": "🏷️ Listar Receitas por Categoria",
                  "callback_data": "listar_receitas_categoria"
               }],
               [{
                  "text": "📈 Receitas por Categoria no Mês",
                  "callback_data": "listar_receitas_categoria_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "🏷️ *Listar Receitas por Categoria*\n\nPara listar todas as receitas de uma categoria específica, envie uma mensagem no formato:\n\n`receitas categoria NOME_CATEGORIA`\n\n*Exemplo:*\n`receitas categoria Trabalho`", opcoes);
         return;
      } else if (textoMensagem == "listar_receitas_categoria_mes") {
         // Mostrar instruções para listar receitas por categoria no mês
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Receita",
                  "callback_data": "adicionar_receita"
               }],
               [{
                  "text": "📊 Listar Receitas do Mês",
                  "callback_data": "listar_receitas_mes"
               }],
               [{
                  "text": "🏷️ Listar Receitas por Categoria",
                  "callback_data": "listar_receitas_categoria"
               }],
               [{
                  "text": "📈 Receitas por Categoria no Mês",
                  "callback_data": "listar_receitas_categoria_mes"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }
         sendMessage(id, "📈 *Receitas por Categoria no Mês*\n\nPara listar receitas de uma categoria específica em um mês específico, envie uma mensagem no formato:\n\n`receitas categoria MÊS NOME_CATEGORIA`\n\n*Exemplo:*\n`receitas categoria 12 Trabalho`\n\n*Mês:* 1 a 12 (Janeiro = 1, Dezembro = 12)", opcoes);
         return;
      }

   } else {
      var id = contents.message.from.id;
      var textoMensagem = contents.message.text;
      textoMensagem = textoMensagem.toLowerCase().trim();
   }

   sendMessage(id, "✏️ *Processando...*");




   if (textoMensagem == "ajuda") {

      var opcoes = {
         "inline_keyboard": [
            [{
               "text": "💰 Orçamento",
               "callback_data": "orcamento"
            }],
            [{
               "text": "📝 Despesas",
               "callback_data": "despesas"
            }],
            [{
               "text": "Adicionar Receita",
               "callback_data": "receita"
            }],
            [{
               "text": "📊 Gráficos",
               "callback_data": "graficos"
            }]
         ]
      }


      sendMessage(id, "🤖 *Comandos Disponíveis:*", opcoes);
   } else if (textoMensagem == 'categorias') {
      // Buscar categorias existentes da planilha
      var categorias = buscarCategoriasExistentes(id_planilha);

      if (categorias && categorias.length > 0) {
         var mensagem = "📋 *Categorias Existentes de Despesas:*\n\n";
         for (var i = 0; i < categorias.length; i++) {
            mensagem += "• " + categorias[i] + "\n";
         }

         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "💰 Orçamento",
                  "callback_data": "orcamento"
               }],
               [{
                  "text": "📝 Despesas",
                  "callback_data": "despesas"
               }],
               [{
                  "text": "💰 Receitas",
                  "callback_data": "receitas"
               }],
               [{
                  "text": "📊 Gráficos",
                  "callback_data": "graficos"
               }]
            ]
         }
         sendMessage(id, mensagem, opcoes);
      } else {
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "💰 Orçamento",
                  "callback_data": "orcamento"
               }],
               [{
                  "text": "📝 Despesas",
                  "callback_data": "despesas"
               }],
               [{
                  "text": "💰 Receitas",
                  "callback_data": "receitas"
               }],
               [{
                  "text": "📊 Gráficos",
                  "callback_data": "graficos"
               }]
            ]
         }
         sendMessage(id, "📋 *Categorias:*\n\nNenhuma categoria encontrada na planilha.\n\nAs categorias são criadas automaticamente quando você adiciona despesas.", opcoes);
      }
   } else if (textoMensagem == "orçamento" || textoMensagem == "visualizar orçamento") {
      var dateNow = new Date();

      // Pega os componentes da data
      var month = parseInt(String(dateNow.getMonth() + 1).padStart(2, '0')); // Mês começa em 0
      var year = dateNow.getFullYear();

      var dadosOrcamento = buscarOrcamentoPorColuna(id_planilha, month);
      var orcamento = dadosOrcamento ? dadosOrcamento.orcamento : 0;
      var orcamento_sobrando = dadosOrcamento ? dadosOrcamento.orcamentoSobrando : 0;

      // Nomes dos meses para exibição
      var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
         "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

      var opcoes = {
         "inline_keyboard": [
            [{
               "text": "✏️ Editar Orçamento",
               "callback_data": "editar_orcamento"
            }],
            [{
               "text": "📅 Visualizar por Mês",
               "callback_data": "orcamento_mes"
            }],
            [{
               "text": "🔙 Voltar ao Menu",
               "callback_data": "ajuda"
            }]
         ]
      }

      if (orcamento && orcamento > 0) {
         sendMessage(id, `💰 *Orçamento - ${nomesMeses[month]} ${year}*\n\n*Orçamento:* R$ ${(orcamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Orçamento Sobrando:* R$ ${(orcamento_sobrando || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, opcoes);
      } else {
         sendMessage(id, `💰 *Orçamento - ${nomesMeses[month]} ${year}*\n\n*Nenhum orçamento definido para este mês.*\n\nUse o comando "editar orçamento" para definir um orçamento.`, opcoes);
      }
   } else if (textoMensagem == "gráfico mensal" || textoMensagem == "grafico mensal" || textoMensagem == "grafico") {
      enviarGraficoMensal(id);
   } else if (textoMensagem.startsWith("editar orçamento") || textoMensagem.startsWith("editar orcamento")) {
      // Processar edição de orçamento
      processarEdicaoOrcamento(id, textoMensagem);
   } else if (textoMensagem.startsWith("orçamento ") && !textoMensagem.includes("visualizar")) {
      // Processar visualização de orçamento por mês específico
      processarOrcamentoPorMes(id, textoMensagem);
   } else if (textoMensagem.startsWith("despesas mês ") || textoMensagem.startsWith("gastos mês ")) {
      // Processar listagem de despesas do mês
      processarGastosDoMes(id, textoMensagem);
   } else if (textoMensagem.startsWith("despesas categoria ") || textoMensagem.startsWith("gastos categoria ")) {
      // Verificar se é comando de categoria no mês (tem número como terceiro parâmetro)
      var partes = textoMensagem.split(' ');
      console.log(`Comando categoria detectado: "${textoMensagem}"`);
      console.log(`Partes: ${JSON.stringify(partes)}`);
      console.log(`Terceiro parâmetro: "${partes[2]}", É número? ${!isNaN(parseInt(partes[2]))}`);

      if (partes.length >= 4 && !isNaN(parseInt(partes[2]))) {
         // Formato: "despesas categoria MÊS CATEGORIA" - processar como categoria no mês
         console.log(`✅ Processando como categoria no mês`);
         processarGastosPorCategoriaNoMes(id, textoMensagem);
      } else {
         // Formato: "despesas categoria CATEGORIA" - processar como categoria apenas
         console.log(`✅ Processando como categoria simples`);
         processarGastosPorCategoria(id, textoMensagem);
      }
   } else if (textoMensagem.startsWith("receitas mês ") || textoMensagem.startsWith("receita mês ")) {
      // Processar listagem de receitas do mês
      processarReceitasDoMes(id, textoMensagem);
   } else if (textoMensagem.startsWith("receitas categoria ") || textoMensagem.startsWith("receita categoria ")) {
      // Verificar se é comando de categoria no mês (tem número como terceiro parâmetro)
      var partes = textoMensagem.split(' ');

      if (partes.length >= 4 && !isNaN(parseInt(partes[2]))) {
         // Formato: "receitas categoria MÊS CATEGORIA" - processar como categoria no mês
         processarReceitasPorCategoriaNoMes(id, textoMensagem);
      } else {
         // Formato: "receitas categoria CATEGORIA" - processar como categoria apenas
         processarReceitasPorCategoria(id, textoMensagem);
      }
   } else {
      if (textoMensagem.includes('-')) {
         textoMensagemAux = textoMensagem.split('-');

         // Verificar se é uma receita (4 campos) ou despesa (3-4 campos)
         if (textoMensagemAux.length === 4) {
            // Formato: Data - Categoria da Receita - Descrição - Valor
            // Pode ser uma receita
            var data = textoMensagemAux[0].trim();
            var categoriaReceita = textoMensagemAux[1].trim();

            // Verificar se a categoria é "Trabalho" para confirmar que é uma receita
            if (categoriaReceita.toLowerCase() === 'trabalho') {
               processarReceita(id, textoReceitaComData);
               return;
            }
         } else if (textoMensagemAux.length === 3) {
            // Formato: Categoria da Receita - Descrição - Valor (sem data = hoje)
            var categoriaReceita = textoMensagemAux[0].trim();

            // Verificar se a categoria é "Trabalho" para confirmar que é uma receita
            if (categoriaReceita.toLowerCase() === 'trabalho') {
               // Adicionar data de hoje no início
               var textoReceitaComData = [dateNow_sem_hora(), categoriaReceita, textoMensagemAux[1].trim(), textoMensagemAux[2].trim()];
               processarReceita(id, textoReceitaComData);
               return;
            }
         }

         // Se não for receita, processar como despesa (formato original)
         var despesa = [];
         var data_compra_inserida_mensagem = true;
         var data = textoMensagemAux[0].trim();

         if (!(data.includes('/'))) {
            despesa['data_compra'] = dateNow_sem_hora();
            data_compra_inserida_mensagem = false;

         } else if (!validarData(data)) {
            sendMessage(id, "❌ *Data da compra inválida!*\n\nPor favor, informe a despesa novamente no formato:\n`Data - Descrição - Valor - Categoria`\n\n*Exemplo:* `15/12/2024 - Almoço - 25.50 - Comida`");
         } else {
            despesa['data_compra'] = data;
         }



         if (!data_compra_inserida_mensagem) {
            despesa['descricao'] = textoMensagemAux[0].trim();
            despesa['valor'] = textoMensagemAux[1].trim();
            despesa['categoria'] = formatarCategoria(textoMensagemAux[2].trim());
         } else {
            despesa['descricao'] = textoMensagemAux[1].trim();
            despesa['valor'] = textoMensagemAux[2].trim();
            despesa['categoria'] = formatarCategoria(textoMensagemAux[3].trim());
         }



         var dateNow = new Date();

         // Pega os componentes da data
         var day = String(dateNow.getDate()).padStart(2, '0');
         var month = String(dateNow.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
         var year = dateNow.getFullYear();

         // Pega os componentes da hora
         var hours = String(dateNow.getHours()).padStart(2, '0');
         var minutes = String(dateNow.getMinutes()).padStart(2, '0');
         var seconds = String(dateNow.getSeconds()).padStart(2, '0');

         var data_formatada = day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;

         despesa['data_hora'] = data_formatada;
         var descricao = despesa['descricao'];
         var planilha = SpreadsheetApp.openById(id_planilha).getSheetByName("Despesas");
         planilha.appendRow([despesa['data_hora'], despesa['data_compra'], despesa['descricao'], despesa['valor'], despesa['categoria']]);

         // Verificar e criar coluna automaticamente no "Resumo Mensal" se a categoria não existir
         verificarECriarColunaCategoria(id_planilha, despesa['categoria'], id);



         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         sendMessage(id, `✅ *Despesa Adicionada com Sucesso!*\n\n*Descrição:* ${descricao}\n*Valor:* R$ ${parseFloat(despesa['valor']).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Categoria:* ${despesa['categoria']}`, opcoes);
      } else {
         // Mostrar menu de opções para mensagens aleatórias
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "💰 Orçamento",
                  "callback_data": "orcamento"
               }],
               [{
                  "text": "📝 Despesas",
                  "callback_data": "despesas"
               }],
               [{
                  "text": "💰 Receitas",
                  "callback_data": "receitas"
               }],
               [{
                  "text": "📊 Gráficos",
                  "callback_data": "graficos"
               }]
            ]
         }
         sendMessage(id, "🤖 *Comandos Disponíveis:*\n\nEscolha uma opção ou envie uma despesa no formato:\n\n 📝 *Como Adicionar uma Despesa:*\n\nUse o formato:\n`Data - Descrição - Valor - Categoria`\n\n*Exemplos:*\n• `15/12/2024 - Almoço - 25,50 - Comida`\n• `Farmácia - 45,80 - Farmácia` (sem data = hoje)\n\n 💰 *Como Adicionar uma Receita:*\n\nUse o formato:\n`Data - Categoria da Receita - Descrição - Valor`\n\n*Exemplos:*\n• `15/12/2024 - Trabalho - Salário - 3000,00`\n• `Trabalho - Freelance - 500,00` (sem data = hoje)", opcoes);
      }
   }
}

function processarEdicaoOrcamento(id, textoMensagem) {
   try {
      // Formato esperado: "editar orçamento MÊS VALOR"
      var partes = textoMensagem.split(' ');

      if (partes.length < 4) {
         sendMessage(id, "❌ *Erro:* Formato inválido. Use: `editar orçamento MÊS VALOR`\n\n*Exemplo:* `editar orçamento 12 1500`");
         return;
      }

      var mes = parseInt(partes[2]);
      var valor = parseFloat(partes[3]);

      // Validar mês
      if (isNaN(mes) || mes < 1 || mes > 12) {
         sendMessage(id, "*Erro:* Mês inválido. Use um número de 1 a 12.\n\n*Exemplo:* Janeiro = 1, Dezembro = 12");
         return;
      }

      // Validar valor
      if (isNaN(valor) || valor <= 0) {
         sendMessage(id, "❌ *Erro:* Valor inválido. Use um número maior que zero.\n\n*Exemplo:* `editar orçamento 12 1500`");
         return;
      }

      // Abrir planilha e editar orçamento
      var planilha_resumo_mensal = SpreadsheetApp.openById(id_planilha).getSheetByName("Resumo mensal");

      if (!planilha_resumo_mensal) {
         sendMessage(id, "*Erro:* Aba 'Resumo mensal' não encontrada na planilha.");
         return;
      }

      // Buscar dados do orçamento para identificar as colunas corretas
      // A planilha tem estrutura: linha 1 = cabeçalho, linha 2 = janeiro, linha 3 = fevereiro, etc.
      var linhaNaPlanilha = mes + 1; // Janeiro (mês 1) = linha 2, Dezembro (mês 12) = linha 13
      var dadosOrcamento = buscarOrcamentoPorColuna(id_planilha, linhaNaPlanilha);


      if (!dadosOrcamento) {
         sendMessage(id, "❌ *Erro:* Não foi possível localizar as colunas de orçamento na planilha.");
         return;
      }

      var linha = dadosOrcamento.linha;

      // Identificar colunas de orçamento
      var planilha = SpreadsheetApp.openById(id_planilha).getSheetByName("Resumo mensal");
      var dados = planilha.getDataRange().getValues();
      var cabecalho = dados[0];

      var colunaOrcamento = -1;
      var colunaOrcamentoSobrando = -1;

      for (var j = 0; j < cabecalho.length; j++) {
         var nomeColunaLower = cabecalho[j].toString().toLowerCase();
         if (nomeColunaLower.includes('orçamento') && !nomeColunaLower.includes('sobrando')) {
            colunaOrcamento = j;
         } else if (nomeColunaLower.includes('orçamento') && nomeColunaLower.includes('sobrando')) {
            colunaOrcamentoSobrando = j;
         }
      }

      // Fallback para as posições padrão se não conseguir identificar
      if (colunaOrcamento === -1) colunaOrcamento = 14;
      if (colunaOrcamentoSobrando === -1) colunaOrcamentoSobrando = 15;

      // Atualizar orçamento na coluna identificada
      planilha.getRange(linha, colunaOrcamento + 1).setValue(valor);

      // Recalcular orçamento sobrando (coluna 15 - coluna O)
      // Assumindo que o orçamento sobrando = orçamento - gastos totais
      var gastosTotais = 0;

      // Buscar gastos do mês na aba "Despesas"
      var planilha_despesas = SpreadsheetApp.openById(id_planilha).getSheetByName("Despesas");
      if (planilha_despesas) {
         var dados = planilha_despesas.getDataRange().getValues();

         for (var i = 1; i < dados.length; i++) {
            var dataDespesa = dados[i][1]; // Coluna da data da compra
            var valorDespesa = parseFloat(dados[i][3]); // Coluna do valor

            if (dataDespesa && valorDespesa) {
               if (typeof dataDespesa === 'string' && dataDespesa.includes('/')) {
                  var partesData = dataDespesa.split('/');
                  var mesDespesa = parseInt(partesData[1]);
                  var anoDespesa = parseInt(partesData[2]);

                  // Verificar se é do mês e ano atual
                  var anoAtual = new Date().getFullYear();
                  if (mesDespesa === mes && anoDespesa === anoAtual) {
                     gastosTotais += valorDespesa;
                  }
               }
            }
         }
      }

      // Calcular orçamento sobrando
      var orcamentoSobrando = valor - gastosTotais;

      // Atualizar orçamento sobrando na coluna identificada
      planilha.getRange(linha, colunaOrcamentoSobrando + 1).setValue(orcamentoSobrando);

      // Nomes dos meses para exibição
      var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
         "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

      var opcoes = {
         "inline_keyboard": [
            [{
               "text": "✏️ Editar Orçamento",
               "callback_data": "editar_orcamento"
            }],
            [{
               "text": "📅 Visualizar por Mês",
               "callback_data": "orcamento_mes"
            }],
            [{
               "text": "🔙 Voltar ao Menu",
               "callback_data": "ajuda"
            }]
         ]
      }

      sendMessage(id, `✅ *Orçamento Atualizado com Sucesso!*\n\n*Mês:* ${nomesMeses[mes]}\n*Novo Orçamento:* R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Gastos Totais:* R$ ${gastosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Orçamento Sobrando:* R$ ${orcamentoSobrando.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, opcoes);

   } catch (error) {
      sendMessage(id, `❌ *Erro ao editar orçamento:* ${error.message}\n\nVerifique se a planilha está acessível e tente novamente.`);
   }
}

function processarOrcamentoPorMes(id, textoMensagem) {
   try {
      // Formato esperado: "orçamento MÊS"
      var partes = textoMensagem.split(' ');

      if (partes.length < 2) {
         sendMessage(id, "❌ *Erro:* Formato inválido. Use: `orçamento MÊS`\n\n*Exemplo:* `orçamento 12`");
         return;
      }

      var mes = parseInt(partes[1]);

      // Validar mês
      if (isNaN(mes) || mes < 1 || mes > 12) {
         sendMessage(id, "*Erro:* Mês inválido. Use um número de 1 a 12.\n\n*Exemplo:* Janeiro = 1, Dezembro = 12");
         return;
      }

      // Abrir planilha e buscar orçamento
      var planilha_resumo_mensal = SpreadsheetApp.openById(id_planilha).getSheetByName("Resumo mensal");

      if (!planilha_resumo_mensal) {
         sendMessage(id, "*Erro:* Aba 'Resumo mensal' não encontrada na planilha.");
         return;
      }

      // Buscar dados do orçamento usando a função auxiliar
      var dadosOrcamento = buscarOrcamentoPorColuna(id_planilha, mes);

      if (!dadosOrcamento) {
         sendMessage(id, "❌ *Erro:* Não foi possível localizar as colunas de orçamento na planilha.");
         return;
      }

      var orcamento = dadosOrcamento.orcamento;
      var orcamentoSobrando = dadosOrcamento.orcamentoSobrando;

      // Nomes dos meses para exibição
      var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
         "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

      var anoAtual = new Date().getFullYear();

      var opcoes = {
         "inline_keyboard": [
            [{
               "text": "✏️ Editar Orçamento",
               "callback_data": "editar_orcamento"
            }],
            [{
               "text": "📅 Visualizar por Mês",
               "callback_data": "orcamento_mes"
            }],
            [{
               "text": "🔙 Voltar ao Menu",
               "callback_data": "ajuda"
            }]
         ]
      }

      if (orcamento && orcamento > 0) {
         sendMessage(id, `💰 *Orçamento - ${nomesMeses[mes]} ${anoAtual}*\n\n*Orçamento:* R$ ${(orcamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Orçamento Sobrando:* R$ ${(orcamentoSobrando || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, opcoes);
      } else {
         sendMessage(id, `💰 *Orçamento - ${nomesMeses[mes]} ${anoAtual}*\n\n*Nenhum orçamento definido para este mês.*\n\nUse o comando "editar orçamento" para definir um orçamento.`, opcoes);
      }

   } catch (error) {
      sendMessage(id, `❌ *Erro ao buscar orçamento:* ${error.message}\n\nVerifique se a planilha está acessível e tente novamente.`);
   }
}

function buscarOrcamentoPorColuna(idPlanilha, linhaNaPlanilha) {
   try {
      var planilha = SpreadsheetApp.openById(idPlanilha).getSheetByName("Resumo mensal");

      if (!planilha) {
         console.error("Aba 'Resumo mensal' não encontrada na planilha");
         return null;
      }

      var dados = planilha.getDataRange().getValues();

      if (dados.length <= 1) {
         console.error("Planilha 'Resumo mensal' não possui dados");
         return null;
      }

      var cabecalho = dados[0];
      var colunaOrcamento = -1;
      var colunaOrcamentoSobrando = -1;
      var colunaMes = -1;

      // Identificar as colunas corretas baseado no cabeçalho
      for (var j = 0; j < cabecalho.length; j++) {
         var nomeColunaLower = cabecalho[j].toString().toLowerCase();
         if (nomeColunaLower.includes('orçamento') && !nomeColunaLower.includes('sobrando')) {
            colunaOrcamento = j;
         } else if (nomeColunaLower.includes('orçamento') && nomeColunaLower.includes('sobrando')) {
            colunaOrcamentoSobrando = j;
         } else if (nomeColunaLower.includes('mês') || nomeColunaLower.includes('mes')) {
            colunaMes = j;
         }
      }

      console.log(`Colunas identificadas: Mês=${colunaMes}, Orçamento=${colunaOrcamento}, Orçamento Sobrando=${colunaOrcamentoSobrando}`);

      // Fallback para as posições padrão se não conseguir identificar
      if (colunaMes === -1) colunaMes = 0;
      if (colunaOrcamento === -1) colunaOrcamento = 14;
      if (colunaOrcamentoSobrando === -1) colunaOrcamentoSobrando = 15;

      // Buscar a linha específica na planilha
      var linhaMes = -1;
      console.log(`Procurando linha ${linhaNaPlanilha} na coluna ${colunaMes}`);

      // Como já sabemos a linha exata, vamos usá-la diretamente
      if (linhaNaPlanilha < dados.length) {
         linhaMes = linhaNaPlanilha;
         console.log(`✅ Usando linha ${linhaNaPlanilha} diretamente`);
      } else {
         console.error(`❌ Linha ${linhaNaPlanilha} não existe na planilha. Total de linhas: ${dados.length}`);
         return null;
      }

      // Não precisamos de fallback, já que estamos usando a linha exata

      // Verificar se a linha existe na planilha
      if (linhaMes >= dados.length) {
         console.error(`❌ Linha ${linhaMes} não existe na planilha. Total de linhas: ${dados.length}`);
         return null;
      }

      // Verificação final: mostrar o valor da linha encontrada
      var valorMesFinal = dados[linhaMes][colunaMes];
      if (valorMesFinal) {
         console.log(`🔍 Linha ${linhaMes} selecionada, valor: "${valorMesFinal}"`);
      }

      // Buscar valores
      var orcamento = dados[linhaMes][colunaOrcamento];
      var orcamentoSobrando = dados[linhaMes][colunaOrcamentoSobrando];

      console.log(`Linha ${linhaMes}: Orçamento=${orcamento}, Orçamento Sobrando=${orcamentoSobrando}`);

      return {
         orcamento: orcamento,
         orcamentoSobrando: orcamentoSobrando,
         linha: linhaMes
      };

   } catch (error) {
      console.error("Erro ao buscar orçamento por coluna:", error.message);
      return null;
   }
}

function validarData(dataStr) {
   // Regex para verificar o formato dd/mm/YYYY
   var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
   var match = dataStr.match(regex);

   if (!match) return false; // Formato errado

   var dia = parseInt(match[1], 10);
   var mes = parseInt(match[2], 10);
   var ano = parseInt(match[3], 10);

   // Checa limites básicos
   if (mes < 1 || mes > 12) return false;
   if (dia < 1) return false;

   // Verifica número de dias do mês (considera ano bissexto)
   var diasNoMes = [31, (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

   if (dia > diasNoMes[mes - 1]) return false;

   return true;
}


function dateNow_sem_hora() {
   var dateNow = new Date();

   // Pega os componentes da data
   var day = String(dateNow.getDate()).padStart(2, '0');
   var month = String(dateNow.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
   var year = dateNow.getFullYear();

   // Pega os componentes da hora
   var hours = String(dateNow.getHours()).padStart(2, '0');
   var minutes = String(dateNow.getMinutes()).padStart(2, '0');
   var seconds = String(dateNow.getSeconds()).padStart(2, '0');

   var data_formatada = day + "/" + month + "/" + year;

   return data_formatada;
}

function enviarGraficoMensal(id) {
   sendMessage(id, "✏️ *Processando gráfico mensal...*");

   try {
      var dateNow = new Date();
      var month = dateNow.getMonth() + 1;
      var year = dateNow.getFullYear();

      // Tentar primeiro capturar o gráfico existente da planilha
      var imagemGrafico = capturarGraficoExistente(id_planilha, month, year, id);

      if (imagemGrafico) {
         // Se conseguiu capturar o gráfico existente, enviar
         var caption = `Gráfico "Gastos - Apunhado Mensal" - ${month}/${year} - Gráfico atualizado da sua planilha`;
         sendPhoto(id, imagemGrafico, caption);
         return;
      }

      // Se não conseguiu capturar, criar um novo gráfico como fallback
      sendMessage(id, "Gráfico existente não encontrado. Criando gráfico temporário...");

      // Abrir a planilha de despesas
      var planilha = SpreadsheetApp.openById(id_planilha).getSheetByName("Despesas");
      var dados = planilha.getDataRange().getValues();

      // Filtrar dados do mês atual
      var categorias = {};

      for (var i = 1; i < dados.length; i++) { // Pular cabeçalho
         var dataDespesa = dados[i][1]; // Coluna da data da compra
         var valor = parseFloat(dados[i][3]); // Coluna do valor
         var categoria = dados[i][4]; // Coluna da categoria

         if (dataDespesa && valor && categoria) {
            // Verificar se é do mês atual
            if (typeof dataDespesa === 'string' && dataDespesa.includes('/')) {
               var partesData = dataDespesa.split('/');
               var mesDespesa = parseInt(partesData[1]);
               var anoDespesa = parseInt(partesData[2]);

               if (mesDespesa === month && anoDespesa === year) {
                  if (categorias[categoria]) {
                     categorias[categoria] += valor;
                  } else {
                     categorias[categoria] = valor;
                  }
               }
            }
         }
      }

      if (Object.keys(categorias).length === 0) {
         sendMessage(id, "📊 *Nenhuma despesa encontrada para o mês atual.*");
         return;
      }

      // Criar dados para o gráfico
      var dadosGrafico = [];
      for (var cat in categorias) {
         dadosGrafico.push([cat, categorias[cat]]);
      }

      // Ordenar por valor (maior para menor)
      dadosGrafico.sort(function (a, b) {
         return b[1] - a[1];
      });

      // Criar gráfico usando Google Charts como fallback
      var chartUrl = criarGraficoGoogleCharts(dadosGrafico, month, year);

      if (chartUrl) {
         var caption = `Gráfico de Despesas - ${month}/${year} - `;
         for (var i = 0; i < dadosGrafico.length; i++) {
            caption += `${dadosGrafico[i][0]}: R$ ${dadosGrafico[i][1].toFixed(2)} | `;
         }

         sendPhoto(id, chartUrl, caption);
      } else {
         sendMessage(id, "❌ *Erro ao gerar o gráfico. Tente novamente.*");
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao gerar gráfico:* " + error.message);
   }
}

function criarGraficoGoogleCharts(dados, month, year) {
   try {
      // Usar Google Charts API para criar gráfico de pizza
      var valores = dados.map(function (d) { return d[1]; });
      var categorias = dados.map(function (d) { return d[0]; });

      // Calcular totais para porcentagens
      var total = valores.reduce(function (a, b) { return a + b; }, 0);

      // Criar URL do gráfico usando Google Charts API
      var chartUrl = "https://chart.googleapis.com/chart?" +
         "cht=p3" + // Gráfico de pizza 3D
         "&chs=600x400" + // Tamanho
         "&chd=t:" + valores.join(',') + // Dados
         "&chl=" + categorias.map(function (cat) { return encodeURIComponent(cat); }).join('|') + // Labels
         "&chtt=Despesas%20" + month + "/" + year + // Título
         "&chco=4285F4,EA4335,FBBC05,34A853,FF6D01,46BDC6,7B1FA2,FF5722,795548,607D8B" + // Cores
         "&chf=bg,s,FFFFFF" + // Fundo branco
         "&chma=0,0,0,0" + // Margens
         "&chdlp=b" + // Posição da legenda
         "&chdls=000000,12" + // Cor e tamanho dos labels
         "&chxt=x,y" + // Eixos
         "&chxl=0:|Total:%20R$%20" + total.toFixed(2) + "|1:|" + month + "/" + year; // Labels dos eixos

      return chartUrl;

   } catch (error) {
      console.error("Erro ao criar gráfico:", error.message);
      return null;
   }
}

function capturarGraficoExistente(idPlanilha, month, year, id) {
   try {
      var planilha = SpreadsheetApp.openById(idPlanilha);

      // Procurar especificamente na aba "Resumo mensal"
      var abaResumo = planilha.getSheetByName("Resumo mensal");

      if (!abaResumo) {
         sendMessage(id, "Aba 'Resumo mensal' não encontrada");
         return null;
      }

      // Procurar por gráficos na aba
      var graficos = abaResumo.getCharts();

      if (graficos.length === 0) {
         sendMessage(id, "Nenhum gráfico encontrado na aba 'Resumo mensal'");
         return null;
      }

      // Procurar pelo gráfico específico "Gastos - Apunhado Mensal"
      var graficoEncontrado = null;
      for (var i = 0; i < graficos.length; i++) {
         try {
            var nomeGrafico = graficos[i].getOptions().get('title');
            if (nomeGrafico && nomeGrafico.includes("Gastos - Apunhado Mensal")) {
               graficoEncontrado = graficos[i];
               break;
            }
         } catch (e) {
            // Se não conseguir pegar o nome, usar o primeiro gráfico
            if (i === 0) {
               graficoEncontrado = graficos[i];
            }
         }
      }

      // Se não encontrou o gráfico específico, usar o primeiro disponível
      if (!graficoEncontrado) {
         graficoEncontrado = graficos[0];
         sendMessage(id, "Gráfico 'Gastos - Apunhado Mensal' não encontrado, usando primeiro gráfico disponível");
      }

      var grafico = graficoEncontrado;

      // Capturar o gráfico como imagem
      var imagem = grafico.getBlob();

      if (!imagem) {
         sendMessage(id, "Não foi possível capturar a imagem do gráfico");
         return null;
      }

      // Salvar no Drive e criar link público
      try {
         var nomeArquivo = `grafico_${month}_${year}_${Date.now()}.png`;
         var arquivo = DriveApp.createFile(imagem);
         arquivo.setName(nomeArquivo);

         // Tornar público
         arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

         var url = arquivo.getDownloadUrl();

         // Agendar para deletar o arquivo após 1 hora (opcional)
         // DriveApp.getFileById(arquivo.getId()).setTrashed(true);

         return url;

      } catch (e) {
         sendMessage(id, "❌ *Erro ao salvar no Drive:* " + e.message);
         return null;
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao capturar gráfico existente:* " + error.message);
      return null;
   }
}

function enviarGraficoReceitas(id) {
   sendMessage(id, "✏️ *Processando gráfico de receitas...*");

   try {
      var dateNow = new Date();
      var year = dateNow.getFullYear();

      // Tentar capturar o gráfico existente da planilha
      var imagemGrafico = capturarGraficoReceitas(id_planilha, year, id);

      if (imagemGrafico) {
         // Se conseguiu capturar o gráfico existente, enviar
         var caption = `Gráfico "Receita - Apunhado anual" - ${year} - Gráfico atualizado da sua planilha`;
         sendPhoto(id, imagemGrafico, caption);
         return;
      }

      // Se não conseguiu capturar, criar um novo gráfico como fallback
      sendMessage(id, "Gráfico de receitas existente não encontrado. Criando gráfico temporário...");

      // Abrir a planilha de receitas
      var planilha = SpreadsheetApp.openById(id_planilha).getSheetByName("Receitas");

      if (!planilha) {
         sendMessage(id, "❌ *Erro:* Aba 'Receitas' não encontrada na planilha.\n\nPor favor, crie uma aba chamada 'Receitas' com as colunas necessárias.");
         return;
      }

      var dados = planilha.getDataRange().getValues();

      // Filtrar dados do ano atual
      var categorias = {};

      for (var i = 1; i < dados.length; i++) { // Pular cabeçalho
         var dataReceita = dados[i][1]; // Coluna da data
         var valor = parseFloat(dados[i][4]); // Coluna do valor da receita
         var categoria = dados[i][2]; // Coluna da categoria da receita

         if (dataReceita && valor && categoria) {
            // Verificar se é do ano atual
            if (typeof dataReceita === 'string' && dataReceita.includes('/')) {
               var partesData = dataReceita.split('/');
               var anoReceita = parseInt(partesData[2]);

               if (anoReceita === year) {
                  if (categorias[categoria]) {
                     categorias[categoria] += valor;
                  } else {
                     categorias[categoria] = valor;
                  }
               }
            }
         }
      }

      if (Object.keys(categorias).length === 0) {
         sendMessage(id, "📊 *Nenhuma receita encontrada para o ano atual.*");
         return;
      }

      // Criar dados para o gráfico
      var dadosGrafico = [];
      for (var cat in categorias) {
         dadosGrafico.push([cat, categorias[cat]]);
      }

      // Ordenar por valor (maior para menor)
      dadosGrafico.sort(function (a, b) {
         return b[1] - a[1];
      });

      // Criar gráfico usando Google Charts como fallback
      var chartUrl = criarGraficoReceitasGoogleCharts(dadosGrafico, year);

      if (chartUrl) {
         var caption = `Gráfico de Receitas - ${year} - `;
         for (var i = 0; i < dadosGrafico.length; i++) {
            caption += `${dadosGrafico[i][0]}: R$ ${dadosGrafico[i][1].toFixed(2)} | `;
         }

         sendPhoto(id, chartUrl, caption);
      } else {
         sendMessage(id, "❌ *Erro ao gerar o gráfico de receitas. Tente novamente.*");
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao gerar gráfico de receitas:* " + error.message);
   }
}

function capturarGraficoReceitas(idPlanilha, year, id) {
   try {
      var planilha = SpreadsheetApp.openById(idPlanilha);

      // Procurar especificamente na aba "Painel de receitas"
      var abaPainelReceitas = planilha.getSheetByName("Painel de receitas");

      if (!abaPainelReceitas) {
         sendMessage(id, "Aba 'Painel de receitas' não encontrada");
         return null;
      }

      // Procurar por gráficos na aba
      var graficos = abaPainelReceitas.getCharts();

      if (graficos.length === 0) {
         sendMessage(id, "Nenhum gráfico encontrado na aba 'Painel de receitas'");
         return null;
      }

      // Procurar pelo gráfico específico "Receita - Apunhado anual"
      var graficoEncontrado = null;
      for (var i = 0; i < graficos.length; i++) {
         try {
            var nomeGrafico = graficos[i].getOptions().get('title');
            if (nomeGrafico && nomeGrafico.includes("Receita - Apunhado anual")) {
               graficoEncontrado = graficos[i];
               break;
            }
         } catch (e) {
            // Se não conseguir pegar o nome, usar o primeiro gráfico
            if (i === 0) {
               graficoEncontrado = graficos[i];
            }
         }
      }

      // Se não encontrou o gráfico específico, usar o primeiro disponível
      if (!graficoEncontrado) {
         graficoEncontrado = graficos[0];
         sendMessage(id, "Gráfico 'Receita - Apunhado anual' não encontrado, usando primeiro gráfico disponível");
      }

      var grafico = graficoEncontrado;

      // Capturar o gráfico como imagem
      var imagem = grafico.getBlob();

      if (!imagem) {
         sendMessage(id, "Não foi possível capturar a imagem do gráfico de receitas");
         return null;
      }

      // Salvar no Drive e criar link público
      try {
         var nomeArquivo = `grafico_receitas_${year}_${Date.now()}.png`;
         var arquivo = DriveApp.createFile(imagem);
         arquivo.setName(nomeArquivo);

         // Tornar público
         arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

         var url = arquivo.getDownloadUrl();

         return url;

      } catch (e) {
         sendMessage(id, "❌ *Erro ao salvar gráfico de receitas no Drive:* " + e.message);
         return null;
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao capturar gráfico de receitas:* " + error.message);
      return null;
   }
}

function criarGraficoReceitasGoogleCharts(dados, year) {
   try {
      // Usar Google Charts API para criar gráfico de pizza
      var valores = dados.map(function (d) { return d[1]; });
      var categorias = dados.map(function (d) { return d[0]; });

      // Calcular totais para porcentagens
      var total = valores.reduce(function (a, b) { return a + b; }, 0);

      // Criar URL do gráfico usando Google Charts API
      var chartUrl = "https://chart.googleapis.com/chart?" +
         "cht=p3" + // Gráfico de pizza 3D
         "&chs=600x400" + // Tamanho
         "&chd=t:" + valores.join(',') + // Dados
         "&chl=" + categorias.map(function (cat) { return encodeURIComponent(cat); }).join('|') + // Labels
         "&chtt=Receitas%20" + year + // Título
         "&chco=34A853,4285F4,FBBC05,EA4335,FF6D01,46BDC6,7B1FA2,FF5722,795548,607D8B" + // Cores (verde primeiro para receitas)
         "&chf=bg,s,FFFFFF" + // Fundo branco
         "&chma=0,0,0,0" + // Margens
         "&chdlp=b" + // Posição da legenda
         "&chdls=000000,12" + // Cor e tamanho dos labels
         "&chxt=x,y" + // Eixos
         "&chxl=0:|Total:%20R$%20" + total.toFixed(2) + "|1:|" + year; // Labels dos eixos

      return chartUrl;

   } catch (error) {
      console.error("Erro ao criar gráfico de receitas:", error.message);
      return null;
   }
}

function enviarGraficoCategorias(id) {
   sendMessage(id, "✏️ *Processando gráfico de categorias...*");

   try {
      var dateNow = new Date();
      var year = dateNow.getFullYear();

      // Tentar capturar o gráfico existente da planilha
      var imagemGrafico = capturarGraficoCategorias(id_planilha, year, id);

      if (imagemGrafico) {
         // Se conseguiu capturar o gráfico existente, enviar
         var caption = `Gráfico "Gastos - Categorias" - ${year} - Gráfico atualizado da sua planilha`;
         sendPhoto(id, imagemGrafico, caption);
         return;
      }

      // Se não conseguiu capturar, criar um novo gráfico como fallback
      sendMessage(id, "Gráfico de categorias existente não encontrado. Criando gráfico temporário...");

      // Abrir a planilha de despesas
      var planilha = SpreadsheetApp.openById(id_planilha).getSheetByName("Despesas");

      if (!planilha) {
         sendMessage(id, "❌ *Erro:* Aba 'Despesas' não encontrada na planilha.\n\nPor favor, crie uma aba chamada 'Despesas' com as colunas necessárias.");
         return;
      }

      var dados = planilha.getDataRange().getValues();

      // Filtrar dados do ano atual
      var categorias = {};

      for (var i = 1; i < dados.length; i++) { // Pular cabeçalho
         var dataDespesa = dados[i][1]; // Coluna da data da compra
         var valor = parseFloat(dados[i][3]); // Coluna do valor
         var categoria = dados[i][4]; // Coluna da categoria

         if (dataDespesa && valor && categoria) {
            // Verificar se é do ano atual
            if (typeof dataDespesa === 'string' && dataDespesa.includes('/')) {
               var partesData = dataDespesa.split('/');
               var anoDespesa = parseInt(partesData[2]);

               if (anoDespesa === year) {
                  if (categorias[categoria]) {
                     categorias[categoria] += valor;
                  } else {
                     categorias[categoria] = valor;
                  }
               }
            }
         }
      }

      if (Object.keys(categorias).length === 0) {
         sendMessage(id, "📊 *Nenhuma despesa encontrada para o ano atual.*");
         return;
      }

      // Criar dados para o gráfico
      var dadosGrafico = [];
      for (var cat in categorias) {
         dadosGrafico.push([cat, categorias[cat]]);
      }

      // Ordenar por valor (maior para menor)
      dadosGrafico.sort(function (a, b) {
         return b[1] - a[1];
      });

      // Criar gráfico usando Google Charts como fallback
      var chartUrl = criarGraficoCategoriasGoogleCharts(dadosGrafico, year);

      if (chartUrl) {
         var caption = `Gráfico de Categorias - ${year} - `;
         for (var i = 0; i < dadosGrafico.length; i++) {
            caption += `${dadosGrafico[i][0]}: R$ ${dadosGrafico[i][1].toFixed(2)} | `;
         }

         sendPhoto(id, chartUrl, caption);
      } else {
         sendMessage(id, "❌ *Erro ao gerar o gráfico de categorias. Tente novamente.*");
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao gerar gráfico de categorias:* " + error.message);
   }
}

function capturarGraficoCategorias(idPlanilha, year, id) {
   try {
      var planilha = SpreadsheetApp.openById(idPlanilha);

      // Procurar especificamente na aba "Resumo mensal"
      var abaResumo = planilha.getSheetByName("Resumo mensal");

      if (!abaResumo) {
         sendMessage(id, "Aba 'Resumo mensal' não encontrada");
         return null;
      }

      // Procurar por gráficos na aba
      var graficos = abaResumo.getCharts();

      if (graficos.length === 0) {
         sendMessage(id, "Nenhum gráfico encontrado na aba 'Resumo mensal'");
         return null;
      }

      // Procurar pelo gráfico específico "Gastos - Categorias"
      var graficoEncontrado = null;
      for (var i = 0; i < graficos.length; i++) {
         try {
            var nomeGrafico = graficos[i].getOptions().get('title');
            if (nomeGrafico && nomeGrafico.includes("Gastos - Categorias")) {
               graficoEncontrado = graficos[i];
               break;
            }
         } catch (e) {
            // Se não conseguir pegar o nome, usar o primeiro gráfico
            if (i === 0) {
               graficoEncontrado = graficos[i];
            }
         }
      }

      // Se não encontrou o gráfico específico, usar o primeiro disponível
      if (!graficoEncontrado) {
         graficoEncontrado = graficos[0];
         sendMessage(id, "Gráfico 'Gastos - Categorias' não encontrado, usando primeiro gráfico disponível");
      }

      var grafico = graficoEncontrado;

      // Capturar o gráfico como imagem
      var imagem = grafico.getBlob();

      if (!imagem) {
         sendMessage(id, "Não foi possível capturar a imagem do gráfico de categorias");
         return null;
      }

      // Salvar no Drive e criar link público
      try {
         var nomeArquivo = `grafico_categorias_${year}_${Date.now()}.png`;
         var arquivo = DriveApp.createFile(imagem);
         arquivo.setName(nomeArquivo);

         // Tornar público
         arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

         var url = arquivo.getDownloadUrl();

         return url;

      } catch (e) {
         sendMessage(id, "❌ *Erro ao salvar gráfico de categorias no Drive:* " + e.message);
         return null;
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao capturar gráfico de categorias:* " + error.message);
      return null;
   }
}

function criarGraficoCategoriasGoogleCharts(dados, year) {
   try {
      // Usar Google Charts API para criar gráfico de pizza
      var valores = dados.map(function (d) { return d[1]; });
      var categorias = dados.map(function (d) { return d[0]; });

      // Calcular totais para porcentagens
      var total = valores.reduce(function (a, b) { return a + b; }, 0);

      // Criar URL do gráfico usando Google Charts API
      var chartUrl = "https://chart.googleapis.com/chart?" +
         "cht=p3" + // Gráfico de pizza 3D
         "&chs=600x400" + // Tamanho
         "&chd=t:" + valores.join(',') + // Dados
         "&chl=" + categorias.map(function (cat) { return encodeURIComponent(cat); }).join('|') + // Labels
         "&chtt=Gastos%20por%20Categorias%20" + year + // Título
         "&chco=EA4335,4285F4,FBBC05,34A853,FF6D01,46BDC6,7B1FA2,FF5722,795548,607D8B" + // Cores (vermelho primeiro para gastos)
         "&chf=bg,s,FFFFFF" + // Fundo branco
         "&chma=0,0,0,0" + // Margens
         "&chdlp=b" + // Posição da legenda
         "&chdls=000000,12" + // Cor e tamanho dos labels
         "&chxt=x,y" + // Eixos
         "&chxl=0:|Total:%20R$%20" + total.toFixed(2) + "|1:|" + year; // Labels dos eixos

      return chartUrl;

   } catch (error) {
      console.error("Erro ao criar gráfico de categorias:", error.message);
      return null;
   }
}

function enviarGraficoSemanal(id) {
   sendMessage(id, "✏️ *Processando gráfico semanal...*");

   try {
      var dateNow = new Date();
      var year = dateNow.getFullYear();
      var week = getWeekNumber(dateNow);

      // Tentar capturar o gráfico existente da planilha
      var imagemGrafico = capturarGraficoSemanal(id_planilha, year, week, id);

      if (imagemGrafico) {
         // Se conseguiu capturar o gráfico existente, enviar
         var caption = `Gráfico "Gastos - Apunhado Semanal"`;
         sendPhoto(id, imagemGrafico, caption);
         return;
      }

      // Se não conseguiu capturar, criar um novo gráfico como fallback
      sendMessage(id, "Gráfico semanal existente não encontrado. Criando gráfico temporário...");

      // Abrir a planilha de despesas
      var planilha = SpreadsheetApp.openById(id_planilha).getSheetByName("Despesas");

      if (!planilha) {
         sendMessage(id, "❌ *Erro:* Aba 'Despesas' não encontrada na planilha.\n\nPor favor, crie uma aba chamada 'Despesas' com as colunas necessárias.");
         return;
      }

      var dados = planilha.getDataRange().getValues();

      // Filtrar dados da semana atual
      var categorias = {};

      for (var i = 1; i < dados.length; i++) { // Pular cabeçalho
         var dataDespesa = dados[i][1]; // Coluna da data da compra
         var valor = parseFloat(dados[i][3]); // Coluna do valor
         var categoria = dados[i][4]; // Coluna da categoria

         if (dataDespesa && valor && categoria) {
            // Verificar se é da semana atual
            if (typeof dataDespesa === 'string' && dataDespesa.includes('/')) {
               var partesData = dataDespesa.split('/');
               var diaDespesa = parseInt(partesData[0]);
               var mesDespesa = parseInt(partesData[1]);
               var anoDespesa = parseInt(partesData[2]);

               // Criar objeto Date para a despesa
               var dataDespesaObj = new Date(anoDespesa, mesDespesa - 1, diaDespesa);
               var semanaDespesa = getWeekNumber(dataDespesaObj);

               if (semanaDespesa === week && anoDespesa === year) {
                  if (categorias[categoria]) {
                     categorias[categoria] += valor;
                  } else {
                     categorias[categoria] = valor;
                  }
               }
            }
         }
      }

      if (Object.keys(categorias).length === 0) {
         sendMessage(id, "📊 *Nenhuma despesa encontrada para a semana atual.*");
         return;
      }

      // Criar dados para o gráfico
      var dadosGrafico = [];
      for (var cat in categorias) {
         dadosGrafico.push([cat, categorias[cat]]);
      }

      // Ordenar por valor (maior para menor)
      dadosGrafico.sort(function (a, b) {
         return b[1] - a[1];
      });

      // Criar gráfico usando Google Charts como fallback
      var chartUrl = criarGraficoSemanalGoogleCharts(dadosGrafico, week, year);

      if (chartUrl) {
         var caption = `Gráfico Semanal - Semana ${week} de ${year} - `;
         for (var i = 0; i < dadosGrafico.length; i++) {
            caption += `${dadosGrafico[i][0]}: R$ ${dadosGrafico[i][1].toFixed(2)} | `;
         }

         sendPhoto(id, chartUrl, caption);
      } else {
         sendMessage(id, "❌ *Erro ao gerar o gráfico semanal. Tente novamente.*");
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao gerar gráfico semanal:* " + error.message);
   }
}

function capturarGraficoSemanal(idPlanilha, year, week, id) {
   try {
      var planilha = SpreadsheetApp.openById(idPlanilha);

      // Procurar especificamente na aba "Resumo semanal"
      var abaResumoSemanal = planilha.getSheetByName("Resumo semanal");

      if (!abaResumoSemanal) {
         sendMessage(id, "Aba 'Resumo semanal' não encontrada");
         return null;
      }

      // Procurar por gráficos na aba
      var graficos = abaResumoSemanal.getCharts();

      if (graficos.length === 0) {
         sendMessage(id, "Nenhum gráfico encontrado na aba 'Resumo semanal'");
         return null;
      }

      // Procurar pelo gráfico específico "Gastos - Apunhado Semanal"
      var graficoEncontrado = null;
      for (var i = 0; i < graficos.length; i++) {
         try {
            var nomeGrafico = graficos[i].getOptions().get('title');
            if (nomeGrafico && nomeGrafico.includes("Gastos - Apunhado Semanal")) {
               graficoEncontrado = graficos[i];
               break;
            }
         } catch (e) {
            // Se não conseguir pegar o nome, usar o primeiro gráfico
            if (i === 0) {
               graficoEncontrado = graficos[i];
            }
         }
      }

      // Se não encontrou o gráfico específico, usar o primeiro disponível
      if (!graficoEncontrado) {
         graficoEncontrado = graficos[0];
         sendMessage(id, "Gráfico 'Gastos - Apunhado Semanal' não encontrado, usando primeiro gráfico disponível");
      }

      var grafico = graficoEncontrado;

      // Capturar o gráfico como imagem
      var imagem = grafico.getBlob();

      if (!imagem) {
         sendMessage(id, "Não foi possível capturar a imagem do gráfico semanal");
         return null;
      }

      // Salvar no Drive e criar link público
      try {
         var nomeArquivo = `grafico_semanal_${week}_${year}_${Date.now()}.png`;
         var arquivo = DriveApp.createFile(imagem);
         arquivo.setName(nomeArquivo);

         // Tornar público
         arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

         var url = arquivo.getDownloadUrl();

         return url;

      } catch (e) {
         sendMessage(id, "❌ *Erro ao salvar gráfico semanal no Drive:* " + e.message);
         return null;
      }

   } catch (error) {
      sendMessage(id, "❌ *Erro ao capturar gráfico semanal:* " + error.message);
      return null;
   }
}

function criarGraficoSemanalGoogleCharts(dados, week, year) {
   try {
      // Usar Google Charts API para criar gráfico de pizza
      var valores = dados.map(function (d) { return d[1]; });
      var categorias = dados.map(function (d) { return d[0]; });

      // Calcular totais para porcentagens
      var total = valores.reduce(function (a, b) { return a + b; }, 0);

      // Criar URL do gráfico usando Google Charts API
      var chartUrl = "https://chart.googleapis.com/chart?" +
         "cht=p3" + // Gráfico de pizza 3D
         "&chs=600x400" + // Tamanho
         "&chd=t:" + valores.join(',') + // Dados
         "&chl=" + categorias.map(function (cat) { return encodeURIComponent(cat); }).join('|') + // Labels
         "&chtt=Gastos%20Semana%20" + week + "%20" + year + // Título
         "&chco=EA4335,4285F4,FBBC05,34A853,FF6D01,46BDC6,7B1FA2,FF5722,795548,607D8B" + // Cores (vermelho primeiro para gastos)
         "&chf=bg,s,FFFFFF" + // Fundo branco
         "&chma=0,0,0,0" + // Margens
         "&chdlp=b" + // Posição da legenda
         "&chdls=000000,12" + // Cor e tamanho dos labels
         "&chxt=x,y" + // Eixos
         "&chxl=0:|Total:%20R$%20" + total.toFixed(2) + "|1:|Semana%20" + week + "%20" + year; // Labels dos eixos

      return chartUrl;

   } catch (error) {
      console.error("Erro ao criar gráfico semanal:", error.message);
      return null;
   }
}

function getWeekNumber(date) {
   // Função para calcular o número da semana do ano
   var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
   var dayNum = d.getUTCDay() || 7;
   d.setUTCDate(d.getUTCDate() + 4 - dayNum);
   var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
   return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function buscarCategoriasExistentes(idPlanilha) {
   try {
      // Abrir a planilha de despesas
      var planilha = SpreadsheetApp.openById(idPlanilha).getSheetByName("Despesas");

      if (!planilha) {
         console.error("Aba 'Despesas' não encontrada na planilha");
         return null;
      }

      // Buscar dados da planilha
      var dados = planilha.getDataRange().getValues();

      if (dados.length <= 1) {
         // Apenas cabeçalho ou planilha vazia
         return [];
      }

      // Criar um Set para armazenar categorias únicas (coluna 4 - índice 4)
      var categoriasUnicas = new Set();

      // Pular o cabeçalho (linha 0) e processar todas as linhas de dados
      for (var i = 1; i < dados.length; i++) {
         var categoria = dados[i][4]; // Coluna da categoria (índice 4)

         // Verificar se a categoria existe e não está vazia
         if (categoria && categoria.toString().trim() !== '') {
            categoriasUnicas.add(categoria.toString().trim());
         }
      }

      // Converter Set para Array e ordenar alfabeticamente
      var categoriasArray = Array.from(categoriasUnicas);
      categoriasArray.sort();

      return categoriasArray;

   } catch (error) {
      console.error("Erro ao buscar categorias:", error.message);
      return null;
   }
}

function formatarCategoria(categoria) {
   try {
      if (!categoria || typeof categoria !== 'string') {
         return categoria;
      }

      // Remover espaços extras no início e fim
      var categoriaLimpa = categoria.trim();

      if (categoriaLimpa === '') {
         return categoriaLimpa;
      }

      // Converter para minúsculas
      var categoriaMinuscula = categoriaLimpa.toLowerCase();

      // Primeira letra maiúscula
      var primeiraLetra = categoriaMinuscula.charAt(0).toUpperCase();
      var restoPalavra = categoriaMinuscula.slice(1);

      return primeiraLetra + restoPalavra;

   } catch (error) {
      console.error("Erro ao formatar categoria:", error.message);
      return categoria; // Retorna original em caso de erro
   }
}

function buscarGastosDoMes(idPlanilha, mes) {
   try {
      // Abrir a planilha de despesas
      var planilha = SpreadsheetApp.openById(idPlanilha).getSheetByName("Despesas");

      if (!planilha) {
         console.error("Aba 'Despesas' não encontrada na planilha");
         return null;
      }

      // Buscar dados da planilha
      var dados = planilha.getDataRange().getValues();

      console.log(`Buscando gastos do mês ${mes}. Dados da planilha: ${dados.length} linhas encontradas`);
      if (dados.length > 1) {
         console.log(`Cabeçalho: ${JSON.stringify(dados[0])}`);
         console.log(`Primeira linha de dados: ${JSON.stringify(dados[1])}`);
         console.log(`Estrutura esperada - Data=${dados[1][1]}, Desc=${dados[1][2]}, Valor=${dados[1][3]}, Cat=${dados[1][4]}`);

         // Verificar todas as colunas para identificar a estrutura real
         for (var col = 0; col < dados[1].length; col++) {
            console.log(`Coluna ${col}: ${dados[1][col]}`);
         }
      }

      if (dados.length <= 1) {
         // Apenas cabeçalho ou planilha vazia
         return [];
      }

      var gastos = [];
      var anoAtual = new Date().getFullYear();

      // Identificar as colunas corretas baseado no cabeçalho
      var colunaData = -1;
      var colunaDescricao = -1;
      var colunaValor = -1;
      var colunaCategoria = -1;

      if (dados.length > 0) {
         var cabecalho = dados[0];
         for (var j = 0; j < cabecalho.length; j++) {
            var nomeColunaLower = cabecalho[j].toString().toLowerCase();
            if (nomeColunaLower.includes('data') && nomeColunaLower.includes('compra')) {
               colunaData = j;
            } else if (nomeColunaLower.includes('descrição') || nomeColunaLower.includes('descricao')) {
               colunaDescricao = j;
            } else if (nomeColunaLower.includes('valor') && nomeColunaLower.includes('despesa')) {
               colunaValor = j;
            } else if (nomeColunaLower.includes('categoria')) {
               colunaCategoria = j;
            }
         }

         console.log(`Colunas identificadas: Data=${colunaData}, Descrição=${colunaDescricao}, Valor=${colunaValor}, Categoria=${colunaCategoria}`);

         // Fallback para as posições padrão se não conseguir identificar
         if (colunaData === -1) colunaData = 1;
         if (colunaDescricao === -1) colunaDescricao = 2;
         if (colunaValor === -1) colunaValor = 3;
         if (colunaCategoria === -1) colunaCategoria = 4;
      }

      // Pular o cabeçalho (linha 0) e processar todas as linhas de dados
      for (var i = 1; i < dados.length; i++) {
         var dataDespesa = dados[i][colunaData]; // Coluna "Data da compra"
         var descricao = dados[i][colunaDescricao]; // Coluna "Descrição"
         var valor = parseFloat(dados[i][colunaValor]); // Coluna "Valor da Despesa"
         var categoria = dados[i][colunaCategoria]; // Coluna "Categoria"

         if (dataDespesa && !isNaN(valor) && categoria) {
            // Verificar se é do mês especificado
            if (typeof dataDespesa === 'string' && dataDespesa.includes('/')) {
               var partesData = dataDespesa.split('/');
               if (partesData.length === 3) {
                  var diaDespesa = parseInt(partesData[0]);
                  var mesDespesa = parseInt(partesData[1]);
                  var anoDespesa = parseInt(partesData[2]);

                  if (mesDespesa === mes && anoDespesa === anoAtual && !isNaN(diaDespesa)) {
                     console.log(`✅ Adicionando gasto do mês: ${descricao} - R$${valor} - ${categoria} (${dataDespesa})`);
                     gastos.push({
                        data: dataDespesa,
                        descricao: descricao.toString().trim(),
                        valor: valor,
                        categoria: categoria.toString().trim()
                     });
                  }
               }
            } else if (dataDespesa instanceof Date) {
               // Se a data for um objeto Date
               var mesDespesa = dataDespesa.getMonth() + 1;
               var anoDespesa = dataDespesa.getFullYear();

               if (mesDespesa === mes && anoDespesa === anoAtual) {
                  var dataFormatada = dataDespesa.getDate().toString().padStart(2, '0') + '/' +
                     (dataDespesa.getMonth() + 1).toString().padStart(2, '0') + '/' +
                     dataDespesa.getFullYear();

                  console.log(`✅ Adicionando gasto do mês (Date): ${descricao} - R$${valor} - ${categoria} (${dataFormatada})`);
                  gastos.push({
                     data: dataFormatada,
                     descricao: descricao.toString().trim(),
                     valor: valor,
                     categoria: categoria.toString().trim()
                  });
               }
            }
         }
      }

      console.log(`Total de gastos encontrados no mês ${mes}: ${gastos.length}`);

      // Ordenar por data (mais recente primeiro) com validação robusta
      gastos.sort(function (a, b) {
         try {
            var partesA = a.data.split('/');
            var partesB = b.data.split('/');

            if (partesA.length !== 3 || partesB.length !== 3) {
               return 0; // Se não conseguir processar, manter ordem original
            }

            var dataA = new Date(parseInt(partesA[2]), parseInt(partesA[1]) - 1, parseInt(partesA[0]));
            var dataB = new Date(parseInt(partesB[2]), parseInt(partesB[1]) - 1, parseInt(partesB[0]));

            return dataB - dataA;
         } catch (error) {
            console.error("Erro na ordenação de gastos do mês:", error);
            return 0;
         }
      });

      console.log(`Gastos do mês ${mes} retornados após ordenação: ${gastos.length}`);
      return gastos;

   } catch (error) {
      console.error("Erro ao buscar gastos do mês:", error.message);
      return null;
   }
}

function buscarGastosPorCategoria(idPlanilha, categoria) {
   try {
      // Abrir a planilha de despesas
      var planilha = SpreadsheetApp.openById(idPlanilha).getSheetByName("Despesas");

      if (!planilha) {
         console.error("Aba 'Despesas' não encontrada na planilha");
         return null;
      }

      // Buscar dados da planilha
      var dados = planilha.getDataRange().getValues();

      if (dados.length <= 1) {
         // Apenas cabeçalho ou planilha vazia
         return [];
      }

      var gastos = [];

      // Identificar as colunas corretas baseado no cabeçalho
      var colunaData = -1;
      var colunaDescricao = -1;
      var colunaValor = -1;
      var colunaCategoria = -1;

      if (dados.length > 0) {
         var cabecalho = dados[0];
         for (var j = 0; j < cabecalho.length; j++) {
            var nomeColunaLower = cabecalho[j].toString().toLowerCase();
            if (nomeColunaLower.includes('data') && nomeColunaLower.includes('compra')) {
               colunaData = j;
            } else if (nomeColunaLower.includes('descrição') || nomeColunaLower.includes('descricao')) {
               colunaDescricao = j;
            } else if (nomeColunaLower.includes('valor') && nomeColunaLower.includes('despesa')) {
               colunaValor = j;
            } else if (nomeColunaLower.includes('categoria')) {
               colunaCategoria = j;
            }
         }

         console.log(`Colunas identificadas para categoria "${categoria}": Data=${colunaData}, Descrição=${colunaDescricao}, Valor=${colunaValor}, Categoria=${colunaCategoria}`);

         // Fallback para as posições padrão se não conseguir identificar
         if (colunaData === -1) colunaData = 1;
         if (colunaDescricao === -1) colunaDescricao = 2;
         if (colunaValor === -1) colunaValor = 3;
         if (colunaCategoria === -1) colunaCategoria = 4;
      }

      // Pular o cabeçalho (linha 0) e processar todas as linhas de dados
      for (var i = 1; i < dados.length; i++) {
         var dataDespesa = dados[i][colunaData]; // Coluna "Data da compra"
         var descricao = dados[i][colunaDescricao]; // Coluna "Descrição"
         var valor = parseFloat(dados[i][colunaValor]); // Coluna "Valor da Despesa"
         var categoriaDespesa = dados[i][colunaCategoria]; // Coluna "Categoria"

         if (dataDespesa && !isNaN(valor) && categoriaDespesa) {
            // Verificar se a categoria corresponde (case-insensitive)
            if (categoriaDespesa.toString().toLowerCase().trim() === categoria.toLowerCase().trim()) {
               var dataFormatada = dataDespesa;

               // Se a data for um objeto Date, converter para string
               if (dataDespesa instanceof Date) {
                  dataFormatada = dataDespesa.getDate().toString().padStart(2, '0') + '/' +
                     (dataDespesa.getMonth() + 1).toString().padStart(2, '0') + '/' +
                     dataDespesa.getFullYear();
               }

               console.log(`✅ Adicionando gasto por categoria: ${descricao} - R$${valor} - ${categoriaDespesa} (${dataFormatada})`);
               gastos.push({
                  data: dataFormatada,
                  descricao: descricao.toString().trim(),
                  valor: valor,
                  categoria: categoriaDespesa.toString().trim()
               });
            }
         }
      }

      console.log(`Total de gastos encontrados para categoria "${categoria}": ${gastos.length}`);

      // Ordenar por data (mais recente primeiro) com validação robusta
      gastos.sort(function (a, b) {
         try {
            var partesA = a.data.split('/');
            var partesB = b.data.split('/');

            if (partesA.length !== 3 || partesB.length !== 3) {
               return 0; // Se não conseguir processar, manter ordem original
            }

            var dataA = new Date(parseInt(partesA[2]), parseInt(partesA[1]) - 1, parseInt(partesA[0]));
            var dataB = new Date(parseInt(partesB[2]), parseInt(partesB[1]) - 1, parseInt(partesB[0]));

            return dataB - dataA;
         } catch (error) {
            console.error("Erro na ordenação de gastos por categoria:", error);
            return 0;
         }
      });

      console.log(`Gastos da categoria "${categoria}" retornados após ordenação: ${gastos.length}`);
      return gastos;

   } catch (error) {
      console.error("Erro ao buscar gastos por categoria:", error.message);
      return null;
   }
}

function buscarGastosPorCategoriaNoMes(idPlanilha, mes, categoria) {
   try {
      // Abrir a planilha de despesas
      var planilha = SpreadsheetApp.openById(idPlanilha).getSheetByName("Despesas");

      if (!planilha) {
         console.error("Aba 'Despesas' não encontrada na planilha");
         return null;
      }

      // Buscar dados da planilha
      var dados = planilha.getDataRange().getValues();

      if (dados.length <= 1) {
         // Apenas cabeçalho ou planilha vazia
         return [];
      }

      var gastos = [];
      var anoAtual = new Date().getFullYear();

      // Identificar as colunas corretas baseado no cabeçalho
      var colunaData = -1;
      var colunaDescricao = -1;
      var colunaValor = -1;
      var colunaCategoria = -1;

      if (dados.length > 0) {
         var cabecalho = dados[0];
         for (var j = 0; j < cabecalho.length; j++) {
            var nomeColunaLower = cabecalho[j].toString().toLowerCase();
            if (nomeColunaLower.includes('data') && nomeColunaLower.includes('compra')) {
               colunaData = j;
            } else if (nomeColunaLower.includes('descrição') || nomeColunaLower.includes('descricao')) {
               colunaDescricao = j;
            } else if (nomeColunaLower.includes('valor') && nomeColunaLower.includes('despesa')) {
               colunaValor = j;
            } else if (nomeColunaLower.includes('categoria')) {
               colunaCategoria = j;
            }
         }

         console.log(`Colunas identificadas para categoria "${categoria}" no mês ${mes}: Data=${colunaData}, Descrição=${colunaDescricao}, Valor=${colunaValor}, Categoria=${colunaCategoria}`);

         // Fallback para as posições padrão se não conseguir identificar
         if (colunaData === -1) colunaData = 1;
         if (colunaDescricao === -1) colunaDescricao = 2;
         if (colunaValor === -1) colunaValor = 3;
         if (colunaCategoria === -1) colunaCategoria = 4;
      }

      // Pular o cabeçalho (linha 0) e processar todas as linhas de dados
      for (var i = 1; i < dados.length; i++) {
         var dataDespesa = dados[i][colunaData]; // Coluna "Data da compra"
         var descricao = dados[i][colunaDescricao]; // Coluna "Descrição"
         var valor = parseFloat(dados[i][colunaValor]); // Coluna "Valor da Despesa"
         var categoriaDespesa = dados[i][colunaCategoria]; // Coluna "Categoria"

         if (dataDespesa && !isNaN(valor) && categoriaDespesa) {
            var mesDespesa = null;
            var anoDespesa = null;
            var dataFormatada = dataDespesa;

            // Verificar se é do mês especificado e da categoria especificada
            if (typeof dataDespesa === 'string' && dataDespesa.includes('/')) {
               var partesData = dataDespesa.split('/');
               if (partesData.length === 3) {
                  var diaDespesa = parseInt(partesData[0]);
                  mesDespesa = parseInt(partesData[1]);
                  anoDespesa = parseInt(partesData[2]);

                  if (isNaN(diaDespesa) || isNaN(mesDespesa) || isNaN(anoDespesa)) {
                     continue; // Pular se a data não for válida
                  }
               } else {
                  continue; // Pular se o formato da data não for válido
               }
            } else if (dataDespesa instanceof Date) {
               // Se a data for um objeto Date
               mesDespesa = dataDespesa.getMonth() + 1;
               anoDespesa = dataDespesa.getFullYear();

               dataFormatada = dataDespesa.getDate().toString().padStart(2, '0') + '/' +
                  (dataDespesa.getMonth() + 1).toString().padStart(2, '0') + '/' +
                  dataDespesa.getFullYear();
            } else {
               continue; // Pular se não conseguir processar a data
            }

            if (mesDespesa === mes && anoDespesa === anoAtual &&
               categoriaDespesa.toString().toLowerCase().trim() === categoria.toLowerCase().trim()) {
               console.log(`✅ Adicionando gasto por categoria no mês: ${descricao} - R$${valor} - ${categoriaDespesa} (${dataFormatada})`);
               gastos.push({
                  data: dataFormatada,
                  descricao: descricao.toString().trim(),
                  valor: valor,
                  categoria: categoriaDespesa.toString().trim()
               });
            }
         }
      }

      console.log(`Total de gastos encontrados para categoria "${categoria}" no mês ${mes}: ${gastos.length}`);

      // Ordenar por data (mais recente primeiro) com validação robusta
      gastos.sort(function (a, b) {
         try {
            var partesA = a.data.split('/');
            var partesB = b.data.split('/');

            if (partesA.length !== 3 || partesB.length !== 3) {
               return 0; // Se não conseguir processar, manter ordem original
            }

            var dataA = new Date(parseInt(partesA[2]), parseInt(partesA[1]) - 1, parseInt(partesA[0]));
            var dataB = new Date(parseInt(partesB[2]), parseInt(partesB[1]) - 1, parseInt(partesB[0]));

            return dataB - dataA;
         } catch (error) {
            console.error("Erro na ordenação de gastos por categoria no mês:", error);
            return 0;
         }
      });

      console.log(`Gastos da categoria "${categoria}" no mês ${mes} retornados após ordenação: ${gastos.length}`);
      return gastos;

   } catch (error) {
      console.error("Erro ao buscar gastos por categoria no mês:", error.message);
      return null;
   }
}

function processarGastosDoMes(id, textoMensagem) {
   try {
      // Formato esperado: "despesas mês MÊS" ou "gastos mês MÊS"
      var partes = textoMensagem.split(' ');

      if (partes.length < 3) {
         sendMessage(id, "❌ *Erro:* Formato inválido. Use: `despesas mês MÊS`\n\n*Exemplo:* `despesas mês 12`");
         return;
      }

      var mes = parseInt(partes[2]);

      // Validar mês
      if (isNaN(mes) || mes < 1 || mes > 12) {
         sendMessage(id, "❌ *Erro:* Mês inválido. Use um número de 1 a 12.\n\n*Exemplo:* Janeiro = 1, Dezembro = 12");
         return;
      }

      // Buscar gastos do mês
      var gastos = buscarGastosDoMes(id_planilha, mes);

      console.log(`Processando gastos do mês ${mes}. Gastos encontrados: ${gastos ? gastos.length : 'null'}`);

      if (gastos && gastos.length > 0) {
         var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

         var anoAtual = new Date().getFullYear();
         var totalMes = gastos.reduce(function (total, gasto) { return total + gasto.valor; }, 0);

         var mensagem = `📊 *Despesas de ${nomesMeses[mes]} ${anoAtual}*\n\n`;
         mensagem += `*Total do mês:* R$ ${totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

         for (var i = 0; i < gastos.length; i++) {
            var gasto = gastos[i];
            mensagem += `📅 *${gasto.data}*\n`;
            mensagem += `💬 ${gasto.descricao}\n`;
            mensagem += `💰 R$ ${gasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
            mensagem += `🏷️ ${gasto.categoria}\n\n`;
         }

         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         sendMessage(id, mensagem, opcoes);
      } else {
         var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

         var anoAtual = new Date().getFullYear();

         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         sendMessage(id, `📊 *Despesas de ${nomesMeses[mes]} ${anoAtual}*\n\nNenhuma despesa encontrada para este mês.`, opcoes);
      }

   } catch (error) {
      sendMessage(id, `❌ *Erro ao buscar gastos:* ${error.message}\n\nVerifique se a planilha está acessível e tente novamente.`);
   }
}

function processarGastosPorCategoria(id, textoMensagem) {
   try {
      // Formato esperado: "despesas categoria NOME_CATEGORIA" ou "gastos categoria NOME_CATEGORIA"
      var partes = textoMensagem.split(' ');
      var categoria = partes.slice(2).join(' ').trim();

      if (!categoria) {
         sendMessage(id, "❌ *Erro:* Formato inválido. Use: `despesas categoria NOME_CATEGORIA`\n\n*Exemplo:* `despesas categoria Comida`");
         return;
      }

      // Buscar gastos da categoria
      var gastos = buscarGastosPorCategoria(id_planilha, categoria);

      if (gastos && gastos.length > 0) {
         var totalCategoria = gastos.reduce(function (total, gasto) { return total + gasto.valor; }, 0);

         var mensagem = `🏷️ *Despesas da Categoria: ${categoria}*\n\n`;
         mensagem += `*Total da categoria:* R$ ${totalCategoria.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

         for (var i = 0; i < gastos.length; i++) {
            var gasto = gastos[i];
            mensagem += `📅 *${gasto.data}*\n`;
            mensagem += `💬 ${gasto.descricao}\n`;
            mensagem += `💰 R$ ${gasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
         }

         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         sendMessage(id, mensagem, opcoes);
      } else {
         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         sendMessage(id, `🏷️ *Despesas da Categoria: ${categoria}*\n\nNenhuma despesa encontrada para esta categoria.\n\n*Dica:* Use o comando 'categorias' para ver as categorias disponíveis.`, opcoes);
      }

   } catch (error) {
      sendMessage(id, `❌ *Erro ao buscar gastos por categoria:* ${error.message}\n\nVerifique se a planilha está acessível e tente novamente.`);
   }
}

function processarGastosPorCategoriaNoMes(id, textoMensagem) {
   try {
      // Formato esperado: "despesas categoria MÊS NOME_CATEGORIA" ou "gastos categoria MÊS NOME_CATEGORIA"
      var partes = textoMensagem.split(' ');

      if (partes.length < 4) {
         sendMessage(id, "❌ *Erro:* Formato inválido. Use: `despesas categoria MÊS NOME_CATEGORIA`\n\n*Exemplo:* `despesas categoria 12 Comida`");
         return;
      }

      var mes = parseInt(partes[2]);
      var categoria = partes.slice(3).join(' ').trim();

      // Validar mês
      if (isNaN(mes) || mes < 1 || mes > 12) {
         sendMessage(id, "❌ *Erro:* Mês inválido. Use um número de 1 a 12.\n\n*Exemplo:* Janeiro = 1, Dezembro = 12");
         return;
      }

      if (!categoria) {
         sendMessage(id, "❌ *Erro:* Categoria não informada. Use: `despesas categoria MÊS NOME_CATEGORIA`\n\n*Exemplo:* `despesas categoria 12 Comida`");
         return;
      }

      // Buscar gastos da categoria no mês
      var gastos = buscarGastosPorCategoriaNoMes(id_planilha, mes, categoria);

      if (gastos && gastos.length > 0) {
         var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

         var anoAtual = new Date().getFullYear();
         var totalCategoriaMes = gastos.reduce(function (total, gasto) { return total + gasto.valor; }, 0);

         var mensagem = `📈 *Despesas da Categoria: ${categoria} - ${nomesMeses[mes]} ${anoAtual}*\n\n`;
         mensagem += `*Total da categoria no mês:* R$ ${totalCategoriaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

         for (var i = 0; i < gastos.length; i++) {
            var gasto = gastos[i];
            mensagem += `📅 *${gasto.data}*\n`;
            mensagem += `💬 ${gasto.descricao}\n`;
            mensagem += `💰 R$ ${gasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
         }

         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         sendMessage(id, mensagem, opcoes);
      } else {
         var nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

         var anoAtual = new Date().getFullYear();

         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "➕ Adicionar Despesa",
                  "callback_data": "adicionar_despesa"
               }],
               [{
                  "text": "📊 Listar Despesas do Mês",
                  "callback_data": "listar_gastos_mes"
               }],
               [{
                  "text": "🏷️ Listar Despesas por Categoria",
                  "callback_data": "listar_gastos_categoria"
               }],
               [{
                  "text": "📈 Despesas por Categoria no Mês",
                  "callback_data": "listar_gastos_categoria_mes"
               }],
               [{
                  "text": "📋 Ver Categorias",
                  "callback_data": "categorias"
               }],
               [{
                  "text": "🔙 Voltar ao Menu",
                  "callback_data": "ajuda"
               }]
            ]
         }

         sendMessage(id, `📈 *Despesas da Categoria: ${categoria} - ${nomesMeses[mes]} ${anoAtual}*\n\nNenhuma despesa encontrada para esta categoria neste mês.`, opcoes);
      }

   } catch (error) {
      sendMessage(id, `❌ *Erro ao buscar gastos por categoria no mês:* ${error.message}\n\nVerifique se a planilha está acessível e tente novamente.`);
   }
}

function verificarECriarColunaCategoria(idPlanilha, categoria, id) {
   try {
      // Abrir a planilha "Resumo mensal"
      var planilhaResumo = SpreadsheetApp.openById(idPlanilha).getSheetByName("Resumo mensal");

      if (!planilhaResumo) {
         sendMessage(id, "❌ *Debug:* Aba 'Resumo mensal' não encontrada na planilha");
         return;
      }

      // Buscar dados da planilha
      var dados = planilhaResumo.getDataRange().getValues();

      if (dados.length === 0) {
         sendMessage(id, "❌ *Debug:* Planilha 'Resumo mensal' está vazia");
         return;
      }

      var cabecalho = dados[0];
      var categoriaExiste = false;
      var colunaExistente = -1;

      // Verificar se a categoria já existe no cabeçalho
      for (var i = 0; i < cabecalho.length; i++) {
         if (cabecalho[i] && cabecalho[i].toString().trim() === categoria.trim()) {
            categoriaExiste = true;
            colunaExistente = i;
            break;
         }
      }

      // Se a categoria não existe, criar nova coluna
      if (!categoriaExiste) {
         sendMessage(id, `🔧 *Debug:* Criando nova coluna para categoria: ${categoria}`);

         // Encontrar a coluna "Total Gasto" para inserir antes dela
         var colunaTotalGasto = -1;
         for (var j = 0; j < cabecalho.length; j++) {
            var nomeColunaLower = cabecalho[j].toString().toLowerCase();
            if (nomeColunaLower.includes('total') && nomeColunaLower.includes('gasto')) {
               colunaTotalGasto = j;
               break;
            }
         }

         // Se não encontrar "Total Gasto", usar a última coluna
         if (colunaTotalGasto === -1) {
            colunaTotalGasto = cabecalho.length;
            sendMessage(id, `⚠️ *Debug:* Coluna "Total Gasto" não encontrada, inserindo na última posição`);
         }

         // Posição onde inserir a nova categoria (antes do Total Gasto)
         var posicaoInsercao = colunaTotalGasto + 1; // +1 porque as colunas começam em 1 no Google Sheets

         sendMessage(id, `🔧 *Debug:* Inserindo categoria "${categoria}" na coluna ${posicaoInsercao} (antes do Total Gasto)`);

         // Inserir nova coluna na posição correta
         planilhaResumo.insertColumnBefore(posicaoInsercao);

         // Adicionar o cabeçalho da categoria na primeira linha
         planilhaResumo.getRange(1, posicaoInsercao).setValue(categoria);

         // Aplicar cor ao cabeçalho da nova categoria
         var corCategoria = obterCorParaCategoria(planilhaResumo, categoria, id);
         planilhaResumo.getRange(1, posicaoInsercao).setBackground(corCategoria);
         planilhaResumo.getRange(1, posicaoInsercao).setFontWeight("bold");

         // Verificar se a cor foi aplicada corretamente
         var corAplicada = planilhaResumo.getRange(1, posicaoInsercao).getBackground();
         console.log(`Cor aplicada na coluna ${posicaoInsercao}: ${corAplicada} (esperada: ${corCategoria})`);

         // Aplicar a fórmula para cada mês (linhas 2 a 13 - Janeiro a Dezembro)
         for (var mes = 2; mes <= 13; mes++) {
            // Identificar a coluna com as datas dos meses (geralmente coluna B)
            var colunaMes = "B"; // Assumindo que as datas dos meses estão na coluna B

            // Identificar as colunas da aba Despesas
            var colunaValores = "D"; // Coluna de valores na aba Despesas
            var colunaDatas = "B";   // Coluna de datas na aba Despesas  
            var colunaCategorias = "E"; // Coluna de categorias na aba Despesas

            // Converter número da coluna para letra (A=1, B=2, etc.)
            var colunaCategoria = String.fromCharCode(65 + posicaoInsercao - 1);

            // Fórmula baseada no exemplo fornecido: =SUMIFS(Despesas!$D$1:$D; Despesas!$B$1:$B; ">="&$B7; Despesas!$B$1:$B; "<"&(EOMONTH($B7; 0)+1); Despesas!$E$1:$E; "="&L$1)
            // Adaptando para nossa estrutura:
            var formula = `=SUMIFS(Despesas!$${colunaValores}$1:$${colunaValores}; Despesas!$${colunaDatas}$1:$${colunaDatas}; ">="&$${colunaMes}$${mes}; Despesas!$${colunaDatas}$1:$${colunaDatas}; "<"&(EOMONTH($${colunaMes}$${mes}; 0)+1); Despesas!$${colunaCategorias}$1:$${colunaCategorias}; "="&$${colunaCategoria}$1)`;

            planilhaResumo.getRange(mes, posicaoInsercao).setFormula(formula);
         }

         // Adicionar fórmula de soma total do ano na linha 15
         var colunaCategoria = String.fromCharCode(65 + posicaoInsercao - 1);
         var formulaTotal = `=SUM($${colunaCategoria}$2:$${colunaCategoria}$13)`;
         planilhaResumo.getRange(15, posicaoInsercao).setFormula(formulaTotal);

         sendMessage(id, `🔧 *Debug:* Fórmula de total anual adicionada na linha 15: ${formulaTotal}`);

         sendMessage(id, `✅ *Debug:* Coluna criada com sucesso para categoria: ${categoria} na coluna ${colunaCategoria} com cor ${corCategoria}`);

         // Verificar se a cor foi realmente aplicada
         Utilities.sleep(1000); // Aguardar 1 segundo para a cor ser aplicada
         var corVerificada = planilhaResumo.getRange(1, posicaoInsercao).getBackground();
         if (corVerificada !== corCategoria) {
            console.log(`⚠️ Cor não foi aplicada corretamente. Esperada: ${corCategoria}, Aplicada: ${corVerificada}`);
            // Tentar aplicar novamente
            planilhaResumo.getRange(1, posicaoInsercao).setBackground(corCategoria);
         }

         // Recriar o gráfico "Gastos - Categorias" (gráfico de pizza) com os totais
         recriarGraficoGastosCategorias(idPlanilha, id);
      } else {
         sendMessage(id, `ℹ️ *Debug:* Categoria ${categoria} já existe no Resumo mensal na coluna ${colunaExistente + 1}`);
      }

   } catch (error) {
      sendMessage(id, `❌ *Debug - Erro ao verificar/criar coluna de categoria:* ${error.message}`);
   }
}

function processarReceita(id, dadosReceita) {
   try {
      // Formato esperado: [data, categoria, descricao, valor]
      var data = dadosReceita[0].trim();
      var categoria = dadosReceita[1].trim();
      var descricao = dadosReceita[2].trim();
      var valor = parseFloat(dadosReceita[3].replace(',', '.'));

      // Validar valor
      if (isNaN(valor) || valor <= 0) {
         sendMessage(id, "❌ *Erro:* Valor inválido. Use um número maior que zero.");
         return;
      }

      // Validar data se fornecida
      if (data && data.includes('/') && !validarData(data)) {
         sendMessage(id, "❌ *Data inválida!*\n\nPor favor, informe a receita novamente no formato:\n`Data - Categoria - Descrição - Valor`\n\n*Exemplo:* `15/12/2024 - Trabalho - Salário - 3000,00`");
         return;
      }

      // Se não foi fornecida data, usar data atual
      if (!data || !data.includes('/')) {
         data = dateNow_sem_hora();
      }

      // Formatar data e hora atual
      var dateNow = new Date();
      var day = String(dateNow.getDate()).padStart(2, '0');
      var month = String(dateNow.getMonth() + 1).padStart(2, '0');
      var year = dateNow.getFullYear();
      var hours = String(dateNow.getHours()).padStart(2, '0');
      var minutes = String(dateNow.getMinutes()).padStart(2, '0');
      var seconds = String(dateNow.getSeconds()).padStart(2, '0');

      var data_hora = day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;

      // Adicionar receita na planilha
      var planilha = SpreadsheetApp.openById(id_planilha).getSheetByName("Receitas");

      if (!planilha) {
         sendMessage(id, "❌ *Erro:* Aba 'Receitas' não encontrada na planilha.\n\nPor favor, crie uma aba chamada 'Receitas' com as colunas necessárias.");
         return;
      }

      planilha.appendRow([data_hora, data, categoria, descricao, valor]);

      var opcoes = {
         "inline_keyboard": [
            [{
               "text": "💰 Orçamento",
               "callback_data": "orcamento"
            }],
            [{
               "text": "📝 Despesas",
               "callback_data": "despesas"
            }],
            [{
               "text": "Adicionar Receita",
               "callback_data": "receita"
            }],
            [{
               "text": "📊 Gráficos",
               "callback_data": "graficos"
            }]
         ]
      }

      sendMessage(id, `✅ *Receita Adicionada com Sucesso!*\n\n*Descrição:* ${descricao}\n*Valor:* R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Categoria:* ${categoria}`, opcoes);

   } catch (error) {
      sendMessage(id, `❌ *Erro ao adicionar receita:* ${error.message}\n\nVerifique se a planilha está acessível e tente novamente.`);
   }
}

function obterCorParaCategoria(planilha, categoria, id) {
   try {
      // Paleta de cores pastéis que funcionam bem com texto preto
      var coresDisponiveis = [
         "#E8F5E8", // Verde pastel muito claro
         "#F0F8FF", // Azul pastel muito claro (Alice Blue)
         "#FFF0F5", // Rosa pastel muito claro (Lavender Blush)
         "#F0FFF0", // Verde pastel muito claro (Honeydew)
         "#FFF8DC", // Amarelo pastel muito claro (Cornsilk)
         "#F5F5DC", // Bege pastel (Beige)
         "#E6E6FA", // Lavanda pastel (Lavender)
         "#FFE4E1", // Rosa pastel (Misty Rose)
         "#E0FFFF", // Ciano pastel (Light Cyan)
         "#F5F5F5", // Cinza muito claro
         "#FFFACD", // Amarelo pastel (Lemon Chiffon)
         "#E6F3FF", // Azul pastel (Light Blue)
         "#F0E6FF", // Roxo pastel muito claro
         "#E6FFE6", // Verde pastel (Light Green)
         "#FFE6E6", // Rosa pastel (Light Pink)
         "#E6E6FF", // Azul pastel (Light Blue)
         "#FFFFE6", // Amarelo pastel (Light Yellow)
         "#E6FFFF", // Ciano pastel (Light Cyan)
         "#FFE6F0", // Rosa pastel (Light Pink)
         "#F8F8FF", // Branco fantasma (Ghost White)
         "#FAF0E6", // Linen (Linho)
         "#FDF5E6", // Old Lace (Renda Antiga)
         "#F0F8FF", // Alice Blue
         "#F5FFFA", // Mint Cream (Creme de Menta)
         "#FFF5EE", // Seashell (Concha)
         "#F8F4FF", // Lavanda muito claro
         "#F0FFF0", // Honeydew
         "#FFF0F5", // Lavender Blush
         "#F0FFFF", // Azure (Azul Céu)
         "#FFF8DC", // Cornsilk
         "#F5F5DC", // Beige
         "#E6F3FF", // Azul céu pastel
         "#F0E6FF", // Roxo pastel muito claro
         "#E6FFE6", // Verde pastel
         "#FFE6E6", // Rosa pastel
         "#E6E6FF", // Azul pastel
         "#FFFFE6", // Amarelo pastel
         "#E6FFFF", // Ciano pastel
         "#FFE6F0", // Rosa pastel
         "#F8F8FF", // Branco fantasma
         "#FAF0E6", // Linho
         "#FDF5E6", // Renda antiga
         "#F5FFFA", // Creme de menta
         "#FFF5EE", // Concha
         "#F8F4FF", // Lavanda muito claro
         "#F0FFFF", // Azure
         "#E6F7FF", // Azul bebê muito claro
         "#F7E6FF", // Roxo bebê muito claro
         "#E6FFF7", // Verde água muito claro
         "#FFE6F7", // Rosa bebê muito claro
         "#E6F0FF", // Azul bebê
         "#FFF7E6", // Amarelo bebê muito claro
         "#E6FFFF", // Ciano bebê
         "#FFE6E6", // Rosa bebê
         "#F0F0FF", // Azul fantasma
         "#F0FFF0", // Verde fantasma
         "#FFF0F0", // Rosa fantasma
         "#FFFFF0", // Amarelo fantasma
         "#F0FFFF", // Ciano fantasma
         "#E8F4F8", // Azul gelo
         "#F8E8F4", // Rosa gelo
         "#F4F8E8", // Verde gelo
         "#F8F4E8", // Amarelo gelo
         "#E8F8F4", // Verde água gelo
         "#F4E8F8", // Roxo gelo
         "#FFE6CC", // Pêssego pastel
         "#E6F0FF", // Azul bebê
         "#F0E6FF", // Roxo bebê
         "#E6FFE6", // Verde bebê
         "#FFE6F0", // Rosa bebê
         "#E6E6FF", // Azul bebê
         "#FFFFE6", // Amarelo bebê
         "#E6FFFF", // Ciano bebê
         "#F8F0FF", // Lavanda bebê
         "#F0FFF0", // Verde menta
         "#FFF0F5", // Rosa bebê
         "#F0FFFF", // Azul céu
         "#FFF8DC", // Amarelo creme
         "#F5F5DC", // Bege
         "#E6F3FF", // Azul céu pastel
         "#F0E6FF", // Roxo pastel
         "#E6FFE6", // Verde pastel
         "#FFE6E6", // Rosa pastel
         "#E6E6FF", // Azul pastel
         "#FFFFE6", // Amarelo pastel
         "#E6FFFF", // Ciano pastel
         "#F8F8FF", // Branco fantasma
         "#FAF0E6", // Linho
         "#FDF5E6", // Renda antiga
         "#F5FFFA", // Creme de menta
         "#FFF5EE", // Concha
         "#F8F4FF", // Lavanda muito claro
         "#E6F7FF", // Azul bebê muito claro
         "#F7E6FF", // Roxo bebê muito claro
         "#E6FFF7", // Verde água muito claro
         "#FFE6F7", // Rosa bebê muito claro
         "#E6F0FF", // Azul bebê
         "#FFF7E6", // Amarelo bebê muito claro
         "#F0F0FF", // Azul fantasma
         "#E8F4F8", // Azul gelo
         "#F8E8F4", // Rosa gelo
         "#F4F8E8", // Verde gelo
         "#F8F4E8", // Amarelo gelo
         "#E8F8F4", // Verde água gelo
         "#F4E8F8"  // Roxo gelo
      ];

      // Escolher cor aleatória da paleta
      var indiceAleatorio = Math.floor(Math.random() * coresDisponiveis.length);
      var corSelecionada = coresDisponiveis[indiceAleatorio];

      sendMessage(id, `🎨 *Cor Aleatória Selecionada:*\nCategoria: ${categoria}\nCor: ${corSelecionada}\nÍndice: ${indiceAleatorio + 1}/${coresDisponiveis.length}`);

      return corSelecionada;

   } catch (error) {
      sendMessage(id, `❌ *Erro ao obter cor:* ${error.message}`);
      // Cor padrão em caso de erro
      return "#F0F8FF";
   }
}

function recriarGraficoGastosCategorias(idPlanilha, id) {
   try {
      sendMessage(id, `🔄 *Debug:* Recriando gráfico "Gastos - Categorias"...`);

      // Abrir a planilha "Resumo mensal"
      var planilhaResumo = SpreadsheetApp.openById(idPlanilha).getSheetByName("Resumo mensal");
      if (!planilhaResumo) {
         sendMessage(id, "❌ *Debug:* Aba 'Resumo mensal' não encontrada para recriar gráfico de categorias");
         return;
      }

      // Buscar dados da planilha
      var dados = planilhaResumo.getDataRange().getValues();
      if (dados.length === 0) {
         sendMessage(id, "❌ *Debug:* Planilha 'Resumo mensal' está vazia para recriar gráfico de categorias");
         return;
      }

      var cabecalho = dados[0];

      // Encontrar a coluna "Total Gasto" (zero-based index)
      var colunaTotalGasto = -1;
      for (var j = 0; j < cabecalho.length; j++) {
         var nomeColunaLower = cabecalho[j].toString().toLowerCase();
         if (nomeColunaLower.includes('total') && nomeColunaLower.includes('gasto')) {
            colunaTotalGasto = j;
            break;
         }
      }
      if (colunaTotalGasto === -1) {
         sendMessage(id, "❌ *Debug:* Coluna 'Total Gasto' não encontrada para recriar gráfico de categorias");
         return;
      }

      // Construir o range: categorias na linha 1, valores na linha 15, começando em C
      var colunaInicio = 3; // Coluna C (1-based)
      var numColunas = colunaTotalGasto - (colunaInicio - 1);
      if (numColunas <= 0) {
         sendMessage(id, "❌ *Debug:* Não há colunas de categorias antes da coluna 'Total Gasto'");
         return;
      }

      var intervaloCategorias = planilhaResumo.getRange(1, colunaInicio, 1, numColunas);
      var intervaloValores = planilhaResumo.getRange(15, colunaInicio, 1, numColunas);

      sendMessage(id, `🔧 *Debug:* Ranges preparados: categorias ${intervaloCategorias.getA1Notation()} valores ${intervaloValores.getA1Notation()}`);

      // Remover gráficos anteriores com título correspondente
      var graficos = planilhaResumo.getCharts();
      for (var k = 0; k < graficos.length; k++) {
         try {
            var nomeGrafico = graficos[k].getOptions().get('title');
            if (nomeGrafico && nomeGrafico.includes("Gastos - Categorias")) {
               planilhaResumo.removeChart(graficos[k]);
               sendMessage(id, `🗑️ *Debug:* Gráfico existente "Gastos - Categorias" removido`);
               // continua removendo todos que coincidirem
            }
         } catch (e) {
            // ignorar erros ao ler opções
         }
      }

      // Montar o builder genérico com os dois ranges e instruções de merge/transpose
      var builder = planilhaResumo.newChart()
         .addRange(intervaloCategorias)
         .addRange(intervaloValores)
         .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_ROWS) // combina verticalmente
         .setTransposeRowsAndColumns(true)                      // transpõe para ter colunas Categoria | Valor
         .setNumHeaders(0)                                     // trata a primeira linha como cabeçalho
         .setPosition(18, 10, 0, 0)
         .setOption('title', 'Gastos - Categorias')
         .setOption('width', 500)
         .setOption('height', 400)
         .setOption('pieSliceText', 'percentage')
         .setOption('pieHole', 0.4);

      // Tentar usar o builder específico de PIE para garantir legenda;
      // se falhar, usar fallback com setOption('legend', ...)
      var novoGrafico;
      try {
         novoGrafico = builder.asPieChart()                       // converte para Pie builder
            .setLegendPosition(Charts.Position.RIGHT) // método específico para posição da legenda
            .build();
      } catch (e) {
         // fallback (alguns ambientes podem não expor setLegendPosition)
         sendMessage(id, `⚠️ *Debug:* setLegendPosition falhou, usando fallback setOption('legend', ...) — ${e.message}`);
         novoGrafico = builder
            .setOption('legend', { position: 'right' })
            .build();
      }

      planilhaResumo.insertChart(novoGrafico);

      sendMessage(id, `✅ *Debug:* Gráfico "Gastos - Categorias" recriado com sucesso!`);
   } catch (error) {
      sendMessage(id, `❌ *Debug - Erro ao recriar gráfico de categorias:* ${error.message}`);
   }
}




