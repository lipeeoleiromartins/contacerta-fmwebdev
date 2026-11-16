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

const formRescisao = document.getElementById("form-rescisao");
if (formRescisao) {
  formRescisao.addEventListener("submit", function (e) {
    e.preventDefault();

    const salarioBruto = lerMoeda(document.getElementById("salario").value);
    const motivo = document.getElementById("motivo").value;
    const mesesTrabAno =
      parseInt(document.getElementById("meses-trab").value, 10) || 0;
    const diasSaldo =
      parseInt(document.getElementById("dias-saldo").value, 10) || 0;
    const anosEmpresa =
      parseInt(document.getElementById("anos-empresa").value, 10) || 1;

    if (salarioBruto <= 0) {
      alert("Por favor, informe um salário bruto válido.");
      return;
    }

    // 1. Saldo de Salário
    const saldoSalario = (salarioBruto / 30) * diasSaldo;

    // 2. Aviso Prévio (30 dias + 3 dias por ano trabalhado, máx 90 dias)
    let diasAviso = 30;
    if (motivo === "sem-justa-causa") {
      diasAviso = Math.min(90, 30 + anosEmpresa * 3);
    } else if (motivo === "pedido-demissao" || motivo === "justa-causa") {
      diasAviso = 0;
    }
    const valorAviso = (salarioBruto / 30) * diasAviso;

    // 3. 13º Salário Proporcional
    let decimoProporcional = (salarioBruto / 12) * mesesTrabAno;
    if (motivo === "justa-causa") decimoProporcional = 0;

    // 4. Férias Proporcionales + 1/3
    let feriasProp = (salarioBruto / 12) * mesesTrabAno;
    feriasProp += feriasProp / 3;
    if (motivo === "justa-causa") feriasProp = 0;

    // 5. Multa do FGTS (8% ao mês aproximado + multa rescisória de 40% ou 20%)
    let percentualMulta = 0;
    if (motivo === "sem-justa-causa") percentualMulta = 0.4;
    if (motivo === "acordo") percentualMulta = 0.2;

    // Estimativa de saldo FGTS acumulado (aproximação pedagógica: 8% do salário por mês trabalhado total)
    const mesesTotaisEstimados = anosEmpresa * 12 + mesesTrabAno;
    const fgtsAcumulado =
      salarioBruto * 0.08 * Math.max(1, mesesTotaisEstimados);
    const multaFgts = fgtsAcumulado * percentualMulta;

    const totalRescisao =
      saldoSalario +
      (motivo !== "pedido-demissao" && motivo !== "justa-causa"
        ? valorAviso
        : 0) +
      decimoProporcional +
      feriasProp +
      multaFgts;

    const formatarMoeda = (valor) =>
      valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    document.getElementById("res-saldo").textContent =
      formatarMoeda(saldoSalario);
    document.getElementById("res-aviso").textContent =
      formatarMoeda(valorAviso);
    document.getElementById("res-decimo").textContent =
      formatarMoeda(decimoProporcional);
    document.getElementById("res-ferias").textContent =
      formatarMoeda(feriasProp);
    document.getElementById("res-multa").textContent = formatarMoeda(multaFgts);
    document.getElementById("res-total").textContent =
      formatarMoeda(totalRescisao);

    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Salva no Histórico Local
    if (typeof salvarNoHistorico === "function") {
      salvarNoHistorico(
        "Rescisão CLT",
        `Total: ${formatarMoeda(totalRescisao)}`,
      );
    }
  });
}

function copiarResumo() {
  const total = document.getElementById("res-total").textContent;
  const texto = `📋 *Simulação de Rescisão CLT (ContaCerta - FM WebDev)*\n✅ *Total Estimado: ${total}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const original = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = original), 2000);
  });
}

function limparFormulario() {
  document.getElementById("form-rescisao").reset();
  document.getElementById("card-resultado").classList.add("hidden");
}
