from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "online", "message": "Bioinformatics API is running."}

def test_hamming_distance():
    response = client.post(
        "/api/v1/alignments/hamming-distance",
        json={"seq1": "ATGC", "seq2": "ATCC"}
    )
    assert response.status_code == 200
    assert response.json()["distance"] == 1
    assert response.json()["status"] == "success"

def test_complement():
    response = client.post(
        "/api/v1/genetics/complement",
        json={"sequence": "ATGC"}
    )
    assert response.status_code == 200
    assert response.json()["complement"] == "TACG"
    assert response.json()["status"] == "success"

def test_levenshtein_distance():
    response = client.post(
        "/api/v1/alignments/levenshtein-distance",
        json={"seq1": "ATGC", "seq2": "ATCC"}
    )
    assert response.status_code == 200
    assert response.json()["distance"] == 1

def test_needleman_wunsch():
    response = client.post(
        "/api/v1/alignments/needleman-wunsch",
        json={"seq1": "ATGC", "seq2": "ATGC"}
    )
    assert response.status_code == 200
    assert response.json()["score"] == 4

def test_smith_waterman():
    response = client.post(
        "/api/v1/alignments/smith-waterman",
        json={"seq1": "ACAAATGTTGGGGG", "seq2": "TGTT"}
    )
    assert response.status_code == 200
    assert response.json()["score"] == 4

def test_hirschberg():
    response = client.post(
        "/api/v1/alignments/hirschberg",
        json={"seq1": "ATGC", "seq2": "ATAC"}
    )
    assert response.status_code == 200
    assert response.json()["score"] == 2

def test_reverse_complement():
    response = client.post(
        "/api/v1/genetics/reverse-complement",
        json={"sequence": "ATGC"}
    )
    assert response.status_code == 200
    assert response.json()["reverse_complement"] == "GCAT"

def test_transcribe():
    response = client.post(
        "/api/v1/genetics/transcribe",
        json={"sequence": "ATGC"}
    )
    assert response.status_code == 200
    assert response.json()["transcribed_sequence"] == "AUGC"

def test_translate():
    response = client.post(
        "/api/v1/genetics/translate",
        json={"rna_sequence": "AUG"}
    )
    assert response.status_code == 200
    assert response.json()["protein"] == "M"

def test_find_motif():
    response = client.post(
        "/api/v1/genetics/find-motif",
        json={"sequence": "GATATATA", "motif": "ATA"}
    )
    assert response.status_code == 200
    assert response.json()["positions"] == [2, 4, 6]

def test_io_validate():
    response = client.post(
        "/api/v1/io/validate",
        json={"data": ["ATGC", "ATCC"]}
    )
    assert response.status_code == 200
    assert response.json()["is_valid"] == True

def test_io_parse_fasta_text():
    response = client.post(
        "/api/v1/io/parse-fasta-text",
        json={"fasta_text": ">seq1\nATGC\n>seq2\nCGTA"}
    )
    assert response.status_code == 200
    assert len(response.json()["data"]) == 2

def test_kmers_count():
    response = client.post(
        "/api/v1/kmers/count",
        json={"sequence": "ATGCATGC", "k": 2}
    )
    assert response.status_code == 200
    assert "AT" in response.json()["counts"]

def test_kmers_most_frequent():
    response = client.post(
        "/api/v1/kmers/most-frequent",
        json={"sequence": "ATGCATGC", "k": 4}
    )
    assert response.status_code == 200
    assert "ATGC" in response.json()["most_frequent"]

def test_indexing_trie():
    response = client.post(
        "/api/v1/indexing/trie-search",
        json={"sequence": "GATATATA", "patterns": ["ATA"]}
    )
    assert response.status_code == 200
    assert response.json()["matches"]["ATA"] == [1, 3, 5]

def test_indexing_suffix():
    response = client.post(
        "/api/v1/indexing/suffix-search",
        json={"sequence": "GATATATA", "pattern": "ATA"}
    )
    assert response.status_code == 200
    assert sorted(response.json()["matches"]) == [1, 3, 5]

# --- Error Path Tests ---

def test_hamming_unequal_length():
    response = client.post(
        "/api/v1/alignments/hamming-distance",
        json={"seq1": "AT", "seq2": "ATGC"}
    )
    assert response.status_code == 400

def test_invalid_characters():
    response = client.post(
        "/api/v1/genetics/complement",
        json={"sequence": "HELLO"}
    )
    assert response.status_code == 400

def test_sequence_too_long_dp():
    response = client.post(
        "/api/v1/alignments/needleman-wunsch",
        json={"seq1": "A" * 51, "seq2": "T" * 51}
    )
    assert response.status_code == 400

def test_sequence_too_long_linear():
    response = client.post(
        "/api/v1/genetics/complement",
        json={"sequence": "A" * 1001}
    )
    assert response.status_code == 400

def test_empty_sequence_complement():
    response = client.post(
        "/api/v1/genetics/complement",
        json={"sequence": ""}
    )
    assert response.status_code == 400

def test_empty_sequence_hamming():
    response = client.post(
        "/api/v1/alignments/hamming-distance",
        json={"seq1": "", "seq2": ""}
    )
    assert response.status_code == 400

def test_malformed_json():
    response = client.post(
        "/api/v1/alignments/hamming-distance",
        json={"wrong_field": "ATGC"}
    )
    assert response.status_code == 422

def test_kmers_k_zero():
    response = client.post(
        "/api/v1/kmers/count",
        json={"sequence": "ATGC", "k": 0}
    )
    assert response.status_code == 400

def test_kmers_k_exceeds_length():
    response = client.post(
        "/api/v1/kmers/count",
        json={"sequence": "AT", "k": 5}
    )
    assert response.status_code == 400

def test_io_validate_invalid():
    response = client.post(
        "/api/v1/io/validate",
        json={"data": ["HELLO", "WORLD"]}
    )
    assert response.status_code == 200
    assert response.json()["is_valid"] == False

def test_fasta_text_too_large():
    response = client.post(
        "/api/v1/io/parse-fasta-text",
        json={"fasta_text": ">seq\n" + "A" * (2 * 1024 * 1024 + 1)}
    )
    assert response.status_code == 413

def test_trie_empty_sequence():
    response = client.post(
        "/api/v1/indexing/trie-search",
        json={"sequence": "", "patterns": ["ATA"]}
    )
    assert response.status_code == 400

def test_suffix_empty_pattern():
    response = client.post(
        "/api/v1/indexing/suffix-search",
        json={"sequence": "ATGC", "pattern": ""}
    )
    assert response.status_code == 400
