// Client-side interactive implementation for Hidden Markov Models & Viterbi Decoding

let viterbiState = {
  obs: "",
  states: ['CpG+', 'CpG-'],
  V: [],
  back: [],
  path: [],
  currentStep: -1,
  isPlaying: false,
  playTimer: null
};

document.addEventListener("DOMContentLoaded", () => {
  const decodeBtn = document.getElementById("decode-btn");
  const sampleBtn = document.getElementById("sample-btn");

  const playBtn = document.getElementById("player-play");
  const prevBtn = document.getElementById("player-prev");
  const nextBtn = document.getElementById("player-next");
  const resetBtn = document.getElementById("player-reset");

  if (decodeBtn) decodeBtn.addEventListener("click", runViterbi);

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      const input = document.getElementById("dna-sequence");
      if (input) input.value = "CGCGATCGATCGATC";
      runViterbi();
    });
  }

  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", stepPrev);
  if (nextBtn) nextBtn.addEventListener("click", stepNext);
  if (resetBtn) resetBtn.addEventListener("click", stepReset);

  runViterbi();
});

function runViterbi() {
  stopPlayback();
  const obsInput = document.getElementById("dna-sequence");
  if (!obsInput) return;
  const obs = (obsInput.value || "CGCGATCGATCGATC").toUpperCase().trim();
  if (!obs) return;

  const states = ['CpG+', 'CpG-'];
  const startP = { 'CpG+': 0.5, 'CpG-': 0.5 };
  const transP = {
    'CpG+': { 'CpG+': 0.8, 'CpG-': 0.2 },
    'CpG-': { 'CpG+': 0.3, 'CpG-': 0.7 }
  };
  const emitP = {
    'CpG+': { 'A': 0.1, 'C': 0.4, 'G': 0.4, 'T': 0.1 },
    'CpG-': { 'A': 0.3, 'C': 0.2, 'G': 0.2, 'T': 0.3 }
  };

  const n = obs.length;
  const V = Array.from({ length: 2 }, () => Array(n).fill(0));
  const back = Array.from({ length: 2 }, () => Array(n).fill(0));

  // Initialization (in log space)
  states.forEach((s, idx) => {
    const eProb = emitP[s][obs[0]] || 0.25;
    V[idx][0] = Math.log(startP[s]) + Math.log(eProb);
  });

  // Recursion
  for (let i = 1; i < n; i++) {
    const char = obs[i];
    states.forEach((sCurr, cIdx) => {
      let maxVal = -Infinity;
      let bestPrev = 0;
      const eProb = emitP[sCurr][char] || 0.25;

      states.forEach((sPrev, pIdx) => {
        const val = V[pIdx][i - 1] + Math.log(transP[sPrev][sCurr]) + Math.log(eProb);
        if (val > maxVal) {
          maxVal = val;
          bestPrev = pIdx;
        }
      });

      V[cIdx][i] = maxVal;
      back[cIdx][i] = bestPrev;
    });
  }

  // Traceback
  let bestLast = V[0][n - 1] > V[1][n - 1] ? 0 : 1;
  const pathIdx = [bestLast];
  for (let i = n - 1; i > 0; i--) {
    bestLast = back[bestLast][i];
    pathIdx.unshift(bestLast);
  }

  const bestPath = pathIdx.map(idx => states[idx]);

  viterbiState = {
    obs,
    states,
    V,
    back,
    path: pathIdx,
    currentStep: -1,
    isPlaying: false,
    playTimer: null
  };

  updateInspectorText();
  renderViterbiPath(bestPath, obs);
  renderViterbiTrellis();
}

function renderViterbiPath(bestPath, obs) {
  const viterbiPathEl = document.getElementById("viterbi-path");
  if (viterbiPathEl) {
    viterbiPathEl.innerHTML = bestPath.map((st, idx) => {
      const isCpG = st === 'CpG+';
      const color = isCpG ? 'text-emerald-400 font-bold' : 'text-slate-400';
      const bg = isCpG ? 'bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800' : 'bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700';
      return `<span class="${bg} ${color} mx-0.5 text-[11px]">${obs[idx]}:${st}</span>`;
    }).join(" &rarr; ");
  }
}

function renderViterbiTrellis() {
  const tableContainer = document.getElementById("viterbi-table-container");
  if (!tableContainer) return;

  const { obs, states, V, path, currentStep } = viterbiState;
  const n = obs.length;

  let tableHtml = `<table class="min-w-full text-center border-collapse font-mono text-xs select-none">`;
  tableHtml += `<thead><tr class="border-b border-slate-300"><th class="p-2.5 text-slate-500 bg-slate-100">State / Pos</th>`;
  for (let i = 0; i < n; i++) {
    const isStep = currentStep === i;
    const stepBg = isStep ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 text-slate-800 font-bold';
    tableHtml += `<th class="p-2.5 ${stepBg} border-r border-slate-200">${obs[i]}<br/><span class="text-[9px] opacity-80">i=${i}</span></th>`;
  }
  tableHtml += `</tr></thead><tbody>`;

  states.forEach((s, sIdx) => {
    tableHtml += `<tr class="border-b border-slate-200">`;
    tableHtml += `<td class="p-2.5 font-bold text-indigo-700 bg-slate-50 border-r border-slate-200">${s}</td>`;
    for (let i = 0; i < n; i++) {
      const isPath = path[i] === sIdx;
      const isCurrent = currentStep === i && isPath;
      const val = V[sIdx][i].toFixed(2);

      let cellStyle = "text-slate-600 border-r border-slate-100";
      if (isCurrent) {
        cellStyle = "bg-emerald-500 text-white font-black border-2 border-emerald-600 shadow-md transform scale-105";
      } else if (isPath && (currentStep === -1 || i <= currentStep)) {
        cellStyle = "bg-emerald-100 text-emerald-900 font-bold border-2 border-emerald-400";
      }

      tableHtml += `<td class="p-2.5 transition-all ${cellStyle}">${val}</td>`;
    }
    tableHtml += `</tr>`;
  });

  tableHtml += `</tbody></table>`;
  tableContainer.innerHTML = tableHtml;
}

function updateInspectorText() {
  const inspector = document.getElementById("viterbi-inspector");
  if (!inspector) return;

  const { obs, states, V, path, currentStep } = viterbiState;
  const n = obs.length;

  if (n === 0) return;

  if (currentStep === -1) {
    const finalScore = Math.max(V[0][n - 1], V[1][n - 1]).toFixed(2);
    inspector.innerHTML = `<strong>Viterbi Path Complete:</strong> Optimal Log-Likelihood Score: <code class="text-indigo-600 font-bold font-mono">${finalScore}</code>. Click <strong>Play Viterbi Decoding</strong> to animate step-by-step state transitions.`;
  } else {
    const char = obs[currentStep];
    const sIdx = path[currentStep];
    const stateName = states[sIdx];
    const score = V[sIdx][currentStep].toFixed(2);
    inspector.innerHTML = `<strong>Step ${currentStep + 1} / ${n}:</strong> Observing Base <span class="text-indigo-600 font-bold font-mono">'${char}'</span> &rarr; Decoded Most Probable Hidden State: <code class="text-emerald-700 font-bold font-mono">${stateName}</code> (Log Score: <span class="font-mono text-slate-900 font-bold">${score}</span>).`;
  }
}

function togglePlay() {
  const playBtn = document.getElementById("player-play");
  if (viterbiState.isPlaying) {
    stopPlayback();
  } else {
    if (viterbiState.currentStep >= viterbiState.obs.length - 1) {
      viterbiState.currentStep = -1;
    }
    viterbiState.isPlaying = true;
    if (playBtn) playBtn.textContent = "Pause";
    viterbiState.playTimer = setInterval(() => {
      if (viterbiState.currentStep < viterbiState.obs.length - 1) {
        viterbiState.currentStep++;
        updateInspectorText();
        renderViterbiTrellis();
      } else {
        stopPlayback();
      }
    }, 800);
  }
}

function stopPlayback() {
  viterbiState.isPlaying = false;
  if (viterbiState.playTimer) {
    clearInterval(viterbiState.playTimer);
    viterbiState.playTimer = null;
  }
  const playBtn = document.getElementById("player-play");
  if (playBtn) playBtn.textContent = "Play Viterbi Decoding";
}

function stepNext() {
  stopPlayback();
  if (viterbiState.currentStep < viterbiState.obs.length - 1) {
    viterbiState.currentStep++;
    updateInspectorText();
    renderViterbiTrellis();
  }
}

function stepPrev() {
  stopPlayback();
  if (viterbiState.currentStep > 0) {
    viterbiState.currentStep--;
    updateInspectorText();
    renderViterbiTrellis();
  }
}

function stepReset() {
  stopPlayback();
  viterbiState.currentStep = -1;
  updateInspectorText();
  renderViterbiTrellis();
}
