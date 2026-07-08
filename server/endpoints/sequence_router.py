from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from core_lib import (
    ValidateInput, FastaParse, 
    NeedlemanWunsch, SmithWaterman, Translate
)

router = APIRouter()

class AlignmentRequest(BaseModel):
    seq1: str
    seq2: str
    match: int = 1
    mismatch: int = -1
    gap: int = -1
    alignment_type: str = "global"  # "global" or "local"

class TranslationRequest(BaseModel):
    rna_sequence: str

# --- Endpoints ---

@router.post("/parse-fasta")
async def parse_fasta_endpoint(file: UploadFile = File(...)):
    """Accepts a .fasta file, parses it, and returns the sequences."""
    
    content = await file.read()
    text_data = content.decode("utf-8")
    
    lines = text_data.strip().split('\n')
    
    if not ValidateInput(lines):
        raise HTTPException(status_code=400, detail="Invalid FASTA format. Only A,C,G,T,N allowed.")
        
    parsed_records = FastaParse(lines)
    
    result = []
    for header, seq in parsed_records.items():
        result.append({
            "header": header,
            "sequence": seq,
            "length": len(seq)
        })
        
    return {"status": "success", "data": result}

@router.post("/align")
def align_sequences(request: AlignmentRequest):
    """Performs global or local sequence alignment using Needleman-Wunsch or Smith-Waterman."""
    
    if request.alignment_type.lower() == "global":
        score, a1, a2 = NeedlemanWunsch(
            request.seq1, request.seq2, request.match, request.mismatch, request.gap
        )
    elif request.alignment_type.lower() == "local":
        score, a1, a2 = SmithWaterman(
            request.seq1, request.seq2, request.match, request.mismatch, request.gap
        )
    else:
        raise HTTPException(status_code=400, detail="alignment_type must be 'global' or 'local'")
        
    return {
        "status": "success", 
        "score": score, 
        "alignment_1": a1, 
        "alignment_2": a2
    }

@router.post("/translate")
def translate_rna(request: TranslationRequest):
    """Translates an RNA sequence into a protein string."""
    protein = Translate(request.rna_sequence)
    return {"status": "success", "protein": protein}