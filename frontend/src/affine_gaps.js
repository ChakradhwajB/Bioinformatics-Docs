// Client-side interactive implementation for Affine Gap Penalties (Gotoh's Algorithm)

document.addEventListener("DOMContentLoaded", () => {
  const alignBtn = document.getElementById("align-btn");
  const sampleBtn = document.getElementById("sample-btn");

  if (alignBtn) {
    alignBtn.addEventListener("click", performAffineAlignment);
  }
  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      document.getElementById("seq1").value = "HEAGAWGHEE";
      document.getElementById("seq2").value = "PAWHEAE";
      performAffineAlignment();
    });
  }

  performAffineAlignment();
});

function createBaseBadge(char) {
  const span = document.createElement("span");
  span.className = "inline-block w-6 py-0.5 text-center font-mono font-bold rounded text-[11px] select-none";
  if (char === 'A') span.className += " bg-rose-950 text-rose-300 border border-rose-900/35";
  else if (char === 'T' || char === 'U') span.className += " bg-amber-950 text-amber-300 border border-amber-900/35";
  else if (char === 'C') span.className += " bg-sky-950 text-sky-300 border border-sky-900/35";
  else if (char === 'G') span.className += " bg-emerald-950 text-emerald-300 border border-emerald-900/35";
  else if (char === '-') span.className += " bg-slate-800 text-slate-500 border border-slate-700/20";
  else span.className += " bg-indigo-950 text-indigo-300 border border-indigo-900/35";
  span.textContent = char;
  return span;
}

function createHeaderCell(content, extraClasses = "bg-slate-100/70 text-slate-500 border-b border-slate-200 font-bold") {
  const th = document.createElement("th");
  th.className = `p-2 text-center font-mono text-[10px] select-none ${extraClasses}`;
  th.textContent = content;
  return th;
}

function performAffineAlignment() {
  const seq1 = (document.getElementById("seq1").value || "HEAGAWGHEE").trim().toUpperCase();
  const seq2 = (document.getElementById("seq2").value || "PAWHEAE").trim().toUpperCase();
  const match = parseInt(document.getElementById("match-score").value) || 2;
  const mismatch = parseInt(document.getElementById("mismatch-penalty").value) || -1;
  const gapOpen = parseInt(document.getElementById("gap-open").value) || 3;
  const gapExtend = parseInt(document.getElementById("gap-extend").value) || 1;

  if (!seq1 || !seq2) return;

  const n = seq1.length;
  const m = seq2.length;
  const INF = 1e9;

  const M = Array.from({ length: n + 1 }, () => Array(m + 1).fill(-INF));
  const Ix = Array.from({ length: n + 1 }, () => Array(m + 1).fill(-INF));
  const Iy = Array.from({ length: n + 1 }, () => Array(m + 1).fill(-INF));

  M[0][0] = 0;
  for (let i = 1; i <= n; i++) Ix[i][0] = -gapOpen - (i - 1) * gapExtend;
  for (let j = 1; j <= m; j++) Iy[0][j] = -gapOpen - (j - 1) * gapExtend;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sub = seq1[i - 1] === seq2[j - 1] ? match : mismatch;
      M[i][j] = Math.max(M[i - 1][j - 1], Ix[i - 1][j - 1], Iy[i - 1][j - 1]) + sub;
      Ix[i][j] = Math.max(M[i - 1][j] - gapOpen, Ix[i - 1][j] - gapExtend);
      Iy[i][j] = Math.max(M[i][j - 1] - gapOpen, Iy[i][j - 1] - gapExtend);
    }
  }

  const maxScore = Math.max(M[n][m], Ix[n][m], Iy[n][m]);
  const scoreEl = document.getElementById("alignment-score");
  if (scoreEl) scoreEl.textContent = maxScore;

  // Traceback Paths calculation for every cell
  const tracebackPaths = {};
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      const path = [];
      let currI = i;
      let currJ = j;

      while (currI > 0 && currJ > 0) {
        path.push(`${currI}-${currJ}`);
        const sub = seq1[currI - 1] === seq2[currJ - 1] ? match : mismatch;
        const currentScore = Math.max(M[currI][currJ], Ix[currI][currJ], Iy[currI][currJ]);

        if (currentScore === M[currI - 1][currJ - 1] + sub) {
          currI--; currJ--;
        } else if (currentScore === Ix[currI - 1][currJ] - gapExtend || currentScore === M[currI - 1][currJ] - gapOpen) {
          currI--;
        } else {
          currJ--;
        }
      }
      while (currI > 0) { path.push(`${currI}-${currJ}`); currI--; }
      while (currJ > 0) { path.push(`${currI}-${currJ}`); currJ--; }
      path.push("0-0");
      tracebackPaths[`${i}-${j}`] = path;
    }
  }

  // Render Alignment Console
  let align1 = [];
  let align2 = [];
  let i = n, j = m;

  while (i > 0 && j > 0) {
    const sub = seq1[i - 1] === seq2[j - 1] ? match : mismatch;
    const currentScore = Math.max(M[i][j], Ix[i][j], Iy[i][j]);

    if (currentScore === M[i - 1][j - 1] + sub) {
      align1.push(seq1[i - 1]); align2.push(seq2[j - 1]);
      i--; j--;
    } else if (currentScore === Ix[i - 1][j] - gapExtend || currentScore === M[i - 1][j] - gapOpen) {
      align1.push(seq1[i - 1]); align2.push('-');
      i--;
    } else {
      align1.push('-'); align2.push(seq2[j - 1]);
      j--;
    }
  }
  while (i > 0) { align1.push(seq1[i - 1]); align2.push('-'); i--; }
  while (j > 0) { align1.push('-'); align2.push(seq2[j - 1]); j--; }

  align1.reverse();
  align2.reverse();

  renderSequenceAlignment(align1, align2);
  renderGotohDPMatrix(seq1, seq2, M, Ix, Iy, match, mismatch, gapOpen, gapExtend, tracebackPaths);
}

function renderSequenceAlignment(align1, align2) {
  const visualSeq1 = document.getElementById("visual-seq1");
  const visualMatch = document.getElementById("visual-match");
  const visualSeq2 = document.getElementById("visual-seq2");

  if (!visualSeq1 || !visualMatch || !visualSeq2) return;

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
      matchChar.className += " text-emerald-400";
    } else if (c1 !== '-' && c2 !== '-' && c1 !== c2) {
      matchChar.textContent = "x";
      matchChar.className += " text-rose-400";
    } else {
      matchChar.textContent = " ";
    }
    visualMatch.appendChild(matchChar);
  }
}

function renderGotohDPMatrix(seq1, seq2, M, Ix, Iy, match, mismatch, gapOpen, gapExtend, tracebackPaths) {
  const n = seq1.length;
  const m = seq2.length;

  const container = document.getElementById("matrix-container");
  if (!container) return;
  container.innerHTML = "";

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xs";

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
      const val = Math.max(M[i][j], Ix[i][j], Iy[i][j]);
      cell.textContent = val === -1e9 ? "-∞" : val;
      cell.id = `cell-${i}-${j}`;
      cell.className = "border-0 p-2.5 font-bold text-slate-700 transition-colors duration-150 cursor-pointer";

      const baseAlpha = val > 0 ? Math.min(0.04 + val * 0.08, 0.45) : 0;
      cell.style.backgroundColor = val > 0 
        ? `rgba(99, 102, 241, ${baseAlpha})` 
        : `rgba(241, 245, 249, 1)`;

      cell.addEventListener("mouseenter", () => {
        if (window.tracebackPlayerPlaying) return;

        const path = tracebackPaths[`${i}-${j}`];
        if (path) {
          path.forEach(coord => {
            const pathCell = table.querySelector(`#cell-${coord}`);
            if (pathCell) {
              pathCell.style.backgroundColor = "#4f46e5";
              pathCell.style.color = "#ffffff";
            }
          });
        }

        const inspector = document.getElementById("dp-inspector");
        if (inspector) {
          if (i === 0 && j === 0) {
            inspector.innerHTML = "<strong>M(0,0) = 0</strong> | Origin baseline";
          } else if (i === 0) {
            inspector.innerHTML = `<strong>Iy(0,${j}) = -gapOpen - (${j-1})*gapExtend</strong> = -${gapOpen} - ${j-1}*${gapExtend} = <strong>${val}</strong>`;
          } else if (j === 0) {
            inspector.innerHTML = `<strong>Ix(${i},0) = -gapOpen - (${i-1})*gapExtend</strong> = -${gapOpen} - ${i-1}*${gapExtend} = <strong>${val}</strong>`;
          } else {
            const isMatch = seq1[i - 1] === seq2[j - 1];
            const sub = isMatch ? match : mismatch;
            inspector.innerHTML = `<strong>M(${i},${j}) ['${seq1[i-1]}' vs '${seq2[j-1]}']</strong> = max(M: ${M[i-1][j-1]}, Ix: ${Ix[i-1][j-1]}, Iy: ${Iy[i-1][j-1]}) + sub(${sub}) = <strong>${val}</strong>`;
          }
        }
      });

      cell.addEventListener("mouseleave", () => {
        if (window.tracebackPlayerPlaying) return;

        const path = tracebackPaths[`${i}-${j}`];
        if (path) {
          path.forEach(coord => {
            const pathCell = table.querySelector(`#cell-${coord}`);
            if (pathCell) {
              const r = parseInt(coord.split("-")[0]);
              const c = parseInt(coord.split("-")[1]);
              const originalVal = Math.max(M[r][c], Ix[r][c], Iy[r][c]);
              const origAlpha = originalVal > 0 ? Math.min(0.04 + originalVal * 0.08, 0.45) : 0;
              pathCell.style.backgroundColor = originalVal > 0 
                ? `rgba(99, 102, 241, ${origAlpha})` 
                : `rgba(241, 245, 249, 1)`;
              pathCell.style.color = "#334155";
            }
          });
        }

        const inspector = document.getElementById("dp-inspector");
        if (inspector) {
          inspector.innerHTML = "Hover over cells to inspect Gotoh DP calculations.";
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
  if (optimalPath) {
    optimalPath.forEach(coord => {
      const optimalCell = table.querySelector(`#cell-${coord}`);
      if (optimalCell) {
        optimalCell.classList.add("ring-2", "ring-slate-400", "z-10");
      }
    });
  }

  // Player controls
  const playerPanel = document.getElementById("player-controls");
  if (playerPanel) {
    playerPanel.classList.remove("hidden");
    if (window.tracebackPlayerInterval) {
      clearInterval(window.tracebackPlayerInterval);
      window.tracebackPlayerInterval = null;
    }

    let currentStep = 0;
    const steps = optimalPath || [];
    let isPlaying = false;

    window.tracebackPlayerActiveStep = currentStep;
    window.tracebackPlayerPlaying = isPlaying;

    const playBtn = document.getElementById("player-play");
    const nextBtn = document.getElementById("player-next");
    const prevBtn = document.getElementById("player-prev");
    const resetBtn = document.getElementById("player-reset");

    if (playBtn && nextBtn && prevBtn && resetBtn) {
      playBtn.textContent = "Play";

      function resetCellStyles() {
        for (let r = 0; r <= n; r++) {
          for (let c = 0; c <= m; c++) {
            const cellEl = table.querySelector(`#cell-${r}-${c}`);
            if (cellEl) {
              const originalVal = Math.max(M[r][c], Ix[r][c], Iy[r][c]);
              const origAlpha = originalVal > 0 ? Math.min(0.04 + originalVal * 0.08, 0.45) : 0;
              cellEl.style.backgroundColor = originalVal > 0 
                ? `rgba(99, 102, 241, ${origAlpha})` 
                : `rgba(241, 245, 249, 1)`;
              cellEl.style.color = "#334155";
            }
          }
        }
        steps.forEach(coord => {
          const optimalCell = table.querySelector(`#cell-${coord}`);
          if (optimalCell) optimalCell.classList.add("ring-2", "ring-slate-400", "z-10");
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
        }
      }

      playBtn.onclick = () => {
        isPlaying = !isPlaying;
        window.tracebackPlayerPlaying = isPlaying;
        if (isPlaying) {
          playBtn.textContent = "Pause";
          window.tracebackPlayerInterval = setInterval(() => {
            if (currentStep < steps.length - 1) {
              renderStep(currentStep + 1);
            } else {
              isPlaying = false;
              window.tracebackPlayerPlaying = false;
              playBtn.textContent = "Play";
              clearInterval(window.tracebackPlayerInterval);
            }
          }, 400);
        } else {
          playBtn.textContent = "Play";
          if (window.tracebackPlayerInterval) clearInterval(window.tracebackPlayerInterval);
        }
      };

      nextBtn.onclick = () => {
        if (currentStep < steps.length - 1) renderStep(currentStep + 1);
      };
      prevBtn.onclick = () => {
        if (currentStep > 0) renderStep(currentStep - 1);
      };
      resetBtn.onclick = () => {
        isPlaying = false;
        window.tracebackPlayerPlaying = false;
        playBtn.textContent = "Play";
        if (window.tracebackPlayerInterval) clearInterval(window.tracebackPlayerInterval);
        renderStep(0);
      };

      renderStep(0);
    }
  }
}
