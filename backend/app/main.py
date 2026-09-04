from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db_and_seed
from app.routers import farm, processing, inventory, sales, expenses, analytics, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed realistic data on startup
    init_db_and_seed()
    yield

app = FastAPI(
    title="DAVOT Farm Operational API",
    description="Personalized backend API for Small Oil-Palm Farm Operational Management & Traceability",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(farm.router)
app.include_router(processing.router)
app.include_router(inventory.router)
app.include_router(sales.router)
app.include_router(expenses.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"status": "healthy", "app": "DAVOT Farm Operations Control System"}
