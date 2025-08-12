
//CONFIGURAÇÕES ---------------------------------------------------------------------------------------------
var token = '8285623012:AAHn7EA6EkYSr4e1_2OOf_yLQ8k4XOaj2Qw';
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
         parse_mode: "HTML",
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
      } else if (textoMensagem == "orçamento") {
         // Simular o comando de orçamento
         var dateNow = new Date();
         var month = parseInt(String(dateNow.getMonth() + 1).padStart(2, '0'));
         var year = dateNow.getFullYear();

         var planilha_resumo_mensal = SpreadsheetApp.openById(id_planilha).getSheetByName("Resumo mensal");
         var orcamento = planilha_resumo_mensal.getDataRange().getCell((parseInt(month + 1)), 14).getValue();
         var orcamento_sobrando = planilha_resumo_mensal.getDataRange().getCell((parseInt(month + 1)), 15).getValue();

         sendMessage(id, `*Orçamento* ${month}/${year}: R$ ${orcamento} *Orçamento sobrando*: ${orcamento_sobrando}`);
         return;
      } else if (textoMensagem == "categorias") {
         sendMessage(id, "Contas, Planos mensais, Diversão, Comida, Farmácia, Autocuidado, Outro, Transporte, Viagem, Presentes, Comida");
         return;
      }

   } else {
      var id = contents.message.from.id;
      var textoMensagem = contents.message.text;
      textoMensagem = textoMensagem.toLowerCase().trim();
   }

   sendMessage(id, "Processando...");




   if (textoMensagem == "ajuda") {

      var opcoes = {
         "inline_keyboard": [
            [{
               "text": "Orçamento",
               "callback_data": "orçamento"
            }],
            [{
               "text": "Adicionar Gasto",
               "callback_data": "gasto"
            }],
            [{
               "text": "Categorias",
               "callback_data": "categorias"
            }],
            [{
               "text": "Gráfico Mensal",
               "callback_data": "grafico_mensal"
            }]
         ]
      }


      sendMessage(id, "**Comandos** :", opcoes);
   } else if (textoMensagem == 'categorias') {
      sendMessage(id, "Contas, Planos mensais, Diversão, Comida, Farmácia, Autocuidado, Outro, Transporte, Viagem, Presentes, Comida");
   } else if (textoMensagem == "orçamento" || textoMensagem == "visualizar orçamento") {

      var dateNow = new Date();

      // Pega os componentes da data
      var month = parseInt(String(dateNow.getMonth() + 1).padStart(2, '0')); // Mês começa em 0
      var year = dateNow.getFullYear();

      //(mes+1) pois a coluna 1 é o cabeçalho "Mês" da tabela, invés de "Janeiro", desse modo: Coluna 2 - Janeiro, Coluna 3 - Fevereiro.... Coluna 13 - Dezembro
      var planilha_resumo_mensal = SpreadsheetApp.openById(id_planilha).getSheetByName("Resumo mensal");

      var orcamento = planilha_resumo_mensal.getDataRange().getCell((parseInt(month + 1)), 14).getValue();
      var orcamento_sobrando = planilha_resumo_mensal.getDataRange().getCell((parseInt(month + 1)), 15).getValue();

      sendMessage(id, `*Orçamento* ${month}/${year}: R$ ${orcamento} *Orçamento sobrando*: ${orcamento_sobrando}`);
   } else if (textoMensagem == "gráfico mensal" || textoMensagem == "grafico mensal" || textoMensagem == "grafico") {
      enviarGraficoMensal(id);
   } else {
      if (textoMensagem.includes('-')) {
         textoMensagemAux = textoMensagem.split('-');

         var despesa = [];
         var data_compra_inserida_mensagem = true;
         var data = textoMensagemAux[0].trim();

         if (!(data.includes('/'))) {
            despesa['data_compra'] = dateNow_sem_hora();
            data_compra_inserida_mensagem = false;

         } else if (!validarData(data)) {
            sendMessage(id, "Data da compra inválida, por favor informe a despesa novamente _Data da compra_ - _Descrição_ - _Valor R$_ - _Categoria_");
         } else {
            despesa['data_compra'] = data;
         }



         if (!data_compra_inserida_mensagem) {
            despesa['descricao'] = textoMensagemAux[0].trim();
            despesa['valor'] = textoMensagemAux[1].trim();
            despesa['categoria'] = textoMensagemAux[2].trim();
         } else {
            despesa['descricao'] = textoMensagemAux[1].trim();
            despesa['valor'] = textoMensagemAux[2].trim();
            despesa['categoria'] = textoMensagemAux[3].trim();
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



         var opcoes = {
            "inline_keyboard": [
               [{
                  "text": "Orçamento",
                  "callback_data": "orçamento"
               }],
               [{
                  "text": "Categorias",
                  "callback_data": "categorias"
               }]
            ]
         }

         sendMessage(id, `Gasto ${descricao} adicionado`, opcoes);
      } else {
         sendMessage(id, "(Data da compra) - (Descrição) - (Valor R$) - (Categoria)");
      }
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
   try {
      var dateNow = new Date();
      var month = dateNow.getMonth() + 1;
      var year = dateNow.getFullYear();

      // Tentar primeiro capturar o gráfico existente da planilha
      var imagemGrafico = capturarGraficoExistente(id_planilha, month, year);

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
         sendMessage(id, "Nenhuma despesa encontrada para o mês atual.");
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
         sendMessage(id, "Erro ao gerar o gráfico. Tente novamente.");
      }

   } catch (error) {
      sendMessage(id, "Erro ao gerar gráfico: " + error.message);
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
      sendMessage(id, "Erro ao criar gráfico: " + error.message);
      return null;
   }
}

function capturarGraficoExistente(idPlanilha, month, year) {
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
         sendMessage(id, "Erro ao salvar no Drive: " + e.message);
         return null;
      }

   } catch (error) {
      sendMessage(id, "Erro ao capturar gráfico existente: " + error.message);
      return null;
   }
}
