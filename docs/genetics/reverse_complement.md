# Reverse Complement

## Problem

Given a DNA sequence, find the reverse complement of that sequence.

## Overview

DNA double-stranded molecules are antiparallel. Therefore, the complementary strand runs in the opposite direction. To represent the complementary strand in the standard 5' to 3' direction, we reverse the sequence after taking the complement.

---

## Method

The reverse complement is generated in two steps:
1. Translate each character to its complement (A $\leftrightarrow$ T, C $\leftrightarrow$ G).
2. Reverse the entire sequence.

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
rev_comp = ReverseComplement("AAAACCCGGT")
```

Output:

```text
"ACCGGGTTTT"
```

---

## Implementation Notes

The implementation maps the characters using `str.translate` and reverses the resulting string using Python's slicing notation `[::-1]`.
