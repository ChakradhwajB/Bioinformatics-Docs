# Reverse Complement

## Problem Statement

Given a DNA sequence $S$, calculate its reverse complementary sequence $S\_{rc}$ to represent the antiparallel strand in the standard $5' \rightarrow 3'$ direction.

## Overview

DNA double-stranded structures are antiparallel. To obtain the standard representation of the opposite strand, it is necessary to:
1. Translate each nucleotide base to its complement ($A \leftrightarrow T$, $C \leftrightarrow G$).
2. Reverse the order of the resulting strand.

---

## Mathematical Formulation

Let $S$ be a sequence of length $n$. The reverse complement sequence $S\_{rc}$ is formulated as:
```math
S_{rc}[i] = f(S[n - 1 - i]) \quad \forall \ 0 \le i < n
```

Where the complement mapping function $f(c)$ is defined as:
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

- **Time Complexity**: $\mathcal{O}(n)$ since sequence translation and reversal are performed in linear passes.
- **Space Complexity**: $\mathcal{O}(n)$ to store the output reverse complement sequence.
