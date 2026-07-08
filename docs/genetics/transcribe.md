# Transcribe

## Problem

Given a DNA sequence, transcribe it into its corresponding RNA sequence.

## Overview

Transcription is the biological process where DNA is used as a template to generate RNA. The key chemical difference is that RNA uses Uracil (U) instead of Thymine (T).

---

## Method

All occurrences of Thymine (`T` or `t`) in the DNA sequence are replaced with Uracil (`U` or `u`).

---

## Complexity

Time Complexity:

O(n)

Space Complexity:

O(n)

where:

n = len(sequence)

---

## Example

Input:

```python
rna_seq = Transcribe("GATTACA")
```

Output:

```text
"GAUUACA"
```

---

## Implementation Notes

The transcription process is implemented using `str.translate` with a mapping of `T` $\rightarrow$ `U` (and `t` $\rightarrow$ `u`).
