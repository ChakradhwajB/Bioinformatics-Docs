# Translation

## Problem Statement

Given an RNA sequence $S\_{rna}$, translate it into its corresponding amino acid peptide sequence $P$ by reading consecutive, non-overlapping nucleotide triplets (codons).

## Overview

Translation represents the final stage of the Central Dogma, where genetic blueprints carried by messenger RNA (mRNA) are decoded by ribosomes to synthesize protein polypeptide chains.

---

## Mathematical Formulation

Let $S\_{rna}$ be an RNA sequence of length $n$. The peptide chain $P$ is represented as a sequence of amino acid residues:
$$
P[k] = \text{Ribosome}(S\_{rna}[3k \dots 3k+2]) \quad \text{for } 0 \le k < \lfloor n/3 \rfloor
$$

Where the mapping function $\text{Ribosome}(c\_1 c\_2 c\_3)$ assigns a single-letter amino acid code to each codon triplet:
$$
\text{Ribosome}(c\_1 c\_2 c\_3) = \text{Amino Acid Letter}
$$

### Termination Condition
Translation terminates immediately at step $k\_{stop}$ if a stop codon is encountered:
$$
\text{Ribosome}(S\_{rna}[3k\_{stop} \dots 3k\_{stop}+2]) \in \{\text{Stop}\} = \{UAA, UAG, UGA\}
$$

Any remaining codons after the stop signal or incomplete codons (fewer than 3 nucleotides) at the end of the sequence are excluded from the output.

---

## Complexity Analysis

- **Time Complexity**: $\mathcal{O}(n)$ since the sequence is scanned linearly in steps of 3.
- **Space Complexity**: $\mathcal{O}(n)$ to store the translated peptide sequence.
