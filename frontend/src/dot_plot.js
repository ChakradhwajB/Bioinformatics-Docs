document.addEventListener("DOMContentLoaded", () => {
  // Initialize server check
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  const plotBtn = document.getElementById("plot-btn");
  if (plotBtn) {
    plotBtn.addEventListener("click", generateDotPlot);
  }

  // Pre-run on load
  generateDotPlot();
});

function generateDotPlot() {
  const seq1Val = document.getElementById("seq1").value.toUpperCase().replace(/\s/g, "");
  const seq2Val = document.getElementById("seq2").value.toUpperCase().replace(/\s/g, "");
  
  const wSizeInput = document.getElementById("window-size");
  const minMatchesInput = document.getElementById("min-matches");
  
  const windowSize = parseInt(wSizeInput.value) || 1;
  const minMatches = parseInt(minMatchesInput.value) || 1;

  const container = document.getElementById("plot-container");
  const dotCountSpan = document.getElementById("dot-count");
  const inspector = document.getElementById("dot-inspector");

  if (!seq1Val || !seq2Val) {
    container.innerHTML = `<span class="text-rose-500 font-semibold text-xs">Error: Both sequences must contain bases.</span>`;
    return;
  }

  if (windowSize < 1) {
    container.innerHTML = `<span class="text-rose-500 font-semibold text-xs">Error: Window size must be at least 1.</span>`;
    return;
  }

  if (minMatches < 1 || minMatches > windowSize) {
    container.innerHTML = `<span class="text-rose-500 font-semibold text-xs">Error: Min Matches must be between 1 and the window size.</span>`;
    return;
  }

  const n = seq1Val.length; // rows
  const m = seq2Val.length; // columns

  // Generate dot plot matrix
  const matrix = Array(n).fill(null).map(() => Array(m).fill(false));
  let dotCount = 0;

  for (let i = 0; i <= n - windowSize; i++) {
    for (let j = 0; j <= m - windowSize; j++) {
      let matches = 0;
      for (let k = 0; k < windowSize; k++) {
        if (seq1Val[i + k] === seq2Val[j + k]) {
          matches++;
        }
      }
      if (matches >= minMatches) {
        matrix[i][j] = true;
        dotCount++;
      }
    }
  }

  dotCountSpan.textContent = dotCount;

  // Render comparative table grid
  container.innerHTML = "";
  const tableWrapper = document.createElement("div");
  tableWrapper.className = "inline-block border border-slate-200 bg-white max-h-[500px] overflow-auto";

  const table = document.createElement("table");
  table.className = "border-collapse font-mono text-[10px]";

  // Header row (horizontal seq2)
  const headerRow = document.createElement("tr");
  const cornerCell = document.createElement("th");
  cornerCell.className = "border border-slate-200 bg-slate-100 p-1 min-w-[24px] sticky top-0 left-0 z-30 select-none text-[8px] text-slate-400 font-bold";
  cornerCell.textContent = "S1 \\ S2";
  headerRow.appendChild(cornerCell);

  for (let j = 0; j < m; j++) {
    const th = document.createElement("th");
    th.className = "border border-slate-200 bg-slate-50 p-1 min-w-[20px] sticky top-0 z-20 text-slate-700 font-bold text-center select-none";
    th.textContent = seq2Val[j];
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Table rows (vertical seq1)
  for (let i = 0; i < n; i++) {
    const row = document.createElement("tr");

    // Left row header
    const rowHeader = document.createElement("td");
    rowHeader.className = "border border-slate-200 bg-slate-50 p-1 min-w-[24px] sticky left-0 z-20 text-slate-700 font-bold text-center select-none";
    rowHeader.textContent = seq1Val[i];
    row.appendChild(rowHeader);

    for (let j = 0; j < m; j++) {
      const cell = document.createElement("td");
      cell.className = "border border-slate-150 p-1.5 transition-colors duration-150 cursor-pointer w-5 h-5 text-center";
      
      const isDotted = matrix[i][j];
      
      if (isDotted) {
        cell.className += " bg-slate-800 hover:bg-indigo-600";
      } else {
        cell.className += " bg-slate-50 hover:bg-slate-200";
      }

      cell.addEventListener("mouseenter", () => {
        inspector.innerHTML = `Position: <strong>S1[${i}] = ${seq1Val[i]}</strong>, <strong>S2[${j}] = ${seq2Val[j]}</strong>${isDotted ? " (Dot Plotted)" : ""}`;
      });

      cell.addEventListener("mouseleave", () => {
        inspector.textContent = "Hover over cells to inspect positions.";
      });

      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);
}
