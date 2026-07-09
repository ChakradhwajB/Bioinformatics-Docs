from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from core_lib import Complement, ReverseComplement, Transcribe, Translate, FindMotif

router = APIRouter()

MAX_LINEAR_SEQUENCE_LENGTH = 1000  # Cap linear operations to 1000 bases
MAX_MOTIF_LENGTH = 100  # Cap motif pattern lookups to 100 bases

# --- Request/Response Models ---

class SequenceRequest(BaseModel):
    sequence: str


class ComplementResponse(BaseModel):
    status: str
    complement: str


class ReverseComplementResponse(BaseModel):
    status: str
    reverse_complement: str


class TranscribeResponse(BaseModel):
    status: str
    transcribed_sequence: str


class TranslateRequest(BaseModel):
    rna_sequence: str


class TranslateResponse(BaseModel):
    status: str
    protein: str


class FindMotifRequest(BaseModel):
    sequence: str
    motif: str


class FindMotifResponse(BaseModel):
    status: str
    positions: List[int]


# --- Endpoints ---

@router.post("/complement", response_model=ComplementResponse)
def get_complement(request: SequenceRequest):
    """Returns the complementary DNA strand."""
    if len(request.sequence) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    try:
        res = Complement(request.sequence)
        return ComplementResponse(status="success", complement=res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reverse-complement", response_model=ReverseComplementResponse)
def get_reverse_complement(request: SequenceRequest):
    """Returns the reverse complement of a DNA strand."""
    if len(request.sequence) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    try:
        res = ReverseComplement(request.sequence)
        return ReverseComplementResponse(status="success", reverse_complement=res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/transcribe", response_model=TranscribeResponse)
def get_transcribe(request: SequenceRequest):
    """Returns the transcribed RNA sequence of a DNA strand."""
    if len(request.sequence) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    try:
        res = Transcribe(request.sequence)
        return TranscribeResponse(status="success", transcribed_sequence=res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/translate", response_model=TranslateResponse)
def translate_rna(request: TranslateRequest):
    """Translates an RNA sequence into a protein string."""
    if len(request.rna_sequence) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"RNA sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    try:
        protein = Translate(request.rna_sequence)
        return TranslateResponse(status="success", protein=protein)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/find-motif", response_model=FindMotifResponse)
def find_motif(request: FindMotifRequest):
    """Finds all starting locations of a given motif within a genetic sequence (1-based)."""
    if len(request.sequence) > MAX_LINEAR_SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Target sequence length exceeds the maximum allowed limit of {MAX_LINEAR_SEQUENCE_LENGTH:,} bases."
        )
    if len(request.motif) > MAX_MOTIF_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Motif pattern length exceeds the maximum allowed limit of {MAX_MOTIF_LENGTH:,} bases."
        )
    try:
        positions = FindMotif(request.sequence, request.motif)
        return FindMotifResponse(status="success", positions=positions)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
