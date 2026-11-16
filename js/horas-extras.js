// Máscara de moeda brasileira enquanto digita
const inputSalario = document.getElementById("salario");

inputSalario.addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
  if (valor === "") {
    e.target.value = "";
    return;
  }
  valor = (parseInt(valor, 10) / 100).toFixed(2);
  valor = valor.replace(".", ",");
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  e.target.value = valor;
});

// Função auxiliar para converter "2.500,00" em número puro 2500.00
function lerMoeda(texto) {
  if (!texto) return 0;
  return parseFloat(texto.replace(/\./g, "").replace(",", ".")) || 0;
}

document
  .getElementById("form-horas-extras")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // 1. Capturar valores dos inputs
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

    // 2. Cálculos baseados na CLT
    const valorHoraNormal = salarioBruto / cargaHoraria;

    // Hora extra 50% (dias úteis)
    const valorHora50 = valorHoraNormal * 1.5;
    const total50 = valorHora50 * horas50;

    // Hora extra 100% (domingos e feriados)
    const valorHora100 = valorHoraNormal * 2.0;
    const total100 = valorHora100 * horas100;

    // Adicional noturno (20% sobre a hora normal)
    const valorAdicionalNoturno = valorHoraNormal * 0.2;
    const totalNoturno = valorAdicionalNoturno * horasNoturnas;

    // Total Geral
    const totalReceber = total50 + total100 + totalNoturno;

    // 3. Formatar para Moeda Brasileira (R$)
    const formatarMoeda = (valor) => {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    // 4. Exibir na tela
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

    // Mostrar o card de resultado suavemente
    const cardResultado = document.getElementById("card-resultado");
    cardResultado.classList.remove("hidden");
    cardResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

// Função para copiar o resumo para o WhatsApp
function copiarResumo() {
  const total = document.getElementById("res-total-geral").textContent;
  const h50 = document.getElementById("res-total-50").textContent;
  const h100 = document.getElementById("res-total-100").textContent;
  const noturno = document.getElementById("res-total-noturno").textContent;

  const texto = `📊 *Resumo de Horas Extras (ContaCerta - FM WebDev)*\n• Extras 50%: ${h50}\n• Extras 100%: ${h100}\n• Adicional Noturno: ${noturno}\n✅ *Total Bruto a Receber: ${total}*`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copiar");
    const textoOriginal = btn.textContent;
    btn.textContent = "Copiado! ✓";
    setTimeout(() => (btn.textContent = textoOriginal), 2000);
  });
}
