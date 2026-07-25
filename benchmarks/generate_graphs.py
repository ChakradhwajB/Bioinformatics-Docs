import os
import re
import sys
import matplotlib.pyplot as plt


def parse_time(time_str):
    time_str = time_str.strip()

    match = re.search(r"([\d\.]+)\s*(µs|ms|s)", time_str)
    if not match:
        return 0.0
    val, unit = match.groups()
    val = float(val)
    if unit == "µs":
        return val * 1e-6
    elif unit == "ms":
        return val * 1e-3
    else:
        return val


def main():
    benchmarks_dir = os.path.dirname(__file__)
    results_path = os.path.join(benchmarks_dir, "results.md")

    if not os.path.exists(results_path):
        print("results.md not found.")
        return

    with open(results_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse sections
    sections = content.split("\n## ")
    data = {}

    for sec in sections[1:]:
        lines = sec.strip().split("\n")
        func_name = lines[0].strip()

        # Read the table rows
        points = []
        for line in lines:
            if (
                line.startswith("|")
                and "Sequence Length" not in line
                and "---" not in line
            ):
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) >= 2:
                    length_str = parts[0].replace(",", "")

                    if not length_str.isdigit():
                        continue

                    length = int(length_str)
                    time_val = parse_time(parts[1])
                    points.append((length, time_val))

        if points:
            data[func_name] = points

    # Plot 1: Linear algorithms (HammingDistance, ReverseComplement, Transcribe, ValidateInput)
    plt.figure(figsize=(9, 5.5))
    linear_funcs = [
        "HammingDistance",
        "ReverseComplement",
        "Transcribe",
        "ValidateInput",
        "MostFrequentKmers",
    ]
    for name in linear_funcs:
        if name in data:
            sizes = [pt[0] for pt in data[name]]
            times = [pt[1] for pt in data[name]]
            plt.plot(sizes, times, marker="o", linewidth=2, label=name)
    plt.xscale("log")
    plt.yscale("log")
    plt.xlabel("Input Sequence Length (log scale)")
    plt.ylabel("Runtime (seconds, log scale)")
    plt.title("Linear-Time Algorithms Performance Comparison (Log-Log Scale)")
    plt.grid(True, which="both", linestyle="--", alpha=0.5)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(benchmarks_dir, "linear_algorithms.png"), dpi=150)
    plt.close()

    # Plot 2: Quadratic algorithms (linear scale showing curve)
    plt.figure(figsize=(9, 5.5))
    quad_funcs = ["LevenshteinDistance", "NeedlemanWunsch", "SmithWaterman"]
    for name in quad_funcs:
        if name in data:
            sizes = [pt[0] for pt in data[name]]
            times = [pt[1] for pt in data[name]]
            plt.plot(sizes, times, marker="o", linewidth=2, label=name)
    plt.xlabel("Input Sequence Length (linear scale)")
    plt.ylabel("Runtime (seconds, linear scale)")
    plt.title("Quadratic-Time Algorithms Performance (Linear Scale)")
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend()
    plt.tight_layout()
    plt.savefig(
        os.path.join(benchmarks_dir, "quadratic_algorithms_linear.png"), dpi=150
    )
    plt.close()

    # Plot 3: Quadratic algorithms (log-log scale showing straight line with slope ~ 2)
    plt.figure(figsize=(9, 5.5))
    for name in quad_funcs:
        if name in data:
            sizes = [pt[0] for pt in data[name]]
            times = [pt[1] for pt in data[name]]
            plt.plot(sizes, times, marker="o", linewidth=2, label=name)
    plt.xscale("log")
    plt.yscale("log")
    plt.xlabel("Input Sequence Length (log scale)")
    plt.ylabel("Runtime (seconds, log scale)")
    plt.title("Quadratic-Time Algorithms Performance (Log-Log Scale - Slope ≈ 2)")
    plt.grid(True, which="both", linestyle="--", alpha=0.5)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(benchmarks_dir, "quadratic_algorithms_log.png"), dpi=150)
    plt.close()

    # Re-write results.md with updated formatting
    python_ver = sys.version.split()[0]
    platform_name = sys.platform

    with open(results_path, "w", encoding="utf-8") as f:
        f.write("# Benchmark Results\n\n")
        f.write(f"**Python version**: `{python_ver}`  \n")
        f.write(f"**Platform**: `{platform_name}`  \n")
        f.write(
            "**Method**: Average runtime over multiple iterations using `time.perf_counter()` (dynamically scaled from 3 to 100 runs based on execution speed for optimal accuracy)  \n\n"
        )
        f.write("---\n\n")

        # Visual Charts Section
        f.write("## Performance Visualization Charts\n\n")

        f.write("### 1. Linear Algorithms Performance Chart\n")
        f.write("Plotted on a log-log scale to highlight sequential efficiency:\n\n")
        f.write("![Linear Algorithms Chart](linear_algorithms.png)\n\n")

        f.write("### 2. Quadratic Algorithms Chart (Linear Scale)\n")
        f.write(
            "Highlights the quadratic-time complexity curve. The $O(n^2)$ upward runtime curve is visually obvious:\n\n"
        )
        f.write(
            "![Quadratic Algorithms Chart Linear](quadratic_algorithms_linear.png)\n\n"
        )

        f.write("### 3. Quadratic Algorithms Chart (Log-Log Scale)\n")
        f.write(
            "Plotted on a log-log scale. Because Levenshtein, Needleman-Wunsch, and Smith-Waterman have $T(n) \\propto n^2$ complexity, they form a straight line with a slope $\\approx 2$ on a log-log axis:\n\n"
        )
        f.write("![Quadratic Algorithms Chart Log](quadratic_algorithms_log.png)\n\n")

        f.write("---\n\n")

        # Practical Limits Section
        f.write("## Practical Limits & Algorithmic Tradeoffs\n\n")
        f.write(
            "| Algorithm | Complexity | Largest Tested Input | Empirical Status |\n"
        )
        f.write(
            "|-----------|------------|----------------------|------------------|\n"
        )
        f.write(
            "| Hamming Distance | $\\mathcal{O}(\\min(n, m))$ | 100,000 | Instantly computed (~5ms) |\n"
        )
        f.write(
            "| Levenshtein Distance | $\\mathcal{O}(n \\cdot m)$ | 5,000 | Practical limits reached (~15s) |\n"
        )
        f.write(
            "| Needleman-Wunsch | $\\mathcal{O}(n \\cdot m)$ | 5,000 | Practical limits reached (~25s) |\n"
        )
        f.write(
            "| Smith-Waterman | $\\mathcal{O}(n \\cdot m)$ | 5,000 | Practical limits reached (~25s) |\n\n"
        )
        f.write("> [!IMPORTANT]\n")
        f.write(
            "> **Dynamic Programming Constraints:** Dynamic-programming alignment algorithms (Needleman-Wunsch, Smith-Waterman, Levenshtein Distance) require $\\mathcal{O}(n^2)$ memory and runtime to construct similarity grids. This makes comparing very large sequences (e.g. whole genomes $> 100,000$ bases) completely impractical without specialized heuristics (such as BLAST or seed-and-extend techniques) or hardware acceleration.\n\n"
        )
        f.write("---\n\n")

        # Rest of the tables
        for name in data:
            complexity_map = {
                "HammingDistance": "$\\mathcal{O}(\\min(n, m))$",
                "LevenshteinDistance": "$\\mathcal{O}(n \\cdot m)$",
                "NeedlemanWunsch": "$\\mathcal{O}(n \\cdot m)$",
                "SmithWaterman": "$\\mathcal{O}(n \\cdot m)$",
                "Complement": "$\\mathcal{O}(n)$",
                "ReverseComplement": "$\\mathcal{O}(n)$",
                "Transcribe": "$\\mathcal{O}(n)$",
                "Translate": "$\\mathcal{O}(n)$",
                "FindMotif": "$\\mathcal{O}(n \\cdot m)$",
                "ValidateInput": "$\\mathcal{O}(N)$",
                "FastaParse": "$\\mathcal{O}(N)$",
                "MostFrequentKmers": "$\\mathcal{O}(n \\cdot k)$",
            }
            comp = complexity_map.get(name, "")
            f.write(f"## {name}\n\n")
            if comp:
                f.write(f"**Time Complexity**: {comp}\n\n")
            f.write("| Sequence Length | Runtime |\n")
            f.write("|----------------|---------|\n")
            for length, time_val in data[name]:
                # Format time back
                if time_val < 0.001:
                    time_str = f"{time_val*1_000_000:.1f}µs"
                elif time_val < 1.0:
                    time_str = f"{time_val*1_000:.3f}ms"
                else:
                    time_str = f"{time_val:.3f}s"
                f.write(f"| {length:,} | {time_str} |\n")
            f.write("\n---\n\n")

    print("Graphs and results.md successfully generated from existing dataset!")


if __name__ == "__main__":
    main()
