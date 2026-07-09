from core_lib.io import ValidateInput, FastaParse, FastaWrite
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


def test_fasta_write(tmp_path):
    record = {"seq1": "ACTG"}
    test_file = tmp_path / "output.json"

    FastaWrite(record, str(test_file))

    with open(test_file, "r") as f:
        saved_data = json.load(f)
    assert saved_data == record


if __name__ == "__main__":
    test_validate_input()
    test_fasta_parse()

    with tempfile.TemporaryDirectory() as tmpdir:
        test_fasta_write(Path(tmpdir))

    print("All parser tests passed!")
