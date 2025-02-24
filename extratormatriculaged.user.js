// ==UserScript==
// @name          Extrator Dados Matrícula
// @version       1.4.0
// @description   Consulta e salva dados de contato dos alunos do sigeduca.
// @author        Roberson Arruda
// @match	      https://*.seduc.mt.gov.br/ged/hwmgedmanutencaomatricula.aspx*
// @match	      http://*.seduc.mt.gov.br/ged/hwmgedmanutencaomatricula.aspx*
// @copyright     2025, Roberson Arruda (robersonarruda@outlook.com)
// @grant         none
// ==/UserScript==


//CARREGA libJquery
var libJquery = document.createElement('script');
libJquery.src = 'https://code.jquery.com/jquery-3.4.0.min.js';
libJquery.language='javascript';
libJquery.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(libJquery);

//CSS DOS BOTÕES
var styleSCT = document.createElement('style');
styleSCT.type = 'text/css';
styleSCT.innerHTML =
'.botaoSCT {'+
'	-moz-box-shadow:inset 1px 1px 0px 0px #b2ced4;'+
'	-webkit-box-shadow:inset 1px 1px 0px 0px #b2ced4;'+
'	box-shadow:inset 1px 1px 0px 0px #b2ced4;'+
'	background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #4e88ed), color-stop(1, #3255c7) );'+
'	background:-moz-linear-gradient( center top, #4e88ed 5%, #3255c7 100% );'+
'	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#4e88ed", endColorstr="#3255c7");'+
'	background-color:#4e88ed;'+
'	-moz-border-radius:4px;'+
'	-webkit-border-radius:4px;'+
'	border-radius:4px;'+
'	border:1px solid #102b4d;'+
'	display:inline-block;'+
'	color:#ffffff;'+
'	font-family:Trebuchet MS;'+
'	font-size:11px;'+
'	font-weight:bold;'+
'	padding:2px 0px;'+
'	width:152px;'+
'	text-decoration:none;'+
'	text-shadow:1px 1px 0px #100d29;'+
'}.botaoSCT:hover {'+
'	background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #3255c7), color-stop(1, #4e88ed) );'+
'	background:-moz-linear-gradient( center top, #3255c7 5%, #4e88ed 100% );'+
'	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#3255c7", endColorstr="#4e88ed");'+
'	background-color:#3255c7;'+
'}.botaoSCT:active {'+
'	position:relative;'+
'	top:1px;}'+
'.menuSCT{'+
'	-moz-border-radius:4px;'+
'	-webkit-border-radius:4px;'+
'	border-radius:4px;'+
'	border:1px solid #102b4d;}'
document.getElementsByTagName('head')[0].appendChild(styleSCT);


//Dados de metadados do script
const scriptName = GM_info.script.name; // Obtém o valor de @name
const scriptVersion = GM_info.script.version; // Obtém o valor de @version

//Variáveis
var vetAluno = [0];
var n = 0;
var a = "";
var cabecalho="";
var nomealuno="";
var grupoSocial = "";

//FUNÇÃO SALVAR CONTEÚDO EM CSV
function saveTextAsFile() {
    var conteudo = document.getElementById("txtDados").value; //P Retirar acentos utilize =>> .normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    var a = document.createElement('a');
    a.href = 'data:text/csv;base64,' + btoa(conteudo);
    a.download = 'dadosGED.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function coletarDadosAlunos(vetAluno) {
    vetAluno = [0];
    vetAluno = txtareaAluno.value.match(/[0-9]+/g).filter(Boolean);

    let matCodAntigo = "0"; // Inicializa com "0"
    let nomeAntigo = "0";
    txtareaDados.value = "Código; Nome do Aluno; Matriz; Turma; Rede de Origem; Observação\n";

    function esperarCarregarElemento(idElemento, valorAntigo, tentativas = 20, intervalo = 100) {
        return new Promise((resolve, reject) => {
            let contador = 0;
            let verificar = setInterval(() => {
                let elemento = document.getElementById(idElemento);
                if (elemento && elemento.innerText.trim() !== "" && elemento.innerText.trim() !== valorAntigo) {
                    clearInterval(verificar);
                    resolve(elemento.innerText.trim());
                    return;
                }
                contador++;
                if (contador >= tentativas) {
                    clearInterval(verificar);
                    reject("Erro ao consultar aluno");
                }
            }, intervalo);
        });
    }

    for (let i = 0; i < vetAluno.length; i++) {
        let codigo = vetAluno[i];
        document.getElementById('vGEDALUCOD').value = codigo;
        document.getElementById('vGEDALUCOD').onblur();
        // Adiciona um tempo de 10ms antes de executar o clique
        setTimeout(function() {
            document.getElementsByName('BCONSULTAR')[0].click();
        }, 50);

        try {
            let matCodAtual = await esperarCarregarElemento("span_vGEDMATCOD_0001", matCodAntigo);
            let nomeAtual = await esperarCarregarElemento("span_vGEDMATCOD_0001", nomeAntigo);
            let nomeAluno = document.getElementById("span_vGEDALUNOM")?.innerText || "N/A";
            let matrizTurma = document.getElementById("span_vGRIDGEDMATDISCGERMATMSC_0001")?.innerText || "N/A";
            let turmaAluno = document.getElementById("span_vGERTURSAL_0001")?.innerText || "N/A"
            let selectElem = document.getElementById("vGEDMATTIPOORIGEMMAT_0001");
            let tipoOrigemMat = selectElem ? selectElem.options[selectElem.selectedIndex]?.text || "N/A" : "N/A";
            txtareaDados.value += `${codigo.trim()}; ${nomeAluno.trim()}; ${matrizTurma.trim()}; ${turmaAluno.trim()}; ${tipoOrigemMat.trim()}\n`;

            matCodAntigo = matCodAtual; // Atualiza o código para próxima verificação
        } catch (error) {
            console.error(error);
            let nomeAluno = document.getElementById("span_vGEDALUNOM")?.innerText || "N/A";
            txtareaDados.value += `${codigo.trim()}; ${nomeAluno.trim()}; N/A; N/A; N/A; Aluno não matriculado ou código inexistente, verifique\n`;
        }
    }

    alert("Consulta finalizada!"); // Exibe alerta ao concluir
}





//BOTÃO EXIBIR ou MINIMIZAR
var exibir = '$("#credito1").slideToggle();if(this.value=="MINIMIZAR"){this.value="ABRIR"}else{this.value="MINIMIZAR"}';
var btnExibir = document.createElement('input');
    btnExibir.setAttribute('type','button');
    btnExibir.setAttribute('id','exibir1');
    btnExibir.setAttribute('value','MINIMIZAR');
    btnExibir.setAttribute('class','menuSCT');
    btnExibir.setAttribute('style','background:#FF3300; width: 187px; border: 1px solid rgb(0, 0, 0); position: fixed; z-index: 2002; bottom: 0px; right: 30px;');
    btnExibir.setAttribute('onmouseover', 'this.style.backgroundColor = "#FF7A00"');
    btnExibir.setAttribute('onmouseout', 'this.style.backgroundColor = "#FF3300"');
    btnExibir.setAttribute('onmousedown', 'this.style.backgroundColor = "#EB8038"');
    btnExibir.setAttribute('onmouseup', 'this.style.backgroundColor = "#FF7A00"');
    btnExibir.setAttribute('onclick', exibir);
document.getElementsByTagName('body')[0].appendChild(btnExibir);

//DIV principal (corpo)
var divCredit = document.createElement('div');
    divCredit.setAttribute('id','credito1');
    divCredit.setAttribute('name','credito2');
    divCredit.setAttribute('class','menuSCT');
    divCredit.setAttribute('style','background: #ffeca9; color: #000; width: 380px; text-align: center;font-weight: bold;position: fixed;z-index: 2002;padding: 5px 0px 0px 5px;bottom: 24px;right: 30px;height: 400px;');
document.getElementsByTagName('body')[0].appendChild(divCredit);

//Iframe
var ifrIframe1 = document.createElement("iframe");
ifrIframe1.setAttribute("id","iframe1");
ifrIframe1.setAttribute("src","about:blank");
ifrIframe1.setAttribute("style","height: 100px; width: 355px; display:none");
divCredit.appendChild(ifrIframe1);

//TEXTO CÓDIGO ALUNO
var textCodAluno = document.createTextNode("INFORME OS CÓDIGOS DOS ALUNOS");
divCredit.appendChild(textCodAluno);

//textarea alunos a serem pesquisados
var txtareaAluno = document.createElement('TEXTAREA');
txtareaAluno.setAttribute('name','txtAluno');
txtareaAluno.setAttribute('id','txtAluno');
txtareaAluno.setAttribute('value','');
txtareaAluno.setAttribute('style','border:1px solid #000000;width: 355px;height: 82px; resize: none');
txtareaAluno.setAttribute('onclick','this.select()');
divCredit.appendChild(txtareaAluno);

//DIV NIS1
var divNIS = document.createElement('div');
divNIS.setAttribute('id','divNIS1');
divNIS.setAttribute('name','divNIS2');
divCredit.appendChild(divNIS);

//BOTÃO COLETAR DADOS PESSOAIS
var btnColetar1 = document.createElement('input');
btnColetar1.setAttribute('type','button');
btnColetar1.setAttribute('name','btnColetar1');
btnColetar1.setAttribute('value','Extrair dados Matricula"');
btnColetar1.setAttribute('class','botaoSCT');
divCredit.appendChild(btnColetar1);
btnColetar1.onclick = function(){coletarDadosAlunos(vetAluno);};

//QUEBRA LINHA
var quebraLinha1 = document.createElement("br");
divCredit.appendChild(quebraLinha1);
quebraLinha1 = document.createElement("br");
divCredit.appendChild(quebraLinha1);

//TEXTO INFORMAÇÕES EXTRAÍDAS
var textColetados = document.createTextNode("INFORMAÇÕES EXTRAÍDAS");
divCredit.appendChild(textColetados);

//textarea pra dados coletados
var txtareaDados = document.createElement('TEXTAREA');
txtareaDados.setAttribute('name','txtDados');
txtareaDados.setAttribute('id','txtDados');
txtareaDados.setAttribute('value','');
txtareaDados.setAttribute('style','border:1px solid #000000;width: 355px;height: 150px; resize: none');
txtareaDados.setAttribute('onclick','this.select()');
txtareaDados.readOnly = true;
divCredit.appendChild(txtareaDados);

//BOTAO SALVAR EM TXT
var btnSalvarTxt = document.createElement('input');
btnSalvarTxt.setAttribute('type','button');
btnSalvarTxt.setAttribute('name','btnSalvarTxt');
btnSalvarTxt.setAttribute('value','Salvar em CSV(Excel)');
btnSalvarTxt.setAttribute('class','botaoSCT');
divCredit.appendChild(btnSalvarTxt);
btnSalvarTxt.onclick = saveTextAsFile;

//DIV CREDITO
var divCredito = document.createElement('div');
divCredit.appendChild(divCredito);

var br1 = document.createElement('br');
divCredito.appendChild(br1);

var span1 = document.createElement('span');
span1.innerHTML = '>>Roberson Arruda<<';
divCredito.appendChild(span1);

br1 = document.createElement('br');
span1.appendChild(br1);

span1 = document.createElement('span');
span1.innerHTML = '(robersonarruda@outlook.com)';
divCredito.appendChild(span1);

br1 = document.createElement('br');
span1.appendChild(br1);

span1 = document.createElement('span');
span1.textContent = `${scriptName} v${scriptVersion}`
divCredito.appendChild(span1);
