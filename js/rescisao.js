// Máscara de moeda brasileira
function aplicarMascaraMoeda(idInput) {
  const input = document.getElementById(idInput);
  input.addEventListener("input", function (e) {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor === "") {
      e.target.value = "";
      return;
    }
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    valor = valor.replace(".", ",");
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    e.target.value = valor;
  });
}

aplicarMascaraMoeda("salario");
aplicarMascaraMoeda("saldo-fgts");

function lerMoeda(texto) {
  if (!texto) return 0;
  return parseFloat(texto.replace(/\./g, "").replace(",", ".")) || 0;
}

function calcularINSS(baseCalculo) {
  if (baseCalculo <= 0) return 0;
  let inss = 0;
  const faixas = [
    { limite: 1518.0, aliquota: 0.075 },
    { limite: 2793.88, aliquota: 0.09 },
    { limite: 4190.83, aliquota: 0.12 },
    { limite: 8157.41, aliquota: 0.14 },
  ];

  let faixaAnterior = 0;
  for (let i = 0; i < faixas.length; i++) {
    if (baseCalculo > faixaAnterior) {
      const baseFaixa = Math.min(baseCalculo, faixas[i].limite) - faixaAnterior;
      inss += baseFaixa * faixas[i].aliquota;
      faixaAnterior = faixas[i].limite;
    } else {
      break;
    }
  }
  return inss;
}

function calcularIRRF(baseTributavel, inss) {
  if (baseTributavel <= 0) return 0;
  const deducaoAplicada = Math.max(inss, 607.2);
  const baseCalculo = baseTributavel - deducaoAplicada;

  if (baseCalculo <= 2428.8) return 0;
  if (baseCalculo <= 2826.65) return baseCalculo * 0.075 - 182.16;
  if (baseCalculo <= 3751.05) return baseCalculo * 0.15 - 394.16;
  if (baseCalculo <= 4664.68) return baseCalculo * 0.225 - 675.49;
  return baseCalculo * 0.275 - 908.73;
}

document
  .getElementById("form-rescisao")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const salario = lerMoeda(document.getElementById("salario").value);
    const motivo = document.getElementById("motivo").value;
    const avisoTipo = document.getElementById("aviso").value;
    const diasTrabalhados =
      parseInt(document.getElementById("dias-trabalhados").value, 10) || 0;
    const meses13 =
      parseInt(document.getElementById("meses-13").value, 10) || 0;
    const mesesFerias =
      parseInt(document.getElementById("meses-ferias").value, 10) || 0;
    const anosEmpresa =
      parseInt(document.getElementById("anos-empresa").value, 10) || 0;
    const feriasVencidas = document.getElementById("ferias-vencidas").checked;
    const saldoFGTS = lerMoeda(document.getElementById("saldo-fgts").value);

    if (salario <= 0) {
      alert("Por favor, informe um salário bruto válido.");
      return;
    }

    // 1. Saldo de Salário
    const saldoSalario = (salario / 30) * diasTrabalhados;

    // 2. Aviso Prévio (30 dias + 3 dias por ano completo, limitado a 90 dias)
    const diasAvisoTotal = Math.min(90, 30 + anosEmpresa * 3);
    let avisoIndenizado = 0;
    let descontoAviso = 0;

    if (motivo === "sem-justa-causa" && avisoTipo === "indenizado") {
      avisoIndenizado = (salario / 30) * diasAvisoTotal;
    } else if (motivo === "acordo" && avisoTipo === "indenizado") {
      avisoIndenizado = (salario / 30) * diasAvisoTotal * 0.5;
    } else if (motivo === "pedido-demissao" && avisoTipo === "nao-cumprido") {
      descontoAviso = salario; // Desconto de 30 dias
    }

    // 3. 13º Salário Proporcional (não devido na justa causa)
    const decimoTerceiro =
      motivo === "justa-causa" ? 0 : (salario / 12) * meses13;

    // 4. Férias Vencidas + 1/3 (sempre devidas se houver)
    const valorFeriasVencidas = feriasVencidas ? salario + salario / 3 : 0;

    // 5. Férias Proporcionais + 1/3 (não devidas na justa causa)
    let valorFeriasProporcionais = 0;
    if (motivo !== "justa-causa") {
      const baseProp = (salario / 12) * mesesFerias;
      valorFeriasProporcionais = baseProp + baseProp / 3;
    }

    // 6. Multa FGTS (Informativo separado ou somado ao total rescisório)
    let multaFGTS = 0;
    if (motivo === "sem-justa-causa") {
      multaFGTS = saldoFGTS * 0.4;
    } else if (motivo === "acordo") {
      multaFGTS = saldoFGTS * 0.2;
    }

    // 7. Descontos de INSS e IRRF (sobre Saldo de Salário e 13º)
    const inssSalario = calcularINSS(saldoSalario);
    const inss13 = calcularINSS(decimoTerceiro);
    const totalINSS = inssSalario + inss13;

    const irrfSalario = Math.max(0, calcularIRRF(saldoSalario, inssSalario));
    const irrf13 = Math.max(0, calcularIRRF(decimoTerceiro, inss13));
    const totalIRRF = irrfSalario + irrf13;

    // 8. Totais
    const totalVerbasBrutas =
      saldoSalario +
      avisoIndenizado +
      decimoTerceiro +
      valorFeriasVencidas +
      valorFeriasProporcionais;
    const totalDescontos = totalINSS + totalIRRF + descontoAviso;
    const liquidoRescisao = Math.max(0, totalVerbasBrutas - totalDescontos);
    const totalGeralComFGTS = liquidoRescisao + multaFGTS;

    const formatarMoeda = (valor) => {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    // Exibir na tela
    document.getElementById("res-saldo-salario").textContent =
      formatarMoeda(saldoSalario);
    document.getElementById("res-aviso").textContent =
      formatarMoeda(avisoIndenizado);
    document.getElementById("res-13").textContent =
      formatarMoeda(decimoTerceiro);
    document.getElementById("res-ferias-vencidas").textContent =
      formatarMoeda(valorFeriasVencidas);
    document.getElementById("res-ferias-prop").textContent = formatarMoeda(
      valorFeriasProporcionais,
    );
    document.getElementById("res-inss").textContent =
      `- ${formatarMoeda(totalINSS)}`;
    document.getElementById("res-irrf").textContent =
      `- ${formatarMoeda(totalIRRF)}`;
    document.getElementById("res-desconto-aviso").textContent =
      `- ${formatarMoeda(descontoAviso)}`;
    document.getElementById("res-liquido").textContent =
      formatarMoeda(liquidoRescisao);
    document.getElementById("res-multa-fgts").textContent =
      formatarMoeda(multaFGTS);
    document.getElementById("res-total-geral").textContent =
      formatarMoeda(totalGeralComFGTS);

    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

function copiarResumo() {
  const liquido = document.getElementById("res-liquido").textContent;
  const multa = document.getElementById("res-multa-fgts").textContent;
  const total = document.getElementById("res-total-geral").textContent;

  const texto = `📑 *Simulação de Rescisão CLT (ContaCerta - FM WebDev)*\n• Líquido da Rescisão: ${liquido}\n• Multa FGTS: ${multa}\n✅ *Total Geral Estimado: ${total}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const textoOriginal = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = textoOriginal), 2000);
  });
}
