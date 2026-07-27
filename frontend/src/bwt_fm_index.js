// Client-side interactive implementation for BWT & FM-Index Read Mapping

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn") || document.getElementById("build-btn");
  const sampleBtn = document.getElementById("sample-btn");

  if (searchBtn) {
    searchBtn.addEventListener("click", runFMIndex);
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      const refInput = document.getElementById("reference-text") || document.getElementById("text-input");
      const patInput = document.getElementById("pattern-text") || document.getElementById("pattern-input");
      if (refInput) refInput.value = "BANANA$";
      if (patInput) patInput.value = "ANA";
      runFMIndex();
    });
  }

  runFMIndex();
});

function runFMIndex() {
  const refInput = document.getElementById("reference-text") || document.getElementById("text-input");
  const patInput = document.getElementById("pattern-text") || document.getElementById("pattern-input");

  if (!refInput) return;
  let s = (refInput.value || "BANANA$").toUpperCase().trim();
  if (!s.endsWith("$")) s += "$";
  const query = (patInput?.value || "ANA").toUpperCase().trim();

  const n = s.length;
  const rotations = [];
  for (let i = 0; i < n; i++) {
    rotations.push({ rot: s.slice(i) + s.slice(0, i), sa: i });
  }
  rotations.sort((a, b) => a.rot.localeCompare(b.rot));

  const bwtStr = rotations.map(r => r.rot[n - 1]).join("");

  // Backward Search Algorithm
  let top = 0;
  let bottom = n - 1;
  let matchOffsets = [];

  for (let p = query.length - 1; p >= 0; p--) {
    const char = query[p];
    let newTop = -1;
    let newBottom = -1;

    for (let i = top; i <= bottom; i++) {
      if (rotations[i].rot[n - 1] === char) {
        if (newTop === -1) newTop = i;
        newBottom = i;
      }
    }

    if (newTop === -1) {
      top = 1; bottom = 0;
      break;
    }

    const firstCol = rotations.map(r => r.rot[0]);
    let rankInLast = 0;
    for (let i = 0; i < newTop; i++) {
      if (rotations[i].rot[n - 1] === char) rankInLast++;
    }
    
    let firstIdx = 0;
    let count = 0;
    while (firstIdx < n) {
      if (firstCol[firstIdx] === char) {
        if (count === rankInLast) break;
        count++;
      }
      firstIdx++;
    }

    let countInRange = 0;
    for (let i = newTop; i <= newBottom; i++) {
      if (rotations[i].rot[n - 1] === char) countInRange++;
    }

    top = firstIdx;
    bottom = firstIdx + countInRange - 1;
  }

  if (top <= bottom) {
    for (let i = top; i <= bottom; i++) matchOffsets.push(rotations[i].sa);
    matchOffsets.sort((a, b) => a - b);
  }

  // Update Summary Metric Displays
  const matchCountEl = document.getElementById("match-count");
  const bwtRangeEl = document.getElementById("bwt-range");
  const genomePosEl = document.getElementById("genome-positions");
  const bwtOutput = document.getElementById("bwt-output");
  const matchesOutput = document.getElementById("matches-output");

  if (matchCountEl) matchCountEl.textContent = matchOffsets.length;
  if (bwtRangeEl) bwtRangeEl.textContent = top <= bottom ? `[${top}, ${bottom}]` : "None";
  if (genomePosEl) genomePosEl.textContent = matchOffsets.length > 0 ? `[${matchOffsets.join(", ")}]` : "None";
  if (bwtOutput) bwtOutput.textContent = bwtStr;
  if (matchesOutput) {
    matchesOutput.textContent = matchOffsets.length > 0 
      ? `Found pattern '${query}' at offset(s): [${matchOffsets.join(", ")}]` 
      : `Pattern '${query}' not found`;
  }

  // Render Table View (bwt-table-container or matrix-container)
  const container = document.getElementById("bwt-table-container") || document.getElementById("matrix-container");
  if (container) {
    let tableHtml = `<table class="min-w-full text-center border-collapse font-mono text-xs select-none">`;
    tableHtml += `<thead><tr class="border-b border-slate-300">
      <th class="p-2 text-slate-400">Row (i)</th>
      <th class="p-2 font-bold text-slate-700">SA[i]</th>
      <th class="p-2 font-bold text-indigo-700">F (First)</th>
      <th class="p-2 text-slate-600">Rotation ($T$)</th>
      <th class="p-2 font-bold text-emerald-600">L (BWT)</th>
    </tr></thead><tbody>`;

    rotations.forEach((r, idx) => {
      const isMatchedRow = idx >= top && idx <= bottom && top <= bottom;
      tableHtml += `<tr class="border-b border-slate-100 transition-colors ${isMatchedRow ? 'bg-indigo-50/90 font-bold border-l-4 border-l-indigo-600' : 'hover:bg-slate-100/50'}">`;
      tableHtml += `<td class="p-2 text-slate-400">${idx}</td>`;
      tableHtml += `<td class="p-2 text-slate-600 font-bold">${r.sa}</td>`;
      tableHtml += `<td class="p-2 font-bold text-indigo-700">${r.rot[0]}</td>`;
      tableHtml += `<td class="p-2 text-slate-700 font-mono">${r.rot}</td>`;
      tableHtml += `<td class="p-2 font-bold text-emerald-600 bg-emerald-50/50">${r.rot[n - 1]}</td>`;
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
  }
}
