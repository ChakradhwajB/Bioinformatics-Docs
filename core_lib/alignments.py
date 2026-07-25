from typing import Tuple


def HammingDistance(
    seq1: str,
    seq2: str,
) -> int:
    """
    Calculates the Hamming Distance between two sequences.

    Args:
        seq1 (str): First genetic sequence.
        seq2 (str): Second genetic sequence.

    Returns:
        int: The Hamming Distance between the two sequences.
    """
    if seq1 is None or seq2 is None:
        raise ValueError("Sequences cannot be None")
    if len(seq1) != len(seq2):
        raise ValueError("Sequences must be of equal length.")
    distance = 0
    for char1, char2 in zip(seq1, seq2):
        if char1 != char2:
            distance += 1
    return distance


def LevenshteinDistance(seq1: str, seq2: str) -> int:
    """
    Calculates the Levenshtein Distance(edit distance) between two sequences.

    Args:
        seq1 (str): First genetic sequence.
        seq2 (str): Second genetic sequence.

    Returns:
        int: The Levenshtein Distance between the two sequences.
    """
    if seq1 is None or seq2 is None:
        raise ValueError("Sequences cannot be None")
    n, m = len(seq1), len(seq2)
    prev = list(range(m + 1))
    for i in range(1, n + 1):
        curr = [i] + [0] * m
        for j in range(1, m + 1):
            if seq1[i - 1] == seq2[j - 1]:
                curr[j] = prev[j - 1]
            else:
                curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])
        prev = curr
    return prev[m]


def NeedlemanWunsch(
    seq1: str, seq2: str, match: int = 1, mismatch: int = -1, gap: int = -1
) -> Tuple[int, str, str]:
    """
    Performs global sequence alignment using the Needleman-Wunsch algorithm.

    Args:
        seq1 (str): First genetic sequence.
        seq2 (str): Second genetic sequence.
        match (int): Score added for a matching character.
        mismatch (int): Score added for a mismatching character.
        gap (int): Score added for inserting a gap.

    Returns:
        Tuple[int, str, str]: The optimal alignment score, aligned seq1, and aligned seq2.
    """
    if seq1 is None or seq2 is None:
        raise ValueError("Sequences cannot be None")
    n, m = len(seq1), len(seq2)

    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i * gap
    for j in range(m + 1):
        dp[0][j] = j * gap

    for i in range(1, n + 1):
        for j in range(1, m + 1):

            if seq1[i - 1] == seq2[j - 1]:
                diagonal_score = dp[i - 1][j - 1] + match
            else:
                diagonal_score = dp[i - 1][j - 1] + mismatch

            up_score = dp[i - 1][j] + gap
            left_score = dp[i][j - 1] + gap

            dp[i][j] = max(diagonal_score, up_score, left_score)

    align1, align2 = [], []
    i, j = n, m

    while i > 0 or j > 0:
        if (
            i > 0
            and j > 0
            and (
                dp[i][j]
                == dp[i - 1][j - 1]
                + (match if seq1[i - 1] == seq2[j - 1] else mismatch)
            )
        ):
            align1.append(seq1[i - 1])
            align2.append(seq2[j - 1])
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + gap:
            align1.append(seq1[i - 1])
            align2.append("-")
            i -= 1
        else:
            align1.append("-")
            align2.append(seq2[j - 1])
            j -= 1

    return dp[n][m], "".join(align1)[::-1], "".join(align2)[::-1]


def SmithWaterman(
    seq1: str, seq2: str, match: int = 1, mismatch: int = -1, gap: int = -1
) -> Tuple[int, str, str]:
    """
    Performs local sequence alignment using the Smith-Waterman algorithm.

    Args:
        seq1 (str): First genetic sequence.
        seq2 (str): Second genetic sequence.
        match (int): Score added for a matching character.
        mismatch (int): Score added for a mismatching character.
        gap (int): Score added for inserting a gap.

    Returns:
        Tuple[int, str, str]: The optimal local alignment score, and the aligned sub-sequences.
    """
    if seq1 is None or seq2 is None:
        raise ValueError("Sequences cannot be None")
    n, m = len(seq1), len(seq2)

    dp = [[0] * (m + 1) for _ in range(n + 1)]

    max_score = 0
    max_pos = (0, 0)

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if seq1[i - 1] == seq2[j - 1]:
                diagonal_score = dp[i - 1][j - 1] + match
            else:
                diagonal_score = dp[i - 1][j - 1] + mismatch

            up_score = dp[i - 1][j] + gap
            left_score = dp[i][j - 1] + gap

            dp[i][j] = max(0, diagonal_score, up_score, left_score)

            if dp[i][j] > max_score:
                max_score = dp[i][j]
                max_pos = (i, j)

    align1, align2 = [], []
    i, j = max_pos

    while i > 0 and j > 0 and dp[i][j] > 0:
        if dp[i][j] == dp[i - 1][j - 1] + (
            match if seq1[i - 1] == seq2[j - 1] else mismatch
        ):
            align1.append(seq1[i - 1])
            align2.append(seq2[j - 1])
            i -= 1
            j -= 1
        elif dp[i][j] == dp[i - 1][j] + gap:
            align1.append(seq1[i - 1])
            align2.append("-")
            i -= 1
        else:
            align1.append("-")
            align2.append(seq2[j - 1])
            j -= 1

    return max_score, "".join(align1)[::-1], "".join(align2)[::-1]


def Hirschberg(
    seq1: str, seq2: str, match: int = 1, mismatch: int = -1, gap: int = -1
) -> Tuple[int, str, str]:
    """
    Performs global sequence alignment using Hirschberg's algorithm in O(N) space.

    Args:
        seq1 (str): First genetic sequence.
        seq2 (str): Second genetic sequence.
        match (int): Score added for a matching character.
        mismatch (int): Score added for a mismatching character.
        gap (int): Score added for inserting a gap.

    Returns:
        Tuple[int, str, str]: The optimal alignment score, aligned seq1, and aligned seq2.
    """
    if seq1 is None or seq2 is None:
        raise ValueError("Sequences cannot be None")
    def nw_score(x, y):
        dp = [j * gap for j in range(len(y) + 1)]
        for i in range(1, len(x) + 1):
            next_dp = [i * gap] + [0] * len(y)
            for j in range(1, len(y) + 1):
                if x[i - 1] == y[j - 1]:
                    score = dp[j - 1] + match
                else:
                    score = dp[j - 1] + mismatch
                next_dp[j] = max(score, dp[j] + gap, next_dp[j - 1] + gap)
            dp = next_dp
        return dp

    def hirschberg_recursive(x, y, out1, out2):
        if len(x) == 0:
            out1.append("-" * len(y))
            out2.append(y)
            return
        elif len(y) == 0:
            out1.append(x)
            out2.append("-" * len(x))
            return
        elif len(x) == 1 or len(y) == 1:
            _, a1, a2 = NeedlemanWunsch(x, y, match, mismatch, gap)
            out1.append(a1)
            out2.append(a2)
            return

        x_mid = len(x) // 2
        score_left = nw_score(x[:x_mid], y)
        score_right = nw_score(x[x_mid:][::-1], y[::-1])[::-1]

        split_j = 0
        max_score = float('-inf')
        for j in range(len(y) + 1):
            s = score_left[j] + score_right[j]
            if s > max_score:
                max_score = s
                split_j = j

        hirschberg_recursive(x[:x_mid], y[:split_j], out1, out2)
        hirschberg_recursive(x[x_mid:], y[split_j:], out1, out2)

    out1, out2 = [], []
    hirschberg_recursive(seq1, seq2, out1, out2)
    align1 = "".join(out1)
    align2 = "".join(out2)
    score = 0
    for c1, c2 in zip(align1, align2):
        if c1 == c2:
            score += match
        elif c1 == "-" or c2 == "-":
            score += gap
        else:
            score += mismatch
    return score, align1, align2
