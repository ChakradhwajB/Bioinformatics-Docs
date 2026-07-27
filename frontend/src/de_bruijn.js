// Interactive De Bruijn Graph Visualizer & Eulerian Path Player (High-DPI Retina Ready)

let graphState = {
  nodes: [],
  edges: [],
  nodePos: new Map(),
  eulerianPath: [],
  currentStep: -1,
  isPlaying: false,
  playTimer: null
};

document.addEventListener("DOMContentLoaded", () => {
  const buildBtn = document.getElementById("build-btn") || document.getElementById("assemble-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const kmerInput = document.getElementById("kmer-size") || document.getElementById("kmer-slider");

  // Player controls
  const playBtn = document.getElementById("player-play");
  const prevBtn = document.getElementById("player-prev");
  const nextBtn = document.getElementById("player-next");
  const resetBtn = document.getElementById("player-reset");

  if (buildBtn) buildBtn.addEventListener("click", runDeBruijn);

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      const readsIn = document.getElementById("reads-input");
      if (readsIn) readsIn.value = "TAATGCCATGGG, ATGCCATGGGAA";
      if (kmerInput) kmerInput.value = 3;
      runDeBruijn();
    });
  }

  if (kmerInput) {
    kmerInput.addEventListener("input", runDeBruijn);
  }

  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", stepPrev);
  if (nextBtn) nextBtn.addEventListener("click", stepNext);
  if (resetBtn) resetBtn.addEventListener("click", stepReset);

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(renderGraphCanvas, 100);
  });

  runDeBruijn();
});

function runDeBruijn() {
  stopPlayback();
  const readsInput = document.getElementById("reads-input");
  const kmerInput = document.getElementById("kmer-size") || document.getElementById("kmer-slider");

  if (!readsInput) return;
  const rawText = readsInput.value || "TAATGCCATGGG, ATGCCATGGGAA";
  const k = parseInt(kmerInput?.value || "3", 10);

  const reads = rawText.split(/[\n,]/).map(r => r.trim().toUpperCase()).filter(r => r.length >= k);
  if (reads.length === 0) return;

  const adjMap = new Map();
  const inDegree = new Map();
  const outDegree = new Map();
  const nodesSet = new Set();
  const edgesList = [];

  reads.forEach(read => {
    for (let i = 0; i <= read.length - k; i++) {
      const kmer = read.substring(i, i + k);
      const u = kmer.substring(0, k - 1);
      const v = kmer.substring(1, k);

      nodesSet.add(u);
      nodesSet.add(v);

      if (!adjMap.has(u)) adjMap.set(u, []);
      adjMap.get(u).push({ to: v, kmer: kmer });
      edgesList.push({ from: u, to: v, kmer: kmer });

      outDegree.set(u, (outDegree.get(u) || 0) + 1);
      inDegree.set(v, (inDegree.get(v) || 0) + 1);
      if (!inDegree.has(u)) inDegree.set(u, 0);
      if (!outDegree.has(v)) outDegree.set(v, 0);
    }
  });

  const nodes = Array.from(nodesSet);
  const path = computeEulerianPath(adjMap, inDegree, outDegree, nodes);

  graphState = {
    nodes,
    edges: edgesList,
    nodePos: computeLayout(nodes),
    eulerianPath: path,
    currentStep: -1,
    isPlaying: false,
    playTimer: null
  };

  const nodesCountEl = document.getElementById("nodes-count");
  const edgesCountEl = document.getElementById("edges-count");
  if (nodesCountEl) nodesCountEl.textContent = nodes.length;
  if (edgesCountEl) edgesCountEl.textContent = edgesList.length;

  updateInspectorText();
  renderGraphCanvas();
}

function computeEulerianPath(adjMap, inDegree, outDegree, nodes) {
  if (nodes.length === 0) return [];

  let startNode = nodes[0];
  for (const n of nodes) {
    const outD = outDegree.get(n) || 0;
    const inD = inDegree.get(n) || 0;
    if (outD - inD === 1) {
      startNode = n;
      break;
    }
  }
  if ((outDegree.get(startNode) || 0) === 0) {
    for (const n of nodes) {
      if ((outDegree.get(n) || 0) > 0) {
        startNode = n;
        break;
      }
    }
  }

  const adj = new Map();
  adjMap.forEach((edges, u) => {
    adj.set(u, edges.map(e => ({ ...e })));
  });

  const stack = [startNode];
  const circuit = [];

  while (stack.length > 0) {
    const u = stack[stack.length - 1];
    const neighbors = adj.get(u) || [];
    if (neighbors.length > 0) {
      const nextEdge = neighbors.shift();
      stack.push(nextEdge.to);
    } else {
      circuit.push(stack.pop());
    }
  }

  circuit.reverse();

  const steps = [];
  for (let i = 0; i < circuit.length - 1; i++) {
    const u = circuit[i];
    const v = circuit[i + 1];
    const kmer = u + v.slice(-1);
    steps.push({ from: u, to: v, kmer: kmer });
  }
  return steps;
}

function computeLayout(nodes) {
  const nodePos = new Map();
  const canvas = document.getElementById("debruijn-canvas");
  if (!canvas) return nodePos;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 760;
  const height = rect.height || 420;

  const padding = 70;
  const rx = (width - padding * 2) / 2;
  const ry = (height - padding * 2) / 2;
  const cx = width / 2;
  const cy = height / 2;

  nodes.forEach((node, idx) => {
    const angle = (idx / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    nodePos.set(node, { x, y });
  });

  return nodePos;
}

function renderGraphCanvas() {
  const canvas = document.getElementById("debruijn-canvas");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  if (rect.width === 0 || rect.height === 0) return;

  // Set internal buffer size to match physical display pixels for crisp sharpness
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Clear canvas (Transparent background)
  ctx.clearRect(0, 0, width, height);

  // Recalculate layout based on actual pixel dimensions
  graphState.nodePos = computeLayout(graphState.nodes);

  const activeStep = graphState.currentStep;
  const activeEdge = activeStep >= 0 && activeStep < graphState.eulerianPath.length 
    ? graphState.eulerianPath[activeStep] 
    : null;

  const activeNode = activeEdge ? activeEdge.to : (activeStep === 0 && graphState.eulerianPath.length > 0 ? graphState.eulerianPath[0].from : null);

  // Draw Edges
  graphState.edges.forEach(edge => {
    const p1 = graphState.nodePos.get(edge.from);
    const p2 = graphState.nodePos.get(edge.to);
    if (!p1 || !p2) return;

    const isActive = activeEdge && activeEdge.from === edge.from && activeEdge.to === edge.to;
    const isVisited = activeStep >= 0 && graphState.eulerianPath.slice(0, activeStep + 1).some(e => e.from === edge.from && e.to === edge.to);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);

    if (edge.from === edge.to) {
      ctx.arc(p1.x, p1.y - 28, 18, 0, 2 * Math.PI);
    } else {
      ctx.lineTo(p2.x, p2.y);
    }

    ctx.strokeStyle = isActive ? "#059669" : (isVisited ? "#4f46e5" : "#cbd5e1");
    ctx.lineWidth = isActive ? 3.5 : (isVisited ? 2.5 : 1.5);
    ctx.stroke();

    // Draw Arrowhead
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const headLen = isActive ? 12 : 9;
    const radius = 24;
    const arrowX = p2.x - radius * Math.cos(angle);
    const arrowY = p2.y - radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - headLen * Math.cos(angle - Math.PI / 6), arrowY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(arrowX - headLen * Math.cos(angle + Math.PI / 6), arrowY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = isActive ? "#059669" : (isVisited ? "#4f46e5" : "#94a3b8");
    ctx.fill();

    // High-definition crisp vector text for Edge k-mer
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - 8;
    ctx.font = "bold 11px 'Fira Code', monospace";
    ctx.fillStyle = isActive ? "#047857" : "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(edge.kmer, midX, midY);
  });

  // Draw Nodes
  graphState.nodes.forEach(node => {
    const pos = graphState.nodePos.get(node);
    if (!pos) return;

    const isActiveNode = activeNode === node;
    const isVisitedNode = activeStep >= 0 && graphState.eulerianPath.slice(0, activeStep + 1).some(e => e.from === node || e.to === node);

    const radius = 22;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);

    ctx.fillStyle = isActiveNode ? "#d1fae5" : (isVisitedNode ? "#e0e7ff" : "#ffffff");
    ctx.fill();

    ctx.strokeStyle = isActiveNode ? "#059669" : (isVisitedNode ? "#4f46e5" : "#94a3b8");
    ctx.lineWidth = isActiveNode ? 3 : 2;
    ctx.stroke();

    // High-definition crisp vector text for (k-1)-mer Node label
    ctx.font = "bold 12px 'Fira Code', monospace";
    ctx.fillStyle = isActiveNode ? "#065f46" : (isVisitedNode ? "#3730a3" : "#0f172a");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node, pos.x, pos.y);
  });

  ctx.restore();
}

function updateInspectorText() {
  const inspector = document.getElementById("graph-inspector");
  if (!inspector) return;

  const totalSteps = graphState.eulerianPath.length;
  if (totalSteps === 0) {
    inspector.innerHTML = `<span class="text-rose-600 font-bold">No valid Eulerian Path found for current k-mer graph.</span>`;
    return;
  }

  if (graphState.currentStep === -1) {
    const fullSeq = graphState.eulerianPath.length > 0 
      ? graphState.eulerianPath[0].from + graphState.eulerianPath.map(e => e.to.slice(-1)).join("") 
      : "";
    inspector.innerHTML = `<strong>Eulerian Path Ready (${totalSteps} steps):</strong> Assembled Genome Sequence: <code class="text-indigo-600 font-bold font-mono">${fullSeq}</code>. Click <strong>Play Eulerian Path</strong> to animate.`;
  } else {
    const step = graphState.currentStep;
    const edge = graphState.eulerianPath[step];
    const partialSeq = graphState.eulerianPath[0].from + graphState.eulerianPath.slice(0, step + 1).map(e => e.to.slice(-1)).join("");
    inspector.innerHTML = `<strong>Step ${step + 1} / ${totalSteps}:</strong> Traversed Edge <code class="text-emerald-600 font-bold font-mono">${edge.from} &rarr; ${edge.to}</code> (k-mer: <span class="text-indigo-600 font-bold font-mono">${edge.kmer}</span>).<br/>Assembled Substring: <code class="text-slate-800 font-bold font-mono">${partialSeq}</code>`;
  }
}

function togglePlay() {
  const playBtn = document.getElementById("player-play");
  if (graphState.isPlaying) {
    stopPlayback();
  } else {
    if (graphState.currentStep >= graphState.eulerianPath.length - 1) {
      graphState.currentStep = -1;
    }
    graphState.isPlaying = true;
    if (playBtn) playBtn.textContent = "Pause";
    graphState.playTimer = setInterval(() => {
      if (graphState.currentStep < graphState.eulerianPath.length - 1) {
        graphState.currentStep++;
        updateInspectorText();
        renderGraphCanvas();
      } else {
        stopPlayback();
      }
    }, 900);
  }
}

function stopPlayback() {
  graphState.isPlaying = false;
  if (graphState.playTimer) {
    clearInterval(graphState.playTimer);
    graphState.playTimer = null;
  }
  const playBtn = document.getElementById("player-play");
  if (playBtn) playBtn.textContent = "Play Eulerian Path";
}

function stepNext() {
  stopPlayback();
  if (graphState.currentStep < graphState.eulerianPath.length - 1) {
    graphState.currentStep++;
    updateInspectorText();
    renderGraphCanvas();
  }
}

function stepPrev() {
  stopPlayback();
  if (graphState.currentStep > 0) {
    graphState.currentStep--;
    updateInspectorText();
    renderGraphCanvas();
  }
}

function stepReset() {
  stopPlayback();
  graphState.currentStep = -1;
  updateInspectorText();
  renderGraphCanvas();
}
