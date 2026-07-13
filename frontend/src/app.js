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

window.updateProgressUI = function() {
  const completed = window.getCompletedPages();
  const allPageIds = [
    "io.html", "genetics.html",
    "kmers.html", "find_motif.html",
    "dot_plot.html", "distances.html",
    "needleman_wunsch.html", "smith_waterman.html",
    "trie.html", "suffix_array.html"
  ];
  
  // Calculate percentage
  const total = allPageIds.length;
  const done = allPageIds.filter(p => completed.includes(p)).length;
  const percentage = Math.round((done / total) * 100);
  
  // Update progress bar if it exists (on homepage)
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  const countText = document.getElementById("progress-count-text");
  
  if (bar) bar.style.width = `${percentage}%`;
  if (text) text.textContent = `${percentage}%`;
  if (countText) countText.textContent = `${done}/${total} Completed`;
  
  // Update homepage cards checkmarks
  allPageIds.forEach(page => {
    const checkEl = document.getElementById(`check-${page.replace('.', '-')}`);
    if (checkEl) {
      if (completed.includes(page)) {
        checkEl.classList.remove("hidden");
      } else {
        checkEl.classList.add("hidden");
      }
    }
  });
};

// Auto-init progress bar if page loaded is index.html
document.addEventListener("DOMContentLoaded", () => {
  window.updateProgressUI();
  
  const checkbox = document.getElementById("page-complete-checkbox");
  if (checkbox) {
    const pageName = window.location.pathname.split("/").pop() || "index.html";
    checkbox.checked = window.isPageCompleted(pageName);
    checkbox.addEventListener("change", (e) => {
      window.setPageCompletion(pageName, e.target.checked);
    });
  }
});

