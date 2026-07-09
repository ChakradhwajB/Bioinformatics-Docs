# Bioinformatics Tool suite

This is a local-first web application for sequence alignment, genetics operations, sequence distances, and pattern mapping. It includes a frontend dashboard that works both locally and deployed, backed by a FastAPI server.

---

## Technical Features

- **Global & Local Alignment Players**: Needleman-Wunsch and Smith-Waterman aligners with a step-by-step traceback visualizer and path inspector.
- **Sequence Distance Metrics**: Hamming mutation distance and Levenshtein edit distance with interactive alignment grid inspectors.
- **Genetics Workbench**: Complementation, Transcription, and Translation tools.
- **Motif Finder**: Substring lookup highlighting matching sequences and density hotspots.
- **Dot Plot Visualizer**: Grid comparison of two sequences with configurable sliding window and threshold settings to identify repeats, indels, and inversions.
- **FASTA File Ingestion**: Drag-and-drop parsing and nucleotide structure validation.

---

## Live Documentation Engine

Instead of relying on heavy static site generators, the page fetches the raw Markdown documentation files (`docs/*.md`) using client-side `fetch()` APIs and renders them on the fly:

1. **Marked.js** compiles the Markdown syntax into standard HTML tags.
2. A custom regex pre-processor intercepts GitHub's native ```math block syntax and translates it to inline/block delimiters.
3. **KaTeX** dynamically parses and renders the mathematical equations in the browser.

To add or update documentation, edit the `.md` files inside the `docs/` directory. Since the `docs/` folder is copied to `frontend/docs/` during deployment, any changes will reflect immediately on the hosted website.

---

## Benchmarking

The project includes a runtime performance analyzer inside the `benchmarks/` directory:

- **run_benchmarks.py**: Runs the core processing library functions against input sizes from $10$ to $100,000$. It uses a dynamic auto-ranging loop (running fast functions 100 times, and capping heavy DP alignments at 3 runs) to ensure stable averages without hanging.
- **generate_graphs.py**: Parses the raw benchmark execution logs, plots the curves via Matplotlib, and writes the results.
- **analysis_report.md**: An internal technical memo evaluating complexity curves (proving the quadratic $\mathcal{O}(n^2)$ behavior using log-log slope calculations), memory thresholds, and optimization strategies (such as Hirschberg's linear-space alignment).

---

## Getting Started

### 1. Run the Python Backend

Install dependencies and launch the FastAPI development server:

```bash
pip install -r requirements.txt
python -m uvicorn server.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### 2. Launch the Web Application

Open `frontend/index.html` directly in any web browser. The app uses local probes to automatically bind to the local backend if running; otherwise, it falls back to the public hosted API.

### 3. Compile Styles (Optional)

If you modify the CSS rules in `frontend/styles.css`, rebuild the Tailwind stylesheet:

```bash
cd frontend
npm run build
```

---

## Testing

Run the python test suite to verify matching logic and IO parser integrity:

```bash
pytest
```
