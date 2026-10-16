"""ProofStack server launcher."""
import uvicorn
from backend.config import settings
from backend.database import engine
from backend import models


def init_db():
    models.Base.metadata.create_all(bind=engine)


def main():
    init_db()
    uvicorn.run("backend.server:app", host=settings.host if hasattr(settings, "host") else "127.0.0.1",
                port=8765, reload=False)


if __name__ == "__main__":
    main()
