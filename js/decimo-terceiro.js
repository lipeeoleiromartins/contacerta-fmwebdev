const inputSalario = document.getElementById("salario");

if (inputSalario) {
  inputSalario.addEventListener("input", function (e) {
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

function lerMoeda(texto) {
  if (!texto) return 0;
  return parseFloat(texto.replace(/\./g, "").replace(",", ".")) || 0;
}

// Cálculo do INSS
function calcularINSS(base) {
  if (base <= 0) return 0;
  let inss = 0;
  const faixas = [
    { limite: 1518.0, aliquota: 0.075 },
    { limite: 2793.88, aliquota: 0.09 },
    { limite: 4190.83, aliquota: 0.12 },
    { limite: 8157.41, aliquota: 0.14 },
  ];

  let faixaAnterior = 0;
  for (let i = 0; i < faixas.length; i++) {
    if (base > faixaAnterior) {
      const baseFaixa = Math.min(base, faixas[i].limite) - faixaAnterior;
      inss += baseFaixa * faixas[i].aliquota;
      faixaAnterior = faixas[i].limite;
    } else {
      break;
    }
  }
  return inss;
}

const formDecimo = document.getElementById("form-decimo");
if (formDecimo) {
  formDecimo.addEventListener("submit", function (e) {
    e.preventDefault();

    const salarioBruto = lerMoeda(document.getElementById("salario").value);
    const meses = parseInt(document.getElementById("meses").value, 10) || 12;

    if (salarioBruto <= 0) {
      alert("Por favor, informe um salário bruto válido.");
      return;
    }

    // 13º proporcional bruto
    const valorBrutoTotal = (salarioBruto / 12) * meses;

    // 1ª Parcela (50% do valor bruto proporcional, sem descontos)
    const primeiraParcela = valorBrutoTotal / 2;

    // 2ª Parcela (O restante bruto menos INSS e IRRF incidentes sobre o total)
    const inss = calcularINSS(valorBrutoTotal);
    // IRRF simplificado sobre 13º (tributação exclusiva na fonte)
    let irrf = 0;
    const baseIR = valorBrutoTotal - inss;
    if (baseIR > 4664.68) irrf = baseIR * 0.275 - 908.73;
    else if (baseIR > 3751.05) irrf = baseIR * 0.225 - 675.49;
    else if (baseIR > 2826.65) irrf = baseIR * 0.15 - 394.16;
    else if (baseIR > 2428.8) irrf = baseIR * 0.075 - 182.16;
    irrf = Math.max(0, irrf);

    const totalDescontos = inss + irrf;
    const segundaParcela = Math.max(0, primeiraParcela - totalDescontos);
    const valorLiquidoTotal = primeiraParcela + segundaParcela;

    const formatarMoeda = (valor) =>
      valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    document.getElementById("res-primeira").textContent =
      formatarMoeda(primeiraParcela);
    document.getElementById("res-inss").textContent =
      `- ${formatarMoeda(inss)}`;
    document.getElementById("res-irrf").textContent =
      `- ${formatarMoeda(irrf)}`;
    document.getElementById("res-segunda").textContent =
      formatarMoeda(segundaParcela);
    document.getElementById("res-liquido").textContent =
      formatarMoeda(valorLiquidoTotal);

    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Salva no Histórico Local
    if (typeof salvarNoHistorico === "function") {
      salvarNoHistorico(
        "13º Salário",
        `Líquido: ${formatarMoeda(valorLiquidoTotal)}`,
      );
    }
  });
}

function copiarResumo() {
  const liquido = document.getElementById("res-liquido").textContent;
  const texto = `🎁 *Cálculo de 13º Salário (ContaCerta - FM WebDev)*\n✅ *Total Líquido: ${liquido}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const original = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = original), 2000);
  });
}

function limparFormulario() {
  document.getElementById("form-decimo").reset();
  document.getElementById("card-resultado").classList.add("hidden");
}
