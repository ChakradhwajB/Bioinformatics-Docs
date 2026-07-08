from core_lib.alignments import NeedlemanWunsch,SmithWaterman

def test_needleman_wunsch_identical():
    score, a1, a2 = NeedlemanWunsch("ATGC", "ATGC", match=1, mismatch=-1, gap=-1)
    assert score == 4
    assert a1 == "ATGC"
    assert a2 == "ATGC"

def test_needleman_wunsch_gaps():
    score, a1, a2 = NeedlemanWunsch("A", "ACT", match=1, mismatch=-1, gap=-1)
    assert score == -1 # 1 match (1) + 2 gaps (-2)
    assert a1 == "A--"
    assert a2 == "ACT"

def test_needleman_wunsch_mismatch():
    score, a1, a2 = NeedlemanWunsch("ATGC", "ATAC", match=1, mismatch=-1, gap=-1)
    assert score == 2 # 3 matches (3) + 1 mismatch (-1)
    assert a1 == "ATGC"
    assert a2 == "ATAC"

def test_smith_waterman_subsequence():
    score, a1, a2 = SmithWaterman("ACAAATGTTGGGGG", "TGTT")
    assert score == 4 # 4 matches
    assert a1 == "TGTT"
    assert a2 == "TGTT"

def test_smith_waterman_partial_overlap():
    score, a1, a2 = SmithWaterman("GGGGATGC", "ATGCCTTT")
    assert score == 4
    assert a1 == "ATGC"
    assert a2 == "ATGC"

def test_smith_waterman_no_match():
    score, a1, a2 = SmithWaterman("AAAA", "GGGG")
    assert score == 0
    assert a1 == ""
    assert a2 == ""

if __name__ == "__main__":
    test_needleman_wunsch_identical()
    test_needleman_wunsch_gaps()
    test_needleman_wunsch_mismatch()
    test_smith_waterman_subsequence()
    test_smith_waterman_partial_overlap()
    test_smith_waterman_no_match()
    print("All alignment tests passed")