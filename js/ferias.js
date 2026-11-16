// Máscara de moeda brasileira
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

// Cálculo progressivo do INSS
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

// Cálculo do IRRF
function calcularIRRF(baseTributavel, inss, dependentes) {
  if (baseTributavel <= 0) return 0;
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

const formFerias = document.getElementById("form-ferias");
if (formFerias) {
  formFerias.addEventListener("submit", function (e) {
    e.preventDefault();

    const salarioBruto = lerMoeda(document.getElementById("salario").value);
    const meses = parseInt(document.getElementById("meses").value, 10) || 12;
    const diasAbono = parseInt(document.getElementById("abono").value, 10) || 0;
    const dependentes =
      parseInt(document.getElementById("dependentes").value, 10) || 0;

    if (salarioBruto <= 0) {
      alert("Por favor, informe um salário bruto válido.");
      return;
    }

    // 1. Valor base proporcional das férias
    const valorFeriasProp = (salarioBruto / 12) * meses;
    // 2. Terço constitucional (1/3)
    const tercoConstitucional = valorFeriasProp / 3;
    const totalBrutoFerias = valorFeriasProp + tercoConstitucional;

    // 3. Abono pecuniário (venda de dias), se houver (já inclui o 1/3 proporcional)
    let valorAbono = 0;
    let tercoAbono = 0;
    let totalBrutoAbono = 0;
    if (diasAbono > 0) {
      valorAbono = (salarioBruto / 30) * diasAbono;
      tercoAbono = valorAbono / 3;
      totalBrutoAbono = valorAbono + tercoAbono;
    }

    const brutoGeral = totalBrutoFerias + totalBrutoAbono;

    // 4. Descontos oficiais (INSS e IRRF incidem sobre as férias normais + 1/3, o abono é isento)
    const baseTributavel = totalBrutoFerias;
    const descontoINSS = calcularINSS(baseTributavel);
    const descontoIRRF = Math.max(
      0,
      calcularIRRF(baseTributavel, descontoINSS, dependentes),
    );
    const totalDescontos = descontoINSS + descontoIRRF;

    // 5. Líquido final
    const valorLiquido = Math.max(0, brutoGeral - totalDescontos);

    const formatarMoeda = (valor) =>
      valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    document.getElementById("res-ferias").textContent =
      formatarMoeda(valorFeriasProp);
    document.getElementById("res-terco").textContent =
      formatarMoeda(tercoConstitucional);
    document.getElementById("res-abono").textContent =
      formatarMoeda(totalBrutoAbono);
    document.getElementById("res-inss").textContent =
      `- ${formatarMoeda(descontoINSS)}`;
    document.getElementById("res-irrf").textContent =
      `- ${formatarMoeda(descontoIRRF)}`;
    document.getElementById("res-liquido").textContent =
      formatarMoeda(valorLiquido);

    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Salva no histórico local
    if (typeof salvarNoHistorico === "function") {
      salvarNoHistorico(
        "Férias Proporcionais",
        `Líquido: ${formatarMoeda(valorLiquido)}`,
      );
    }
  });
}

function copiarResumo() {
  const liquido = document.getElementById("res-liquido").textContent;
  const texto = `🌴 *Cálculo de Férias (ContaCerta - FM WebDev)*\n✅ *Valor Líquido a Receber: ${liquido}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const original = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = original), 2000);
  });
}

function limparFormulario() {
  document.getElementById("form-ferias").reset();
  document.getElementById("card-resultado").classList.add("hidden");
}
