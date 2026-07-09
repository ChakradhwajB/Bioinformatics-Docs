# Needleman-Wunsch Algorithm

## Problem Statement

Given two sequences $S\_1$ and $S\_2$ of lengths $n$ and $m$, find the optimal global alignment that maximizes a similarity score based on rewards for matches and penalties for mismatches and gaps.

## Overview

The Needleman-Wunsch algorithm is a fundamental dynamic programming method used for global sequence alignment. It attempts to align two sequences from end-to-end to highlight homologous regions.

---

## Recurrence Relation & Dynamic Programming Formulation

Let:
- $\text{match}$: Reward score for matching characters.
- $\text{mismatch}$: Penalty score for mismatching characters.
- $\text{gap}$: Penalty score for introducing a gap.

We define the DP matrix cell $E\_{i,j}$ as the optimal global alignment score between prefix $S\_1[0 \dots i-1]$ and prefix $S\_2[0 \dots j-1]$.

### Base Cases
$$
E\_{i, 0} = i \times \text{gap} \quad \forall \ 0 \le i \le n
$$
$$
E\_{0, j} = j \times \text{gap} \quad \forall \ 0 \le j \le m
$$

### Transition Formula
For $1 \le i \le n$ and $1 \le j \le m$, the value is computed as:
$$
E\_{i, j} = \max \begin{cases} 
E\_{i-1, j-1} + S(S\_1[i-1], S\_2[j-1]) & \text{(Match / Mismatch)} \\
E\_{i-1, j} + \text{gap} & \text{(Deletion from } S\_1\text{)} \\
E\_{i, j-1} + \text{gap} & \text{(Insertion into } S\_1\text{)}
\end{cases}
$$

Where the similarity function $S(a, b)$ is:
$$
S(a, b) = \begin{cases} 
\text{match} & \text{if } a = b \\
\text{mismatch} & \text{if } a \neq b
\end{cases}
$$

The optimal alignment score is stored in:
$$
\text{Score} = E\_{n, m}
$$

---

## Algorithmic Complexity

- **Time Complexity**: $\mathcal{O}(n \cdot m)$ since every cell in the $n \times m$ grid is computed in constant time $\mathcal{O}(1)$.
- **Space Complexity**: $\mathcal{O}(n \cdot m)$ to store the dynamic programming score matrix for traceback.

Where:
- $n = |S\_1|$ (length of Sequence 1)
- $m = |S\_2|$ (length of Sequence 2)

---

## Traceback Procedure

The traceback starts at the bottom-right cell $E\_{n, m}$ and reconstructs the alignment path backwards towards $E\_{0, 0}$:
- If the current cell $E\_{i, j}$ came from the diagonal cell $E\_{i-1, j-1}$, we align $S\_1[i-1]$ with $S\_2[j-1]$.
- If it came from the top cell $E\_{i-1, j}$, we align $S\_1[i-1]$ with a gap `-` in $S\_2$.
- If it came from the left cell $E\_{i, j-1}$, we align a gap `-` in $S\_1$ with $S\_2[j-1]$.
