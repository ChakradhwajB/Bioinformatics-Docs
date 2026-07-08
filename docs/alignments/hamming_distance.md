# Hamming Distance

## Problem

Given two genetic sequences, count the number of positions at which the corresponding characters differ.

## Overview

The Hamming distance measures the minimum number of point mutations (substitutions) required to change one sequence into another. 

---

## Method

For two sequences `seq1` and `seq2`, the distance is calculated by comparing characters at each position:

- Compare characters at each index `i` from `0` to `min(len(seq1), len(seq2)) - 1`.
- If `seq1[i] != seq2[i]`, increment the distance counter.

---

## Complexity

Time Complexity:

O(n)

Space Complexity:

O(1)

where:

n = min(len(seq1), len(seq2))

---

## Example

Input:

```python
distance = HammingDistance(
    "GGCCG",
    "GGTCG"
)
```

Output:

```text
Distance: 1
```

---

## Implementation Notes

The implementation uses Python's built-in `zip` function to pair characters from both sequences. It compares characters up to the length of the shorter sequence.
