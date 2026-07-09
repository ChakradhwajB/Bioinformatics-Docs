const API_BASE = window.API_BASE;
const checkServerStatus = window.checkServerStatus;

const CODON_CHART = {
  "UUU": "F", "UUC": "F", "UUA": "L", "UUG": "L",
  "UCU": "S", "UCC": "S", "UCA": "S", "UCG": "S",
  "UAU": "Y", "UAC": "Y", "UAA": "*", "UAG": "*",
  "UGU": "C", "UGC": "C", "UGA": "*", "UGG": "W",
  "CUU": "L", "CUC": "L", "CUA": "L", "CUG": "L",
  "CCU": "P", "CCC": "P", "CCA": "P", "CCG": "P",
  "CAU": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
  "CGU": "R", "CGC": "R", "CGA": "R", "CGG": "R",
  "AUU": "I", "AUC": "I", "AUA": "I", "AUG": "M",
  "ACU": "T", "ACC": "T", "ACA": "T", "ACG": "T",
  "AAU": "N", "AAC": "N", "AAA": "K", "AAG": "K",
  "AGU": "S", "AGC": "S", "AGA": "R", "AGG": "R",
  "GUU": "V", "GUC": "V", "GUA": "V", "GUG": "V",
  "GCU": "A", "GCC": "A", "GCA": "A", "GCG": "A",
  "GAU": "D", "GAC": "D", "GAA": "E", "GAG": "E",
  "GGU": "G", "GGC": "G", "GGA": "G", "GGG": "G"
};

const AMINO_ACID_NAMES = {
  "F": "Phe", "L": "Leu", "S": "Ser", "Y": "Tyr",
  "C": "Cys", "W": "Trp", "P": "Pro", "H": "His",
  "Q": "Gln", "R": "Arg", "I": "Ile", "M": "Met (Start)",
  "T": "Thr", "N": "Asn", "K": "Lys", "V": "Val",
  "A": "Ala", "D": "Asp", "E": "Glu", "G": "Gly",
  "X": "Unk", "*": "Stop"
};

document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  const textarea = document.getElementById("sequence-input");
  const countSpan = document.getElementById("base-count");

  textarea.addEventListener("input", (e) => {
    countSpan.textContent = `Bases: ${e.target.value.length}`;
  });

  const runBtn = document.getElementById("run-btn");
  if (runBtn) {
    runBtn.addEventListener("click", performGeneticsOperation);
  }

  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = document.getElementById("output-text")?.textContent || "";
      if (text) {
        navigator.clipboard.writeText(text);
        alert("Copied results output strand to clipboard!");
      }
    });
  }

  performGeneticsOperation();
});

async function performGeneticsOperation() {
  const sequence = document.getElementById("sequence-input").value.trim().toUpperCase();
  const op = document.getElementById("genetics-op-select").value;

  if (!sequence) {
    alert("Please enter a sequence strand.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/genetics/${op}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(op === "translate" ? { rna_sequence: sequence } : { sequence })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Transformation request failed.");
    }

    const data = await res.json();
    let outputVal = "";
    if (op === "complement") outputVal = data.complement;
    else if (op === "reverse-complement") outputVal = data.reverse_complement;
    else if (op === "transcribe") outputVal = data.transcribed_sequence;
    else if (op === "translate") outputVal = data.protein;

    // Display inside Console
    const consoleEl = document.getElementById("output-console");
    consoleEl.innerHTML = `
      <div class="mb-1 text-slate-400 uppercase tracking-wider text-[10px] font-bold">Results strand output:</div>
      <div id="output-text" class="break-all font-bold tracking-wider text-emerald-400 select-all">${outputVal}</div>
    `;

    // Render visualizers
    if (op === "translate") {
      renderRibosomeTable(sequence);
    } else {
      renderStrandsDualTable(sequence, outputVal);
    }

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function renderStrandsDualTable(inStrand, outStrand) {
  const container = document.getElementById("visualizer-container");
  container.innerHTML = "";
  container.className = "flex-grow overflow-auto bg-slate-50 p-4 flex flex-col items-center justify-center border border-slate-200 rounded";

  const wrapper = document.createElement("div");
  wrapper.className = "border border-slate-200 bg-white rounded-md p-4 flex flex-col space-y-2 max-w-xl w-full";

  const row1 = document.createElement("div");
  row1.className = "flex flex-wrap gap-1 font-mono-seq text-xs";
  row1.innerHTML = `<span class="text-slate-450 mr-2 uppercase text-[9px] self-center">Input:</span>`;
  
  const row2 = document.createElement("div");
  row2.className = "flex flex-wrap gap-1 font-mono-seq text-xs";
  row2.innerHTML = `<span class="text-slate-450 mr-2 uppercase text-[9px] self-center">Output:</span>`;

  for (let i = 0; i < inStrand.length; i++) {
    row1.appendChild(createBaseBadge(inStrand[i]));
  }
  for (let i = 0; i < outStrand.length; i++) {
    row2.appendChild(createBaseBadge(outStrand[i]));
  }

  wrapper.appendChild(row1);
  wrapper.appendChild(row2);
  container.appendChild(wrapper);
}

function createBaseBadge(char) {
  const span = document.createElement("span");
  span.className = "inline-block w-6 py-0.5 text-center font-mono font-bold rounded text-[11px]";
  if (char === 'A') span.className += " bg-rose-950 text-rose-300 border border-rose-900/30";
  else if (char === 'T' || char === 'U') span.className += " bg-amber-950 text-amber-300 border border-amber-900/30";
  else if (char === 'C') span.className += " bg-sky-950 text-sky-300 border border-sky-900/30";
  else if (char === 'G') span.className += " bg-emerald-950 text-emerald-300 border border-emerald-900/30";
  else span.className += " bg-slate-800 text-slate-500 border border-slate-700/20";
  span.textContent = char;
  return span;
}

function renderRibosomeTable(rnaStrand) {
  const container = document.getElementById("visualizer-container");
  container.innerHTML = "";
  container.className = "flex-grow overflow-auto bg-slate-50 p-2 border border-slate-200 rounded flex flex-col justify-start w-full";

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "w-full border border-slate-200 bg-white rounded-md overflow-x-auto";

  const table = document.createElement("table");
  table.className = "min-w-full divide-y divide-slate-200 text-left text-xs font-mono select-none";
  table.innerHTML = `
    <thead class="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[9px]">
      <tr>
        <th class="px-4 py-2 text-center">Codon ID</th>
        <th class="px-4 py-2 text-center">Triplet</th>
        <th class="px-4 py-2 text-center">Amino Acid</th>
        <th class="px-4 py-2">Full Name</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 bg-white" id="codon-rows-body"></tbody>
  `;
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);

  const tbody = table.querySelector("#codon-rows-body");
  let id = 1;

  for (let i = 0; i <= rnaStrand.length - 3; i += 3) {
    const codon = rnaStrand.substring(i, i + 3);
    const aa = CODON_CHART[codon] || "X";
    const aaName = AMINO_ACID_NAMES[aa] || "Unknown";

    const tr = document.createElement("tr");
    tr.className = aa === "*" ? "bg-rose-50/40" : "hover:bg-slate-50/50";
    tr.innerHTML = `
      <td class="px-4 py-2 text-center text-slate-400 font-bold">${id++}</td>
      <td class="px-4 py-2 text-center font-bold tracking-widest text-slate-700">${codon}</td>
      <td class="px-4 py-2 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold text-white ${getAaColorClass(aa)}">${aa}</span></td>
      <td class="px-4 py-2 text-slate-600 font-semibold">${aaName}</td>
    `;
    tbody.appendChild(tr);

    if (aa === "*") break;
  }
}

function getAaColorClass(aa) {
  if (["R", "K", "H"].includes(aa)) return "bg-blue-600";
  if (["D", "E"].includes(aa)) return "bg-rose-600";
  if (["Q", "N", "S", "T", "Y", "C"].includes(aa)) return "bg-amber-600";
  if (aa === "M") return "bg-emerald-600";
  if (aa === "*") return "bg-slate-700";
  return "bg-slate-500";
}
