# Validate Input

## Problem

Validate if an input text or file representation conforms to the FASTA format, containing only allowed genetic bases (`A`, `T`, `G`, `C`, `N` case-insensitively) in sequence lines.

## Overview

Before parsing or executing operations on genomic files, we must validate their formatting. In FASTA files, lines starting with `>` are descriptive headers and are skipped during base validation. Other non-empty lines must only contain valid IUPAC nucleotide characters.

---

## Method

1. Define a reference set of valid characters: `A`, `T`, `G`, `C`, `N` (both upper and lower case).
2. For each line in the input data iterable:
   - Strip whitespace.
   - If the line starts with `>` or is empty, skip validation for that line.
   - Otherwise, check if any character in the line is not in the reference set. If an invalid character is found, immediately return `False`.
3. If all checked lines are valid, return `True`.

---

## Complexity

Time Complexity:

O(N)

Space Complexity:

O(W)

where:

N = total number of characters in the input
W = maximum width/length of a single line (for set operations)

---

## Example

Input:

```python
is_valid = ValidateInput([
    ">Seq1",
    "ATCGN",
    "GATC"
])
```

Output:

```text
True
```

---

## Implementation Notes

The validator uses a `frozenset` of base characters (`ATGCNatgcn`) for $O(1)$ lookups. It utilizes set difference (`set(line) - bases`) to check if any unexpected characters exist on a line.
