// ---------- Calculando Aliquota de Imposto de Renda Basead nos dias ----------
function getAliquotaIR() {
  const selectedOptionText =
    document.getElementById("periodo").options[
      document.getElementById("periodo").selectedIndex
    ].text;

  if (selectedOptionText.startsWith("180 dias")) return 0.225; // 22.5%
  if (selectedOptionText.startsWith("181 dias")) return 0.2; // 20%
  if (selectedOptionText.startsWith("360 dias")) return 0.2; // 20%
  if (selectedOptionText.startsWith("361 dias")) return 0.175; // 17.5%
  if (selectedOptionText.startsWith("540 dias")) return 0.175; // 17.5%
  if (selectedOptionText.startsWith("720 dias")) return 0.175; // 17.5%
  return 0.15; // 15%
}

// ---------- Convertendo Taxa de Juros Anual para Mensal ----------
function taxaAnualParaMensal(taxaAnual) {
  return Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

// ---------- Convertendo Taxa de Juros Mensal para Anual ----------
function taxaMensalParaAnual(taxaMensal) {
  return Math.pow(1 + taxaMensal, 12) - 1;
}

// ---------- Calculando Montantes Finais ----------
function calcularResultados() {
  let aliquotaIR = getAliquotaIR();
  let tipoInvestimento = document.getElementById("tipoinvestimento").value;

  if (tipoInvestimento === "cdi") {
    let cdiAcumulado =
      parseFloat(document.getElementById("cdiacumulado").value) / 100;
    let cdiBrutoPercentual =
      parseFloat(document.getElementById("bruto").value) / 100;
    let cdiLiquidoPercentual =
      parseFloat(document.getElementById("liquido").value) / 100;
    bruto = cdiAcumulado * cdiBrutoPercentual;
    liquido = cdiAcumulado * cdiLiquidoPercentual;
  } else if (tipoInvestimento === "ipca") {
    let ipcaAcumulado =
      parseFloat(document.getElementById("ipcaacumulado").value) / 100;
    bruto =
      parseFloat(document.getElementById("bruto").value) / 100 + ipcaAcumulado;
    liquido =
      parseFloat(document.getElementById("liquido").value) / 100 +
      ipcaAcumulado;
  } else {
    bruto = parseFloat(document.getElementById("bruto").value) / 100;
    liquido = parseFloat(document.getElementById("liquido").value) / 100;
  }

  let brutoMensal = taxaAnualParaMensal(bruto);
  let liquidoMensal = taxaAnualParaMensal(liquido);

  let valorInvestido = parseFloat(
    document.getElementById("valorInvestido").value
  );
  let periodo = parseInt(document.getElementById("periodo").value);

  // Calculando para taxa bruta
  let montanteBruto = valorInvestido * Math.pow(1 + brutoMensal, periodo);
  let rendimentoBruto = montanteBruto - valorInvestido;
  let impostoSobreRendimento = rendimentoBruto * aliquotaIR;
  let montanteFinalBruto = montanteBruto - impostoSobreRendimento;

  // Calculando para taxa liquida
  let montanteLiquido = valorInvestido * Math.pow(1 + liquidoMensal, periodo);

  // Atualizando campos de resultado
  document.getElementById("montanteBruto").textContent =
    montanteBruto.toFixed(2);
  document.getElementById("resultadoBruto").textContent =
    montanteFinalBruto.toFixed(2);
  document.getElementById("descontoIR").textContent =
    impostoSobreRendimento.toFixed(2);
  document.getElementById("resultadoLiquido").textContent =
    montanteLiquido.toFixed(2);
}
calcularTaxaLiquida();
calcularResultados();

// Adicionando event listeners para campos de entrada
document.getElementById("bruto").addEventListener("input", calcularResultados);
document
  .getElementById("liquido")
  .addEventListener("input", calcularResultados);
document
  .getElementById("valorInvestido")
  .addEventListener("input", calcularResultados);
document
  .getElementById("periodo")
  .addEventListener("change", calcularResultados);

// ---------- Escolhe qual taxa a ser calculada de forma apropriada ----------
function calcularTaxaEquivalente() {
  let isBrutoInputEnabled = !document.getElementById("bruto").disabled;

  if (isBrutoInputEnabled) {
    calcularTaxaLiquida();
  } else {
    calcularTaxaBruta();
  }

  calcularResultados();
}
document
  .getElementById("bruto")
  .addEventListener("input", calcularTaxaEquivalente);
document
  .getElementById("liquido")
  .addEventListener("input", calcularTaxaEquivalente);
document
  .getElementById("periodo")
  .addEventListener("change", calcularTaxaEquivalente);

// ---------- Calculando taxa líquida ----------
function calcularTaxaLiquida() {
  let aliquotaIR = getAliquotaIR();

  let tipoInvestimento = document.getElementById("tipoinvestimento").value;
  let brutoAnual;

  if (tipoInvestimento === "cdi") {
    let cdiAcumulado =
      parseFloat(document.getElementById("cdiacumulado").value) / 100;
    let cdiPercentual =
      parseFloat(document.getElementById("bruto").value) / 100;
    brutoAnual = cdiAcumulado * cdiPercentual;
  } else if (tipoInvestimento === "ipca") {
    let ipcaAcumulado =
      parseFloat(document.getElementById("ipcaacumulado").value) / 100;
    brutoAnual =
      parseFloat(document.getElementById("bruto").value) / 100 + ipcaAcumulado;
  } else {
    brutoAnual = parseFloat(document.getElementById("bruto").value) / 100;
  }

  // Convertendo a taxa bruta anual para mensal
  let brutoMensal = taxaAnualParaMensal(brutoAnual);

  let valorInvestido = parseFloat(
    document.getElementById("valorInvestido").value
  );
  let periodo = parseInt(document.getElementById("periodo").value);

  // Definindo um intervalo inicial para taxa líquida (estes valores podem ser ajustados conforme necessário)
  let lowerBound = 0;
  let upperBound = 1;

  let montanteBruto = valorInvestido * Math.pow(1 + brutoMensal, periodo);
  let rendimentoBruto = montanteBruto - valorInvestido;
  let impostoSobreRendimento = rendimentoBruto * aliquotaIR;
  let montanteFinalBruto = montanteBruto - impostoSobreRendimento;

  for (let i = 0; i < 1000; i++) {
    let liquidoMensalEstimado = (upperBound + lowerBound) / 2; // ponto médio
    let montanteLiquido =
      valorInvestido * Math.pow(1 + liquidoMensalEstimado, periodo);

    if (Math.abs(montanteFinalBruto - montanteLiquido) < 0.01) break; // Condição de parada

    if (montanteLiquido < montanteFinalBruto) {
      lowerBound = liquidoMensalEstimado;
    } else {
      upperBound = liquidoMensalEstimado;
    }
  }

  // Convertendo a taxa líquida mensal estimada de volta para anual
  let liquidoAnualEstimado = taxaMensalParaAnual((upperBound + lowerBound) / 2);

  // Se o tipo de investimento for CDI, calcular a taxa líquida como uma porcentagem do CDI acumulado
  if (tipoInvestimento === "cdi") {
    let cdiAcumulado =
      parseFloat(document.getElementById("cdiacumulado").value) / 100;
    let percentualDoCDI = (liquidoAnualEstimado / cdiAcumulado) * 100;
    document.getElementById("liquido").value = percentualDoCDI.toFixed(3);
  } else if (tipoInvestimento === "ipca") {
    let ipcaAcumulado =
      parseFloat(document.getElementById("ipcaacumulado").value) / 100;
    let resultadoSemIPCA = (liquidoAnualEstimado - ipcaAcumulado) * 100;
    document.getElementById("liquido").value = resultadoSemIPCA.toFixed(4);
  } else {
    document.getElementById("liquido").value = (
      liquidoAnualEstimado * 100
    ).toFixed(4);
  }
}

// ---------- Calculando taxa bruta ----------
function calcularTaxaBruta() {
  let aliquotaIR = getAliquotaIR();

  let tipoInvestimento = document.getElementById("tipoinvestimento").value;
  let liquidoAnual;

  if (tipoInvestimento === "cdi") {
    let cdiAcumulado =
      parseFloat(document.getElementById("cdiacumulado").value) / 100;
    let percentualDoCDI =
      parseFloat(document.getElementById("liquido").value) / 100;
    liquidoAnual = cdiAcumulado * percentualDoCDI;
  } else if (tipoInvestimento === "ipca") {
    let ipcaAcumulado =
      parseFloat(document.getElementById("ipcaacumulado").value) / 100;
    liquidoAnual =
      parseFloat(document.getElementById("liquido").value) / 100 +
      ipcaAcumulado;
  } else {
    liquidoAnual = parseFloat(document.getElementById("liquido").value) / 100;
  }

  // Convertendo a taxa líquida anual para mensal
  let liquidoMensal = taxaAnualParaMensal(liquidoAnual);

  let valorInvestido = parseFloat(
    document.getElementById("valorInvestido").value
  );
  let periodo = parseInt(document.getElementById("periodo").value);

  // Definindo um intervalo inicial para taxa bruta
  let lowerBound = 0;
  let upperBound = 1;

  let montanteLiquido = valorInvestido * Math.pow(1 + liquidoMensal, periodo);

  for (let i = 0; i < 1000; i++) {
    let brutoMensalEstimado = (upperBound + lowerBound) / 2; // ponto médio
    let montanteBruto =
      valorInvestido * Math.pow(1 + brutoMensalEstimado, periodo);
    let rendimentoBruto = montanteBruto - valorInvestido;
    let impostoSobreRendimento = rendimentoBruto * aliquotaIR;
    let montanteFinalBruto = montanteBruto - impostoSobreRendimento;

    if (Math.abs(montanteFinalBruto - montanteLiquido) < 0.01) break; // Condição de parada

    if (montanteFinalBruto < montanteLiquido) {
      lowerBound = brutoMensalEstimado;
    } else {
      upperBound = brutoMensalEstimado;
    }
  }

  // Convertendo a taxa bruta mensal estimada de volta para anual
  let brutoAnualEstimado = taxaMensalParaAnual((upperBound + lowerBound) / 2);

  // Se o tipo de investimento for CDI, calcular a taxa bruta como uma porcentagem do CDI acumulado
  if (tipoInvestimento === "cdi") {
    let cdiAcumulado =
      parseFloat(document.getElementById("cdiacumulado").value) / 100;
    let percentualDoCDI = (brutoAnualEstimado / cdiAcumulado) * 100;
    document.getElementById("bruto").value = percentualDoCDI.toFixed(4);
  } else if (tipoInvestimento === "ipca") {
    let ipcaAcumulado =
      parseFloat(document.getElementById("ipcaacumulado").value) / 100;
    let resultadoSemIPCA = (brutoAnualEstimado - ipcaAcumulado) * 100;
    document.getElementById("bruto").value = resultadoSemIPCA.toFixed(4);
  } else {
    document.getElementById("bruto").value = (brutoAnualEstimado * 100).toFixed(
      4
    );
  }
}

// ---------- Atualizar Campo de IR ----------
function atualizarCampoIR() {
  const aliquota = getAliquotaIR();
  console.log(aliquota);
  // converter a alíquota para porcentagem e formatar para duas casas decimais
  document.getElementById("ir").value = (aliquota * 100).toFixed(1) + " %";
}
atualizarCampoIR();
document.getElementById("periodo").addEventListener("change", atualizarCampoIR);

// ---------- SELEÇÃO DE INVESTIMENTO ----------
document.addEventListener("DOMContentLoaded", function () {
  let tipoInvestimento = document.getElementById("tipoinvestimento");
  let cdiField = document.getElementById("cdiacumulado").parentNode;
  let ipcaField = document.getElementById("ipcaacumulado").parentNode;
  let cdiFields = document.querySelectorAll(".cdivalue");
  let ipcaFields = document.querySelectorAll(".ipcavalue");

  // Função para verificar e mostrar/ocultar os campos CDI e IPCA
  function checkFields() {
    // Primeiro, ocultamos tudo
    cdiField.style.display = "none";
    ipcaField.style.display = "none";

    // Variáveis de verificação
    let isCDI = tipoInvestimento.value === "cdi";
    let isIPCA = tipoInvestimento.value === "ipca";

    if (isCDI) {
      cdiField.style.display = "block";
    } else if (isIPCA) {
      ipcaField.style.display = "block";
    }

    cdiFields.forEach((field) => {
      field.style.display = isCDI ? "inline" : "none";
    });

    ipcaFields.forEach((field) => {
      field.style.display = isIPCA ? "inline" : "none";
    });
  }

  // Ouça as mudanças no select
  tipoInvestimento.addEventListener("change", checkFields);

  // Verifique o valor inicial no carregamento da página
  checkFields();
});

// ---------- Adicionando event listener aos campos ----------
document.getElementById("cdiacumulado").addEventListener("input", function () {
  calcularResultados();
  calcularTaxaEquivalente();
});
document
  .getElementById("tipoinvestimento")
  .addEventListener("change", function () {
    calcularResultados();
    calcularTaxaEquivalente();
  });

// ---------- Slider Listener ----------
$(document).on("change", "#taxaSwitch", function (e) {
  let isChecked = e.target.checked;

  if (isChecked) {
    $("#bruto").attr("disabled", true);
    $("#liquido").attr("disabled", false);
  } else {
    $("#bruto").attr("disabled", false);
    $("#liquido").attr("disabled", true);
  }
});
