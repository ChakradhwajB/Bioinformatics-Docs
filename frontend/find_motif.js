const API_BASE = window.API_BASE;
const checkServerStatus = window.checkServerStatus;

document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  const findBtn = document.getElementById("find-btn");
  if (findBtn) {
    findBtn.addEventListener("click", findMotifs);
  }

  findMotifs();
});

async function findMotifs() {
  const sequence = document.getElementById("sequence").value.trim().toUpperCase();
  const motif = document.getElementById("motif").value.trim().toUpperCase();

  if (!sequence || !motif) {
    alert("Please enter both sequence and motif.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/genetics/find-motif`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequence, motif })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Motif search failed.");
    }

    const result = await res.json();

    document.getElementById("match-count").textContent = result.positions.length;

    const badgeContainer = document.getElementById("position-badges");
    badgeContainer.innerHTML = "";

    if (result.positions.length === 0) {
      badgeContainer.innerHTML = `<span class="text-xs text-slate-500">No matches found.</span>`;
    } else {
      result.positions.forEach(pos => {
        const badge = document.createElement("button");
        badge.className = "px-2.5 py-0.5 border border-slate-700 bg-slate-800 text-slate-300 font-bold rounded text-[10px] transition-colors cursor-pointer hover:bg-slate-700";
        badge.textContent = `Pos ${pos}`;
        badge.addEventListener("click", () => {
          const matchEl = document.getElementById(`match-anchor-${pos}`);
          if (matchEl) {
            matchEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
        badgeContainer.appendChild(badge);
      });
    }

    renderSpotlightViewer(sequence, motif, result.positions);
    renderHeatmapTrack(sequence.length, result.positions);

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function renderSpotlightViewer(sequence, motif, positions) {
  const viewer = document.getElementById("spotlight-viewer");
  viewer.innerHTML = "";

  if (positions.length === 0) {
    viewer.textContent = sequence;
    return;
  }

  const motifLen = motif.length;
  const highlightGrid = new Array(sequence.length).fill(false);
  const startPositions = {};

  positions.forEach(pos => {
    const startIdx = pos - 1;
    startPositions[startIdx] = pos;
    for (let k = 0; k < motifLen; k++) {
      if (startIdx + k < sequence.length) {
        highlightGrid[startIdx + k] = true;
      }
    }
  });

  let html = "";
  let inHighlight = false;
  let activeAnchor = null;

  for (let i = 0; i < sequence.length; i++) {
    const isMatch = highlightGrid[i];
    const isStart = startPositions[i] !== undefined;

    if (isStart) {
      if (inHighlight) {
        html += "</span>";
        inHighlight = false;
      }
      activeAnchor = startPositions[i];
    }

    if (isMatch && !inHighlight) {
      const anchorIdStr = activeAnchor ? `id="match-anchor-${activeAnchor}"` : "";
      html += `<span ${anchorIdStr} class="bg-rose-900 text-rose-200 font-bold border border-rose-800/40 rounded px-0.5">`;
      inHighlight = true;
      activeAnchor = null;
    } else if (!isMatch && inHighlight) {
      html += "</span>";
      inHighlight = false;
    }

    html += sequence[i];
  }

  if (inHighlight) {
    html += "</span>";
  }

  viewer.innerHTML = html;
}

function renderHeatmapTrack(seqLen, positions) {
  const track = document.getElementById("heatmap-track");
  track.innerHTML = "";

  positions.forEach(pos => {
    const pct = ((pos - 1) / seqLen) * 100;

    const line = document.createElement("div");
    line.className = "absolute left-0 w-full h-[2px] bg-rose-500 cursor-pointer hover:h-[3px] transition-all";
    line.style.top = `${pct}%`;

    line.addEventListener("click", (e) => {
      e.stopPropagation();
      const matchEl = document.getElementById(`match-anchor-${pos}`);
      if (matchEl) {
        matchEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    track.appendChild(line);
  });

  track.addEventListener("click", (e) => {
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const pct = clickY / rect.height;

    const viewer = document.getElementById("spotlight-viewer");
    const scrollTarget = viewer.scrollHeight * pct;
    viewer.scrollTo({
      top: scrollTarget - viewer.clientHeight / 2,
      behavior: "smooth"
    });
  });
}
