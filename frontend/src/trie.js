const API_BASE = window.API_BASE;
const checkServerStatus = window.checkServerStatus;

let globalTrieRoot = null;
let globalSequence = "";

document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", runTrieSearch);
  }
  
  // Auto-run the example case on page load
  runTrieSearch();
});

async function runTrieSearch() {
  const searchBtn = document.getElementById("search-btn");
  const seqInput = document.getElementById("sequence-input");
  const pattInput = document.getElementById("patterns-input");
  const visualizerBox = document.getElementById("visualizer-box");
  const tableBody = document.getElementById("results-table-body");

  const sequence = seqInput.value.trim().toUpperCase();
  globalSequence = sequence;
  const rawPatterns = pattInput.value.split(",");
  const patterns = rawPatterns.map(p => p.trim().toUpperCase()).filter(p => p.length > 0);

  if (!sequence) {
    alert("Please enter a target sequence.");
    return;
  }
  if (sequence.length > 50) {
    alert("For visualization purposes, please limit individual sequences to 50 characters.");
    return;
  }
  if (patterns.length > 20) {
    alert("Please limit the number of patterns to 20 for performance reasons.");
    return;
  }
  if (patterns.length === 0) {
    alert("Please enter at least one search pattern.");
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
  searchBtn.classList.add("opacity-50");

  try {
    const response = await fetch(`${API_BASE}/indexing/trie-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequence, patterns })
    });

    if (!response.ok) {
      throw new Error("Trie search request failed.");
    }

    const data = await response.json();
    const matches = data.matches; // Map of pattern -> start indices

    // 1. Render Results Table with Hover pattern highlight triggers
    tableBody.innerHTML = "";
    Object.entries(matches).forEach(([pattern, offsets]) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 cursor-pointer transition-colors";

      const count = offsets.length;
      const statusBadge = count > 0 
        ? `<span class="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-none uppercase">FOUND</span>`
        : `<span class="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-400 border-0 rounded-none uppercase">NOT FOUND</span>`;

      tr.innerHTML = `
        <td class="py-2.5 px-3 font-mono font-bold text-slate-800">${pattern}</td>
        <td class="py-2.5 px-3">${statusBadge}</td>
        <td class="py-2.5 px-3 font-mono-seq font-black">${count}</td>
        <td class="py-2.5 px-3 font-mono text-slate-500">${count > 0 ? offsets.join(", ") : "-"}</td>
      `;

      tr.addEventListener("mouseenter", () => highlightPatternPath(pattern));
      tr.addEventListener("mouseleave", resetTrieHighlights);

      tableBody.appendChild(tr);
    });

    // 2. Generate Highlighted Sequence Visualization with hover index triggers
    const highlighted = new Array(sequence.length).fill(false);

    Object.entries(matches).forEach(([pattern, offsets]) => {
      const len = pattern.length;
      offsets.forEach(start => {
        for (let idx = start; idx < start + len; idx++) {
          if (idx < highlighted.length) {
            highlighted[idx] = true;
          }
        }
      });
    });

    let html = "";
    for (let idx = 0; idx < sequence.length; idx++) {
      const char = sequence[idx];
      const isHigh = highlighted[idx];
      const spanClass = isHigh 
        ? "seq-char bg-indigo-500/30 text-indigo-300 border-b border-indigo-400 font-bold px-0.5 rounded-none cursor-crosshair hover:bg-indigo-400 hover:text-white transition-all duration-100"
        : "seq-char text-slate-350 px-0.5 cursor-crosshair hover:bg-slate-700 hover:text-white transition-all duration-100";

      html += `<span class="${spanClass}" data-idx="${idx}">${char}</span>`;
    }

    visualizerBox.innerHTML = html || `<span class="text-slate-500 italic">No matches mapped.</span>`;

    // 3. Render Trie Prefix Tree SVG Graph
    buildAndRenderTrieSVG(patterns);

    // 4. Attach Interactive Hover Listeners to Sequence Characters
    attachSequenceHoverListeners();

  } catch (error) {
    console.error(error);
    visualizerBox.innerHTML = `<span class="text-rose-400 font-semibold">Error: Could not reach backend indexing server. Ensure the FastAPI application is running.</span>`;
    tableBody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-rose-500 font-semibold">API connection failure.</td></tr>`;
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Concurrently Search patterns";
    searchBtn.classList.remove("opacity-50");
  }
}

function buildAndRenderTrieSVG(patterns) {
  // Build Tree Model
  const root = { id: 0, prefix: "", label: "Root", children: {}, isEnd: false, depth: 0 };
  let nodeCount = 1;
  
  patterns.forEach(pattern => {
    let curr = root;
    let accumulatedPrefix = "";
    for (let char of pattern) {
      accumulatedPrefix += char;
      if (!curr.children[char]) {
        curr.children[char] = {
          id: nodeCount++,
          prefix: accumulatedPrefix,
          label: char,
          children: {},
          isEnd: false,
          depth: curr.depth + 1
        };
      }
      curr = curr.children[char];
    }
    curr.isEnd = true;
  });

  globalTrieRoot = root;

  // Calculate coordinates
  let leafCount = 0;
  const nodes = [];
  const links = [];

  function layout(node) {
    node.y = node.depth * 55 + 30;
    
    const childKeys = Object.keys(node.children);
    if (childKeys.length === 0) {
      node.x = leafCount * 45 + 35;
      leafCount++;
    } else {
      let sumX = 0;
      childKeys.forEach(key => {
        const child = node.children[key];
        layout(child);
        sumX += child.x;
        links.push({ from: node, to: child });
      });
      node.x = sumX / childKeys.length;
    }
    nodes.push(node);
  }

  layout(root);

  // Generate SVG Element
  const width = Math.max(leafCount * 45 + 70, 320);
  const height = nodeCount > 1 ? (Math.max(...nodes.map(n => n.y)) + 45) : 100;

  let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="mx-auto font-mono text-[9px] font-bold select-none">`;

  // Draw links
  links.forEach(link => {
    svgHtml += `<line id="trie-link-${link.from.id}-${link.to.id}" x1="${link.from.x}" y1="${link.from.y}" x2="${link.to.x}" y2="${link.to.y}" stroke="#cbd5e1" stroke-width="2" class="transition-all duration-150" />`;
  });

  // Draw nodes (No hover animations directly on SVG; triggered via sequence scan or patterns list)
  nodes.forEach(node => {
    const isRoot = node.id === 0;
    const strokeColor = node.isEnd ? "#10b981" : "#6366f1";
    const fillColor = node.isEnd ? "#ecfdf5" : (isRoot ? "#f8fafc" : "#e0e7ff");
    const textColor = node.isEnd ? "#065f46" : (isRoot ? "#475569" : "#3730a3");
    const radius = isRoot ? 18 : 13;

    svgHtml += `
      <g class="trie-node" data-prefix="${node.prefix}" data-isend="${node.isEnd}" data-id="${node.id}">
        <circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" class="shadow-none transition-all duration-150" />
        <text x="${node.x}" y="${node.y + 3}" text-anchor="middle" fill="${textColor}" class="font-bold">${node.label}</text>
      </g>
    `;
  });

  svgHtml += `</svg>`;
  document.getElementById("trie-graph-container").innerHTML = svgHtml;

  attachTrieNodeHoverListeners();
}

function attachTrieNodeHoverListeners() {
  document.querySelectorAll(".trie-node").forEach(nodeEl => {
    nodeEl.style.cursor = "pointer";
    nodeEl.addEventListener("mouseenter", () => {
      const pfx = nodeEl.getAttribute("data-prefix");
      if (!pfx) return;
      
      // Highlight the path in the Trie tree matching this node's prefix
      highlightPatternPath(pfx);
    });
    nodeEl.addEventListener("mouseleave", resetTrieHighlights);
  });
}

function highlightPatternPath(pattern) {
  const prefixes = [""];
  let acc = "";
  for (let char of pattern) {
    acc += char;
    prefixes.push(acc);
  }

  const matchedNodeIds = [];

  // Highlight matching nodes, dim others
  document.querySelectorAll(".trie-node").forEach(nodeEl => {
    const pfx = nodeEl.getAttribute("data-prefix");
    const nid = parseInt(nodeEl.getAttribute("data-id"));
    const circle = nodeEl.querySelector("circle");
    const text = nodeEl.querySelector("text");

    if (prefixes.includes(pfx)) {
      circle.setAttribute("stroke", "#10b981"); // Emerald color for selected patterns
      circle.setAttribute("stroke-width", "3.5");
      circle.setAttribute("fill", "#ecfdf5");
      matchedNodeIds.push(nid);
    } else {
      circle.setAttribute("opacity", "0.2");
      text.setAttribute("opacity", "0.2");
    }
  });

  // Highlight matching links
  document.querySelectorAll("svg line").forEach(line => {
    const idAttr = line.getAttribute("id") || "";
    const parts = idAttr.replace("trie-link-", "").split("-");
    if (parts.length === 2) {
      const fromId = parseInt(parts[0]);
      const toId = parseInt(parts[1]);

      const linkInPath = matchedNodeIds.includes(fromId) && matchedNodeIds.includes(toId) && 
                         (matchedNodeIds.indexOf(toId) === matchedNodeIds.indexOf(fromId) + 1);

      if (linkInPath) {
        line.setAttribute("stroke", "#10b981");
        line.setAttribute("stroke-width", "3.5");
      } else {
        line.setAttribute("opacity", "0.15");
      }
    }
  });
}

function resetTrieHighlights() {
  document.querySelectorAll(".trie-node").forEach(nodeEl => {
    const circle = nodeEl.querySelector("circle");
    const text = nodeEl.querySelector("text");
    circle.removeAttribute("opacity");
    text.removeAttribute("opacity");

    const isEnd = nodeEl.getAttribute("data-isend") === "true";
    const isRoot = nodeEl.getAttribute("data-prefix") === "";
    circle.setAttribute("stroke", isEnd ? "#10b981" : "#6366f1");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("fill", isEnd ? "#ecfdf5" : (isRoot ? "#f8fafc" : "#e0e7ff"));
  });

  document.querySelectorAll("svg line").forEach(line => {
    line.removeAttribute("opacity");
    line.setAttribute("stroke", "#cbd5e1");
    line.setAttribute("stroke-width", "2");
  });
}

function attachSequenceHoverListeners() {
  const seqSpans = document.querySelectorAll(".seq-char");
  seqSpans.forEach(span => {
    span.addEventListener("mouseenter", () => {
      const startIdx = parseInt(span.getAttribute("data-idx"));
      
      // Trace path down the trie
      let prefix = "";
      const matchedPrefixes = [""]; // root always highlighted
      const matchedNodeIds = [0];
      
      let curr = globalTrieRoot;
      if (!curr) return;

      for (let i = startIdx; i < globalSequence.length; i++) {
        const char = globalSequence[i];
        if (curr.children[char]) {
          prefix += char;
          matchedPrefixes.push(prefix);
          matchedNodeIds.push(curr.children[char].id);
          curr = curr.children[char];
        } else {
          break;
        }
      }

      // Highlight nodes & links
      document.querySelectorAll(".trie-node").forEach(nodeEl => {
        const pfx = nodeEl.getAttribute("data-prefix");
        const nid = parseInt(nodeEl.getAttribute("data-id"));
        const circle = nodeEl.querySelector("circle");
        const text = nodeEl.querySelector("text");

        if (matchedPrefixes.includes(pfx)) {
          circle.setAttribute("stroke", "#f59e0b"); // amber glow for traversal
          circle.setAttribute("stroke-width", "3.5");
          circle.setAttribute("fill", "#fffbeb");
        } else {
          circle.setAttribute("opacity", "0.2");
          text.setAttribute("opacity", "0.2");
        }
      });

      // Dim links not in path
      document.querySelectorAll("svg line").forEach(line => {
        const idAttr = line.getAttribute("id") || "";
        const parts = idAttr.replace("trie-link-", "").split("-");
        if (parts.length === 2) {
          const fromId = parseInt(parts[0]);
          const toId = parseInt(parts[1]);
          
          const linkInPath = matchedNodeIds.includes(fromId) && matchedNodeIds.includes(toId) && 
                             (matchedNodeIds.indexOf(toId) === matchedNodeIds.indexOf(fromId) + 1);
          
          if (linkInPath) {
            line.setAttribute("stroke", "#f59e0b");
            line.setAttribute("stroke-width", "3.5");
          } else {
            line.setAttribute("opacity", "0.15");
          }
        }
      });
    });

    span.addEventListener("mouseleave", resetTrieHighlights);
  });
}
