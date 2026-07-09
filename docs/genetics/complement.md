# Sequence Complement

## Problem Statement

Given a DNA nucleotide sequence $S$, calculate its complementary sequence $S\_c$ based on Watson-Crick base-pairing rules.

## Overview

In the double-stranded DNA helix, nucleotides form hydrogen bonds between specific base pairs. The complementary sequence is constructed by base-pairing:
- Adenine ($A$) pairs with Thymine ($T$).
- Cytosine ($C$) pairs with Guanine ($G$).

---

## Mathematical Mapping

Let $S$ be a sequence of length $n$. The complementary sequence $S\_c$ is defined as:
```math
S_c[i] = f(S[i]) \quad \forall \ 0 \le i < n
```

Where the mapping function $f(c)$ is:
```math
f(c) = \begin{cases} 
T & \text{if } c = A \\
A & \text{if } c = T \\
G & \text{if } c = C \\
C & \text{if } c = G
\end{cases}
```

---

## Complexity Analysis

- **Time Complexity**: $\mathcal{O}(n)$ since base mapping is performed linearly in a single pass.
- **Space Complexity**: $\mathcal{O}(n)$ to store the generated complementary sequence of length $n$.
