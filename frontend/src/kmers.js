document.addEventListener("DOMContentLoaded", () => {
  const checkServerStatus = window.checkServerStatus;
  if (typeof checkServerStatus === "function") {
    checkServerStatus();
    setInterval(checkServerStatus, 5000);
  }

  const seqInput = document.getElementById("sequence-input");
  const baseCount = document.getElementById("base-count");
  const kmerK = document.getElementById("kmer-k");
  const runBtn = document.getElementById("run-btn");
  const outputConsole = document.getElementById("output-console");
  const frequentBadge = document.getElementById("frequent-badge");
  const placeholder = document.getElementById("visualizer-placeholder");
  const histogramBars = document.getElementById("histogram-bars");

  // Track base count dynamically
  function updateBaseCount() {
    const len = seqInput.value.trim().length;
    baseCount.textContent = `Bases: ${len}`;
  }
  seqInput.addEventListener("input", updateBaseCount);
  updateBaseCount();

  // Run analysis
  runBtn.addEventListener("click", async () => {
    const sequence = seqInput.value.trim().toUpperCase();
    const k = parseInt(kmerK.value);

    if (!sequence) {
      alert("Please enter a genetic sequence.");
      return;
    }

    if (isNaN(k) || k <= 0 || k > sequence.length) {
      alert(`Please enter a valid K-mer length (1 to ${sequence.length}).`);
      return;
    }

    if (sequence.length > 1000) {
      alert("Sequence exceeds the maximum limit of 1000 bases.");
      return;
    }

    runBtn.disabled = true;
    runBtn.textContent = "Analyzing...";
    outputConsole.innerHTML = "Processing k-mers on backend API server...";
    frequentBadge.textContent = "-";
    placeholder.style.display = "block";
    histogramBars.classList.add("hidden");
    histogramBars.innerHTML = "";

    try {
      const apiBase = window.API_BASE || "http://127.0.0.1:8000/api/v1";

      // 1. Fetch counts
      const countRes = await fetch(`${apiBase}/kmers/count`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence, k })
      });

      if (!countRes.ok) {
        const err = await countRes.json();
        throw new Error(err.detail || "Failed to count k-mers.");
      }
      const countData = await countRes.json();
      const counts = countData.counts;

      // 2. Fetch most frequent
      const freqRes = await fetch(`${apiBase}/kmers/most-frequent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence, k })
      });

      if (!freqRes.ok) {
        const err = await freqRes.json();
        throw new Error(err.detail || "Failed to compute frequent k-mers.");
      }
      const freqData = await freqRes.json();
      const mostFrequent = freqData.most_frequent;

      // Render Badge
      frequentBadge.textContent = mostFrequent.join(", ");

      // Render Console output
      let consoleContent = `<strong>Analysis Complete</strong>\n`;
      consoleContent += `Sequence Length: ${sequence.length} bases | k = ${k}\n`;
      consoleContent += `Unique Overlapping K-mers found: ${Object.keys(counts).length}\n\n`;
      consoleContent += `--------------------------------------\n`;
      consoleContent += `K-mer      | Occurrence Count\n`;
      consoleContent += `--------------------------------------\n`;

      // Sort by count descending, then alphabetically
      const sortedKmers = Object.entries(counts).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      });

      sortedKmers.forEach(([kmer, count]) => {
        const isFreq = mostFrequent.includes(kmer);
        const marker = isFreq ? " *[MAX]" : "";
        consoleContent += `${kmer.padEnd(10)} | ${count}${marker}\n`;
      });

      outputConsole.innerHTML = consoleContent;

      // Render visual bar chart distribution
      placeholder.style.display = "none";
      histogramBars.classList.remove("hidden");

      if (sortedKmers.length === 0) {
        placeholder.style.display = "block";
        placeholder.textContent = "No k-mers generated.";
        return;
      }

      const maxVal = Math.max(...sortedKmers.map(x => x[1]));

      sortedKmers.slice(0, 15).forEach(([kmer, count]) => {
        const percent = Math.max(10, (count / maxVal) * 100);
        const isFreq = mostFrequent.includes(kmer);

        const barCol = document.createElement("div");
        barCol.className = "flex flex-col items-center flex-shrink-0 w-12 group";

        // Hover tooltip showing value
        const tooltip = document.createElement("div");
        tooltip.className = "opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-800 text-white text-[9px] font-bold py-0.5 px-1.5 rounded mb-1 shadow-none";
        tooltip.textContent = `${count}x`;
        barCol.appendChild(tooltip);

        // Bar column element
        const bar = document.createElement("div");
        bar.style.height = `${percent * 1.2}px`; // max height 120px
        bar.className = isFreq
          ? "w-8 bg-indigo-500 rounded-t-sm shadow-none transition-all duration-300 group-hover:bg-indigo-650"
          : "w-8 bg-slate-300 rounded-t-sm shadow-none transition-all duration-300 group-hover:bg-slate-450";
        barCol.appendChild(bar);

        // Label element
        const label = document.createElement("div");
        label.className = "text-[9px] font-bold text-slate-500 mt-1 select-none truncate max-w-full";
        label.textContent = kmer;
        barCol.appendChild(label);

        histogramBars.appendChild(barCol);
      });

      if (sortedKmers.length > 15) {
        const notice = document.createElement("div");
        notice.className = "self-center text-[10px] text-slate-400 italic pl-4";
        notice.textContent = `Showing top 15 of ${sortedKmers.length} unique k-mers...`;
        histogramBars.appendChild(notice);
      }

    } catch (e) {
      outputConsole.textContent = `Error: ${e.message}`;
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = "Analyze K-mers";
    }
  });

  // Auto-run on page load
  runBtn.click();
});
