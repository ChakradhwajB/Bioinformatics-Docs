from typing import List


def BuildSuffixArray(text: str) -> List[int]:
    """
    Constructs the Suffix Array of a text string.
    Appends the terminal sentinel '$' if not already present.

    Args:
        text (str): Input text sequence (e.g. DNA string)

    Returns:
        List[int]: Lexicographically sorted suffix starting index offsets
    """
    if not text:
        return []

    # Append terminal symbol to differentiate suffix terminations
    t_plus = text if text.endswith("$") else text + "$"

    # Generate all suffix tuples: (suffix_string, starting_index)
    suffixes = [(t_plus[i:], i) for i in range(len(t_plus))]

    # Sort lexicographically by suffix string
    suffixes.sort(key=lambda x: x[0])

    # Extract starting indices
    return [suffix[1] for suffix in suffixes]


def BinarySearchPattern(text: str, pattern: str, suffix_array: List[int]) -> List[int]:
    """
    Queries occurrences of a pattern in a text using binary search over its Suffix Array.

    Args:
        text (str): Original text string
        pattern (str): Query pattern to find
        suffix_array (List[int]): Precomputed Suffix Array for the text (including '$')

    Returns:
        List[int]: Sorted list of starting indices of matching occurrences in the text
    """
    if not text or not pattern or not suffix_array:
        return []

    t_plus = text if text.endswith("$") else text + "$"
    n = len(suffix_array)

    # 1. Binary Search for Lower Bound (First lexicographical match)
    low, high = 0, n - 1
    L = -1
    while low <= high:
        mid = (low + high) // 2
        suffix = t_plus[suffix_array[mid]:]
        if suffix.startswith(pattern):
            L = mid
            high = mid - 1  # Seek further left
        elif suffix < pattern:
            low = mid + 1
        else:
            high = mid - 1

    if L == -1:
        return []

    # 2. Binary Search for Upper Bound (Last lexicographical match)
    low, high = 0, n - 1
    R = -1
    while low <= high:
        mid = (low + high) // 2
        suffix = t_plus[suffix_array[mid]:]
        if suffix.startswith(pattern):
            R = mid
            low = mid + 1  # Seek further right
        elif suffix < pattern:
            low = mid + 1
        else:
            high = mid - 1

    # Extract match start locations and sort them ascending
    matches = [suffix_array[i] for i in range(L, R + 1)]
    matches.sort()
    return matches
