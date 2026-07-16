const API_BASE = window.API_BASE;
const checkServerStatus = window.checkServerStatus;

let loadedRecords = [];

document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  setInterval(checkServerStatus, 5000);

  setupDropZone();

  const fileInput = document.getElementById("file-input");
  const browseBtn = document.getElementById("browse-btn");
  const exportBtn = document.getElementById("export-btn");

  if (browseBtn) browseBtn.addEventListener("click", () => fileInput.click());
  if (fileInput) fileInput.addEventListener("change", handleFileSelect);
  if (exportBtn) exportBtn.addEventListener("click", exportRecordsJson);
});

function setupDropZone() {
  const dropZone = document.getElementById("drop-zone");
  if (!dropZone) return;

  ["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add("bg-slate-100");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove("bg-slate-100");
    }, false);
  });

  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      uploadFastaFile(files[0]);
    }
  });
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    uploadFastaFile(files[0]);
  }
}

async function uploadFastaFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const consoleEl = document.getElementById("output-console");
  consoleEl.innerHTML = `<div class="text-slate-400">Parsing uploaded FASTA file...</div>`;

  try {
    const res = await fetch(`${API_BASE}/io/parse-fasta`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "FASTA parsing failed.");
    }

    const result = await res.json();
    loadedRecords = result.data; // [{ header, sequence, length }]

    document.getElementById("record-count").textContent = loadedRecords.length;

    renderFastaConsole();
    renderFastaTable();

  } catch (error) {
    alert(`Error: ${error.message}`);
    consoleEl.innerHTML = `<div class="text-rose-500 font-bold">Failed: ${error.message}</div>`;
  }
}

function renderFastaConsole() {
  const consoleEl = document.getElementById("output-console");
  let rowsHtml = "";
  loadedRecords.forEach(r => {
    rowsHtml += `<div>&gt;${r.header} (${r.length} bp)</div>`;
  });

  consoleEl.innerHTML = `
    <div class="mb-1 text-slate-450 uppercase tracking-wider font-semibold text-[10px]">Ingested FASTA record dictionary:</div>
    <div class="overflow-y-auto max-h-[120px] scrollbar-thin text-emerald-400 font-bold">${rowsHtml}</div>
  `;
}

function renderFastaTable() {
  const container = document.getElementById("visualizer-container");
  container.innerHTML = "";
  container.className = "flex-grow overflow-auto bg-slate-50 p-4 border border-slate-150 rounded flex flex-col justify-start w-full";

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "w-full border-0 bg-transparent rounded-none overflow-x-auto";

  const table = document.createElement("table");
  table.className = "min-w-full divide-y divide-slate-200 text-left text-xs font-mono select-none";
  table.innerHTML = `
    <thead class="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[9px]">
      <tr>
        <th class="px-4 py-2">Sequence Header</th>
        <th class="px-4 py-2">Bases Preview</th>
        <th class="px-4 py-2 text-center">Length</th>
        <th class="px-4 py-2 text-center">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 bg-transparent" id="fasta-rows-body"></tbody>
  `;
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);

  const tbody = table.querySelector("#fasta-rows-body");
  loadedRecords.forEach(record => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50/50";
    
    const preview = record.sequence.substring(0, 20);
    const previewStr = record.sequence.length > 20 ? `${preview}...` : preview;

    tr.innerHTML = `
      <td class="px-4 py-2.5 font-bold text-slate-700 max-w-[200px] truncate" title="${record.header}">${record.header}</td>
      <td class="px-4 py-2.5 text-slate-500 tracking-wider">${previewStr}</td>
      <td class="px-4 py-2.5 text-center font-bold text-slate-600">${record.length}</td>
      <td class="px-4 py-2.5 text-center">
        <button class="copy-btn px-2 py-0.5 border border-slate-250 bg-slate-50 hover:bg-slate-150 rounded text-[9px] font-semibold transition-colors cursor-pointer">Copy</button>
      </td>
    `;

    tr.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(record.sequence);
      alert(`Sequence copied for: ${record.header}`);
    });

    tbody.appendChild(tr);
  });
}

async function exportRecordsJson() {
  if (loadedRecords.length === 0) {
    alert("No records loaded to export.");
    return;
  }

  const outputPath = document.getElementById("output-path").value.trim();
  if (!outputPath) {
    alert("Please enter a valid file output path on the server.");
    return;
  }

  const recordDict = {};
  loadedRecords.forEach(r => {
    recordDict[r.header] = r.sequence;
  });

  const exportBtn = document.getElementById("export-btn");
  exportBtn.disabled = true;
  exportBtn.classList.add("opacity-50");

  try {
    const res = await fetch(`${API_BASE}/io/write-fasta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        record: recordDict,
        output_file: outputPath
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Server failed to write JSON.");
    }

    const result = await res.json();
    alert(`Success: ${result.message}`);

  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    exportBtn.disabled = false;
    exportBtn.classList.remove("opacity-50");
  }
}
