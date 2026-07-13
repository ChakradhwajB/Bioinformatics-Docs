import pytest
from core_lib.indexing import Trie, FindPatterns, BuildSuffixArray, BinarySearchPattern


def test_trie_basic_operations():
    trie = Trie()
    trie.insert("ATG")
    trie.insert("ATGC")
    
    assert trie.search("ATG") is True
    assert trie.search("ATGC") is True
    assert trie.search("AT") is False
    assert trie.search("ATGA") is False
    
    assert trie.prefix_search("AT") is True
    assert trie.prefix_search("ATG") is True
    assert trie.prefix_search("ATGC") is True
    assert trie.prefix_search("CG") is False


def test_find_patterns_trie():
    sequence = "ATGCGATCGATCG"
    patterns = ["ATC", "GCG", "XYZ", "CG"]
    
    matches = FindPatterns(sequence, patterns)
    
    assert matches["ATC"] == [5, 9]
    assert matches["GCG"] == [2]
    assert matches["XYZ"] == []
    assert matches["CG"] == [3, 7, 11]


def test_suffix_array_build():
    text = "banana"
    # Suffixes of banana$:
    # 0: banana$
    # 1: anana$
    # 2: nana$
    # 3: ana$
    # 4: na$
    # 5: a$
    # 6: $
    # Sorted: $, a$, ana$, anana$, banana$, na$, nana$
    # Sorted Indices: [6, 5, 3, 1, 0, 4, 2]
    sa = BuildSuffixArray(text)
    assert sa == [6, 5, 3, 1, 0, 4, 2]


def test_suffix_array_binary_search():
    text = "banana"
    sa = BuildSuffixArray(text)
    
    assert BinarySearchPattern(text, "an", sa) == [1, 3]
    assert BinarySearchPattern(text, "nana", sa) == [2]
    assert BinarySearchPattern(text, "xyz", sa) == []
    assert BinarySearchPattern(text, "a", sa) == [1, 3, 5]
