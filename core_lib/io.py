from typing import Dict, Iterable
import json


def ValidateInput(data: Iterable[str]) -> bool:
    """
    Validates if an input is in FASTA format

    Args:
        data (Iterable[str]): An iterable (like a list of strings or a file object)
                              containing FASTA formatted text.

    Returns:
        bool: A boolean that determines if the input is in FASTA format
    """
    bases = frozenset("ATGCNatgcn")
    for line in data:
        line = line.strip()
        if line and not line.startswith(">"):
            if set(line) - bases:
                return False
    return True


def FastaParse(data: Iterable[str]) -> Dict[str, str]:
    """
    Parses an iterable of FASTA formatted lines into a dictionary.

    Args:
        data (Iterable[str]): An iterable (like a list of strings or a file object)
                              containing FASTA formatted text.

    Returns:
        Dict[str, str]: A dictionary where keys are the sequence headers (without '>')
                        and values are the genetic sequences.
    """
    record = {}
    currHeader, currSequence = "", []
    for line in data:
        line = line.strip()
        if line:
            if line.startswith(">"):
                if currHeader:
                    record[currHeader] = "".join(currSequence)
                currHeader, currSequence = line[1:], []
            else:
                currSequence.append(line)
    if currHeader:
        record[currHeader] = "".join(currSequence)
    return record


def JsonWrite(
    records: Dict[str, str], output_file: str = "output.json"
) -> None:
    """
    Writes a dictionary of genetic sequences to a JSON file.
    
    Args:
        records (Dict[str, str]): Dictionary with sequence headers as keys and sequences as values.
        output_file (str, optional): Path to the output JSON file. Defaults to "output.json".
        
    Returns:
        None
    """
    with open(output_file, "w") as f:
        json.dump(records, f, indent=4)
