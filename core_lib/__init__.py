"""
Core Bioinformatics Library

"""

__version__ = "0.1.0"
__author__ = "Chakradhwaj Bathineni"

from .io import (
    ValidateInput,
    FastaParse,
    JsonWrite,
    PhredToProbability,
    FastqParse,
    CalculateQualityStats,
)

from .genetics import Complement, ReverseComplement, Transcribe, Translate, FindMotif

from .alignments import (
    HammingDistance,
    LevenshteinDistance,
    NeedlemanWunsch,
    SmithWaterman,
    Hirschberg,
)

from .kmers import (
    GenerateKmers,
    CountKmers,
    MostFrequentKmers,
)

from .indexing import (
    TrieNode,
    Trie,
    FindPatterns,
    BuildSuffixArray,
    BinarySearchPattern,
)

__all__ = [
    "ValidateInput",
    "FastaParse",
    "JsonWrite",
    "PhredToProbability",
    "FastqParse",
    "CalculateQualityStats",
    "Complement",
    "ReverseComplement",
    "Transcribe",
    "Translate",
    "FindMotif",
    "HammingDistance",
    "LevenshteinDistance",
    "NeedlemanWunsch",
    "SmithWaterman",
    "Hirschberg",
    "GenerateKmers",
    "CountKmers",
    "MostFrequentKmers",
    "TrieNode",
    "Trie",
    "FindPatterns",
    "BuildSuffixArray",
    "BinarySearchPattern",
]

