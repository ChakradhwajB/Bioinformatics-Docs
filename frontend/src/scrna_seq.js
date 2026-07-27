// Client-side interactive implementation for Single-Cell RNA-Seq (scRNA-Seq) Pipeline

let scrnaState = {
  cells: [],
  clusters: [
    { name: "T-Cells (CD4+/CD8+)", color: "#4f46e5", cx: 220, cy: 150, r: 65 },
    { name: "B-Cells (CD19+)", color: "#059669", cx: 520, cy: 130, r: 55 },
    { name: "Monocytes (CD14+)", color: "#d97706", cx: 380, cy: 290, r: 75 },
    { name: "NK Cells (NCAM1+)", color: "#db2777", cx: 160, cy: 300, r: 45 }
  ],
  currentStep: -1,
  isPlaying: false,
  playTimer: null
};

document.addEventListener("DOMContentLoaded", () => {
  const processBtn = document.getElementById("process-btn");
  const sampleBtn = document.getElementById("sample-btn");

  const playBtn = document.getElementById("player-play");
  const prevBtn = document.getElementById("player-prev");
  const nextBtn = document.getElementById("player-next");
  const resetBtn = document.getElementById("player-reset");

  if (processBtn) processBtn.addEventListener("click", runSCRNAPipeline);

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      const cellCountEl = document.getElementById("cell-count");
      if (cellCountEl) cellCountEl.value = 500;
      runSCRNAPipeline();
    });
  }

  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", stepPrev);
  if (nextBtn) nextBtn.addEventListener("click", stepNext);
  if (resetBtn) resetBtn.addEventListener("click", stepReset);

  window.addEventListener("resize", renderUMAPCanvas);

  runSCRNAPipeline();
});

function runSCRNAPipeline() {
  stopPlayback();
  const cellCountEl = document.getElementById("cell-count");
  const numCells = parseInt(cellCountEl?.value || "400", 10);

  const generatedCells = [];
  for (let i = 0; i < numCells; i++) {
    const cIdx = i % scrnaState.clusters.length;
    const cluster = scrnaState.clusters[cIdx];

    const u1 = Math.random();
    const u2 = Math.random();
    const radius = Math.sqrt(u1) * cluster.r;
    const theta = u2 * 2 * Math.PI;

    const x = cluster.cx + radius * Math.cos(theta);
    const y = cluster.cy + radius * Math.sin(theta);

    generatedCells.push({
      x,
      y,
      clusterIdx: cIdx,
      clusterName: cluster.name,
      color: cluster.color,
      umiCount: Math.floor(Math.random() * 3000) + 1500
    });
  }

  scrnaState.cells = generatedCells;
  scrnaState.currentStep = -1;

  updateInspectorText();
  renderUMAPCanvas();
}

function renderUMAPCanvas() {
  const canvas = document.getElementById("umap-canvas");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  if (rect.width === 0 || rect.height === 0) return;

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const activeStep = scrnaState.currentStep;
  const activeCluster = activeStep >= 0 && activeStep < scrnaState.clusters.length ? activeStep : -1;

  // Draw UMAP Cell Dots
  scrnaState.cells.forEach(cell => {
    const isClusterActive = activeCluster === -1 || cell.clusterIdx === activeCluster;
    ctx.beginPath();
    ctx.arc(cell.x * (width / 700), cell.y * (height / 380), isClusterActive ? 4 : 2, 0, 2 * Math.PI);
    ctx.fillStyle = cell.color;
    ctx.globalAlpha = isClusterActive ? 0.85 : 0.15;
    ctx.fill();
  });

  ctx.globalAlpha = 1.0;

  // Draw Legend
  ctx.font = "bold 11px Inter, sans-serif";
  scrnaState.clusters.forEach((c, idx) => {
    const isSelected = activeCluster === idx;
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(20 + idx * 150, 20, isSelected ? 7 : 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = isSelected ? "#0f172a" : "#64748b";
    ctx.fillText(c.name, 32 + idx * 150, 24);
  });

  ctx.restore();
}

function updateInspectorText() {
  const inspector = document.getElementById("scrna-inspector");
  if (!inspector) return;

  const totalCells = scrnaState.cells.length;
  if (totalCells === 0) return;

  if (scrnaState.currentStep === -1) {
    inspector.innerHTML = `<strong>UMAP &amp; Leiden Clustering Complete:</strong> Simulated <span class="text-indigo-600 font-bold font-mono">${totalCells}</span> single-cell transcriptomes across 4 cell lineage clusters. Click <strong>Play UMAP Clustering</strong> to highlight cell types.`;
  } else {
    const cIdx = scrnaState.currentStep;
    const cluster = scrnaState.clusters[cIdx];
    const cellCount = scrnaState.cells.filter(c => c.clusterIdx === cIdx).length;
    inspector.innerHTML = `<strong>Cluster ${cIdx + 1} / ${scrnaState.clusters.length}:</strong> Highlighted <span class="font-bold" style="color: ${cluster.color}">${cluster.name}</span> (${cellCount} cells, Avg UMI Count: 2,450).`;
  }
}

function togglePlay() {
  const playBtn = document.getElementById("player-play");
  if (scrnaState.isPlaying) {
    stopPlayback();
  } else {
    if (scrnaState.currentStep >= scrnaState.clusters.length - 1) {
      scrnaState.currentStep = -1;
    }
    scrnaState.isPlaying = true;
    if (playBtn) playBtn.textContent = "Pause";
    scrnaState.playTimer = setInterval(() => {
      if (scrnaState.currentStep < scrnaState.clusters.length - 1) {
        scrnaState.currentStep++;
        updateInspectorText();
        renderUMAPCanvas();
      } else {
        stopPlayback();
      }
    }, 1000);
  }
}

function stopPlayback() {
  scrnaState.isPlaying = false;
  if (scrnaState.playTimer) {
    clearInterval(scrnaState.playTimer);
    scrnaState.playTimer = null;
  }
  const playBtn = document.getElementById("player-play");
  if (playBtn) playBtn.textContent = "Play UMAP Clustering";
}

function stepNext() {
  stopPlayback();
  if (scrnaState.currentStep < scrnaState.clusters.length - 1) {
    scrnaState.currentStep++;
    updateInspectorText();
    renderUMAPCanvas();
  }
}

function stepPrev() {
  stopPlayback();
  if (scrnaState.currentStep > 0) {
    scrnaState.currentStep--;
    updateInspectorText();
    renderUMAPCanvas();
  }
}

function stepReset() {
  stopPlayback();
  scrnaState.currentStep = -1;
  updateInspectorText();
  renderUMAPCanvas();
}
