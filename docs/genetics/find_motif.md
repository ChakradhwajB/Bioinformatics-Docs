# Motif Finding

## Problem Statement

Given a genome sequence $S$ and a target motif $M$, find all starting positions (1-based indices) where $M$ occurs as a substring within $S$, supporting overlapping matches.

## Overview

Motifs are short, recurring patterns of DNA that have biological significance, such as transcription factor binding sites. Motif finding requires scanning the sequence and capturing matches even when they overlap (e.g. searching for $ATAT$ in $GATATATGC\dots$ matches at indices $2$ and $4$).

---

## Mathematical Formulation

Let $S$ be a sequence of length $n$ and $M$ be a motif of length $m$. We define the set of 1-based start positions $I$ as:
```math
I = \{i + 1 \mid 0 \le i \le n - m \quad \text{and} \quad S[i \dots i+m-1] = M\}
```

---

## Complexity Analysis

- **Time Complexity**: $\mathcal{O}(n \cdot m)$ since we scan sequence windows of size $m$ along the sequence length $n$.
- **Space Complexity**: $\mathcal{O}(k)$ where $k$ is the number of matching indices returned in the output array.
