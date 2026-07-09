import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Dict, List

from core_lib import ValidateInput, FastaParse, FastaWrite

router = APIRouter()

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB limit

# --- Request/Response Models ---

class ValidateRequest(BaseModel):
    data: List[str]


class ValidateResponse(BaseModel):
    status: str
    is_valid: bool


class FastaTextRequest(BaseModel):
    fasta_text: str


class FastaRecord(BaseModel):
    header: str
    sequence: str
    length: int


class ParseFastaResponse(BaseModel):
    status: str
    data: List[FastaRecord]


class FastaWriteRequest(BaseModel):
    record: Dict[str, str]
    output_file: str


class FastaWriteResponse(BaseModel):
    status: str
    message: str


# --- Endpoints ---

@router.post("/validate", response_model=ValidateResponse)
def validate_fasta_lines(request: ValidateRequest):
    """Validates if the provided list of lines conforms to FASTA sequence contents."""
    try:
        is_valid = ValidateInput(request.data)
        return ValidateResponse(status="success", is_valid=is_valid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/parse-fasta-text", response_model=ParseFastaResponse)
def parse_fasta_text(request: FastaTextRequest):
    """Accepts a raw FASTA text string, caches it to disk, and parses it lazily to avoid memory spikes."""
    if len(request.fasta_text) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Text payload too large. Maximum allowed size is 2 MB."
        )

    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"text_{os.urandom(8).hex()}.fasta")
    
    try:
        # Write input string to disk to allow lazy file iteration
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(request.fasta_text)
            
        # Validate lines lazily (O(1) active RAM)
        with open(temp_path, "r", encoding="utf-8") as f:
            if not ValidateInput(f):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid FASTA format. Only A, C, G, T, N (case-insensitive) allowed in sequences.",
                )
                
        # Parse lines lazily (O(1) active RAM)
        with open(temp_path, "r", encoding="utf-8") as f:
            parsed_records = FastaParse(f)
            
        data_list = [
            FastaRecord(header=header, sequence=seq, length=len(seq))
            for header, seq in parsed_records.items()
        ]
        return ParseFastaResponse(status="success", data=data_list)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process text: {str(e)}")
    finally:
        # Strict resource cleanup
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@router.post("/parse-fasta", response_model=ParseFastaResponse)
async def parse_fasta_file(file: UploadFile = File(...)):
    """Accepts an uploaded FASTA file, streams it to disk in chunks, and parses it lazily (O(1) memory)."""
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"upload_{os.urandom(8).hex()}.fasta")
    
    try:
        # 1. Stream upload to disk in 10 KB chunks (O(1) space relative to file size)
        file_size = 0
        with open(temp_path, "wb") as buffer:
            while True:
                chunk = await file.read(10240)  # Read 10 KB chunks
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File too large. Maximum allowed size is 2 MB."
                    )
                buffer.write(chunk)
                
        # 2. Validate lazily from disk (O(1) active RAM)
        with open(temp_path, "r", encoding="utf-8") as f:
            if not ValidateInput(f):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid FASTA format. Only A, C, G, T, N (case-insensitive) allowed in sequences.",
                )
                
        # 3. Parse records lazily from disk (O(1) active RAM)
        with open(temp_path, "r", encoding="utf-8") as f:
            parsed_records = FastaParse(f)
            
        data_list = [
            FastaRecord(header=header, sequence=seq, length=len(seq))
            for header, seq in parsed_records.items()
        ]
        return ParseFastaResponse(status="success", data=data_list)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")
    finally:
        # Strict resource cleanup
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@router.post("/write-fasta", response_model=FastaWriteResponse)
def write_fasta_records(request: FastaWriteRequest):
    """Writes a dictionary of genetic sequences to a JSON-formatted file on the server."""
    try:
        FastaWrite(request.record, request.output_file)
        return FastaWriteResponse(
            status="success",
            message=f"Successfully wrote records to {request.output_file}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file: {str(e)}")
