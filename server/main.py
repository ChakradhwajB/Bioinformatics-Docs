from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.endpoints import sequence_router

app = FastAPI(
    title="Bioinformatics Platform API",
    description="Backend for genetic sequence analysis.",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(sequence_router.router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "online", "message": "Bioinformatics API is running."}