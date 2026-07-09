# Levenshtein Distance (Edit Distance)

## Problem Statement

Given two sequences $S\_1$ and $S\_2$, calculate the minimum number of single-character edit operations (insertions, deletions, or substitutions) required to transform $S\_1$ into $S\_2$.

## Overview

The Levenshtein distance measures the edit dissimilarity between two sequences. Unlike the Hamming distance, which only allows substitutions, Levenshtein distance handles alignments of different lengths by incorporating gap insertions and deletions.

---

## Recurrence Relation & Dynamic Programming Formulation

Let:
- $S\_1$ be of length $n$
- $S\_2$ be of length $m$

We define the DP cell $D\_{i,j}$ as the minimum edit operations required to transform prefix $S\_1[0 \dots i-1]$ into prefix $S\_2[0 \dots j-1]$.

### Base Cases
Transforming a sequence to/from an empty sequence requires deleting/inserting all characters:
```math
D_{i, 0} = i \quad \forall \ 0 \le i \le n
```
```math
D_{0, j} = j \quad \forall \ 0 \le j \le m
```

### Transition Formula
For $1 \le i \le n$ and $1 \le j \le m$, the edit distance cell is computed as the minimum of three transition paths:
```math
D_{i, j} = \min \begin{cases} 
D_{i-1, j-1} + \text{cost} & \text{(Match / Substitution)} \\
D_{i-1, j} + 1 & \text{(Deletion)} \\
D_{i, j-1} + 1 & \text{(Insertion)}
\end{cases}
```

Where the step-wise operation cost is defined as:
```math
\text{cost} = \begin{cases} 
0 & \text{if } S_1[i-1] = S_2[j-1] \\
1 & \text{if } S_1[i-1] \neq S_2[j-1]
\end{cases}
```

The final minimum edit distance value is stored in:
```math
\text{Distance} = D_{n, m}
```

---

## Algorithmic Complexity

- **Time Complexity**: $\mathcal{O}(n \cdot m)$ since every cell in the $n \times m$ grid is computed in constant time $\mathcal{O}(1)$.
- **Space Complexity**: $\mathcal{O}(n \cdot m)$ to store the dynamic programming distance matrix.

Where:
- $n = |S\_1|$
- $m = |S\_2|$
