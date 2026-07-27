from typing import Dict, Iterable, Any
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


def PhredToProbability(q: int) -> float:
    """
    Calculates base error probability from Phred quality score P = 10^(-Q/10).

    Args:
        q (int): Phred quality score.

    Returns:
        float: Error probability.
    """
    return 10.0 ** (-q / 10.0)


def FastqParse(data: Iterable[str]) -> Dict[str, Any]:
    """
    Parses an iterable of FASTQ lines into structured read dictionaries.

    Args:
        data (Iterable[str]): An iterable containing FASTQ formatted text lines.

    Returns:
        Dict[str, Any]: Dictionary containing 'read_count' and a list of 'records'.
    """
    clean_lines = [line.strip() for line in data if line.strip()]
    records = []
    i = 0
    while i + 3 < len(clean_lines):
        header = clean_lines[i]
        seq = clean_lines[i + 1]
        strand = clean_lines[i + 2]
        qual = clean_lines[i + 3]
        if header.startswith("@") and strand.startswith("+"):
            scores = [ord(c) - 33 for c in qual]
            avg_q = sum(scores) / len(scores) if scores else 0.0
            records.append(
                {
                    "header": header[1:],
                    "sequence": seq,
                    "phred_scores": scores,
                    "avg_quality": round(avg_q, 2),
                }
            )
            i += 4
        else:
            i += 1
    return {"read_count": len(records), "records": records}


def CalculateQualityStats(records: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates overall quality metrics across a collection of FASTQ records.

    Args:
        records (Iterable[Dict[str, Any]]): List of parsed FASTQ read record dicts.

    Returns:
        Dict[str, Any]: Dictionary containing overall_avg_q and q30_percentage.
    """
    all_scores = []
    for r in records:
        all_scores.extend(r.get("phred_scores", []))

    if not all_scores:
        return {"overall_avg_q": 0.0, "q30_percentage": 0.0}

    overall_avg = sum(all_scores) / len(all_scores)
    q30_count = sum(1 for s in all_scores if s >= 30)
    q30_pct = (q30_count / len(all_scores)) * 100.0

    return {
        "overall_avg_q": round(overall_avg, 2),
        "q30_percentage": round(q30_pct, 2),
    }
