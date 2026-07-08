from typing import Tuple

def NeedlemanWunsch(seq1: str, seq2: str, match: int = 1, mismatch: int = -1, gap: int = -1) -> Tuple[int, str, str]:
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
        if i > 0 and j > 0 and (
            dp[i][j] == dp[i - 1][j - 1] + (match if seq1[i - 1] == seq2[j - 1] else mismatch)
        ):
            align1.append(seq1[i - 1])
            align2.append(seq2[j - 1])
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + gap:
            align1.append(seq1[i - 1])
            align2.append('-')
            i -= 1
        else:
            align1.append('-')
            align2.append(seq2[j - 1])
            j -= 1
            
    return dp[n][m], "".join(align1)[::-1], "".join(align2)[::-1]


def SmithWaterman(seq1: str, seq2: str, match: int = 1, mismatch: int = -1, gap: int = -1) -> Tuple[int, str, str]:
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
        if dp[i][j] == dp[i - 1][j - 1] + (match if seq1[i - 1] == seq2[j - 1] else mismatch):
            align1.append(seq1[i - 1])
            align2.append(seq2[j - 1])
            i -= 1
            j -= 1
        elif dp[i][j] == dp[i - 1][j] + gap:
            align1.append(seq1[i - 1])
            align2.append('-')
            i -= 1
        else:
            align1.append('-')
            align2.append(seq2[j - 1])
            j -= 1
            
    return max_score, "".join(align1)[::-1], "".join(align2)[::-1]