from core_lib.parsers import ValidateInput, FastaParse


def test_validate_input():
    valid_data = [">seq1", "ATGC", "CGTA"]
    invalid_data = [">seq1", "ATGC", "CGTAX"]
    assert ValidateInput(valid_data) == True
    assert ValidateInput(invalid_data) == False


def test_fasta_parse():
    data = [">seq1", "ATGC", "CGTA", ">seq2", "AATT"]
    result = FastaParse(data)
    assert result == {"seq1": "ATGCCGTA", "seq2": "AATT"}


if __name__ == "__main__":
    test_validate_input()
    test_fasta_parse()
    print("All parser tests passed!")
