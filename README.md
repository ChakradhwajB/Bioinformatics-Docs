# Bioinformatics Docs

A desktop-grade local web application for sequence alignment, genetics operations, sequence distances, and pattern mapping.

## Features

- **Global & Local Sequence Alignment**: Needleman-Wunsch and Smith-Waterman alignment visualizers with dynamic programming matrix cell inspectors and a step-by-step traceback path player.
- **Sequence Distance Metrics**: Calculates Hamming mutation distance and Levenshtein edit distance with interactive comparison grids.
- **Genetics Operations**: Watson-Crick DNA complementation, transcription to RNA, and ribosome translation to peptide residues.
- **Motif Finder**: Highlights sequence matches and provides a sliding window density heatmap scrollbar.
- **Dot Plot Visualizer**: Grid comparison of two sequences with configurable sliding window and threshold settings to identify repeats, indels, and inversions.
- **FASTA File Ingestion**: Drag-and-drop FASTA parser with structure validation.

## Tech Stack

- **Frontend**: Vanilla HTML5, Tailwind CSS v4, KaTeX (for mathematical formulas rendering), client-side JS. Exposes globals via the global `window` object to allow opening HTML files directly from Windows File Explorer (`file://` protocol) without CORS blocks.
- **Backend**: FastAPI web server (Python 3) for processing JSON exports and sequence imports.

---

## Getting Started

### 1. Run the Python Backend
Install dependencies and run the FastAPI server:
```bash
pip install -r requirements.txt
uvicorn server.main:app --reload
```
The server will run on `http://127.0.0.1:8000`.

### 2. Launch the Web Application
Simply open `frontend/index.html` in any web browser. You can double-click it directly from your file manager or host it on a local dev server.

### 3. (Optional) Compile Stylesheet
If you edit `frontend/styles.css`, compile the Tailwind build:
```bash
cd frontend
npm run build
```

---

## Testing
Run the Python test suite:
```bash
pytest
```
