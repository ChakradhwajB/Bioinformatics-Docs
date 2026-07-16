// Dynamically select the best active backend API
let localOnline = false;
try {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://127.0.0.1:8000/", false);
  xhr.send(null);
  if (xhr.status >= 200 && xhr.status < 400) {
    localOnline = true;
  }
} catch (e) {
  localOnline = false;
}

window.API_BASE = localOnline
  ? "http://127.0.0.1:8000/api/v1"
  : "https://bioinformatics-library.onrender.com/api/v1";

window.checkServerStatus = async function (
  dotId = "server-status-dot",
  textId = "server-status-text",
) {
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if (!dot || !text) return;

  // Ping the active root endpoint (local or Render)
  const rootUrl = window.API_BASE.replace("/api/v1", "");
  try {
    const res = await fetch(rootUrl + "/");
    if (res.ok) {
      dot.className = "h-2 w-2 rounded-full bg-emerald-500 mr-2";
      text.textContent = "Online";
      text.className =
        "text-[10px] font-bold text-emerald-600 uppercase tracking-wider";
    } else {
      throw new Error();
    }
  } catch (e) {
    dot.className = "h-2 w-2 rounded-full bg-rose-500 mr-2";
    text.textContent = "Offline";
    text.className =
      "text-[10px] font-bold text-rose-600 uppercase tracking-wider";
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
  
  // Dispatch a custom event to notify potential listeners
  window.dispatchEvent(new CustomEvent('progressUpdated'));
};

const MODULE_PAGES = [
  "io.html", "genetics.html",
  "kmers.html", "find_motif.html",
  "dot_plot.html", "distances.html",
  "needleman_wunsch.html", "smith_waterman.html",
  "trie.html", "suffix_array.html"
];

window.updateProgressUI = function() {
  const completed = window.getCompletedPages();
  const allPageIds = MODULE_PAGES;

  // Calculate percentage
  const total = allPageIds.length;
  const done = allPageIds.filter(p => completed.includes(p)).length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  // Update progress bar
  const bar      = document.getElementById("progress-bar");
  const text     = document.getElementById("progress-text");
  const countText = document.getElementById("progress-count-text");

  if (bar)       bar.style.width = `${percentage}%`;
  if (text)      text.textContent = `${percentage}%`;
  if (countText) countText.textContent = `${done} / ${total} Completed`;

  // Update homepage card checkmarks + mini progress dots
  allPageIds.forEach(page => {
    // Use replaceAll so multi-dot filenames are handled correctly
    const safeId = page.replaceAll('.', '-');
    const isComplete = completed.includes(page);

    // Checkmark icon inside the card title
    const checkEl = document.getElementById(`check-${safeId}`);
    if (checkEl) {
      checkEl.classList.toggle("hidden", !isComplete);
    }

    // Mini dot in the progress tracker row
    const dotEl = document.getElementById(`dot-${safeId}`);
    if (dotEl) {
      if (isComplete) {
        dotEl.classList.remove("bg-slate-200");
        dotEl.classList.add("bg-indigo-500");
      } else {
        dotEl.classList.remove("bg-indigo-500");
        dotEl.classList.add("bg-slate-200");
      }
    }
  });

  // The index page no longer handles big orange locks.
  // Instead, individual pages will show a small banner if prerequisites aren't met.
};

const PREREQUISITES = {
  "genetics.html": "io.html",
  "find_motif.html": "kmers.html",
  "distances.html": "genetics.html",
  "needleman_wunsch.html": "dot_plot.html",
  "smith_waterman.html": "distances.html",
  "trie.html": "distances.html",
  "suffix_array.html": "needleman_wunsch.html"
};

function checkPagePrerequisite(pageName) {
  const req = PREREQUISITES[pageName];
  if (req && !window.isPageCompleted(req)) {
    const friendlyName = req.replace(".html", "").replace("_", " ").toUpperCase();
    const banner = document.createElement("div");
    banner.className = "bg-slate-100 text-slate-600 text-xs py-2 text-center border-b border-slate-200 font-medium";
    banner.innerHTML = `Note: This module builds upon concepts from <a href="${req}" class="text-indigo-600 font-bold hover:underline">${friendlyName}</a>. Consider completing it first.`;
    document.body.insertBefore(banner, document.body.firstChild);
  }
}

function buildModuleNavigation(pageName) {
  const index = MODULE_PAGES.indexOf(pageName);
  if (index === -1) return;

  const main = document.querySelector("main");
  if (!main) return;

  const total = MODULE_PAGES.length;
  const current = index + 1;

  const navContainer = document.createElement("div");
  // We don't want mb-5 if we just use mb-0 and let main's space-y-5 handle spacing, but we can just use the classes
  navContainer.className = "flex justify-between items-center bg-transparent border-0 p-3 rounded-none shadow-none select-none shrink-0";

  const prevLink = index > 0 
    ? `<a href="${MODULE_PAGES[index - 1]}" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">&larr; Previous</a>` 
    : `<span class="text-xs font-bold text-slate-300 flex items-center">&larr; Previous</span>`;
    
  const nextLink = index < total - 1 
    ? `<a href="${MODULE_PAGES[index + 1]}" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">Next &rarr;</a>` 
    : `<span class="text-xs font-bold text-slate-300 flex items-center">Next &rarr;</span>`;

  navContainer.innerHTML = `
    <div class="w-24">${prevLink}</div>
    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center flex-grow">Module ${current} of ${total}</div>
    <div class="w-24 flex justify-end">${nextLink}</div>
  `;

  main.insertBefore(navContainer, main.firstChild);
}

// Auto-init progress on page load
document.addEventListener("DOMContentLoaded", () => {
  window.updateProgressUI();

  // Wire up the per-page completion checkbox (on module pages)
  const checkbox = document.getElementById("page-complete-checkbox");
  if (checkbox) {
    // Netlify's "pretty URLs" feature strips .html from pathnames.
    // e.g. /pages/io.html becomes /pages/io  →  pop() gives "io" not "io.html"
    // We always normalise to include the .html suffix so it matches stored keys.
    let pageName = window.location.pathname.split("/").pop() || "index.html";
    if (!pageName.endsWith(".html")) pageName += ".html";
    
    checkPagePrerequisite(pageName);
    buildModuleNavigation(pageName);

    checkbox.checked = window.isPageCompleted(pageName);
    checkbox.addEventListener("change", (e) => {
      window.setPageCompletion(pageName, e.target.checked);
      window.updateProgressUI();
    });
  }
});

// Listen for localStorage changes made by OTHER pages/tabs (e.g. a module page
// marking itself complete while index.html is open in another tab, or on
// Netlify where navigation is a full page load and the storage event fires on
// the returning page).
window.addEventListener("storage", (e) => {
  if (e.key === "bioinformatics_learning_progress") {
    window.updateProgressUI();
  }
});

// Also refresh when the user navigates back to index.html (pageshow covers
// back-forward cache restores, which is what happens on Netlify static sites).
window.addEventListener("pageshow", () => {
  window.updateProgressUI();
});

