# Translate

## Problem

Given an RNA sequence, translate it into the corresponding amino acid (protein) sequence.

## Overview

Translation converts an mRNA sequence into a peptide chain. Ribosomes read mRNA in triplets of nucleotides, known as codons. Each codon corresponds to a specific amino acid or a translation stop signal.

---

## Method

1. The input RNA sequence is converted to uppercase.
2. The sequence is scanned in consecutive, non-overlapping triplets (codons) from index `0` to `len(rna_sequence) - 3`.
3. Each codon is matched against the standard genetic codon chart:
   - If a stop codon is matched (`UAA`, `UAG`, `UGA`), translation halts.
   - If a codon is not recognized in the chart, it is translated as `X` (unknown).
   - Otherwise, the corresponding amino acid letter is appended to the protein sequence.

---

## Complexity

Time Complexity:

O(n)

Space Complexity:

O(n)

where:

n = len(rna_sequence)

---

## Example

Input:

```python
protein = Translate("AUGGCCAUGGCGCCCUAG")
```

Output:

```text
"MAMAP"
```

---

## Implementation Notes

The implementation uses a static dictionary (`_CODON_CHART`) mapping codons to single-letter amino acid codes. It terminates early when it encounters a stop codon (`*`). Incomplete codons at the end of the sequence (fewer than 3 nucleotides) are ignored.
