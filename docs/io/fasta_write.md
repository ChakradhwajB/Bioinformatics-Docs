# FASTA Write

## Problem

Export a dictionary of genetic sequences (such as parsed FASTA records) to a structured file.

## Overview

After parsing, analyzing, or modifying genetic sequences, it is helpful to save the results. This function serializes a dictionary of sequence records to a file.

---

## Method

1. Open the target output file pathway in write (`"w"`) mode.
2. Serialize the dictionary to JSON format and write it to the file using an indentation level of 4.

---

## Complexity

Time Complexity:

O(N)

Space Complexity:

O(1) auxiliary space

where:

N = total length of the sequence records dictionary (keys + values)

---

## Example

Input:

```python
records = {
    "Seq1": "ATCGGATC",
    "Seq2": "TATA"
}
FastaWrite(records, "output.json")
```

Output:

*(A file named `output.json` is created with the following contents:)*
```json
{
    "Seq1": "ATCGGATC",
    "Seq2": "TATA"
}
```

---

## Implementation Notes

Despite its name starting with `Fasta`, the current implementation exports the dictionary specifically in **JSON** format rather than standard raw FASTA text format. It handles file resources safely using Python's `with` context manager block.
