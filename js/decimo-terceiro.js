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

document
  .getElementById("form-decimo-terceiro")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const salarioBruto = lerMoeda(document.getElementById("salario").value);
    const mesesTrabalhados =
      parseInt(document.getElementById("meses").value, 10) || 12;
    const dependentes =
      parseInt(document.getElementById("dependentes").value, 10) || 0;

    if (salarioBruto <= 0) {
      alert("Por favor, informe um salário bruto válido.");
      return;
    }

    // 1. Valor Bruto Proporcional do 13º
    const bruto13 = (salarioBruto / 12) * mesesTrabalhados;

    // 2. Primeira Parcela (50% do bruto proporcional, sem descontos)
    const primeiraParcela = bruto13 / 2;

    // 3. Descontos oficiais (incidem integralmente na 2ª parcela sobre o valor bruto total do 13º)
    const descontoINSS = calcularINSS(bruto13);
    const descontoIRRF = Math.max(
      0,
      calcularIRRF(bruto13, descontoINSS, dependentes),
    );

    // 4. Segunda Parcela (50% restante menos INSS e IRRF)
    const segundaParcela = Math.max(
      0,
      bruto13 / 2 - descontoINSS - descontoIRRF,
    );

    // 5. Total Líquido (1ª + 2ª parcela)
    const totalLiquido = primeiraParcela + segundaParcela;

    const formatarMoeda = (valor) => {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    document.getElementById("res-bruto").textContent = formatarMoeda(bruto13);
    document.getElementById("res-parcela-1").textContent =
      formatarMoeda(primeiraParcela);
    document.getElementById("res-inss").textContent =
      `- ${formatarMoeda(descontoINSS)}`;
    document.getElementById("res-irrf").textContent =
      `- ${formatarMoeda(descontoIRRF)}`;
    document.getElementById("res-parcela-2").textContent =
      formatarMoeda(segundaParcela);
    document.getElementById("res-liquido").textContent =
      formatarMoeda(totalLiquido);

    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

function copiarResumo() {
  const p1 = document.getElementById("res-parcela-1").textContent;
  const p2 = document.getElementById("res-parcela-2").textContent;
  const total = document.getElementById("res-liquido").textContent;

  const texto = `🎄 *Cálculo de 13º Salário (ContaCerta - FM WebDev)*\n• 1ª Parcela (sem descontos): ${p1}\n• 2ª Parcela (já com descontos): ${p2}\n✅ *Total Líquido a Receber: ${total}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const textoOriginal = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = textoOriginal), 2000);
  });
}
