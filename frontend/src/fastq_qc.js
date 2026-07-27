// FASTQ QC & Phred Score Workbench Logic

document.addEventListener("DOMContentLoaded", () => {
  const parseBtn = document.getElementById("parse-fastq-btn");
  const sampleBtn = document.getElementById("sample-fastq-btn");
  const inputEl = document.getElementById("fastq-input");
  const statsContainer = document.getElementById("fastq-stats-container");
  const readsContainer = document.getElementById("fastq-reads-container");
  const chartContainer = document.getElementById("fastq-chart-container");
  const trimSlider = document.getElementById("trim-cutoff-slider");
  const trimValueEl = document.getElementById("trim-cutoff-value");

  const sampleFASTQ = `@READ_001 Illumina HiSeq 2000
GATCGGAAGAGCACACGTCTGAACTCCAGTCAC
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
@READ_002 Illumina HiSeq 2000
GATCGGAAGAGCACACGTCTGAACTCCAGTCAC
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIHFFCCC
@READ_003 Low Quality Read
ATGCGATCGATCGATCGATCGATCGATCGATCG
+
?????????????????????????????????
@READ_004 Corrupted Tail Read
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG
+
IIIIIIIIIIIIIIIIIIIIIIII5555!!!!!`;

  if (inputEl && !inputEl.value.trim()) {
    inputEl.value = sampleFASTQ;
  }

  if (trimSlider && trimValueEl) {
    trimSlider.addEventListener("input", (e) => {
      trimValueEl.textContent = `Q${e.target.value}`;
      if (inputEl && inputEl.value.trim()) {
        processFastqText(inputEl.value, parseInt(e.target.value, 10));
      }
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      inputEl.value = sampleFASTQ;
      const cutoff = trimSlider ? parseInt(trimSlider.value, 10) : 20;
      processFastqText(sampleFASTQ, cutoff);
    });
  }

  if (parseBtn) {
    parseBtn.addEventListener("click", () => {
      const text = inputEl.value;
      const cutoff = trimSlider ? parseInt(trimSlider.value, 10) : 20;
      processFastqText(text, cutoff);
    });
  }

  // Initial calculation
  if (inputEl && inputEl.value.trim()) {
    processFastqText(inputEl.value, 20);
  }
});

function parseFastqClient(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const records = [];

  let i = 0;
  while (i + 3 < lines.length) {
    const header = lines[i];
    const seq = lines[i + 1];
    const strand = lines[i + 2];
    const qual = lines[i + 3];

    if (header.startsWith("@") && strand.startsWith("+")) {
      const phred = [];
      for (let j = 0; j < qual.length; j++) {
        phred.push(qual.charCodeAt(j) - 33);
      }
      const sumQ = phred.reduce((a, b) => a + b, 0);
      const avgQ = phred.length > 0 ? (sumQ / phred.length) : 0;

      records.push({
        header: header.substring(1),
        sequence: seq,
        length: seq.length,
        quality_string: qual,
        phred_scores: phred,
        avg_quality: parseFloat(avgQ.toFixed(2))
      });
      i += 4;
    } else {
      i += 1;
    }
  }

  return records;
}

function processFastqText(text, trimCutoff = 20) {
  const records = parseFastqClient(text);
  const statsContainer = document.getElementById("fastq-stats-container");
  const readsContainer = document.getElementById("fastq-reads-container");
  const chartContainer = document.getElementById("fastq-chart-container");

  if (!records || records.length === 0) {
    if (statsContainer) statsContainer.innerHTML = `<p class="text-xs text-rose-500 font-semibold">No valid 4-line FASTQ records found.</p>`;
    return;
  }

  let totalBases = 0;
  let totalQSum = 0;
  let q30Bases = 0;
  let trimmedBasesRemoved = 0;

  const maxLen = Math.max(...records.map(r => r.phred_scores.length));
  const posSums = new Array(maxLen).fill(0);
  const posCounts = new Array(maxLen).fill(0);

  records.forEach(r => {
    r.phred_scores.forEach((q, idx) => {
      totalBases++;
      totalQSum += q;
      if (q >= 30) q30Bases++;
      posSums[idx] += q;
      posCounts[idx]++;
      if (q < trimCutoff) trimmedBasesRemoved++;
    });
  });

  const overallAvgQ = (totalQSum / totalBases).toFixed(2);
  const q30Pct = ((q30Bases / totalBases) * 100).toFixed(1);
  const perPosAvg = posSums.map((sum, i) => (sum / posCounts[i]).toFixed(1));

  // Render Stats Grid
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reads</div>
          <div class="text-lg font-extrabold text-slate-900 mt-0.5">${records.length}</div>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Mean Q</div>
          <div class="text-lg font-extrabold ${overallAvgQ >= 30 ? 'text-emerald-600' : 'text-amber-600'} mt-0.5">${overallAvgQ}</div>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Q30+ Rate</div>
          <div class="text-lg font-extrabold text-indigo-600 mt-0.5">${q30Pct}%</div>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bases Below Q${trimCutoff}</div>
          <div class="text-lg font-extrabold text-rose-600 mt-0.5">${trimmedBasesRemoved}</div>
        </div>
      </div>
    `;
  }

  // Render Quality Curve Bars
  if (chartContainer) {
    let chartHtml = `<div class="flex items-end justify-between h-36 gap-1 border-b border-slate-200 pb-1 px-1">`;
    perPosAvg.forEach((qVal, idx) => {
      const hPct = Math.min(100, Math.max(10, (qVal / 40) * 100));
      let barColor = "bg-emerald-500";
      if (qVal < 20) barColor = "bg-rose-500";
      else if (qVal < 30) barColor = "bg-amber-500";

      chartHtml += `
        <div class="flex-grow flex flex-col items-center group relative">
          <div class="text-[9px] font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">Q${qVal}</div>
          <div class="w-full ${barColor} rounded-t transition-all duration-300" style="height: ${hPct}%;"></div>
          <span class="text-[8px] font-mono text-slate-400 mt-1">${idx + 1}</span>
        </div>
      `;
    });
    chartHtml += `</div>`;
    chartContainer.innerHTML = chartHtml;
  }

  // Render Individual Read Trimming Cards
  if (readsContainer) {
    let readsHtml = `<div class="space-y-3 max-h-64 overflow-y-auto pr-1">`;
    records.forEach(r => {
      let seqSpan = "";
      r.phred_scores.forEach((q, idx) => {
        const char = r.sequence[idx] || "";
        let colorClass = "text-emerald-700 bg-emerald-50";
        if (q < trimCutoff) colorClass = "text-rose-700 bg-rose-100 line-through opacity-60";
        else if (q < 30) colorClass = "text-amber-700 bg-amber-50";

        seqSpan += `<span class="inline-block px-1 py-0.5 text-[10px] font-mono font-bold rounded ${colorClass} mr-0.5 mb-0.5" title="Base ${idx+1}: ${char} (Q${q})">${char}</span>`;
      });

      readsHtml += `
        <div class="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold text-slate-800 font-mono">@${r.header}</span>
            <span class="text-[10px] font-bold text-slate-500">Mean Q: <span class="${r.avg_quality >= 30 ? 'text-emerald-600' : 'text-amber-600'}">${r.avg_quality}</span></span>
          </div>
          <div class="flex flex-wrap">${seqSpan}</div>
        </div>
      `;
    });
    readsHtml += `</div>`;
    readsContainer.innerHTML = readsHtml;
  }
}
