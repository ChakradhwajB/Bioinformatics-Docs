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
