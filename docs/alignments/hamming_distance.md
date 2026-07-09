# Hamming Distance

## Problem Statement

Given two sequences $S\_1$ and $S\_2$, count the number of positions at which the corresponding characters differ.

## Overview

The Hamming distance measures point mutations (substitutions) between two aligned sequences of equal length. In bioinformatics, it represents mutation differences without gap insertions or deletions. The calculation is capped at the length of the shorter sequence:
```math
L = \min(|S_1|, |S_2|)
```

---

## Mathematical Formulation

For two sequences $S\_1$ and $S\_2$ comparing up to length $L = \min(|S\_1|, |S\_2|)$, the Hamming distance $d\_H(S\_1, S\_2)$ is defined as:
```math
d_H(S_1, S_2) = \sum_{i=0}^{L-1} \delta(S_1[i], S_2[i])
```

Where the indicator function $\delta(a, b)$ is:
```math
\delta(a, b) = \begin{cases} 
0 & \text{if } a = b \\
1 & \text{if } a \neq b
\end{cases}
```

---

## Algorithmic Complexity

- **Time Complexity**: $\mathcal{O}(L)$ where $L = \min(|S\_1|, |S\_2|)$ since characters are compared sequentially in a single pass.
- **Space Complexity**: $\mathcal{O}(1)$ auxiliary space.
