"""
Core Bioinformatics Library

"""

__version__ = "0.1.0"
__author__ = "Chakradhwaj Bathineni"

from .io import (
    ValidateInput,
    FastaParse,
    FastaWrite,
)

from .genetics import Complement, ReverseComplement, Transcribe, Translate, FindMotif

from .alignments import (
    HammingDistance,
    LevenshteinDistance,
    NeedlemanWunsch,
    SmithWaterman,
)

from .kmers import (
    GenerateKmers,
    CountKmers,
    MostFrequentKmers,
)

__all__ = [
    "ValidateInput",
    "FastaParse",
    "FastaWrite",
    "Complement",
    "ReverseComplement",
    "Transcribe",
    "Translate",
    "FindMotif",
    "HammingDistance",
    "LevenshteinDistance",
    "NeedlemanWunsch",
    "SmithWaterman",
    "GenerateKmers",
    "CountKmers",
    "MostFrequentKmers",
    "TrieNode",
    "Trie",
    "FindPatterns",
    "BuildSuffixArray",
    "BinarySearchPattern",
]

from .indexing import (
    TrieNode,
    Trie,
    FindPatterns,
    BuildSuffixArray,
    BinarySearchPattern,
)
