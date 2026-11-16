// --- 1. GERENCIAMENTO DE COOKIES / LGPD ---
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("cookieConsent")) {
    criarBannerCookies();
  }
  if (typeof atualizarExibicaoHistorico === "function") {
    atualizarExibicaoHistorico();
  }
  inicializarDarkMode();
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
    '<h4 class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Suas Últimas Simulações</h4><ul class="space-y-2 text-xs">';
  historico.forEach((item) => {
    html += `
            <li class="bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <span class="font-semibold text-blue-700 dark:text-blue-400">${item.ferramenta}</span>
                    <p class="text-slate-600 dark:text-slate-300 font-medium mt-0.5">${item.resumo}</p>
                </div>
                <span class="text-[10px] text-slate-400">${item.data}</span>
            </li>
        `;
  });
  html += "</ul>";
  container.innerHTML = html;
}

// --- 3. MODO ESCURO (DARK MODE) ---
function inicializarDarkMode() {
  // Cria o botão de alternância de tema no header se ele ainda não existir
  const headerNav = document.querySelector("header nav");
  if (headerNav && !document.getElementById("btn-dark-mode")) {
    const btnDark = document.createElement("button");
    btnDark.id = "btn-dark-mode";
    btnDark.className =
      "bg-blue-800/60 hover:bg-blue-800 text-white text-xs font-medium px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer";
    btnDark.innerHTML = `<span id="icone-tema">🌙</span> <span class="hidden sm:inline">Tema</span>`;
    btnDark.onclick = alternarDarkMode;
    headerNav.appendChild(btnDark);
  }

  // Aplica o tema salvo no localStorage
  const temaSalvo = localStorage.getItem("contacerta_tema");
  if (temaSalvo === "dark") {
    document.documentElement.classList.add("dark");
    atualizarIconeTema("dark");
  } else {
    document.documentElement.classList.remove("dark");
    atualizarIconeTema("light");
  }
}

function alternarDarkMode() {
  const htmlEl = document.documentElement;
  if (htmlEl.classList.contains("dark")) {
    htmlEl.classList.remove("dark");
    localStorage.setItem("contacerta_tema", "light");
    atualizarIconeTema("light");
  } else {
    htmlEl.classList.add("dark");
    localStorage.setItem("contacerta_tema", "dark");
    atualizarIconeTema("dark");
  }
}

function atualizarIconeTema(modo) {
  const icone = document.getElementById("icone-tema");
  if (icone) {
    icone.textContent = modo === "dark" ? "☀️" : "🌙";
  }
}
