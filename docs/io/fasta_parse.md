# FASTA Parse

## Problem

Parse an iterable of FASTA-formatted lines (e.g., from a file or list of strings) into a dictionary structure mapping header labels to their concatenated genetic sequences.

## Overview

FASTA is a common format where sequence descriptions are prefixed with `>` and the sequence itself spans one or more subsequent lines. The parser handles empty lines and concatenates multi-line sequences under their corresponding headers.

---

## Method

1. Initialize a dictionary `record`, a string `currHeader`, and a list `currSequence`.
2. Iterate through each line in the input:
   - Strip whitespace.
   - If the line is empty, skip it.
   - If the line starts with `>`:
     - If `currHeader` is already set, save the joined `currSequence` to `record[currHeader]`.
     - Update `currHeader` with the line contents after `>` (i.e., `line[1:]`), and reset `currSequence` to an empty list.
   - Otherwise, append the sequence line to `currSequence`.
3. After processing all lines, save the final sequence to `record[currHeader]` if `currHeader` is set.
4. Return the `record` dictionary.

---

## Complexity

Time Complexity:

O(N)

Space Complexity:

O(N)

where:

N = total number of characters in the input sequence data

---

## Example

Input:

```python
parsed = FastaParse([
    ">Seq1",
    "ATCG",
    "GATC",
    ">Seq2",
    "TATA"
])
```

Output:

```python
{
    "Seq1": "ATCGGATC",
    "Seq2": "TATA"
}
```

---

## Implementation Notes

The parser collects sequence segments in a list (`currSequence`) instead of performing direct string concatenation (`+=`), which is an $O(N^2)$ operation in Python. Joining list elements at the end runs in $O(N)$ time.
