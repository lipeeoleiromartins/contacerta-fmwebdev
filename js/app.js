// --- 1. GERENCIAMENTO DE COOKIES / LGPD ---
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("cookieConsent")) {
    criarBannerCookies();
  }
  if (typeof atualizarExibicaoHistorico === "function") {
    atualizarExibicaoHistorico();
  }
  inserirBreadcrumbs();
});

function criarBannerCookies() {
  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.className =
    "fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-300 p-4 shadow-lg border-t border-slate-800 z-50 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs";
  banner.innerHTML = `
        <p class="text-center sm:text-left">
            Utilizamos cookies essenciais e tecnologias de anúncios (Google AdSense) para melhorar sua experiência. Ao continuar navegando, você concorda com nossa <a href="/privacidade.html" class="text-blue-400 underline">Política de Privacidade</a>.
        </p>
        <button id="aceitar-cookies" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition whitespace-nowrap">
            Entendi e Aceitar
        </button>
    `;
  document.body.appendChild(banner);

  document
    .getElementById("aceitar-cookies")
    .addEventListener("click", function () {
      localStorage.setItem("cookieConsent", "true");
      banner.remove();
    });
}

// --- 2. HISTÓRICO LOCAL (LOCALSTORAGE) ---
function salvarNoHistorico(nomeCalculadora, resumo) {
  let historico =
    JSON.parse(localStorage.getItem("contacerta_historico")) || [];
  const novoRegistro = {
    ferramenta: nomeCalculadora,
    resumo: resumo,
    data:
      new Date().toLocaleDateString("pt-BR") +
      " às " +
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  };

  historico.unshift(novoRegistro);
  if (historico.length > 5) historico.pop();

  localStorage.setItem("contacerta_historico", JSON.stringify(historico));
  atualizarExibicaoHistorico();
}

function atualizarExibicaoHistorico() {
  const container = document.getElementById("historico-recente");
  if (!container) return;

  let historico =
    JSON.parse(localStorage.getItem("contacerta_historico")) || [];
  if (historico.length === 0) {
    container.innerHTML =
      '<p class="text-xs text-slate-400 italic">Nenhuma simulação recente neste navegador.</p>';
    return;
  }

  let html =
    '<h4 class="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">Suas Últimas Simulações</h4><ul class="space-y-2 text-xs">';
  historico.forEach((item) => {
    html += `
            <li class="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between items-center">
                <div>
                    <span class="font-semibold text-blue-700">${item.ferramenta}</span>
                    <p class="text-slate-600 font-medium mt-0.5">${item.resumo}</p>
                </div>
                <span class="text-[10px] text-slate-400">${item.data}</span>
            </li>
        `;
  });
  html += "</ul>";
  container.innerHTML = html;
}

// --- 3. BREADCRUMBS (TRILHA DE NAVEGAÇÃO SEO) ---
function inserirBreadcrumbs() {
  const caminho = window.location.pathname;
  const main = document.querySelector("main");
  if (!main) return;

  const rotas = {
    "horas-extras": {
      categoria: "Trabalhista",
      nome: "Horas Extras e Noturno",
    },
    "salario-liquido": { categoria: "Financeiro", nome: "Salário Líquido" },
    "ferias-proporcionais": {
      categoria: "Trabalhista",
      nome: "Férias Proporcionais",
    },
    "rescisao-clt": { categoria: "Trabalhista", nome: "Rescisão CLT" },
    "decimo-terceiro": { categoria: "Trabalhista", nome: "13º Salário" },
  };

  let paginaAtual = null;
  for (const chave in rotas) {
    if (caminho.includes(chave)) {
      paginaAtual = rotas[chave];
      break;
    }
  }

  // Só insere se estiver em uma das 5 calculadoras
  if (!paginaAtual) return;

  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Breadcrumb");
  nav.className =
    "text-xs text-slate-500 mb-4 flex items-center flex-wrap gap-1.5";
  nav.innerHTML = `
        <a href="../../index.html" class="hover:text-blue-700 hover:underline transition">Início</a>
        <span>/</span>
        <span>${paginaAtual.categoria}</span>
        <span>/</span>
        <span class="font-semibold text-slate-700">${paginaAtual.nome}</span>
    `;

  main.insertBefore(nav, main.firstChild);
}
