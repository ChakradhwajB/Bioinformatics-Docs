from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from core_lib.indexing import FindPatterns, BuildSuffixArray, BinarySearchPattern

router = APIRouter()


class TrieSearchRequest(BaseModel):
    sequence: str
    patterns: List[str]


class TrieSearchResponse(BaseModel):
    matches: Dict[str, List[int]]


class SuffixSearchRequest(BaseModel):
    sequence: str
    pattern: str


class SuffixSearchResponse(BaseModel):
    suffix_array: List[int]
    matches: List[int]


@router.post("/trie-search", response_model=TrieSearchResponse)
def trie_search(payload: TrieSearchRequest):
    """
    Finds all occurrences of multiple query patterns in a sequence using a Trie.
    """
    if not payload.sequence:
        raise HTTPException(status_code=400, detail="Sequence string cannot be empty.")
    try:
        # Normalize to uppercase
        seq = payload.sequence.strip().upper()
        patts = [p.strip().upper() for p in payload.patterns if p.strip()]
        
        matches = FindPatterns(seq, patts)
        return TrieSearchResponse(matches=matches)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/suffix-search", response_model=SuffixSearchResponse)
def suffix_search(payload: SuffixSearchRequest):
    """
    Builds the Suffix Array of a sequence and searches for a single pattern using binary search.
    """
    if not payload.sequence:
        raise HTTPException(status_code=400, detail="Sequence string cannot be empty.")
    if not payload.pattern:
        raise HTTPException(status_code=400, detail="Pattern query cannot be empty.")
    try:
        # Normalize to uppercase
        seq = payload.sequence.strip().upper()
        patt = payload.pattern.strip().upper()
        
        # Build suffix array (returns offsets including sentinel $)
        sa = BuildSuffixArray(seq)
        
        # Find match indices using binary search over the suffix array
        matches = BinarySearchPattern(seq, patt, sa)
        
        return SuffixSearchResponse(suffix_array=sa, matches=matches)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
