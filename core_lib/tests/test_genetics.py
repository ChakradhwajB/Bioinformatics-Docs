from core_lib.genetics import Complement, ReverseComplement, Transcribe, Translate, FindMotif

def test_complement():
    assert Complement("ATGC") == "TACG"
    assert Complement("atgc") == "tacg"
    assert Complement("AATTCCGG") == "TTAAGGCC"


def test_reverse_complement():
    assert ReverseComplement("ATGC") == "GCAT"
    assert ReverseComplement("atgc") == "gcat"
    assert ReverseComplement("GAATTC") == "GAATTC"


def test_transcribe():
    assert Transcribe("ATGC") == "AUGC"
    assert Transcribe("atgc") == "augc"
    assert Transcribe("ACGC") == "ACGC"


def test_translate():
    assert Translate("AUGGCACGCUAA") == "MAR"
    assert Translate("augucg") == "MS"
    assert Translate("AUGCGAUAAUGC") == "MR"
    assert Translate("AUGCGAA") == "MR"

def test_find_motif():
    assert FindMotif("GATATATGCATATACTT", "ATAT") == [2, 4, 10]
    assert FindMotif("ATGC", "CCC") == []
    assert FindMotif("A", "ATGC") == []

if __name__ == "__main__":
    test_complement()
    test_reverse_complement()
    test_transcribe()
    test_translate()
    test_find_motif()
    print("All genetics tests passed!")
