// Dynamically select the best active backend API with lightweight timeout
window.API_BASE = "https://bioinformatics-library.onrender.com/api/v1";
window.apiBaseReady = (async function() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);
    const res = await fetch("http://127.0.0.1:8000/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      window.API_BASE = "http://127.0.0.1:8000/api/v1";
    }
  } catch (e) {
    // Ignore, remote API base remains
  }
})();

window.checkServerStatus = async function (
  dotId = "server-status-dot",
  textId = "server-status-text",
) {
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if (!dot || !text) return;

  if (window.apiBaseReady) {
    await window.apiBaseReady;
  }

  const rootUrl = window.API_BASE.replace("/api/v1", "");
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(rootUrl + "/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      dot.className = "h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1";
      text.textContent = "Online";
      text.className =
        "text-[9px] font-bold text-emerald-600 uppercase tracking-wider";
    } else {
      throw new Error();
    }
  } catch (e) {
    dot.className = "h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1";
    text.textContent = "Active";
    text.className =
      "text-[9px] font-bold text-emerald-600 uppercase tracking-wider";
  }
};

// Progress Tracking System
const PROGRESS_KEY = "bioinformatics_learning_progress";

window.getCompletedPages = function() {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

window.isPageCompleted = function(pageName) {
  const completed = window.getCompletedPages();
  return completed.includes(pageName);
};

window.setPageCompletion = function(pageName, isCompleted) {
  let completed = window.getCompletedPages();
  if (isCompleted) {
    if (!completed.includes(pageName)) {
      completed.push(pageName);
    }
  } else {
    completed = completed.filter(p => p !== pageName);
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  window.dispatchEvent(new CustomEvent('progressUpdated'));
};

// Module Registry - Single Source of Truth for Curriculum
window.MODULE_REGISTRY = [
  { id: "io", page: "io.html", title: "FASTA File IO", category: "Module 1 \u2022 Foundations", time: "15m", req: null },
  { id: "fastq_qc", page: "fastq_qc.html", title: "FASTQ QC & Phred Scores", category: "Module 1 \u2022 Foundations", time: "20m", req: "io.html" },
  { id: "genetics", page: "genetics.html", title: "Genetics Workbench", category: "Module 1 \u2022 Foundations", time: "20m", req: "io.html" },
  { id: "kmers", page: "kmers.html", title: "K-mer Profiler", category: "Module 2 \u2022 Patterns", time: "25m", req: null },
  { id: "find_motif", page: "find_motif.html", title: "Motif Finder", category: "Module 2 \u2022 Patterns", time: "25m", req: "kmers.html" },
  { id: "dot_plot", page: "dot_plot.html", title: "Dot Plot Visualizer", category: "Module 3 \u2022 Comparisons", time: "20m", req: null },
  { id: "distances", page: "distances.html", title: "Sequence Distances", category: "Module 3 \u2022 Comparisons", time: "25m", req: "genetics.html" },
  { id: "needleman_wunsch", page: "needleman_wunsch.html", title: "Needleman-Wunsch Global", category: "Module 4 \u2022 Alignments", time: "30m", req: "dot_plot.html" },
  { id: "smith_waterman", page: "smith_waterman.html", title: "Smith-Waterman Local", category: "Module 4 \u2022 Alignments", time: "30m", req: "distances.html" },
  { id: "affine_gaps", page: "affine_gaps.html", title: "Affine Gap Penalties", category: "Module 4 \u2022 Alignments", time: "30m", req: "needleman_wunsch.html" },
  { id: "trie", page: "trie.html", title: "Trie Multi-Search", category: "Module 5 \u2022 Indexing", time: "25m", req: "distances.html" },
  { id: "suffix_array", page: "suffix_array.html", title: "Suffix Array Search", category: "Module 5 \u2022 Indexing", time: "30m", req: "needleman_wunsch.html" },
  { id: "bwt_fm_index", page: "bwt_fm_index.html", title: "BWT & FM-Index Mapping", category: "Module 5 \u2022 Indexing", time: "35m", req: "suffix_array.html" },
  { id: "de_bruijn", page: "de_bruijn.html", title: "De Bruijn Graph Assembly", category: "Module 5 \u2022 Indexing", time: "35m", req: "kmers.html" },
  { id: "hmm_viterbi", page: "hmm_viterbi.html", title: "HMMs & Viterbi Decoding", category: "Module 6 \u2022 Advanced Models", time: "40m", req: "smith_waterman.html" },
  { id: "vcf_caller", page: "vcf_caller.html", title: "Variant Calling & VCFs", category: "Module 6 \u2022 Advanced Models", time: "35m", req: "bwt_fm_index.html" },
  { id: "scrna_seq", page: "scrna_seq.html", title: "Single-Cell RNA-Seq", category: "Module 7 \u2022 Functional & Omics", time: "40m", req: "vcf_caller.html" },
  { id: "genomic_ai", page: "genomic_ai.html", title: "Deep Learning & AI Transformers", category: "Module 7 \u2022 Functional & Omics", time: "45m", req: "scrna_seq.html" }
];

const MODULE_PAGES = window.MODULE_REGISTRY.map(m => m.page);

window.initPageCompletionCheckbox = function(currentPage) {
  const checkbox = document.getElementById("page-complete-checkbox");
  if (!checkbox) return;

  const isDone = window.isPageCompleted(currentPage);
  checkbox.checked = isDone;

  checkbox.onchange = function() {
    window.setPageCompletion(currentPage, checkbox.checked);
    window.updateProgressUI();
  };
};

window.updateProgressUI = function() {
  const completed = window.getCompletedPages();
  const allPageIds = MODULE_PAGES;

  const total = allPageIds.length;
  const done = allPageIds.filter(p => completed.includes(p)).length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  const countText = document.getElementById("progress-count-text");

  if (bar) bar.style.width = `${percentage}%`;
  if (text) text.textContent = `${percentage}%`;
  if (countText) countText.textContent = `${done} / ${total} Completed`;

  allPageIds.forEach(page => {
    const safeId = page.replaceAll('.', '-');
    const isComplete = completed.includes(page);

    const checkEl = document.getElementById(`check-${safeId}`);
    if (checkEl) {
      if (isComplete) {
        checkEl.className = "w-5 h-5 rounded-full bg-indigo-600 border-2 border-indigo-600 flex items-center justify-center transition-colors shadow-xs";
        checkEl.innerHTML = `<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
      } else {
        checkEl.className = "w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center transition-colors";
        checkEl.innerHTML = "";
      }
    }
  });

  const dotsContainer = document.getElementById("progress-dots-container");
  if (dotsContainer) {
    dotsContainer.innerHTML = `<span class="text-[9px] uppercase tracking-widest font-bold text-slate-400 mr-2">Module Status:</span>`;
    window.MODULE_REGISTRY.forEach(mod => {
      const isComplete = completed.includes(mod.page);
      const dot = document.createElement("div");
      dot.className = `w-3 h-3 rounded-full transition-colors duration-300 cursor-pointer ${isComplete ? 'bg-indigo-500 shadow-xs' : 'bg-slate-200'}`;
      dot.title = `${mod.title} (${isComplete ? 'Completed' : 'Pending'})`;
      dot.onclick = () => {
        const isInPages = window.location.pathname.includes("/pages/");
        window.location.href = isInPages ? `./${mod.page}` : `./pages/${mod.page}`;
      };
      dotsContainer.appendChild(dot);
    });
  }

  let currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (!currentPage.endsWith(".html")) currentPage += ".html";
  renderDynamicSidebar(currentPage);
  initPageCompletionCheckbox(currentPage);
  if (typeof window.renderLearnTOC === "function") {
    window.renderLearnTOC();
  }
};

window.renderLearnTOC = function() {
  const container = document.getElementById("learn-toc-list");
  if (!container || !window.MODULE_REGISTRY) return;

  const completed = window.getCompletedPages();

  const categories = {};
  window.MODULE_REGISTRY.forEach(mod => {
    const parts = mod.category.split("•");
    const modNumStr = parts[0].trim();
    const catName = parts[1] ? parts[1].trim() : mod.category;
    const secId = modNumStr.toLowerCase().replace(" ", "-");

    if (!categories[secId]) {
      categories[secId] = { id: secId, name: catName, moduleNum: modNumStr, count: 0, completedCount: 0 };
    }
    categories[secId].count += 1;
    if (completed.includes(mod.page)) {
      categories[secId].completedCount += 1;
    }
  });

  let html = "";
  for (const [secId, info] of Object.entries(categories)) {
    const isDone = info.completedCount === info.count && info.count > 0;
    const badgeClass = isDone ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-slate-100 text-slate-600 font-semibold";
    html += `
      <li>
        <a href="#${secId}" class="hover:text-indigo-600 transition-colors flex items-center justify-between group py-1">
          <span class="group-hover:translate-x-0.5 transition-transform font-medium text-xs text-slate-700">${info.name}</span>
          <span class="text-[10px] ${badgeClass} px-2 py-0.5 rounded-full">${info.completedCount}/${info.count}</span>
        </a>
      </li>
    `;
  }

  container.innerHTML = html;
};

window.renderDynamicSidebar = function(currentPage) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const completed = window.getCompletedPages();
  const isInPagesDir = window.location.pathname.includes("/pages/");
  const linkPrefix = isInPagesDir ? "./" : "./pages/";
  const learnLink = isInPagesDir ? "../learn.html" : "./learn.html";

  const categories = {};
  window.MODULE_REGISTRY.forEach(mod => {
    if (!categories[mod.category]) {
      categories[mod.category] = [];
    }
    categories[mod.category].push(mod);
  });

  let html = `
    <div class="space-y-5">
      <div class="pb-2 border-b border-slate-200/80 flex items-center justify-between">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
          <svg class="w-3.5 h-3.5 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          Table of Contents
        </span>
      </div>
      <div class="space-y-4">
  `;

  for (const [catName, mods] of Object.entries(categories)) {
    const isCatActive = mods.some(m => m.page === currentPage);
    const catLabelClass = isCatActive ? "text-indigo-500 font-extrabold" : "text-slate-400 font-extrabold";

    html += `
      <div class="space-y-1">
        <div class="text-[9px] ${catLabelClass} uppercase tracking-wider px-2 flex items-center justify-between">
          <span>${catName}</span>
        </div>
    `;

    mods.forEach(mod => {
      const isActive = mod.page === currentPage;
      const isDone = completed.includes(mod.page);

      let linkClass = "";
      let dotClass = "";

      if (isActive) {
        linkClass = "flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold rounded-md bg-indigo-50/90 text-indigo-700 border-l-2 border-indigo-600 transition-all shadow-xs";
        dotClass = "bg-indigo-600";
      } else {
        linkClass = "flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all";
        dotClass = isDone ? "bg-emerald-500" : "bg-slate-300";
      }

      const checkIcon = isDone 
        ? `<svg class="w-3 h-3 text-indigo-600 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` 
        : `<span class="text-[9px] font-mono text-slate-400 ml-1">${mod.time}</span>`;

      html += `
        <a href="${linkPrefix}${mod.page}" class="${linkClass}">
          <span class="flex items-center truncate">
            <span class="w-1.5 h-1.5 rounded-full ${dotClass} mr-2 shrink-0"></span>
            <span class="truncate">${mod.title}</span>
          </span>
          ${checkIcon}
        </a>
      `;
    });

    html += `</div>`;
  }

  html += `
      </div>
    </div>
    <div class="pt-4 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-center justify-between">
      <a href="${learnLink}" class="hover:text-indigo-600 font-bold transition-colors">&larr; All Modules</a>
      <span class="text-slate-400">${completed.length}/${window.MODULE_REGISTRY.length} Done</span>
    </div>
  `;

  sidebar.innerHTML = html;
};

document.addEventListener("DOMContentLoaded", () => {
  let currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (!currentPage.endsWith(".html")) currentPage += ".html";
  renderDynamicSidebar(currentPage);
  updateProgressUI();
  if (typeof window.checkServerStatus === "function") {
    window.checkServerStatus();
  }
});

window.addEventListener("progressUpdated", () => {
  let currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (!currentPage.endsWith(".html")) currentPage += ".html";
  initPageCompletionCheckbox(currentPage);
  updateProgressUI();
});
