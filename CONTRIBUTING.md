# Contributing Guide

This guide outlines the exact integration checklist required when adding a new bioinformatics function to the codebase. Follow these steps to ensure the new feature is fully wired across the core library, backend server, frontend UI, live documentation viewer, and benchmarking suite.

---

### 1. Core Library Implementation

- **Add Function Logic**: Implement the function inside the appropriate core module:
  - [alignments.py](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/core_lib/alignments.py) (alignment, distance, matrices)
  - [genetics.py](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/core_lib/genetics.py) (mutations, complements, transcriptions)
  - [io.py](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/core_lib/io.py) (file parsing, output formatting)
- **Export Function**: Import the new function and append its name to the `__all__` list in [core_lib/\_\_init\_\_.py](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/core_lib/__init__.py).
- **Write Unit Tests**: Add test coverage inside the [tests/](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/tests) folder (e.g. `test_alignments.py`). Run the test suite:
  ```bash
  pytest
  ```

### 2. Backend API Endpoint (FastAPI)

- **Register Route**: Open [server/main.py](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/server/main.py) and create a POST/GET endpoint (e.g. `/api/new-method`) that receives request data, runs your library function, and returns the result in JSON format.

### 3. Frontend Integration

- **Create View Page**: Create a new `.html` file inside the `frontend/pages/` directory (e.g. `frontend/pages/new_tool.html`). Use the same visual CSS/layout structure:
  - Include the `<header>` dashboard bar.
  - Include the sidebar navigation list (Modules List).
- **Link Sidebar Navigation**: Add a navigation anchor `<a href="./new_tool.html">` to the sidebar menu of all other HTML views (e.g. `needleman_wunsch.html`, etc.).
- **Launch Card**: Add a module launcher card inside the `modules-grid` container on the homepage [frontend/index.html](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/frontend/index.html).
- **JavaScript Bindings**: Update [frontend/src/app.js](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/frontend/src/app.js) and create a corresponding `new_tool.js` in `frontend/src/` to:
  - Write the fetch callbacks that query your new backend FastAPI endpoint.
  - Bind UI inputs (buttons, input fields) to query triggers and update the output containers.

### 4. Live Documentation Viewer

- **Create Markdown Reference**: Write an educational markdown guide explaining the logic, equations, and complexity of the new algorithm inside the `docs/` folder (e.g. `docs/alignments/new_tool.md`).
  - _Note: Use native GitHub ```math code blocks for block equations to bypass Markdown compiler overrides._
- **Inject Navigation Link**: Register the new file link in [frontend/pages/docs.html](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/frontend/pages/docs.html) inside its navigation sidebar `<nav>` menu.

### 5. Performance Benchmarking

- **Register in Runner**: Open [benchmarks/run_benchmarks.py](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/benchmarks/run_benchmarks.py):
  - Import the new library function.
  - Add the function to the `BENCHMARKS` list by specifying its name, complexity, test sizes (`LINEAR` or `QUAD`), and setup lambda expression.
- **Run Measurements**: Execute the benchmark script to calculate the averaged datasets:
  ```bash
  python benchmarks/run_benchmarks.py
  ```
- **Regenerate Plots**: Update the plotting lists in [benchmarks/generate_graphs.py](file:///C:/Users/gamer/OneDrive/Documents/Bioinformatics-project/benchmarks/generate_graphs.py) to plot your new function. Then, run the graph generator:
  ```bash
  python benchmarks/generate_graphs.py
  ```
- **Sync Benchmarks**: Copy the newly updated charts and files directly to your root docs:
  ```bash
  Copy-Item -Path "benchmarks\linear_algorithms.png", "benchmarks\quadratic_algorithms_linear.png", "benchmarks\quadratic_algorithms_log.png" -Destination "docs\benchmarks\" -Force
  ```
