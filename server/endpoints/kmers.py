from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict

from core_lib import CountKmers, MostFrequentKmers
from .config import MAX_LINEAR_SEQUENCE_LENGTH, validate_sequence

router = APIRouter()

class KmerRequest(BaseModel):
    sequence: str
    k: int

class KmerCountResponse(BaseModel):
    status: str
    counts: Dict[str, int]

class KmerFrequentResponse(BaseModel):
    status: str
    most_frequent: List[str]

@router.post("/count", response_model=KmerCountResponse)
def get_kmer_counts(request: KmerRequest):
    """Calculates occurrence counts for all overlapping k-mers of length k."""
    if len(request.sequence) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    if request.k <= 0 or request.k > len(request.sequence):
        raise HTTPException(
            status_code=400,
            detail=f"K-mer length k must be greater than 0 and less than or equal to the sequence length ({len(request.sequence)})."
        )
    try:
        validate_sequence(request.sequence)
        counts = CountKmers(request.sequence, request.k)
        return KmerCountResponse(status="success", counts=counts)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/most-frequent", response_model=KmerFrequentResponse)
def get_most_frequent_kmers(request: KmerRequest):
    """Identifies the most frequent k-mers of length k in the sequence."""
    if len(request.sequence) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    if request.k <= 0 or request.k > len(request.sequence):
        raise HTTPException(
            status_code=400,
            detail=f"K-mer length k must be greater than 0 and less than or equal to the sequence length ({len(request.sequence)})."
        )
    try:
        validate_sequence(request.sequence)
        frequent = MostFrequentKmers(request.sequence, request.k)
        return KmerFrequentResponse(status="success", most_frequent=frequent)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
