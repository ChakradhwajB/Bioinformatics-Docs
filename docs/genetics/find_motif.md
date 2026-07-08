# Find Motif

## Problem

Find all starting locations of a target motif (sub-sequence) within a genetic sequence, returning the results as 1-based indices.

## Overview

Motif searching is used to locate specific patterns in genomes (such as restriction sites or promoter regions). The search must support overlapping occurrences.

---

## Method

1. Check if the motif length is empty or exceeds the sequence length; if so, return an empty list.
2. Search for the motif in the sequence starting from index `0`.
3. When a match is found:
   - Append `index + 1` to the results (converting 0-based to 1-based index).
   - Set the next search start position to `index + 1` to find potential overlapping matches.
4. Continue until no further matches are found.

---

## Complexity

Time Complexity:

O(nm)

Space Complexity:

O(k)

where:

n = len(sequence)
m = len(motif)
k = number of matches found

---

## Example

Input:

```python
positions = FindMotif(
    "GATATATGCATATACTT",
    "ATAT"
)
```

Output:

```text
[2, 4, 10]
```

*(Note: The first two matches at indices 2 and 4 are overlapping: G**ATAT**AT... and GAT**ATAT**...)*

---

## Implementation Notes

Overlapping searches are handled by shifting the search offset by 1 character after each match, rather than by the full length of the motif. The algorithm uses Python's built-in `str.find` for efficient substring matching.
