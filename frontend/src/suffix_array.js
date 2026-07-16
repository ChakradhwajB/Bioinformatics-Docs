const API_BASE = window.API_BASE;
const checkServerStatus = window.checkServerStatus;

document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", runSuffixArraySearch);
  }
  
  // Auto-run the example case on page load
  runSuffixArraySearch();
});

async function runSuffixArraySearch() {
  const searchBtn = document.getElementById("search-btn");
  const seqInput = document.getElementById("sequence-input");
  const pattInput = document.getElementById("pattern-input");
  const visualizerBox = document.getElementById("visualizer-box");
  const tableBody = document.getElementById("results-table-body");

  const sequence = seqInput.value.trim().toUpperCase();
  const pattern = pattInput.value.trim().toUpperCase();

  if (!sequence) {
    alert("Please enter a target sequence.");
    return;
  }
  if (sequence.length > 50) {
    alert("For visualization purposes, please limit the sequence to 50 characters.");
    return;
  }
  if (!pattern) {
    alert("Please enter a search pattern.");
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
  searchBtn.classList.add("opacity-50");

  try {
    const response = await fetch(`${API_BASE}/indexing/suffix-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequence, pattern })
    });

    if (!response.ok) {
      throw new Error("Suffix Array search request failed.");
    }

    const data = await response.json();
    const suffixArray = data.suffix_array; // Sorted suffix index offsets
    const matches = data.matches;          // Matching start indices in text

    const textWithSentinel = sequence + "$";

    // 1. Render Suffix Array Table
    tableBody.innerHTML = "";
    suffixArray.forEach((suffixIndex, rank) => {
      const suffixVal = textWithSentinel.substring(suffixIndex);
      const isMatch = matches.includes(suffixIndex);

      const tr = document.createElement("tr");
      tr.className = isMatch 
        ? "bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-bold border-l-2 border-emerald-500 cursor-pointer transition-all"
        : "hover:bg-slate-50 text-slate-700 cursor-pointer transition-all";

      tr.setAttribute("data-rank", rank);
      tr.setAttribute("data-index", suffixIndex);

      tr.innerHTML = `
        <td class="py-2 px-3 font-mono text-slate-400 select-none">${rank}</td>
        <td class="py-2 px-3 font-mono font-bold">${suffixIndex}</td>
        <td class="py-2 px-3 font-mono-seq text-xs break-all">${suffixVal}</td>
      `;

      // Hover Bindings to Highlight SVG paths
      tr.addEventListener("mouseenter", () => highlightTracePath(rank));
      tr.addEventListener("mouseleave", resetTracePaths);

      tableBody.appendChild(tr);
    });

    // 2. Highlight Sequence Visualizer Box
    const highlighted = new Array(sequence.length).fill(false);
    const len = pattern.length;

    matches.forEach(start => {
      for (let idx = start; idx < start + len; idx++) {
        if (idx < highlighted.length) {
          highlighted[idx] = true;
        }
      }
    });

    let html = "";
    let isHighlightGroupOpen = false;

    for (let idx = 0; idx < sequence.length; idx++) {
      const char = sequence[idx];
      const isHigh = highlighted[idx];

      if (isHigh && !isHighlightGroupOpen) {
        html += `<span class="bg-indigo-500/30 text-indigo-300 border-b border-indigo-400 font-bold px-0.5 rounded-none">`;
        isHighlightGroupOpen = true;
      } else if (!isHigh && isHighlightGroupOpen) {
        html += `</span>`;
        isHighlightGroupOpen = false;
      }
      html += char;
    }

    if (isHighlightGroupOpen) {
      html += `</span>`;
    }

    visualizerBox.innerHTML = html || `<span class="text-slate-500 italic">No matches mapped.</span>`;

    // 3. Render Suffix Array Trace Map SVG
    renderSuffixTraceMap(sequence, suffixArray, matches);

    // 4. Initialize Suffix Array Player
    initSuffixArrayPlayer(sequence, suffixArray);


  } catch (error) {
    console.error(error);
    visualizerBox.innerHTML = `<span class="text-rose-400 font-semibold">Error: Could not reach backend indexing server. Ensure the FastAPI application is running.</span>`;
    tableBody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-rose-500 font-semibold">API connection failure.</td></tr>`;
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Construct & Search Suffixes";
    searchBtn.classList.remove("opacity-50");
  }
}

function renderSuffixTraceMap(sequence, suffixArray, matches) {
  const textWithSentinel = sequence + "$";
  const n = textWithSentinel.length;

  const itemWidth = 40;
  const width = Math.max(n * itemWidth + 80, 320);
  const height = 240;

  let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="mx-auto font-mono text-[10px] font-bold select-none">`;

  // Draw Sequence (Horizontal list at Y = 40)
  svgHtml += `<g id="sequence-chars">`;
  for (let idx = 0; idx < n; idx++) {
    const char = textWithSentinel[idx];
    const x = idx * itemWidth + 40;

    svgHtml += `
      <g>
        <circle cx="${x}" cy="40" r="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${x}" y="43" text-anchor="middle" fill="#475569" class="font-bold">${char}</text>
        <text x="${x}" y="20" text-anchor="middle" fill="#94a3b8" class="text-[8px] font-mono">${idx}</text>
      </g>
    `;
  }
  svgHtml += `</g>`;

  // Draw Suffix Array ranks (Horizontal list at Y = 180)
  svgHtml += `<g id="suffix-ranks">`;
  suffixArray.forEach((suffixIndex, rank) => {
    const x = rank * itemWidth + 40;
    const isMatch = matches.includes(suffixIndex);
    const strokeColor = isMatch ? "#10b981" : "#6366f1";
    const fillColor = isMatch ? "#ecfdf5" : "#e0e7ff";
    const textColor = isMatch ? "#065f46" : "#3730a3";

    svgHtml += `
      <g id="sa-rank-node-${rank}" class="cursor-pointer" onclick="highlightTracePath(${rank})">
        <circle cx="${x}" cy="180" r="14" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" />
        <text x="${x}" y="183" text-anchor="middle" fill="${textColor}" class="font-bold">SA[${rank}]</text>
        <text x="${x}" y="205" text-anchor="middle" fill="#64748b" class="text-[8px] font-bold">${suffixIndex}</text>
      </g>
    `;
  });
  svgHtml += `</g>`;

  // Draw Bezier curves connecting ranks to sequence origins
  svgHtml += `<g id="trace-curves">`;
  suffixArray.forEach((suffixIndex, rank) => {
    const startX = rank * itemWidth + 40;
    const endX = suffixIndex * itemWidth + 40;

    const isMatch = matches.includes(suffixIndex);
    const strokeColor = isMatch ? "#10b981" : "#94a3b8";
    const strokeWidth = isMatch ? "2" : "1.25";
    const opacity = isMatch ? "0.65" : "0.3";

    // Bezier control points for smooth vertical curves
    const yControl1 = 90;
    const yControl2 = 130;

    svgHtml += `
      <path 
        id="trace-path-${rank}" 
        d="M ${startX} 166 C ${startX} ${yControl2}, ${endX} ${yControl1}, ${endX} 54" 
        fill="none" 
        stroke="${strokeColor}" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${isMatch ? 'none' : '2 2'}"
        opacity="${opacity}" 
        class="transition-all duration-200" 
      />
    `;
  });
  svgHtml += `</g>`;

  svgHtml += `</svg>`;
  document.getElementById("suffix-visualizer-container").innerHTML = svgHtml;
}

function highlightTracePath(targetRank) {
  const curves = document.querySelectorAll("#trace-curves path");
  curves.forEach((path, rank) => {
    if (rank === targetRank) {
      path.setAttribute("stroke", "#4f46e5");
      path.setAttribute("stroke-width", "4");
      path.setAttribute("opacity", "1");
      path.setAttribute("stroke-dasharray", "none");
    } else {
      path.setAttribute("opacity", "0.08");
    }
  });
}

function resetTracePaths() {
  const curves = document.querySelectorAll("#trace-curves path");
  curves.forEach(path => {
    const id = path.getAttribute("id");
    const rank = parseInt(id.replace("trace-path-", ""));
    
    // Check if it is a match path to restore correct styling
    const tableRow = document.querySelector(`tr[data-rank="${rank}"]`);
    const isMatch = tableRow && tableRow.classList.contains("bg-emerald-50/50");

    path.setAttribute("stroke", isMatch ? "#10b981" : "#94a3b8");
    path.setAttribute("stroke-width", isMatch ? "2" : "1.25");
    path.setAttribute("opacity", isMatch ? "0.65" : "0.3");
    path.setAttribute("stroke-dasharray", isMatch ? "none" : "2 2");
  });
}

function initSuffixArrayPlayer(sequence, suffixArray) {
  const playerControls = document.getElementById("sa-player-controls");
  const inspector = document.getElementById("sa-dp-inspector");
  if (!playerControls || !inspector) return;

  playerControls.classList.remove("hidden");
  inspector.classList.remove("hidden");

  let currentStep = -1; // -1 means all hidden (initial state)
  const totalSteps = suffixArray.length;
  let isPlaying = false;
  let playerInterval = null;

  const playBtn = document.getElementById("sa-player-play");
  const nextBtn = document.getElementById("sa-player-next");
  const prevBtn = document.getElementById("sa-player-prev");
  const resetBtn = document.getElementById("sa-player-reset");

  const textWithSentinel = sequence + "$";

  function resetTracePathsPartial(rank) {
    const path = document.querySelector(`#trace-path-${rank}`);
    if (!path) return;
    const tableRow = document.querySelector(`tr[data-rank="${rank}"]`);
    const isMatch = tableRow && tableRow.classList.contains("bg-emerald-50/50");

    path.setAttribute("stroke", isMatch ? "#10b981" : "#94a3b8");
    path.setAttribute("stroke-width", isMatch ? "2" : "1.25");
    path.setAttribute("opacity", isMatch ? "0.65" : "0.3");
    path.setAttribute("stroke-dasharray", isMatch ? "none" : "2 2");
  }

  function renderStep(step) {
    currentStep = step;
    
    // Show/hide table rows and SVG elements based on step
    for (let rank = 0; rank < totalSteps; rank++) {
      const isVisible = rank <= step || step === totalSteps; // if totalSteps, just show all
      
      // Table row
      const tr = document.querySelector(`tr[data-rank="${rank}"]`);
      if (tr) {
        tr.style.display = isVisible ? "" : "none";
        if (rank === step) {
          tr.classList.add("bg-indigo-50");
        } else {
          tr.classList.remove("bg-indigo-50");
        }
      }

      // SVG rank node and path
      const rankNode = document.querySelector(`#sa-rank-node-${rank}`);
      const pathNode = document.querySelector(`#trace-path-${rank}`);
      if (rankNode) rankNode.style.display = isVisible ? "" : "none";
      if (pathNode) pathNode.style.display = isVisible ? "" : "none";
      
      if (isVisible) {
        if (rank === step) {
            highlightTracePath(rank);
        } else if (rank < step && currentStep !== -1) {
            resetTracePathsPartial(rank);
        }
      }
    }
    
    if (step === -1) {
      inspector.innerHTML = `<strong>Initial State:</strong> All suffixes extracted. Press Play to see them sorted lexicographically.`;
      resetTracePaths(); // hide all highlights
    } else if (step === totalSteps) {
      inspector.innerHTML = `<strong>Complete:</strong> Suffix Array constructed. You can now hover rows to trace origins.`;
      resetTracePaths();
    } else {
      const suffixIdx = suffixArray[step];
      const suffixVal = textWithSentinel.substring(suffixIdx);
      if (step === 0) {
        inspector.innerHTML = `<strong>Step 1:</strong> Inserted <code>${suffixVal}</code> at Rank 0 (Smallest suffix).`;
      } else {
        const prevIdx = suffixArray[step - 1];
        const prevVal = textWithSentinel.substring(prevIdx);
        inspector.innerHTML = `<strong>Step ${step + 1}:</strong> Inserted <code>${suffixVal}</code> at Rank ${step}. It is lexicographically greater than <code>${prevVal}</code>.`;
      }
    }
  }

  function pause() {
    isPlaying = false;
    clearInterval(playerInterval);
    playerInterval = null;
    playBtn.textContent = "Play";
    playBtn.className = "px-2.5 py-1 text-[10px] bg-slate-800 text-white hover:bg-slate-900 rounded-none font-bold cursor-pointer";
  }

  function play() {
    isPlaying = true;
    playBtn.textContent = "Pause";
    playBtn.className = "px-2.5 py-1 text-[10px] bg-rose-600 text-white hover:bg-rose-700 rounded-none font-bold cursor-pointer";
    
    playerInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        renderStep(currentStep + 1);
      } else {
        pause();
      }
    }, 1000);
  }

  // Event listeners
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
      if (currentStep >= totalSteps) renderStep(-1);
      play();
    }
  });

  newNextBtn.addEventListener("click", () => {
    pause();
    if (currentStep < totalSteps) renderStep(currentStep + 1);
  });

  newPrevBtn.addEventListener("click", () => {
    pause();
    if (currentStep > -1) renderStep(currentStep - 1);
  });

  newResetBtn.addEventListener("click", () => {
    pause();
    renderStep(-1);
  });

  // Start with animation ready
  renderStep(-1);
}

