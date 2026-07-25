from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.endpoints import alignments, genetics, io, kmers, indexing

app = FastAPI(
    title="Bioinformatics Platform API",
    description="Backend for genetic sequence analysis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bioinformatics-docs.netlify.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(alignments.router, prefix="/api/v1/alignments", tags=["alignments"])
app.include_router(genetics.router, prefix="/api/v1/genetics", tags=["genetics"])
app.include_router(io.router, prefix="/api/v1/io", tags=["io"])
app.include_router(kmers.router, prefix="/api/v1/kmers", tags=["kmers"])
app.include_router(indexing.router, prefix="/api/v1/indexing", tags=["indexing"])

@app.get("/")
def health_check():
    return {"status": "online", "message": "Bioinformatics API is running."}
