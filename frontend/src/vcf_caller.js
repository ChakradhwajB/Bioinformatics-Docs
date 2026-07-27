// Client-side interactive implementation for Variant Calling & VCF Analysis

let vcfState = {
  ref: "A",
  reads: ["A", "A", "G", "G", "G", "G", "G", "G", "G"],
  qualScores: [35, 30, 40, 38, 39, 40, 35, 37, 36],
  currentStep: -1,
  isPlaying: false,
  playTimer: null
};

document.addEventListener("DOMContentLoaded", () => {
  const callBtn = document.getElementById("call-btn") || document.getElementById("parse-btn");
  const sampleBtn = document.getElementById("sample-btn");

  const playBtn = document.getElementById("player-play");
  const prevBtn = document.getElementById("player-prev");
  const nextBtn = document.getElementById("player-next");
  const resetBtn = document.getElementById("player-reset");

  if (callBtn) callBtn.addEventListener("click", runVariantCaller);

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      const refEl = document.getElementById("ref-base");
      const readsEl = document.getElementById("reads-bases");
      if (refEl) refEl.value = "A";
      if (readsEl) readsEl.value = "A,A,G,G,G,G,G,G,G";
      runVariantCaller();
    });
  }

  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", stepPrev);
  if (nextBtn) nextBtn.addEventListener("click", stepNext);
  if (resetBtn) resetBtn.addEventListener("click", stepReset);

  runVariantCaller();
});

function runVariantCaller() {
  stopPlayback();
  const refEl = document.getElementById("ref-base");
  const readsEl = document.getElementById("reads-bases");

  const ref = (refEl?.value || "A").toUpperCase().trim()[0] || "A";
  const rawReads = (readsEl?.value || "A,A,G,G,G,G,G,G,G").toUpperCase();
  const reads = rawReads.split(",").map(b => b.trim()).filter(b => b.length === 1);

  if (reads.length === 0) return;

  vcfState = {
    ref,
    reads,
    qualScores: reads.map(() => Math.floor(Math.random() * 15) + 25),
    currentStep: -1,
    isPlaying: false,
    playTimer: null
  };

  updateInspectorText();
  renderVCFOutput();
}

function renderVCFOutput() {
  const outputContainer = document.getElementById("vcf-output-container");
  if (!outputContainer) return;

  const { ref, reads, qualScores, currentStep } = vcfState;
  const counts = {};
  reads.forEach(b => counts[b] = (counts[b] || 0) + 1);

  let alt = ref;
  let maxAltCount = 0;
  Object.keys(counts).forEach(b => {
    if (b !== ref && counts[b] > maxAltCount) {
      alt = b;
      maxAltCount = counts[b];
    }
  });

  const totalDP = reads.length;
  const altAF = maxAltCount / totalDP;
  let gt = "0/0";
  if (altAF >= 0.8) {
    gt = "1/1";
  } else if (altAF >= 0.2) {
    gt = "0/1";
  } else {
    alt = ".";
  }

  const qualScore = alt !== "." ? Math.min(99, Math.round(altAF * 99 + 10)) : 99;

  let vcfText = `##fileformat=VCFv4.2\n`;
  vcfText += `##source=BioinformaticsDocsVariantCaller\n`;
  vcfText += `##INFO=<ID=DP,Number=1,Type=Integer,Description="Total Depth">\n`;
  vcfText += `##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">\n`;
  vcfText += `##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">\n`;
  vcfText += `#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE01\n`;
  vcfText += `chr1\t10452\trs88201\t${ref}\t${alt}\t${qualScore}\tPASS\tDP=${totalDP};AF=${altAF.toFixed(2)}\tGT\t${gt}`;

  let html = `<div class="space-y-4">`;
  html += `<pre class="text-indigo-950 font-mono text-xs font-bold leading-relaxed whitespace-pre-wrap bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-xs">${vcfText}</pre>`;

  // Read Pileup Table
  html += `<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">`;
  html += `<h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Read Alignment Pileup Stack (${reads.length} Reads)</h4>`;
  html += `<div class="flex flex-wrap gap-1.5 font-mono text-xs">`;

  reads.forEach((b, idx) => {
    const isRef = b === ref;
    const isCurrent = currentStep === idx;
    let badgeClass = isRef ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    if (isCurrent) {
      badgeClass = 'bg-indigo-600 text-white font-black border-indigo-700 shadow-md transform scale-110';
    } else if (currentStep !== -1 && idx < currentStep) {
      badgeClass += ' opacity-80';
    }

    html += `<span class="px-2 py-1 rounded border ${badgeClass}">R${idx + 1}:${b} (Q${qualScores[idx]})</span>`;
  });

  html += `</div></div></div>`;
  outputContainer.innerHTML = html;
}

function updateInspectorText() {
  const inspector = document.getElementById("vcf-inspector");
  if (!inspector) return;

  const { ref, reads, qualScores, currentStep } = vcfState;
  const n = reads.length;

  if (currentStep === -1) {
    const altCounts = reads.filter(b => b !== ref).length;
    inspector.innerHTML = `<strong>Variant Call Ready (${n} reads loaded):</strong> Reference Base: <code class="text-indigo-600 font-bold font-mono">${ref}</code> &bull; Non-Ref Reads: <span class="text-rose-600 font-bold font-mono">${altCounts}</span>. Click <strong>Play Variant Calling</strong> to step through reads.`;
  } else {
    const readBase = reads[currentStep];
    const q = qualScores[currentStep];
    const isAlt = readBase !== ref;
    const color = isAlt ? 'text-rose-600' : 'text-slate-700';
    inspector.innerHTML = `<strong>Read ${currentStep + 1} / ${n}:</strong> Evaluated Base <code class="${color} font-bold font-mono">'${readBase}'</code> (Phred Quality Score Q${q}). ${isAlt ? '<span class="text-rose-600 font-bold">Supports Alternate Allele!</span>' : 'Supports Reference Base.'}`;
  }
}

function togglePlay() {
  const playBtn = document.getElementById("player-play");
  if (vcfState.isPlaying) {
    stopPlayback();
  } else {
    if (vcfState.currentStep >= vcfState.reads.length - 1) {
      vcfState.currentStep = -1;
    }
    vcfState.isPlaying = true;
    if (playBtn) playBtn.textContent = "Pause";
    vcfState.playTimer = setInterval(() => {
      if (vcfState.currentStep < vcfState.reads.length - 1) {
        vcfState.currentStep++;
        updateInspectorText();
        renderVCFOutput();
      } else {
        stopPlayback();
      }
    }, 700);
  }
}

function stopPlayback() {
  vcfState.isPlaying = false;
  if (vcfState.playTimer) {
    clearInterval(vcfState.playTimer);
    vcfState.playTimer = null;
  }
  const playBtn = document.getElementById("player-play");
  if (playBtn) playBtn.textContent = "Play Variant Calling";
}

function stepNext() {
  stopPlayback();
  if (vcfState.currentStep < vcfState.reads.length - 1) {
    vcfState.currentStep++;
    updateInspectorText();
    renderVCFOutput();
  }
}

function stepPrev() {
  stopPlayback();
  if (vcfState.currentStep > 0) {
    vcfState.currentStep--;
    updateInspectorText();
    renderVCFOutput();
  }
}

function stepReset() {
  stopPlayback();
  vcfState.currentStep = -1;
  updateInspectorText();
  renderVCFOutput();
}
