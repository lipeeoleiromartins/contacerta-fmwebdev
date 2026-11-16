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

document
  .getElementById("form-horas-extras")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const salarioBruto = lerMoeda(document.getElementById("salario").value);
    const cargaHoraria =
      parseFloat(document.getElementById("carga-horaria").value) || 220;
    const horas50 = parseFloat(document.getElementById("horas-50").value) || 0;
    const horas100 =
      parseFloat(document.getElementById("horas-100").value) || 0;
    const horasNoturnas =
      parseFloat(document.getElementById("horas-noturnas").value) || 0;

    if (salarioBruto <= 0) {
      alert("Por favor, informe um salário bruto válido.");
      return;
    }

    const valorHoraNormal = salarioBruto / cargaHoraria;
    const total50 = valorHoraNormal * 1.5 * horas50;
    const total100 = valorHoraNormal * 2.0 * horas100;
    const totalNoturno = valorHoraNormal * 0.2 * horasNoturnas;
    const totalReceber = total50 + total100 + totalNoturno;

    const formatarMoeda = (valor) =>
      valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    document.getElementById("res-hora-normal").textContent =
      formatarMoeda(valorHoraNormal);
    document.getElementById("res-total-50").textContent =
      formatarMoeda(total50);
    document.getElementById("res-total-100").textContent =
      formatarMoeda(total100);
    document.getElementById("res-total-noturno").textContent =
      formatarMoeda(totalNoturno);
    document.getElementById("res-total-geral").textContent =
      formatarMoeda(totalReceber);

    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Salva no Histórico Local
    if (typeof salvarNoHistorico === "function") {
      salvarNoHistorico(
        "Horas Extras",
        `Total: ${formatarMoeda(totalReceber)}`,
      );
    }
  });

function copiarResumo() {
  const total = document.getElementById("res-total-geral").textContent;
  const h50 = document.getElementById("res-total-50").textContent;
  const h100 = document.getElementById("res-total-100").textContent;
  const noturno = document.getElementById("res-total-noturno").textContent;

  const texto = `📊 *Resumo de Horas Extras (ContaCerta - FM WebDev)*\n• Extras 50%: ${h50}\n• Extras 100%: ${h100}\n• Adicional Noturno: ${noturno}\n✅ *Total Bruto a Receber: ${total}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const original = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = original), 2000);
  });
}

function limparFormulario() {
  document.getElementById("form-horas-extras").reset();
  document.getElementById("card-resultado").classList.add("hidden");
}
