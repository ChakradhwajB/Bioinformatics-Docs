# Smith-Waterman Algorithm

## Problem Statement

Given two sequences $S\_1$ and $S\_2$, find the region of highest similarity (local sequence alignment) between subsequences of $S\_1$ and $S\_2$, maximizing a similarity scoring function.

## Overview

The Smith-Waterman algorithm is a classic dynamic programming algorithm used for local sequence alignment. Unlike global alignment, it isolates local regions of high homology without forcing alignment across flanking, dissimilar regions. This is done by preventing negative scores from propagating through the matrix (capping score minimums at $0$).

---

## Recurrence Relation & Dynamic Programming Formulation

Let:
- $\text{match}$: Reward score for matching characters.
- $\text{mismatch}$: Penalty score for mismatching characters.
- $\text{gap}$: Penalty score for introducing a gap.

We define the DP matrix cell $H\_{i,j}$ as the optimal local alignment score ending at prefix $S\_1[0 \dots i-1]$ and prefix $S\_2[0 \dots j-1]$.

### Base Cases
All edges are initialized to $0$ since local alignments can start at any offset:
$$
H\_{i, 0} = 0 \quad \forall \ 0 \le i \le n
$$
$$
H\_{0, j} = 0 \quad \forall \ 0 \le j \le m
$$

### Transition Formula
For $1 \le i \le n$ and $1 \le j \le m$, the value is computed as:
$$
H\_{i, j} = \max \begin{cases} 
0 & \text{(Terminate alignment)} \\
H\_{i-1, j-1} + S(S\_1[i-1], S\_2[j-1]) & \text{(Match / Mismatch)} \\
H\_{i-1, j} + \text{gap} & \text{(Deletion from } S\_1\text{)} \\
H\_{i, j-1} + \text{gap} & \text{(Insertion into } S\_1\text{)}
\end{cases}
$$

Where the similarity function $S(a, b)$ is:
$$
S(a, b) = \begin{cases} 
\text{match} & \text{if } a = b \\
\text{mismatch} & \text{if } a \neq b
\end{cases}
$$

The optimal local alignment score is the maximum value found anywhere in the entire grid:
$$
\text{Score} = \max\_{0 \le i \le n, 0 \le j \le m} H\_{i, j}
$$

---

## Algorithmic Complexity

- **Time Complexity**: $\mathcal{O}(n \cdot m)$ since every cell in the $n \times m$ grid is computed in constant time $\mathcal{O}(1)$.
- **Space Complexity**: $\mathcal{O}(n \cdot m)$ to store the dynamic programming matrix for traceback.

Where:
- $n = |S\_1|$ (length of Sequence 1)
- $m = |S\_2|$ (length of Sequence 2)

---

## Traceback Procedure

The traceback starts at the maximum value cell $H\_{i\_{\max}, j\_{\max}}$ in the matrix and moves backwards:
- Reconstruct the path using the same transition rules.
- Terminate the traceback immediately when a cell with a score of $0$ ($H\_{i, j} = 0$) is reached, marking the start of the matching subsequence.
