from core_lib.io import ValidateInput, FastaParse, JsonWrite, PhredToProbability, FastqParse, CalculateQualityStats
import json
import tempfile
from pathlib import Path


def test_validate_input():
    valid_data = [">seq1", "ATGC", "CGTA"]
    invalid_data = [">seq1", "ATGC", "CGTAX"]
    assert ValidateInput(valid_data) == True
    assert ValidateInput(invalid_data) == False


def test_fasta_parse():
    data = [">seq1", "ATGC", "CGTA", ">seq2", "AATT"]
    result = FastaParse(data)
    assert result == {"seq1": "ATGCCGTA", "seq2": "AATT"}


def test_fastq_parse_and_stats():
    fastq_lines = [
        "@READ1",
        "AGCT",
        "+",
        "IHH?"
    ]
    parsed = FastqParse(fastq_lines)
    assert parsed["read_count"] == 1
    record = parsed["records"][0]
    assert record["header"] == "READ1"
    assert record["sequence"] == "AGCT"
    # Phred scores for 'I', 'H', 'H', '?' -> ord('I')-33=40, ord('H')-33=39, ord('?')-33=30
    assert record["phred_scores"] == [40, 39, 39, 30]
    
    stats = CalculateQualityStats(parsed["records"])
    assert stats["overall_avg_q"] == 37.0
    assert stats["q30_percentage"] == 100.0


def test_phred_to_probability():
    assert PhredToProbability(10) == 0.1
    assert abs(PhredToProbability(30) - 0.001) < 1e-6


def test_json_write(tmp_path):
    record = {"seq1": "ACTG"}
    test_file = tmp_path / "output.json"

    JsonWrite(record, str(test_file))

    with open(test_file, "r") as f:
        saved_data = json.load(f)
    assert saved_data == record


if __name__ == "__main__":
    test_validate_input()
    test_fasta_parse()
    test_fastq_parse_and_stats()
    test_phred_to_probability()

    with tempfile.TemporaryDirectory() as tmpdir:
        test_json_write(Path(tmpdir))

    print("All parser tests passed!")

