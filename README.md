# Bioinformatics Library

A Python bioinformatics toolkit implementing sequence alignment, distance metrics, sequence transformations, and file processing algorithms from computational biology.

[Documentation](https://bioinformatics-docs.netlify.app/pages/docs.html) • [Benchmarks](https://bioinformatics-docs.netlify.app/pages/docs.html?path=benchmarks/analysis_report.md) • [Website](https://bioinformatics-docs.netlify.app/) • [Source Code](https://github.com/ChakradhwajB/Bioinformatics-Docs)

---


![Bioinformatics Toolkit Landing Page](frontend/landing_page.png)

---

## Features

### Sequence Alignment

- **Needleman-Wunsch**: Global homology alignments utilizing dynamic programming with traceback visualization.
- **Smith-Waterman**: Local sequence alignments focusing on highly similar subsequences.

### Distance Metrics

- **Hamming Distance**: Linear mutation metric comparing identical-length strings.
- **Levenshtein Distance**: Dynamic programming edit distance calculating insertions, deletions, and substitutions.

### Genetic Transformations

- **Complement & Reverse Complement**: Standard DNA/RNA strand conversions.
- **Transcription & Translation**: DNA-to-RNA transcription and RNA-to-Peptide codon mapping.
- **Motif Search**: Sliding window target pattern mapping.

### File Processing

- **FASTA Parsing**: High-performance, low-memory line-by-line file streaming and header stats parser.
- **FASTA Writing**: Output record generators.
- **Input Validation**: Strict DNA/RNA vocabulary check tools.

### Engineering

- **Unit Tested**: $40+$ test assertions validating edge cases, penalties, and parser bounds.
- **Complexity Benchmarked**: Empirical validation logs matching theoretical $\mathcal{O}(n)$ and $\mathcal{O}(n^2)$ behavior.
- **Documented**: Educational articles with KaTeX math rendering.

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ChakradhwajB/Bioinformatics-Docs.git
cd Bioinformatics-Docs
pip install -r requirements.txt
```

---

## Quick Start

You can run calculations directly in Python or launch the local interactive web dashboard.

#### 1. Global Sequence Alignment

```python
from core_lib.alignments import NeedlemanWunsch

# Align sequences with Match=1, Mismatch=-1, Gap=-1 penalties
score, align1, align2 = NeedlemanWunsch(
    "GCATGCG",
    "GATTACA",
    match=1,
    mismatch=-1,
    gap=-1
)

print(f"Alignment Score: {score}")
print(f"Seq 1: {align1}")
print(f"Seq 2: {align2}")
# Output:
# Alignment Score: 0
# Seq 1: G-CATGCG
# Seq 2: GA-T-ACA
```

#### 2. Motif Searching

```python
from core_lib.genetics import FindMotif

# Locate all offsets of a target motif in a genome sequence
positions = FindMotif(
    "GATATATGCATATACTT",
    "ATAT"
)
print(f"Motif starts at 0-indexed positions: {positions}")
# Output: [1, 3, 9]
```

### Local Quick Start

Start the FastAPI backend server:

```bash
python -m uvicorn server.main:app --reload
```

Then, double-click `frontend/index.html` to open the visual alignment canvas in your web browser.

---

## Implemented Algorithms

| Algorithm                           | Category           | Time Complexity          | Space Complexity             |
| :---------------------------------- | :----------------- | :----------------------- | :--------------------------- |
| **Hamming Distance**                | Distance Metric    | $\mathcal{O}(L)$         | $\mathcal{O}(1)$             |
| **Levenshtein Distance**            | Distance Metric    | $\mathcal{O}(n \cdot m)$ | $\mathcal{O}(n \cdot m)$     |
| **Needleman-Wunsch**                | Global Alignment   | $\mathcal{O}(n \cdot m)$ | $\mathcal{O}(n \cdot m)$     |
| **Smith-Waterman**                  | Local Alignment    | $\mathcal{O}(n \cdot m)$ | $\mathcal{O}(n \cdot m)$     |
| **Complement / Reverse Complement** | Sequence Transform | $\mathcal{O}(n)$         | $\mathcal{O}(n)$             |
| **Transcription / Translation**     | Sequence Transform | $\mathcal{O}(n)$         | $\mathcal{O}(n)$             |
| **Motif Search**                    | Pattern Matching   | $\mathcal{O}(n \cdot m)$ | $\mathcal{O}(n)$             |
| **FASTA Ingestion Parser**          | File IO            | $\mathcal{O}(n)$         | $\mathcal{O}(1)$ (Streaming) |

---

## Benchmark Results

Empirical runtime validations show that our implementations match theoretical complexity behavior exactly.

![Benchmark Curve](benchmarks/quadratic_algorithms_linear.png)

- **Linear operations** (Transcription, translation, Hamming distance) scale strictly as $\mathcal{O}(n)$ up to $100,000$ bases.
- **Quadratic alignment algorithms** (Needleman-Wunsch, Smith-Waterman) scale as $\mathcal{O}(n^2)$ and are capped to safe limits of $50$ bases on free hosting tiers to prevent out-of-memory errors under the strict $512\text{ MB}$ limit.
- **Empirical validation** proves the quadratic behavior with log-log regression slope calculation: $d(\log T)/d(\log N) \approx 2.01$.

---

## Project Structure

```text
├── core_lib/        # Reusable core bioinformatics algorithm engine
│   ├── alignments.py
│   ├── genetics.py
│   └── io.py
├── server/          # FastAPI REST API wrapper
│   ├── endpoints/
│   └── main.py
├── frontend/        # HTML5/JS Visual Dashboard
│   ├── pages/
│   └── src/
├── docs/            # Markdown documentation library (Math enabled)
├── benchmarks/      # Performance evaluation script suite & graphs
└── tests/           # Pytest unit testing suite
```

---

## Documentation

Detailed educational guide articles, math formulas, and interactive trace tutorials are built into the web application:

- Online: [bioinformatics-docs.netlify.app](https://bioinformatics-docs.netlify.app/)
- Local: Open `frontend/pages/docs.html`

---

## Roadmap

### Planned

- [ ] **Linear-space alignments** using Hirschberg's algorithm (reducing space to $\mathcal{O}(m)$).
- [ ] **Suffix Array & FM-Index** implementations for index-backed fast genome lookups.
- [ ] **De Bruijn Graphs** for assembly simulation of short reads.
- [ ] **BWT (Burrows-Wheeler Transform)** compression analysis.

---
