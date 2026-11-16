// Máscara de moeda brasileira
const inputSalario = document.getElementById("salario");

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

function lerMoeda(texto) {
  if (!texto) return 0;
  return parseFloat(texto.replace(/\./g, "").replace(",", ".")) || 0;
}

// Cálculo Progressivo do INSS (incide sobre férias + 1/3, exceto abono pecuniário)
function calcularINSS(baseCalculo) {
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

// Cálculo do IRRF sobre férias
function calcularIRRF(baseTributavel, inss, dependentes) {
  const deducaoPorDependente = 189.59;
  const deducoesLegais = inss + dependentes * deducaoPorDependente;
  const descontoSimplificado = 607.2;

  const deducaoAplicada = Math.max(deducoesLegais, descontoSimplificado);
  const baseCalculo = baseTributavel - deducaoAplicada;

  if (baseCalculo <= 2428.8) return 0;
  if (baseCalculo <= 2826.65) return baseCalculo * 0.075 - 182.16;
  if (baseCalculo <= 3751.05) return baseCalculo * 0.15 - 394.16;
  if (baseCalculo <= 4664.68) return baseCalculo * 0.225 - 675.49;
  return baseCalculo * 0.275 - 908.73;
}

document.getElementById("form-ferias").addEventListener("submit", function (e) {
  e.preventDefault();

  const salarioBruto = lerMoeda(document.getElementById("salario").value);
  const mesesTrabalhados =
    parseInt(document.getElementById("meses").value, 10) || 12;
  const dependentes =
    parseInt(document.getElementById("dependentes").value, 10) || 0;
  const venderFerias = document.getElementById("vender-ferias").checked;
  const adiantar13 = document.getElementById("adiantar-13").checked;

  if (salarioBruto <= 0) {
    alert("Por favor, informe um salário bruto válido.");
    return;
  }

  // 1. Valor base das férias proporcionais aos meses (12 meses = salário integral)
  const valorFeriasBase = (salarioBruto / 12) * mesesTrabalhados;

  // Se vender 1/3 (abono pecuniário), 2/3 são gozados e 1/3 é vendido (isento de INSS/IR)
  const feriasGozadas = venderFerias
    ? valorFeriasBase * (2 / 3)
    : valorFeriasBase;
  const tercoConstitucional = feriasGozadas / 3;

  // Abono pecuniário (venda de 1/3 das férias + 1/3 sobre o abono)
  const abonoPecuniario = venderFerias ? valorFeriasBase / 3 : 0;
  const tercoAbono = venderFerias ? abonoPecuniario / 3 : 0;
  const totalAbono = abonoPecuniario + tercoAbono;

  // Adiantamento 1ª parcela 13º (50% do salário bruto, sem descontos)
  const adiantamento13 = adiantar13 ? salarioBruto * 0.5 : 0;

  // 2. Descontos (incidem apenas sobre férias gozadas + 1/3)
  const baseTributavel = feriasGozadas + tercoConstitucional;
  const descontoINSS = calcularINSS(baseTributavel);
  const descontoIRRF = Math.max(
    0,
    calcularIRRF(baseTributavel, descontoINSS, dependentes),
  );

  // 3. Total Líquido
  const totalProventos = baseTributavel + totalAbono + adiantamento13;
  const totalLiquido = Math.max(
    0,
    totalProventos - descontoINSS - descontoIRRF,
  );

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // 4. Exibir na tela
  document.getElementById("res-ferias-base").textContent =
    formatarMoeda(feriasGozadas);
  document.getElementById("res-terco").textContent =
    formatarMoeda(tercoConstitucional);
  document.getElementById("res-abono").textContent = formatarMoeda(totalAbono);
  document.getElementById("res-13").textContent = formatarMoeda(adiantamento13);
  document.getElementById("res-inss").textContent =
    `- ${formatarMoeda(descontoINSS)}`;
  document.getElementById("res-irrf").textContent =
    `- ${formatarMoeda(descontoIRRF)}`;
  document.getElementById("res-liquido").textContent =
    formatarMoeda(totalLiquido);

  const cardResultado = document.getElementById("card-resultado");
  cardResultado.classList.remove("hidden");
  cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

function copiarResumo() {
  const ferias = document.getElementById("res-ferias-base").textContent;
  const terco = document.getElementById("res-terco").textContent;
  const abono = document.getElementById("res-abono").textContent;
  const liquido = document.getElementById("res-liquido").textContent;

  const texto = `🏖️ *Simulação de Férias (ContaCerta - FM WebDev)*\n• Férias: ${ferias}\n• Adicional 1/3: ${terco}\n• Abono Pecuniário (Venda): ${abono}\n✅ *Total Líquido a Receber: ${liquido}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const textoOriginal = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = textoOriginal), 2000);
  });
}
