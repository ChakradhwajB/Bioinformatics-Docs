const API_BASE = window.API_BASE;
const checkServerStatus = window.checkServerStatus;

document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  const alignBtn = document.getElementById("align-btn");
  if (alignBtn) {
    alignBtn.addEventListener("click", performNWAlignment);
  }

  performNWAlignment();
});

async function performNWAlignment() {
  const seq1 = document.getElementById("seq1").value.trim().toUpperCase();
  const seq2 = document.getElementById("seq2").value.trim().toUpperCase();
  const match = parseInt(document.getElementById("match").value) || 1;
  const mismatch = parseInt(document.getElementById("mismatch").value) || -1;
  const gap = parseInt(document.getElementById("gap").value) || -1;

  if (!seq1 || !seq2) {
    alert("Please enter both sequences.");
    return;
  }

  const alignBtn = document.getElementById("align-btn");
  alignBtn.disabled = true;
  alignBtn.classList.add("opacity-50");

  try {
    const response = await fetch(`${API_BASE}/alignments/needleman-wunsch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seq1, seq2, match, mismatch, gap })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Alignment request failed.");
    }

    const result = await response.json();

    document.getElementById("alignment-score").textContent = result.score;
    renderSequenceAlignment(result.alignment_1, result.alignment_2);
    renderDPMatrix(seq1, seq2, match, mismatch, gap);

  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    alignBtn.disabled = false;
    alignBtn.classList.remove("opacity-50");
  }
}

function renderSequenceAlignment(align1, align2) {
  const visualSeq1 = document.getElementById("visual-seq1");
  const visualMatch = document.getElementById("visual-match");
  const visualSeq2 = document.getElementById("visual-seq2");

  visualSeq1.innerHTML = "";
  visualMatch.innerHTML = "";
  visualSeq2.innerHTML = "";

  for (let i = 0; i < align1.length; i++) {
    const c1 = align1[i];
    const c2 = align2[i];

    visualSeq1.appendChild(createBaseBadge(c1));
    visualSeq2.appendChild(createBaseBadge(c2));

    const matchChar = document.createElement("span");
    matchChar.className = "inline-block w-6 text-center font-bold text-[10px]";
    if (c1 === c2 && c1 !== '-') {
      matchChar.textContent = "|";
      matchChar.className += " text-emerald-500";
    } else if (c1 !== '-' && c2 !== '-' && c1 !== c2) {
      matchChar.textContent = "x";
      matchChar.className += " text-rose-500";
    } else {
      matchChar.textContent = " ";
    }
    visualMatch.appendChild(matchChar);
  }
}

function createBaseBadge(char) {
  const span = document.createElement("span");
  span.className = "inline-block w-6 py-0.5 text-center font-mono font-bold rounded text-[11px]";
  if (char === 'A') span.className += " bg-rose-950 text-rose-300 border border-rose-900/35";
  else if (char === 'T' || char === 'U') span.className += " bg-amber-950 text-amber-300 border border-amber-900/35";
  else if (char === 'C') span.className += " bg-sky-950 text-sky-300 border border-sky-900/35";
  else if (char === 'G') span.className += " bg-emerald-950 text-emerald-300 border border-emerald-900/35";
  else span.className += " bg-slate-800 text-slate-500 border border-slate-700/20";
  span.textContent = char;
  return span;
}

function renderDPMatrix(seq1, seq2, match, mismatch, gap) {
  const n = seq1.length;
  const m = seq2.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * gap;
  for (let j = 0; j <= m; j++) dp[0][j] = j * gap;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const matchScore = dp[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? match : mismatch);
      const delScore = dp[i - 1][j] + gap;
      const insScore = dp[i][j - 1] + gap;
      dp[i][j] = Math.max(matchScore, delScore, insScore);
    }
  }

  const tracebackPaths = {};
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      const path = [];
      let currI = i;
      let currJ = j;
      while (currI > 0 || currJ > 0) {
        path.push(`${currI}-${currJ}`);
        if (currI > 0 && currJ > 0 && dp[currI][currJ] === dp[currI - 1][currJ - 1] + (seq1[currI - 1] === seq2[currJ - 1] ? match : mismatch)) {
          currI--;
          currJ--;
        } else if (currI > 0 && dp[currI][currJ] === dp[currI - 1][currJ] + gap) {
          currI--;
        } else {
          currJ--;
        }
      }
      path.push("0-0");
      tracebackPaths[`${i}-${j}`] = path;
    }
  }

  const container = document.getElementById("matrix-container");
  container.innerHTML = "";

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "border border-slate-200 bg-white rounded-md overflow-x-auto w-full";

  const table = document.createElement("table");
  table.className = "min-w-full border-collapse border border-slate-200 text-center font-mono text-[10px] select-none";

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
      const val = dp[i][j];
      cell.textContent = val;
      cell.id = `cell-${i}-${j}`;
      cell.className = "border border-slate-200 p-2.5 font-bold text-slate-700 transition-colors duration-150 cursor-pointer";

      const baseAlpha = val > 0 ? Math.min(0.04 + val * 0.08, 0.45) : 0;
      cell.style.backgroundColor = val > 0 
        ? `rgba(99, 102, 241, ${baseAlpha})`
        : `rgba(241, 245, 249, 1)`;

      cell.addEventListener("mouseenter", () => {
        if (window.tracebackPlayerPlaying) return;

        const path = tracebackPaths[`${i}-${j}`];
        path.forEach(coord => {
          const pathCell = table.querySelector(`#cell-${coord}`);
          if (pathCell) {
            pathCell.style.backgroundColor = "#475569";
            pathCell.style.color = "#ffffff";
          }
        });

        // Dynamic Programming Transition Step Tooltip
        const inspector = document.getElementById("dp-inspector");
        if (inspector) {
          if (i === 0 && j === 0) {
            inspector.innerHTML = "<strong>E(0,0) = 0</strong> | Origin baseline";
          } else if (i === 0) {
            inspector.innerHTML = `<strong>E(0,${j}) = E(0,${j-1}) + gap</strong> = ${dp[0][j-1]} + (${gap}) = <strong>${val}</strong> | Insertion base case`;
          } else if (j === 0) {
            inspector.innerHTML = `<strong>E(${i},0) = E(${i-1},0) + gap</strong> = ${dp[i-1][0]} + (${gap}) = <strong>${val}</strong> | Deletion base case`;
          } else {
            const isCharMatch = seq1[i-1] === seq2[j-1];
            const matchScore = isCharMatch ? match : mismatch;
            const matchLabel = isCharMatch ? "match" : "mismatch";

            const dVal = dp[i-1][j-1];
            const tVal = dp[i-1][j];
            const lVal = dp[i][j-1];

            const dSum = dVal + matchScore;
            const tSum = tVal + gap;
            const lSum = lVal + gap;

            inspector.innerHTML = `<strong>E(${i},${j})</strong> = max(Diag: ${dVal} + ${matchScore} (${matchLabel}) = ${dSum}, Top: ${tVal} + (${gap}) = ${tSum}, Left: ${lVal} + (${gap}) = ${lSum}) = <strong>${val}</strong>`;
          }
        }
      });

      cell.addEventListener("mouseleave", () => {
        if (window.tracebackPlayerPlaying) return;

        if (window.tracebackPlayerActiveStep !== undefined && typeof window.tracebackPlayerRenderStep === "function") {
          window.tracebackPlayerRenderStep(window.tracebackPlayerActiveStep);
          return;
        }

        const path = tracebackPaths[`${i}-${j}`];
        path.forEach(coord => {
          const pathCell = table.querySelector(`#cell-${coord}`);
          if (pathCell) {
            const originalVal = dp[parseInt(coord.split("-")[0])][parseInt(coord.split("-")[1])];
            const origAlpha = originalVal > 0 ? Math.min(0.04 + originalVal * 0.08, 0.45) : 0;
            pathCell.style.backgroundColor = originalVal > 0 
              ? `rgba(99, 102, 241, ${origAlpha})` 
              : `rgba(241, 245, 249, 1)`;
            pathCell.style.color = "#334155";
          }
        });

        const inspector = document.getElementById("dp-inspector");
        if (inspector) {
          inspector.innerHTML = "Hover over cells to inspect DP calculations.";
        }
      });

      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);

  // Traceback Path Player Integration
  const optimalPath = tracebackPaths[`${n}-${m}`];
  
  // Set default ring class to show optimal path initially
  optimalPath.forEach(coord => {
    const optimalCell = table.querySelector(`#cell-${coord}`);
    if (optimalCell) {
      optimalCell.classList.add("ring-2", "ring-slate-400", "z-10");
    }
  });

  const playerPanel = document.getElementById("player-controls");
  if (playerPanel) {
    playerPanel.classList.remove("hidden");
    
    // Clear previous intervals if any
    if (window.tracebackPlayerInterval) {
      clearInterval(window.tracebackPlayerInterval);
      window.tracebackPlayerInterval = null;
    }
    
    let currentStep = 0;
    const steps = optimalPath; // path from (n,m) to (0,0)
    let isPlaying = false;

    window.tracebackPlayerActiveStep = currentStep;
    window.tracebackPlayerPlaying = isPlaying;
    window.tracebackPlayerRenderStep = renderStep;

    const playBtn = document.getElementById("player-play");
    const nextBtn = document.getElementById("player-next");
    const prevBtn = document.getElementById("player-prev");
    const resetBtn = document.getElementById("player-reset");

    // Reset button states
    playBtn.textContent = "Play";
    playBtn.className = "px-2.5 py-1 text-[10px] bg-slate-800 text-white hover:bg-slate-900 rounded-sm font-bold cursor-pointer";

    function resetCellStyles() {
      // Restore all cells to their original background/color states
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
          const c = table.querySelector(`#cell-${i}-${j}`);
          if (c) {
            c.style.backgroundColor = "";
            c.style.color = "";
            c.className = "border border-slate-200 p-2.5 font-bold text-slate-700 transition-colors duration-150 cursor-pointer";
            
            const originalVal = dp[i][j];
            const origAlpha = originalVal > 0 ? Math.min(0.04 + originalVal * 0.08, 0.45) : 0;
            c.style.backgroundColor = originalVal > 0 
              ? `rgba(99, 102, 241, ${origAlpha})` 
              : `rgba(241, 245, 249, 1)`;
            c.style.color = "#334155";
          }
        }
      }
      
      // Re-add baseline optimal ring
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
      
      // Highlight path up to current index
      for (let s = 0; s <= index; s++) {
        const coord = steps[s];
        const pathCell = table.querySelector(`#cell-${coord}`);
        if (pathCell) {
          pathCell.style.backgroundColor = "#475569";
          pathCell.style.color = "#ffffff";
        }
      }

      // Highlight active cell uniquely
      const activeCoord = steps[index];
      const activeCell = table.querySelector(`#cell-${activeCoord}`);
      if (activeCell) {
        activeCell.style.backgroundColor = "#10b981"; // Emerald bg
        activeCell.style.color = "#ffffff";
        activeCell.classList.remove("ring-slate-400");
        activeCell.classList.add("ring-4", "ring-emerald-400", "z-20");
        
        // Scroll into view
        activeCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }

      // Update inspector details
      const [currI, currJ] = activeCoord.split("-").map(Number);
      const inspector = document.getElementById("dp-inspector");
      const val = dp[currI][currJ];

      if (inspector) {
        if (currI === 0 && currJ === 0) {
          inspector.innerHTML = `<strong>E(0,0) = 0</strong> | Origin baseline reached`;
        } else if (currI === 0) {
          inspector.innerHTML = `<strong>E(0,${currJ}) = E(0,${currJ-1}) + gap</strong> = ${dp[0][currJ-1]} + (${gap}) = <strong>${val}</strong> | Insertion`;
        } else if (currJ === 0) {
          inspector.innerHTML = `<strong>E(${currI},0) = E(${currI-1},0) + gap</strong> = ${dp[currI-1][0]} + (${gap}) = <strong>${val}</strong> | Deletion`;
        } else {
          const isCharMatch = seq1[currI-1] === seq2[currJ-1];
          const matchScore = isCharMatch ? match : mismatch;
          const matchLabel = isCharMatch ? "match" : "mismatch";

          const dVal = dp[currI-1][currJ-1];
          const tVal = dp[currI-1][currJ];
          const lVal = dp[currI][currJ-1];

          const dSum = dVal + matchScore;
          const tSum = tVal + gap;
          const lSum = lVal + gap;

          inspector.innerHTML = `<strong>Step ${index + 1}: E(${currI},${currJ})</strong> = max(Diag: ${dVal} + ${matchScore} = ${dSum}, Top: ${tVal} + (${gap}) = ${tSum}, Left: ${lVal} + (${gap}) = ${lSum}) = <strong>${val}</strong>`;
        }
      }
    }

    function pause() {
      isPlaying = false;
      window.tracebackPlayerPlaying = false;
      clearInterval(window.tracebackPlayerInterval);
      window.tracebackPlayerInterval = null;
      playBtn.textContent = "Play";
      playBtn.className = "px-2.5 py-1 text-[10px] bg-slate-800 text-white hover:bg-slate-900 rounded-sm font-bold cursor-pointer";
    }

    function play() {
      isPlaying = true;
      window.tracebackPlayerPlaying = true;
      playBtn.textContent = "Pause";
      playBtn.className = "px-2.5 py-1 text-[10px] bg-rose-600 text-white hover:bg-rose-700 rounded-sm font-bold cursor-pointer";
      
      window.tracebackPlayerInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          renderStep(currentStep);
        } else {
          pause();
        }
      }, 700);
    }

    // Button Event Listeners
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

    // Start on first step
    renderStep(0);
  }
}

function createHeaderCell(text, className = "bg-slate-100 text-slate-500") {
  const th = document.createElement("th");
  th.textContent = text;
  th.className = `border border-slate-200 p-2.5 font-semibold ${className}`;
  return th;
}
