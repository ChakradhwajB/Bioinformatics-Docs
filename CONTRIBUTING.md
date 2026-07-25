# Contributing Guide

This guide outlines the exact integration checklist required when adding a new bioinformatics function to the codebase. The `bioinformatics-docs` project spans across a pure Python library, a FastAPI backend, a static JS frontend, a Pyodide-powered sandbox, and a markdown documentation renderer. 

Follow these exact steps to ensure the new feature is fully wired across the architecture without breaking existing patterns.

---

### 1. Core Library Implementation (`core_lib/`)

When you implement a new algorithm, it must live in the `core_lib` independent of any web framework.

- **Add Function Logic**: Implement the function inside the appropriate core module using `PascalCase` naming convention (e.g. `FindMotif`, `NeedlemanWunsch`):
  - `core_lib/alignments.py` (global/local alignments, distance metrics)
  - `core_lib/genetics.py` (strand mutations, complements, translations)
  - `core_lib/kmers.py` (k-mer generation, counting)
  - `core_lib/indexing/` (Trie, Suffix Arrays, FM-Indexes)
  - `core_lib/io.py` (file parsing, output formatting)
- **Export Function**: Import the new function and append its name to the `__all__` list in `core_lib/__init__.py`.
- **Write Unit Tests**: Add test coverage inside the `tests/` folder matching the module name (e.g. `tests/test_alignments.py`). Run the suite:
  ```bash
  pytest
  ```

### 2. Backend API Endpoint (`server/endpoints/`)

Do **not** add routes directly to `server/main.py`. The API is modularized using FastAPI routers.

- **Define Pydantic Models**: Open the appropriate router file (e.g., `server/endpoints/alignments.py`) and create strict request and response schema classes (e.g., `MyNewToolRequest` and `MyNewToolResponse`). Ensure the response includes a `status: str` field (e.g. `status="success"`).
- **Import Security Guards**: Import sequence limits and validators from `server.endpoints.config`:
  ```python
  from .config import MAX_LINEAR_SEQUENCE_LENGTH, MAX_DP_SEQUENCE_LENGTH, validate_sequence
  ```
- **Register Route**: Add the `@router.post("/your-endpoint")` function. 
- **Enforce Constraints**:
  - Check the length of the input against the config constants and raise a 400 `HTTPException` if exceeded.
  - Call `validate_sequence(request.sequence)` to prevent invalid characters.
- **Error Handling**: Wrap the core library call in a `try...except ValueError` block to map library-level data errors into HTTP 400 Bad Request responses.
- **Write API Tests**: Open `tests/test_api.py` and write an integration test using the `TestClient` to verify the JSON output.

### 3. Frontend Integration (`frontend/`)

- **Create View Page**: Create a new `.html` file inside `frontend/pages/` (e.g., `frontend/pages/new_tool.html`). Use Tailwind CSS v4 layout structures mirroring existing pages.
- **Link Navigation Sidebar**: Add a navigation anchor `<a href="./new_tool.html">` to the sidebar menu of **all** HTML views (including `learn.html`, `index.html`, and every file in `frontend/pages/`).
- **Launch Card**: Add a visual launcher card inside the `modules-grid` container on the homepage `frontend/index.html`.
- **JavaScript Bindings**: Create a corresponding `new_tool.js` in `frontend/src/` to handle DOM manipulation and `fetch()` queries to your new backend endpoint. Include this script via a `<script>` tag in your HTML file.
- **Sandbox Practice Data**: If you want a practice problem for this tool, open `frontend/src/sandbox.js` and add a new entry to the `SANDBOX_DATA` dictionary mapping to your HTML filename (e.g., `"new_tool.html": { ... }`). Provide the `initialCode` and `testCode`.
- **Build Scripts**: Run the injection build scripts to propagate standard components across your new HTML file:
  ```bash
  python add_buttons.py
  python add_sandbox.py
  ```

### 4. Live Documentation Viewer (`docs/`)

- **Create Markdown Reference**: Write an educational markdown guide explaining the logic, equations, and complexity of the new algorithm inside the appropriate subfolder in `docs/` (e.g. `docs/alignments/new_tool.md`).
  - *Note: Use native GitHub ````math` code blocks for equations. They are converted dynamically by KaTeX.*
- **Inject Navigation Link**: Register the new document link in `frontend/pages/docs.html` inside its sidebar `<nav>` menu so the `docs-renderer.js` can `fetch()` it.

### 5. Performance Benchmarking (`benchmarks/`)

If your algorithm performs complex logic, validate its Big-O empirical time complexity.

- **Register in Runner**: Open `benchmarks/run_benchmarks.py`:
  - Import the new library function.
  - Add the function to the `BENCHMARKS` list by specifying its name, expected theoretical complexity, test sizes (`LINEAR` or `QUAD`), and setup lambda expression.
- **Run Measurements**: Execute the script to generate empirical `.csv` data logs:
  ```bash
  python benchmarks/run_benchmarks.py
  ```
- **Regenerate Plots**: Update the configuration lists in `benchmarks/generate_graphs.py` to plot your new function. Then, run the graph generator to produce the output `.png` charts and `results.md`:
  ```bash
  python benchmarks/generate_graphs.py
  ```
- **Build Step Note**: When deployed, Netlify's build process (`frontend/copy-docs.js`) automatically syncs the `docs/` directory to `frontend/docs/` so the frontend fetch mechanism can access the markdown content.
