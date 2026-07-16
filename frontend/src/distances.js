const API_BASE = window.API_BASE;
const checkServerStatus = window.checkServerStatus;

document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  const calcBtn = document.getElementById("calc-btn");
  if (calcBtn) {
    calcBtn.addEventListener("click", runDistanceCalculation);
  }

  runDistanceCalculation();
});

async function runDistanceCalculation() {
  const seq1 = document.getElementById("seq1").value.trim().toUpperCase();
  const seq2 = document.getElementById("seq2").value.trim().toUpperCase();
  const metric = document.getElementById("distance-metric-select").value;

  if (!seq1 || !seq2) {
    alert("Please enter both sequences.");
    return;
  }

  const helperText = document.getElementById("visual-helper-text");

  try {
    const res = await fetch(`${API_BASE}/alignments/${metric}-distance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seq1, seq2 })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Distance calculation failed.");
    }

    const result = await res.json();
    const distanceVal = result.distance;

    document.getElementById("distance-score").textContent = distanceVal;

    if (metric === "hamming") {
      helperText.textContent = "Mismatch Position Highlights";
      document.getElementById("player-controls").classList.add("hidden");
      document.getElementById("dp-inspector").classList.add("hidden");
      renderHammingConsole(seq1, seq2, distanceVal);
      renderHammingVisualizer(seq1, seq2);
    } else {
      helperText.textContent = "Edit Operations Scoring Table";
      document.getElementById("player-controls").classList.remove("hidden");
      document.getElementById("dp-inspector").classList.remove("hidden");
      renderLevenshteinConsole(seq1, seq2, distanceVal);
      renderLevMatrix(seq1, seq2);
    }


  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function renderHammingConsole(seq1, seq2, dist) {
  const consoleEl = document.getElementById("output-console");
  consoleEl.innerHTML = `
    <div class="mb-1 text-slate-400">HAMMING DISTANCE CALCULATION REPORT:</div>
    <div class="mb-2">Counts index-by-index character mutations. Distance is only evaluated up to the length of the shorter sequence.</div>
    <div>S1: <span class="tracking-widest">${seq1}</span></div>
    <div>S2: <span class="tracking-widest">${seq2}</span></div>
    <div class="mt-2 text-amber-500 font-bold">Total Mismatches: ${dist}</div>
  `;
}

function renderLevenshteinConsole(seq1, seq2, dist) {
  const consoleEl = document.getElementById("output-console");
  consoleEl.innerHTML = `
    <div class="mb-1 text-slate-400">EDIT DISTANCE (LEVENSHTEIN) REPORT:</div>
    <div class="mb-2">Minimum single-character insertions, deletions, or substitutions required to align strands.</div>
    <div>S1: <span class="tracking-widest">${seq1}</span> (len: ${seq1.length})</div>
    <div>S2: <span class="tracking-widest">${seq2}</span> (len: ${seq2.length})</div>
    <div class="mt-2 text-rose-500 font-bold">Minimum operations count: ${dist}</div>
  `;
}

function renderHammingVisualizer(seq1, seq2) {
  const container = document.getElementById("visualizer-container");
  container.innerHTML = "";
  container.className = "flex-grow overflow-auto bg-slate-50 p-4 flex flex-col items-center justify-center space-y-2 border border-slate-150 rounded";

  const row1 = document.createElement("div");
  row1.className = "flex space-x-1 font-mono-seq text-xs";
  const arrowRow = document.createElement("div");
  arrowRow.className = "flex space-x-1 font-mono-seq text-[10px]";
  const row2 = document.createElement("div");
  row2.className = "flex space-x-1 font-mono-seq text-xs";

  const minLen = Math.min(seq1.length, seq2.length);

  for (let i = 0; i < minLen; i++) {
    const c1 = seq1[i];
    const c2 = seq2[i];
    const isMatch = c1 === c2;

    row1.appendChild(createDistanceBadge(c1, isMatch));
    row2.appendChild(createDistanceBadge(c2, isMatch));

    const marker = document.createElement("span");
    marker.className = `inline-block w-6 text-center font-bold ${isMatch ? 'text-emerald-600' : 'text-rose-600'}`;
    marker.textContent = isMatch ? "↓" : "X";
    arrowRow.appendChild(marker);
  }

  container.appendChild(row1);
  container.appendChild(arrowRow);
  container.appendChild(row2);
}

function createDistanceBadge(char, isMatch) {
  const span = document.createElement("span");
  span.className = "inline-block w-6 py-1 text-center font-bold border rounded shadow-none";
  if (isMatch) {
    span.className += " bg-emerald-50 text-emerald-700 border-emerald-200";
  } else {
    span.className += " bg-rose-50 text-rose-700 border-rose-200 font-black";
  }
  span.textContent = char;
  return span;
}

function renderLevMatrix(seq1, seq2) {
  const n = seq1.length;
  const m = seq2.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (seq1[i - 1] === seq2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }

  const container = document.getElementById("visualizer-container");
  container.innerHTML = "";
  container.className = "flex-grow overflow-auto bg-slate-50 p-4 border-0 rounded flex flex-col justify-start";

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "border-0 bg-transparent rounded-none overflow-x-auto w-full";

  const table = document.createElement("table");
  table.className = "min-w-full border-collapse border-0 text-center font-mono text-[10px] select-none";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(createHeaderCell(""));
  headerRow.appendChild(createHeaderCell("-"));
  for (let j = 0; j < m; j++) {
    headerRow.appendChild(createHeaderCell(seq2[j], "bg-slate-50 border-b border-slate-200 text-slate-650 font-bold"));
  }
  table.appendChild(headerRow);

  for (let i = 0; i <= n; i++) {
    const row = document.createElement("tr");
    if (i === 0) {
      row.appendChild(createHeaderCell("-"));
    } else {
      row.appendChild(createHeaderCell(seq1[i - 1], "bg-slate-50 border-r border-slate-200 text-slate-650 font-bold"));
    }

    for (let j = 0; j <= m; j++) {
      const cell = document.createElement("td");
      cell.id = `cell-${i}-${j}`;
      const val = dp[i][j];
      cell.textContent = val;
      cell.className = "border-0 p-2.5 font-bold text-slate-700 transition-colors duration-150 cursor-pointer";

      const baseAlpha = val > 0 ? Math.min(val * 0.08, 0.45) : 0;
      cell.style.backgroundColor = val === 0 
        ? "rgba(16, 185, 129, 0.15)"
        : `rgba(244, 63, 94, ${baseAlpha})`;

      // Hover interaction
      cell.addEventListener("mouseenter", () => {
        if (window.tracebackPlayerPlaying) return;
        const inspector = document.getElementById("dp-inspector");
        if (inspector) {
          if (i === 0 && j === 0) {
            inspector.innerHTML = `<strong>L(0,0) = 0</strong> | Origin`;
          } else if (i === 0) {
            inspector.innerHTML = `<strong>L(0,${j}) = L(0,${j-1}) + 1</strong> = ${dp[0][j-1]} + 1 = <strong>${val}</strong> | Insertion`;
          } else if (j === 0) {
            inspector.innerHTML = `<strong>L(${i},0) = L(${i-1},0) + 1</strong> = ${dp[i-1][0]} + 1 = <strong>${val}</strong> | Deletion`;
          } else {
            const cost = seq1[i-1] === seq2[j-1] ? 0 : 1;
            const op = cost === 0 ? "Match" : "Substitute";
            inspector.innerHTML = `<strong>L(${i},${j})</strong> = min(Del: ${dp[i-1][j]} + 1, Ins: ${dp[i][j-1]} + 1, Sub: ${dp[i-1][j-1]} + ${cost} (${op})) = <strong>${val}</strong>`;
          }
        }
      });

      cell.addEventListener("mouseleave", () => {
        if (window.tracebackPlayerPlaying) return;
        if (window.tracebackPlayerActiveStep !== undefined && typeof window.tracebackPlayerRenderStep === "function") {
          window.tracebackPlayerRenderStep(window.tracebackPlayerActiveStep);
          return;
        }
        const inspector = document.getElementById("dp-inspector");
        if (inspector) {
          inspector.innerHTML = "Hover over cells or use the player to inspect DP calculations.";
        }
      });

      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);

  // Compute traceback path
  const optimalPath = [];
  let currI = n;
  let currJ = m;
  optimalPath.push(`${currI}-${currJ}`);
  while (currI > 0 || currJ > 0) {
    if (currI > 0 && currJ > 0 && seq1[currI-1] === seq2[currJ-1] && dp[currI][currJ] === dp[currI-1][currJ-1]) {
      currI--; currJ--;
    } else if (currI > 0 && currJ > 0 && dp[currI][currJ] === dp[currI-1][currJ-1] + 1) {
      currI--; currJ--;
    } else if (currI > 0 && dp[currI][currJ] === dp[currI-1][currJ] + 1) {
      currI--;
    } else {
      currJ--;
    }
    optimalPath.push(`${currI}-${currJ}`);
  }
  optimalPath.reverse(); // Go from (0,0) to (n,m)

  // Set default ring class to show optimal path initially
  optimalPath.forEach(coord => {
    const optimalCell = table.querySelector(`#cell-${coord}`);
    if (optimalCell) {
      optimalCell.classList.add("ring-2", "ring-slate-400", "z-10");
    }
  });

  const playerPanel = document.getElementById("player-controls");
  if (playerPanel) {
    // Clear previous intervals if any
    if (window.tracebackPlayerInterval) {
      clearInterval(window.tracebackPlayerInterval);
      window.tracebackPlayerInterval = null;
    }
    
    let currentStep = 0;
    const steps = optimalPath;
    let isPlaying = false;

    window.tracebackPlayerActiveStep = currentStep;
    window.tracebackPlayerPlaying = isPlaying;
    window.tracebackPlayerRenderStep = renderStep;

    const playBtn = document.getElementById("player-play");
    const nextBtn = document.getElementById("player-next");
    const prevBtn = document.getElementById("player-prev");
    const resetBtn = document.getElementById("player-reset");

    playBtn.textContent = "Play";
    playBtn.className = "px-2.5 py-1 text-[10px] bg-slate-800 text-white hover:bg-slate-900 rounded-none font-bold cursor-pointer";

    function resetCellStyles() {
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
          const c = table.querySelector(`#cell-${i}-${j}`);
          if (c) {
            c.style.backgroundColor = "";
            c.style.color = "";
            c.className = "border-0 p-2.5 font-bold text-slate-700 transition-colors duration-150 cursor-pointer";
            
            const val = dp[i][j];
            const baseAlpha = val > 0 ? Math.min(val * 0.08, 0.45) : 0;
            c.style.backgroundColor = val === 0 
              ? "rgba(16, 185, 129, 0.15)"
              : `rgba(244, 63, 94, ${baseAlpha})`;
            c.style.color = "#334155";
          }
        }
      }
      
      optimalPath.forEach(coord => {
        const optimalCell = table.querySelector(`#cell-${coord}`);
        if (optimalCell) {
          optimalCell.classList.add("ring-2", "ring-slate-400", "z-10");
        }
      });
    }

    function renderStep(index) {
      currentStep = index;
      window.tracebackPlayerActiveStep = index;
      resetCellStyles();
      
      for (let s = 0; s <= index; s++) {
        const coord = steps[s];
        const pathCell = table.querySelector(`#cell-${coord}`);
        if (pathCell) {
          pathCell.style.backgroundColor = "#4f46e5";
          pathCell.style.color = "#ffffff";
        }
      }

      const activeCoord = steps[index];
      const activeCell = table.querySelector(`#cell-${activeCoord}`);
      if (activeCell) {
        activeCell.style.backgroundColor = "#10b981";
        activeCell.style.color = "#ffffff";
        activeCell.classList.add("active-traceback-cell", "z-30");
        activeCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }

      const [currI, currJ] = activeCoord.split("-").map(Number);
      const inspector = document.getElementById("dp-inspector");
      const val = dp[currI][currJ];

      if (inspector) {
        if (currI === 0 && currJ === 0) {
          inspector.innerHTML = `<strong>L(0,0) = 0</strong> | Origin baseline reached`;
        } else if (currI === 0) {
          inspector.innerHTML = `<strong>Step ${index + 1}: L(0,${currJ}) = L(0,${currJ-1}) + 1</strong> = ${dp[0][currJ-1]} + 1 = <strong>${val}</strong> | Insertion`;
        } else if (currJ === 0) {
          inspector.innerHTML = `<strong>Step ${index + 1}: L(${currI},0) = L(${currI-1},0) + 1</strong> = ${dp[currI-1][0]} + 1 = <strong>${val}</strong> | Deletion`;
        } else {
          const cost = seq1[currI-1] === seq2[currJ-1] ? 0 : 1;
          const op = cost === 0 ? "Match" : "Substitute";
          inspector.innerHTML = `<strong>Step ${index + 1}: L(${currI},${currJ})</strong> = min(Del: ${dp[currI-1][currJ]} + 1, Ins: ${dp[currI][currJ-1]} + 1, Sub: ${dp[currI-1][currJ-1]} + ${cost} (${op})) = <strong>${val}</strong>`;
        }
      }
    }

    function pause() {
      isPlaying = false;
      window.tracebackPlayerPlaying = false;
      clearInterval(window.tracebackPlayerInterval);
      window.tracebackPlayerInterval = null;
      playBtn.textContent = "Play";
      playBtn.className = "px-2.5 py-1 text-[10px] bg-slate-800 text-white hover:bg-slate-900 rounded-none font-bold cursor-pointer";
    }

    function play() {
      isPlaying = true;
      window.tracebackPlayerPlaying = true;
      playBtn.textContent = "Pause";
      playBtn.className = "px-2.5 py-1 text-[10px] bg-rose-600 text-white hover:bg-rose-700 rounded-none font-bold cursor-pointer";
      
      window.tracebackPlayerInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          renderStep(currentStep);
        } else {
          pause();
        }
      }, 700);
    }

    const newPlayBtn = playBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    const newPrevBtn = prevBtn.cloneNode(true);
    const newResetBtn = resetBtn.cloneNode(true);

    playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);

    newPlayBtn.addEventListener("click", () => {
      if (isPlaying) pause();
      else {
        if (currentStep >= steps.length - 1) {
          currentStep = 0;
          renderStep(0);
        }
        play();
      }
    });

    newNextBtn.addEventListener("click", () => {
      pause();
      if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep(currentStep);
      }
    });

    newPrevBtn.addEventListener("click", () => {
      pause();
      if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
      }
    });

    newResetBtn.addEventListener("click", () => {
      pause();
      currentStep = 0;
      renderStep(0);
    });

    renderStep(0);
  }
}

function createHeaderCell(text, className = "bg-slate-100 text-slate-500") {
  const th = document.createElement("th");
  th.textContent = text;
  th.className = `border-0 p-2.5 font-semibold ${className}`;
  return th;
}
