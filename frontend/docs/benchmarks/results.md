# Benchmark Results

**Python version**: `3.13.5`  
**Platform**: `win64`  
**Method**: Average runtime over multiple iterations using `time.perf_counter()` that was dynamically scaled from 3 to 100 runs based on execution speed for optimal accuracy.

---

## Performance Visualization Charts

### 1. Linear Algorithms Performance Chart

Plotted on a log-log scale to highlight sequential efficiency:

![Linear Algorithms Chart](linear_algorithms.png)

### 2. Quadratic Algorithms Chart (Linear Scale)

Highlights the quadratic-time complexity curve. The $O(n^2)$ upward runtime curve is visually obvious:

![Quadratic Algorithms Chart Linear](quadratic_algorithms_linear.png)

### 3. Quadratic Algorithms Chart (Log-Log Scale)

Plotted on a log-log scale. Because Levenshtein, Needleman-Wunsch, and Smith-Waterman have $T(n) \propto n^2$ complexity, they form a straight line with a slope $\approx 2$ on a log-log axis:

![Quadratic Algorithms Chart Log](quadratic_algorithms_log.png)

---

## Practical Limits & Algorithmic Tradeoffs

| Algorithm            | Complexity                | Largest Tested Input | Status                          |
| -------------------- | ------------------------- | -------------------- | ------------------------------- |
| Hamming Distance     | $\mathcal{O}(\min(n, m))$ | 100,000              | Instantly computed (~5ms)       |
| Levenshtein Distance | $\mathcal{O}(n \cdot m)$  | 5,000                | Practical limits reached (~15s) |
| Needleman-Wunsch     | $\mathcal{O}(n \cdot m)$  | 5,000                | Practical limits reached (~25s) |
| Smith-Waterman       | $\mathcal{O}(n \cdot m)$  | 5,000                | Practical limits reached (~25s) |

> [!IMPORTANT]
> **Dynamic Programming Constraints:** Dynamic-programming alignment algorithms (Needleman-Wunsch, Smith-Waterman, Levenshtein Distance) require $\mathcal{O}(n^2)$ memory and runtime to construct similarity grids. This makes comparing very large sequences (e.g. whole genomes $> 100,000$ bases) completely impractical without specialized heuristics or hardware acceleration.

---

## HammingDistance

**Time Complexity**: $\mathcal{O}(\min(n, m))$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 0.9µs   |
| 100             | 4.9µs   |
| 1,000           | 68.7µs  |
| 10,000          | 621.0µs |
| 100,000         | 6.425ms |

---

## LevenshteinDistance

**Time Complexity**: $\mathcal{O}(n \cdot m)$

| Sequence Length | Runtime   |
| --------------- | --------- |
| 10              | 28.4µs    |
| 100             | 2.321ms   |
| 500             | 66.834ms  |
| 1,000           | 317.412ms |
| 2,000           | 1.789s    |
| 3,000           | 11.381s   |
| 4,000           | 11.767s   |
| 5,000           | 22.460s   |

---

## NeedlemanWunsch

**Time Complexity**: $\mathcal{O}(n \cdot m)$

| Sequence Length | Runtime   |
| --------------- | --------- |
| 10              | 146.4µs   |
| 100             | 11.167ms  |
| 500             | 203.544ms |
| 1,000           | 773.028ms |
| 2,000           | 4.466s    |
| 3,000           | 5.054s    |
| 4,000           | 11.431s   |
| 5,000           | 27.622s   |

---

## SmithWaterman

**Time Complexity**: $\mathcal{O}(n \cdot m)$

| Sequence Length | Runtime   |
| --------------- | --------- |
| 10              | 45.4µs    |
| 100             | 4.572ms   |
| 500             | 132.966ms |
| 1,000           | 527.845ms |
| 2,000           | 2.704s    |
| 3,000           | 7.597s    |
| 4,000           | 14.511s   |
| 5,000           | 25.776s   |

---

## Complement

**Time Complexity**: $\mathcal{O}(n)$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 1.7µs   |
| 100             | 1.6µs   |
| 1,000           | 3.4µs   |
| 10,000          | 39.6µs  |
| 100,000         | 459.0µs |

---

## ReverseComplement

**Time Complexity**: $\mathcal{O}(n)$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 1.7µs   |
| 100             | 1.2µs   |
| 1,000           | 9.7µs   |
| 10,000          | 136.9µs |
| 100,000         | 896.9µs |

---

## Transcribe

**Time Complexity**: $\mathcal{O}(n)$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 3.3µs   |
| 100             | 3.2µs   |
| 1,000           | 11.4µs  |
| 10,000          | 44.4µs  |
| 100,000         | 386.8µs |

---

## Translate

**Time Complexity**: $\mathcal{O}(n)$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 7.0µs   |
| 100             | 9.9µs   |
| 1,000           | 34.8µs  |
| 10,000          | 60.9µs  |
| 100,000         | 359.7µs |

---

## FindMotif

**Time Complexity**: $\mathcal{O}(n \cdot m)$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 2.6µs   |
| 100             | 1.1µs   |
| 1,000           | 5.3µs   |
| 10,000          | 40.0µs  |
| 100,000         | 733.3µs |

---

## ValidateInput

**Time Complexity**: $\mathcal{O}(N)$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 14.9µs  |
| 100             | 14.0µs  |
| 1,000           | 81.6µs  |
| 10,000          | 907.0µs |
| 100,000         | 6.583ms |

---

## FastaParse

**Time Complexity**: $\mathcal{O}(N)$

| Sequence Length | Runtime |
| --------------- | ------- |
| 10              | 2.5µs   |
| 100             | 33.2µs  |
| 1,000           | 5.8µs   |
| 10,000          | 57.9µs  |
| 100,000         | 634.8µs |

---
