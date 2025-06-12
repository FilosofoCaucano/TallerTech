from pydantic import BaseModel
from datetime import date
from typing import Literal

class ClienteBase(BaseModel):
    id: str
    nombre: str
    tecnomecanica: date
    email: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    estado: Literal["Activo", "Inactivo"] = "Activo"  # SOLO PERMITE ESTOS VALORES


class ClienteOut(ClienteBase):
    class Config:
        from_attributes = True  # Pydantic v2