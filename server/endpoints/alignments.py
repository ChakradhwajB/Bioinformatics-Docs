from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core_lib import (
    HammingDistance,
    LevenshteinDistance,
    NeedlemanWunsch,
    SmithWaterman,
)

router = APIRouter()

MAX_DP_SEQUENCE_LENGTH = 50  # Cap O(n*m) space complexities
MAX_LINEAR_SEQUENCE_LENGTH = 1000  # Cap O(n) space complexities

# --- Request/Response Models ---

class HammingRequest(BaseModel):
    seq1: str
    seq2: str


class HammingResponse(BaseModel):
    status: str
    distance: int


class LevenshteinRequest(BaseModel):
    seq1: str
    seq2: str


class LevenshteinResponse(BaseModel):
    status: str
    distance: int


class AlignmentRequest(BaseModel):
    seq1: str
    seq2: str
    match: int = 1
    mismatch: int = -1
    gap: int = -1
    alignment_type: str = "global"  # "global" or "local"


class AlignmentResponse(BaseModel):
    status: str
    score: int
    alignment_1: str
    alignment_2: str


class NeedlemanWunschRequest(BaseModel):
    seq1: str
    seq2: str
    match: int = 1
    mismatch: int = -1
    gap: int = -1


class SmithWatermanRequest(BaseModel):
    seq1: str
    seq2: str
    match: int = 1
    mismatch: int = -1
    gap: int = -1


# --- Endpoints ---

@router.post("/hamming-distance", response_model=HammingResponse)
def get_hamming_distance(request: HammingRequest):
    """Calculates the Hamming Distance between two genetic sequences."""
    if len(request.seq1) > MAX_LINEAR_SEQUENCE_LENGTH or len(request.seq2) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    try:
        distance = HammingDistance(request.seq1, request.seq2)
        return HammingResponse(status="success", distance=distance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/levenshtein-distance", response_model=LevenshteinResponse)
def get_levenshtein_distance(request: LevenshteinRequest):
    """Calculates the Levenshtein Distance (edit distance) between two sequences."""
    if len(request.seq1) > MAX_DP_SEQUENCE_LENGTH or len(request.seq2) > MAX_DP_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_DP_SEQUENCE_LENGTH:,} bases for quadratic DP algorithms."
        )
    try:
        distance = LevenshteinDistance(request.seq1, request.seq2)
        return LevenshteinResponse(status="success", distance=distance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/align", response_model=AlignmentResponse)
def align_sequences(request: AlignmentRequest):
    """Performs global or local sequence alignment using Needleman-Wunsch or Smith-Waterman."""
    if len(request.seq1) > MAX_DP_SEQUENCE_LENGTH or len(request.seq2) > MAX_DP_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_DP_SEQUENCE_LENGTH:,} bases for quadratic DP alignments."
        )
    try:
        if request.alignment_type.lower() == "global":
            score, a1, a2 = NeedlemanWunsch(
                request.seq1, request.seq2, request.match, request.mismatch, request.gap
            )
        elif request.alignment_type.lower() == "local":
            score, a1, a2 = SmithWaterman(
                request.seq1, request.seq2, request.match, request.mismatch, request.gap
            )
        else:
            raise HTTPException(
                status_code=400, detail="alignment_type must be 'global' or 'local'"
            )

        return AlignmentResponse(
            status="success", score=score, alignment_1=a1, alignment_2=a2
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/needleman-wunsch", response_model=AlignmentResponse)
def align_needleman_wunsch(request: NeedlemanWunschRequest):
    """Performs global sequence alignment using the Needleman-Wunsch algorithm."""
    if len(request.seq1) > MAX_DP_SEQUENCE_LENGTH or len(request.seq2) > MAX_DP_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_DP_SEQUENCE_LENGTH:,} bases for Needleman-Wunsch alignment."
        )
    try:
        score, a1, a2 = NeedlemanWunsch(
            request.seq1, request.seq2, request.match, request.mismatch, request.gap
        )
        return AlignmentResponse(
            status="success", score=score, alignment_1=a1, alignment_2=a2
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/smith-waterman", response_model=AlignmentResponse)
def align_smith_waterman(request: SmithWatermanRequest):
    """Performs local sequence alignment using the Smith-Waterman algorithm."""
    if len(request.seq1) > MAX_DP_SEQUENCE_LENGTH or len(request.seq2) > MAX_DP_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_DP_SEQUENCE_LENGTH:,} bases for Smith-Waterman alignment."
        )
    try:
        score, a1, a2 = SmithWaterman(
            request.seq1, request.seq2, request.match, request.mismatch, request.gap
        )
        return AlignmentResponse(
            status="success", score=score, alignment_1=a1, alignment_2=a2
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
