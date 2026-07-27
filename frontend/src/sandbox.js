const SANDBOX_DATA = {
  "io.html": {
    title: "Parse FASTA",
    initialCode: "def parse_fasta(fasta_string):\n    # TODO: Implement FASTA parser returning dict\n    return {}\n\nprint(parse_fasta('>seq1\\nATGC\\n>seq2\\nCGTA'))",
    testCode: "assert parse_fasta('>seq1\\nATGC\\n>seq2\\nCGTA') == {'seq1': 'ATGC', 'seq2': 'CGTA'}"
  },
  "fastq_qc.html": {
    title: "FASTQ Quality Score Trimmer",
    initialCode: "def phred_to_prob(q):\n    # Calculate error probability P = 10^(-Q/10)\n    return 10 ** (-q / 10)\n\ndef trim_low_quality(sequence, phred_scores, min_q=20):\n    # Trim sequence from 3' end while score < min_q\n    idx = len(phred_scores)\n    while idx > 0 and phred_scores[idx - 1] < min_q:\n        idx -= 1\n    return sequence[:idx]\n\nprint('P(Q30) =', phred_to_prob(30))\nprint('Trimmed:', trim_low_quality('AGCTAG', [35, 30, 25, 10, 5, 2], min_q=20))",
    testCode: "assert abs(phred_to_prob(20) - 0.01) < 1e-5\nassert trim_low_quality('AGCTAG', [35, 30, 25, 10, 5, 2], min_q=20) == 'AGC'"
  },
  "genetics.html": {
    title: "Reverse Complement",
    initialCode: "def reverse_complement(seq):\n    # TODO: return reverse complement\n    return ''\n\nprint(reverse_complement('ATGC'))",
    testCode: "assert reverse_complement('ATGC') == 'GCAT'"
  },
  "kmers.html": {
    title: "Generate k-mers",
    initialCode: "def get_kmers(seq, k):\n    # TODO: return list of k-mers\n    return []\n\nprint(get_kmers('GATTACA', 3))",
    testCode: "assert get_kmers('GATTACA', 3) == ['GAT', 'ATT', 'TTA', 'TAC', 'ACA']"
  },
  "find_motif.html": {
    title: "Motif Finding",
    initialCode: "def find_motif(seq, motif):\n    # TODO: return list of 1-based start positions\n    return []\n\nprint(find_motif('GATATATA', 'ATA'))",
    testCode: "assert find_motif('GATATATA', 'ATA') == [1, 3, 5]"
  },
  "dot_plot.html": {
    title: "Dot Plot Matrix",
    initialCode: "def dot_plot(seq1, seq2):\n    # TODO: return 2D boolean list\n    return []\n\nprint(dot_plot('AT', 'AT'))",
    testCode: "assert dot_plot('AT', 'AT') == [[True, False], [False, True]]"
  },
  "distances.html": {
    title: "Hamming Distance",
    initialCode: "def hamming_distance(seq1, seq2):\n    # TODO: return integer distance\n    return 0\n\nprint(hamming_distance('ATCG', 'ATCC'))",
    testCode: "assert hamming_distance('ATCG', 'ATCC') == 1"
  },
  "needleman_wunsch.html": {
    title: "NW Global Alignment",
    initialCode: "def needleman_wunsch(seq1, seq2, match=1, mismatch=-1, gap=-1):\n    # TODO: return max alignment score\n    return 0\n\nprint(needleman_wunsch('AT', 'A'))",
    testCode: "assert needleman_wunsch('AT', 'A') == 0"
  },
  "smith_waterman.html": {
    title: "SW Local Alignment",
    initialCode: "def smith_waterman(seq1, seq2, match=1, mismatch=-1, gap=-1):\n    # TODO: return max local alignment score\n    return 0\n\nprint(smith_waterman('ATAC', 'TACG'))",
    testCode: "assert smith_waterman('ATAC', 'TACG') == 3"
  },
  "trie.html": {
    title: "Naive Search",
    initialCode: "def naive_search(sequence, patterns):\n    # TODO: return dictionary of pattern -> list of start offsets\n    return {}\n\nprint(naive_search('GATATATA', ['ATA']))",
    testCode: "assert naive_search('GATATATA', ['ATA']) == {'ATA': [1, 3, 5]}"
  },
  "suffix_array.html": {
    title: "Suffix Array Construction",
    initialCode: "def build_suffix_array(text):\n    # text includes sentinel '$'\n    # TODO: return list of offsets\n    return []\n\nprint(build_suffix_array('BANA$'))",
    testCode: "assert build_suffix_array('BANA$') == [4, 3, 1, 0, 2]"
  },
  "affine_gaps.html": {
    title: "Affine Gap Penalty Score",
    initialCode: "def affine_gap_score(open_penalty=10, extend_penalty=1, length=5):\n    # Calculate penalty for a gap of given length: g(k) = open + (k-1)*extend\n    return open_penalty + (length - 1) * extend_penalty\n\nprint('Gap score (length=5):', affine_gap_score(10, 1, 5))",
    testCode: "assert affine_gap_score(10, 1, 5) == 14"
  },
  "bwt_fm_index.html": {
    title: "Burrows-Wheeler Transform",
    initialCode: "def bwt(s):\n    # Add sentinel '$'\n    s = s + '$' if not s.endsWith('$') else s\n    table = sorted(s[i:] + s[:i] for i in range(len(s)))\n    return ''.join(row[-1] for row in table)\n\nprint('BWT(GATTACA$):', bwt('GATTACA$'))",
    testCode: "assert bwt('GCAT$') == 'T$ACG'"
  },
  "de_bruijn.html": {
    title: "De Bruijn Graph Construction",
    initialCode: "def build_de_bruijn(reads, k=3):\n    edges = []\n    for read in reads:\n        for i in range(len(read) - k + 1):\n            kmer = read[i:i+k]\n            edges.append((kmer[:-1], kmer[1:]))\n    return edges\n\nprint('Edges:', build_de_bruijn(['GATTACA'], k=3))",
    testCode: "assert ('GA', 'AT') in build_de_bruijn(['GATTACA'], k=3)"
  },
  "hmm_viterbi.html": {
    title: "Viterbi Path Decoding",
    initialCode: "def viterbi_decode(obs, states, start_p, trans_p, emit_p):\n    # Simple Viterbi implementation for 2-state HMM\n    return ['E' if o == 'C' else 'N' for o in obs]\n\nprint('Path:', viterbi_decode('CGCG', ['N', 'E'], None, None, None))",
    testCode: "assert len(viterbi_decode('CGCG', ['N', 'E'], None, None, None)) == 4"
  },
  "vcf_caller.html": {
    title: "Variant Calling & Ti/Tv Ratio",
    initialCode: "def calc_titv(variants):\n    transitions = {'A': 'G', 'G': 'A', 'C': 'T', 'T': 'C'}\n    ti, tv = 0, 0\n    for ref, alt in variants:\n        if transitions.get(ref) == alt:\n            ti += 1\n        else:\n            tv += 1\n    return round(ti / tv, 2) if tv > 0 else 0.0\n\nprint('Ti/Tv:', calc_titv([('A', 'G'), ('C', 'T'), ('A', 'C')]))",
    testCode: "assert calc_titv([('A', 'G'), ('C', 'T'), ('A', 'C')]) == 2.0"
  },
  "scrna_seq.html": {
    title: "Single-Cell TPM & Quality Control",
    initialCode: "def filter_cells(counts, min_genes=200):\n    # Keep cells with gene count >= min_genes\n    return [cell for cell in counts if sum(cell) >= min_genes]\n\nprint('Filtered:', len(filter_cells([[100, 150], [10, 20]])))",
    testCode: "assert len(filter_cells([[100, 150], [10, 20]])) == 1"
  },
  "genomic_ai.html": {
    title: "One-Hot DNA Encoding for AI Models",
    initialCode: "def one_hot_encode(seq):\n    mapping = {'A': [1,0,0,0], 'C': [0,1,0,0], 'G': [0,0,1,0], 'T': [0,0,0,1]}\n    return [mapping.get(n, [0,0,0,0]) for n in seq.upper()]\n\nprint('One-hot ACGT:', one_hot_encode('ACGT'))",
    testCode: "assert one_hot_encode('ACGT') == [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]]"
  }
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let pyodide = null;
let isPyodideLoading = false;
let currentTestCode = null;

window.loadSandboxChallenge = function(btn) {
  if (!btn) return;
  const parentDiv = btn.parentElement;
  if (!parentDiv) return;
  
  const typeEl = parentDiv.querySelector('span');
  const problemEl = parentDiv.querySelector('p');
  
  const type = typeEl ? typeEl.textContent : 'Challenge';
  const problemText = problemEl ? problemEl.textContent : 'Write your solution below.';
  
  const editor = document.getElementById('python-editor');
  if (!editor) return;
  
  // Format text to wrap around 70 chars for python comments
  let formattedText = problemText;
  if (formattedText.length > 70) {
      formattedText = formattedText.match(/.{1,70}(\s|$)/g).join('\n# ');
  }
  
  editor.value = `# ${type} Challenge:\n# ${formattedText}\n\ndef solve():\n    # TODO: write your solution here\n    pass\n\nprint(solve())`;
  
  // Disable tests since this is a freeform practice problem
  currentTestCode = null;
  
  // Open the sandbox details tag if closed
  const details = document.getElementById('sandbox-details');
  if (details && !details.open) {
      details.open = true;
  }
  
  // scroll down smoothly after layout updates
  setTimeout(() => {
      const container = document.getElementById('sandbox-container');
      if (container) {
          container.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  let pageName = window.location.pathname.split("/").pop() || "index.html";
  if (!pageName.endsWith(".html")) pageName += ".html";

  const sandboxData = SANDBOX_DATA[pageName];
  if (!sandboxData) return;

  const container = document.getElementById("sandbox-container");
  if (!container) return;

  renderSandbox(container, sandboxData);
});

function renderSandbox(container, sandboxData) {
  currentTestCode = sandboxData.testCode;

  const html = `
    <details id="sandbox-details" class="max-w-6xl mx-auto w-full bg-white/80 border border-slate-200 rounded-xl shadow-xs mt-6 overflow-hidden flex flex-col group backdrop-blur-sm">
      <summary class="bg-slate-50/80 px-4 py-3 flex items-center justify-between border-b border-slate-200 cursor-pointer select-none outline-none">
        <h3 id="sandbox-title" class="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center">
          <svg class="w-4 h-4 mr-1.5 text-indigo-600 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          Interactive Python Sandbox: ${sandboxData.title}
        </h3>
        <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider group-open:hidden">Click to Expand</span>
      </summary>
      <div class="flex flex-col md:flex-row group-open:flex hidden group-open:!flex">
        <div class="w-full md:w-1/2 border-r border-slate-200 relative">
          <textarea id="python-editor" class="w-full h-48 md:h-64 bg-slate-50/50 text-slate-800 p-4 font-mono text-[11px] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" spellcheck="false">${sandboxData.initialCode}</textarea>
        </div>
        <div class="w-full md:w-1/2 bg-slate-50/90 p-4 flex flex-col relative">
          <div class="flex justify-between items-center mb-2">
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Console Output</span>
            <button id="run-code-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold py-1 px-3 rounded transition-colors uppercase tracking-wider flex items-center shadow-xs">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
              Run Code
            </button>
          </div>
          <pre id="python-output" class="text-slate-700 font-mono text-[10px] whitespace-pre-wrap flex-grow overflow-y-auto">Click 'Run Code' to execute your Python script in the browser.</pre>
        </div>
      </div>
    </details>
  `;

  if (!container) return;
  container.innerHTML = html;

  const runBtn = document.getElementById("run-code-btn");
  if (!runBtn) return;
  runBtn.addEventListener("click", async () => {
    const editor = document.getElementById("python-editor");
    const output = document.getElementById("python-output");
    const code = editor.value;

    output.innerHTML = '<span class="text-sky-400 animate-pulse">Initializing Python runtime (Pyodide)...</span>';
    runBtn.disabled = true;
    runBtn.classList.add("opacity-50");

    try {
      if (!pyodide) {
        if (!isPyodideLoading) {
            isPyodideLoading = true;
            // Ensure pyodide script is loaded
            if (typeof loadPyodide === 'undefined') {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            pyodide = await loadPyodide();
        } else {
            // wait until loaded
            while (!pyodide) {
                await new Promise(r => setTimeout(r, 100));
            }
        }
      }

      output.innerHTML = '<span class="text-sky-400">Running...</span>';

      // Capture stdout with limit
      let stdout = "";
      pyodide.setStdout({ batched: (msg) => {
        if (stdout.length < 10000) {
          stdout += msg + "\\n";
        } else if (!stdout.endsWith("... [OUTPUT TRUNCATED]\\n")) {
          stdout += "... [OUTPUT TRUNCATED]\\n";
        }
      }});
      
      // Run user code with timeout and basic size wrapper
      const timeoutWrapper = (sourceCode) => `
import sys
import time
import builtins

class SandboxTimeout(Exception): pass
class SandboxMemoryLimit(Exception): pass

# Restrict imports to safe modules only
_SAFE_MODULES = frozenset({
    'math', 'random', 'string', 'collections', 'itertools',
    'functools', 'operator', 're', 'json', 'copy',
    'heapq', 'bisect', 'array', 'enum', 'typing',
    'dataclasses', 'abc', 'numbers', 'decimal', 'fractions',
    'statistics', 'textwrap', 'unicodedata', 'pprint',
})
_original_import = builtins.__import__
def _safe_import(name, *args, **kwargs):
    top_level = name.split('.')[0]
    if top_level not in _SAFE_MODULES and top_level not in sys.modules:
        raise ImportError(f"Module '{name}' is not available in the sandbox")
    return _original_import(name, *args, **kwargs)
builtins.__import__ = _safe_import

def _run_with_timeout():
    start_time = time.time()
    def trace_calls(frame, event, arg):
        if time.time() - start_time > 3:
            raise SandboxTimeout("Execution timed out after 3 seconds")
        # Basic check to avoid massive allocations filling up browser memory
        if sys.getallocatedblocks() > 100000:
            raise SandboxMemoryLimit("Memory limit exceeded")
        return trace_calls
    sys.settrace(trace_calls)
    try:
        exec(${JSON.stringify(sourceCode)}, globals())
    finally:
        sys.settrace(None)
        builtins.__import__ = _original_import
_run_with_timeout()
`;

      await pyodide.runPythonAsync(timeoutWrapper(code));
      
      let finalOutput = escapeHtml(stdout);

      // Run tests
      if (sandboxData.testCode) {
        try {
          await pyodide.runPythonAsync(timeoutWrapper(sandboxData.testCode));
          finalOutput += "\\n\\n<span class='text-emerald-400 font-bold'>[SUCCESS] All tests passed!</span>";
        } catch (testErr) {
          finalOutput += `\n\n<span class='text-rose-400 font-bold'>[TEST FAILED]</span>\n${testErr.message}`;
        }
      }

      output.innerHTML = finalOutput;
    } catch (err) {
      output.innerHTML = `<span class="text-rose-400">${escapeHtml(err.message)}</span>`;
    } finally {
      runBtn.disabled = false;
      runBtn.classList.remove("opacity-50");
    }
  });
}
