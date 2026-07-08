# Levenshtein Distance

## Problem

Given two genetic sequences, calculate the minimum number of single-character edits (insertions, deletions, or substitutions) required to transform one sequence into the other.

## Overview

The Levenshtein distance (also known as Edit Distance) is a dynamic programming algorithm that measures sequence dissimilarity. Unlike Hamming distance, it handles insertions and deletions, making it suitable for aligning sequences of differing lengths.

---

## Algorithm

Let `seq1` of length `n` and `seq2` of length `m` be the two input sequences.

Define `dp[i][j]` as the edit distance between the prefixes `seq1[:i]` and `seq2[:j]`.

Base cases:
- `dp[i][0] = i` for all `0 <= i <= n`
- `dp[0][j] = j` for all `0 <= j <= m`

Transition:
- If `seq1[i - 1] == seq2[j - 1]`:
  `dp[i][j] = dp[i - 1][j - 1]`
- Otherwise, `dp[i][j]` is the minimum of:
  - Deletion: `dp[i - 1][j] + 1`
  - Insertion: `dp[i][j - 1] + 1`
  - Substitution: `dp[i - 1][j - 1] + 1`

The final result is stored in `dp[n][m]`.

---

## Complexity

Time Complexity:

O(nm)

Space Complexity:

O(nm)

where:

n = len(seq1)
m = len(seq2)

---

## Example

Input:

```python
distance = LevenshteinDistance(
    "AGTACG",
    "ATGACG"
)
```

Output:

```text
Distance: 1
```

---

## Implementation Notes

The implementation builds an `(n + 1) x (m + 1)` table to store subproblem solutions. It handles empty inputs by using the length of the other string as the default distance.
