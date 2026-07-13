# Suffix Array Pattern Search

A **Suffix Array** is a lexicographically sorted array of all suffixes of a string. It is a space-efficient alternative to Suffix Trees, which can be used to solve many string matching and pattern queries efficiently.

For a text string $T$ of length $N$:
1. We append a terminal sentinel character `$` which is lexicographically smaller than any character in the alphabet.
2. We generate all suffixes $T[i \dots N]$.
3. We sort these suffixes lexicographically.
4. The Suffix Array ($SA$) stores the starting indices of these sorted suffixes.

---

## 1. Binary Search Matching

Since all suffixes are sorted lexicographically in the array, any occurrences of a pattern $P$ in the text will appear as prefixes of a contiguous range of suffixes in the Suffix Array.

To find all starting positions of $P$:
1. We use binary search to locate the **lower bound** $L$: the first suffix in $SA$ that starts with $P$.
2. We use binary search to locate the **upper bound** $R$: the last suffix in $SA$ that starts with $P$.
3. All indices from $SA[L]$ to $SA[R]$ are matching occurrences.

---

## 2. Complexity

* **Construction Complexity:** $\mathcal{O}(N^2 \log N)$ using naive suffix generation and comparison sorting, or $\mathcal{O}(N \log N)$ / $\mathcal{O}(N)$ using advanced algorithms (like prefix doubling or DC3).
* **Pattern Search Complexity:** $\mathcal{O}(|P| \log N)$ where $|P|$ is the pattern length. Since we perform binary search (which takes $\log N$ steps) and compare the pattern of length $|P|$ at each step, the search runtime scales logarithmically with the text size.
