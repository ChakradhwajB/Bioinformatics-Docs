from typing import List

_DNA_COMPLEMENT_TABLE = str.maketrans("ACGTacgt", "TGCAtgca")
_RNA_TRANSCRIPTION_TABLE = str.maketrans("Tt", "Uu")
_CODON_CHART = {
    "UUU": "F",
    "UUC": "F",
    "UUA": "L",
    "UUG": "L",
    "UCU": "S",
    "UCC": "S",
    "UCA": "S",
    "UCG": "S",
    "UAU": "Y",
    "UAC": "Y",
    "UAA": "*",
    "UAG": "*",
    "UGU": "C",
    "UGC": "C",
    "UGA": "*",
    "UGG": "W",
    "CUU": "L",
    "CUC": "L",
    "CUA": "L",
    "CUG": "L",
    "CCU": "P",
    "CCC": "P",
    "CCA": "P",
    "CCG": "P",
    "CAU": "H",
    "CAC": "H",
    "CAA": "Q",
    "CAG": "Q",
    "CGU": "R",
    "CGC": "R",
    "CGA": "R",
    "CGG": "R",
    "AUU": "I",
    "AUC": "I",
    "AUA": "I",
    "AUG": "M",
    "ACU": "T",
    "ACC": "T",
    "ACA": "T",
    "ACG": "T",
    "AAU": "N",
    "AAC": "N",
    "AAA": "K",
    "AAG": "K",
    "AGU": "S",
    "AGC": "S",
    "AGA": "R",
    "AGG": "R",
    "GUU": "V",
    "GUC": "V",
    "GUA": "V",
    "GUG": "V",
    "GCU": "A",
    "GCC": "A",
    "GCA": "A",
    "GCG": "A",
    "GAU": "D",
    "GAC": "D",
    "GAA": "E",
    "GAG": "E",
    "GGU": "G",
    "GGC": "G",
    "GGA": "G",
    "GGG": "G",
}


def Complement(sequence: str) -> str:
    """
    Returns the complementary DNA strand.

    Args:
        sequence (str): The input DNA sequence.

    Returns:
        str: The complementary sequence.
    """
    return sequence.translate(_DNA_COMPLEMENT_TABLE)


def ReverseComplement(sequence: str) -> str:
    """
    Returns the reverse complement of a DNA strand.

    Args:
        sequence (str): The input DNA sequence.

    Returns:
        str: The reversed and complemented sequence.
    """
    return sequence.translate(_DNA_COMPLEMENT_TABLE)[::-1]


def Transcribe(sequence: str) -> str:
    """
    Returns the transcribed RNA sequence of a DNA strand.

    Args:
        sequence (str): The input DNA sequence.

    Returns:
        str: The transcribed RNA sequence.
    """
    return sequence.translate(_RNA_TRANSCRIPTION_TABLE)


def Translate(rna_sequence: str) -> str:
    """
    Returns the translated protein sequence of an RNA strand.

    Args:
        rna_sequence (str): The input RNA sequence.

    Returns:
        str: The translated protein sequence.
    """
    protein = []
    rna_sequence = rna_sequence.upper()

    for i in range(0, len(rna_sequence) - 2, 3):
        codon = rna_sequence[i : i + 3]
        amino_acid = _CODON_CHART.get(codon, "X")

        if amino_acid == "*":
            break

        protein.append(amino_acid)

    return "".join(protein)


def FindMotif(sequence: str, motif: str) -> List[int]:
    """
    Finds all starting locations of a given motif within a genetic sequence.
    Returns 1-based indexing.

    Args:
        sequence (str): The main genetic sequence to search through.
        motif (str): The sub-sequence to locate.

    Returns:
        List[int]: A list of 1-based indices where the motif occurs.
    """
    positions = []
    motif_len = len(motif)
    seq_len = len(sequence)

    if motif_len == 0 or motif_len > seq_len:
        return positions

    start = 0
    while True:
        start = sequence.find(motif, start)

        if start == -1:
            break

        positions.append(start + 1)
        start += 1

    return positions
