from typing import Dict, List


class TrieNode:
    """
    Represents a single node in a Trie (Prefix Tree).
    """
    def __init__(self):
        self.children: Dict[str, TrieNode] = {}
        self.is_end_of_word: bool = False
        self.patterns: List[str] = []


class Trie:
    """
    A prefix tree containing DNA/RNA patterns for fast matching.
    """
    def __init__(self):
        self.root = TrieNode()

    def insert(self, pattern: str) -> None:
        """
        Inserts a pattern sequence into the Trie.
        """
        if not pattern:
            return
        node = self.root
        for char in pattern:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        if pattern not in node.patterns:
            node.patterns.append(pattern)

    def search(self, pattern: str) -> bool:
        """
        Returns True if the exact pattern exists in the Trie.
        """
        if not pattern:
            return False
        node = self.root
        for char in pattern:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_of_word

    def prefix_search(self, prefix: str) -> bool:
        """
        Returns True if there is any word in the Trie starting with the prefix.
        """
        if not prefix:
            return True
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True


def FindPatterns(sequence: str, patterns: List[str]) -> Dict[str, List[int]]:
    """
    Locates starting indices of multiple query patterns in a sequence in a single pass.

    Args:
        sequence (str): The search text (e.g. genomic sequence)
        patterns (List[str]): List of patterns to locate

    Returns:
        Dict[str, List[int]]: Mapping of pattern string -> list of starting index offsets
    """
    trie = Trie()
    results: Dict[str, List[int]] = {}

    for pattern in patterns:
        if pattern:
            trie.insert(pattern)
            results[pattern] = []

    n = len(sequence)
    for i in range(n):
        node = trie.root
        j = i
        while j < n and sequence[j] in node.children:
            node = node.children[sequence[j]]
            if node.is_end_of_word:
                for matched_pattern in node.patterns:
                    results[matched_pattern].append(i)
            j += 1

    return results
