# Transcription

## Problem Statement

Given a DNA sequence $S$, transcribe it into its corresponding RNA sequence $S\_{rna}$ by substituting Thymine ($T$) bases with Uracil ($U$) bases.

## Overview

Transcription is the first step of the Central Dogma, converting a double-stranded DNA template into a single-stranded messenger RNA (mRNA). Uracil ($U$) replaces Thymine ($T$) in RNA structures.

---

## Mathematical Mapping

Let $S$ be a DNA sequence of length $n$. The mRNA sequence $S\_{rna}$ is formulated as:
```math
S_{rna}[i] = g(S[i]) \quad \forall \ 0 \le i < n
```

Where the substitution function $g(c)$ is:
```math
g(c) = \begin{cases} 
U & \text{if } c = T \\
c & \text{otherwise}
\end{cases}
```

---

## Complexity Analysis

- **Time Complexity**: $\mathcal{O}(n)$ since base replacement is performed linearly.
- **Space Complexity**: $\mathcal{O}(n)$ to store the transcribed RNA sequence.
