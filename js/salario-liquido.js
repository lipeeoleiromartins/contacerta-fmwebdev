// Máscaras de moeda brasileira para Salário Bruto e Outros Descontos
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
aplicarMascaraMoeda("outros-descontos");

function lerMoeda(texto) {
  if (!texto) return 0;
  return parseFloat(texto.replace(/\./g, "").replace(",", ".")) || 0;
}

// Cálculo Progressivo do INSS
function calcularINSS(salario) {
  let inss = 0;
  const faixas = [
    { limite: 1518.0, aliquota: 0.075 },
    { limite: 2793.88, aliquota: 0.09 },
    { limite: 4190.83, aliquota: 0.12 },
    { limite: 8157.41, aliquota: 0.14 },
  ];

  let faixaAnterior = 0;
  for (let i = 0; i < faixas.length; i++) {
    if (salario > faixaAnterior) {
      const baseFaixa = Math.min(salario, faixas[i].limite) - faixaAnterior;
      inss += baseFaixa * faixas[i].aliquota;
      faixaAnterior = faixas[i].limite;
    } else {
      break;
    }
  }
  return inss;
}

// Cálculo do IRRF (com regra automática do Desconto Simplificado vs Deduções Legais)
function calcularIRRF(salarioBruto, inss, dependentes) {
  const deducaoPorDependente = 189.59;
  const deducoesLegais = inss + dependentes * deducaoPorDependente;
  const descontoSimplificado = 607.2;

  // Usa o desconto que for maior (mais vantajoso para o trabalhador)
  const deducaoAplicada = Math.max(deducoesLegais, descontoSimplificado);
  const baseCalculo = salarioBruto - deducaoAplicada;

  if (baseCalculo <= 2428.8) return 0;
  if (baseCalculo <= 2826.65) return baseCalculo * 0.075 - 182.16;
  if (baseCalculo <= 3751.05) return baseCalculo * 0.15 - 394.16;
  if (baseCalculo <= 4664.68) return baseCalculo * 0.225 - 675.49;
  return baseCalculo * 0.275 - 908.73;
}

document
  .getElementById("form-salario-liquido")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const salarioBruto = lerMoeda(document.getElementById("salario").value);
    const dependentes =
      parseInt(document.getElementById("dependentes").value, 10) || 0;
    const outrosDescontos = lerMoeda(
      document.getElementById("outros-descontos").value,
    );

    if (salarioBruto <= 0) {
      alert("Por favor, informe um salário bruto válido.");
      return;
    }

    const descontoINSS = calcularINSS(salarioBruto);
    const descontoIRRF = Math.max(
      0,
      calcularIRRF(salarioBruto, descontoINSS, dependentes),
    );
    const totalDescontos = descontoINSS + descontoIRRF + outrosDescontos;
    const salarioLiquido = Math.max(0, salarioBruto - totalDescontos);

    const formatarMoeda = (valor) => {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    document.getElementById("res-bruto").textContent =
      formatarMoeda(salarioBruto);
    document.getElementById("res-inss").textContent =
      `- ${formatarMoeda(descontoINSS)}`;
    document.getElementById("res-irrf").textContent =
      `- ${formatarMoeda(descontoIRRF)}`;
    document.getElementById("res-outros").textContent =
      `- ${formatarMoeda(outrosDescontos)}`;
    document.getElementById("res-liquido").textContent =
      formatarMoeda(salarioLiquido);

    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

function copiarResumo() {
  const bruto = document.getElementById("res-bruto").textContent;
  const inss = document.getElementById("res-inss").textContent;
  const irrf = document.getElementById("res-irrf").textContent;
  const outros = document.getElementById("res-outros").textContent;
  const liquido = document.getElementById("res-liquido").textContent;

  const texto = `💰 *Cálculo de Salário Líquido (ContaCerta - FM WebDev)*\n• Salário Bruto: ${bruto}\n• INSS: ${inss}\n• IRRF: ${irrf}\n• Outros Descontos: ${outros}\n✅ *Salário Líquido: ${liquido}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const textoOriginal = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = textoOriginal), 2000);
  });
}
