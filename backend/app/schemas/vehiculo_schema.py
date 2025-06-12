from typing import Optional
from pydantic import BaseModel

class VehiculoBase(BaseModel):
    placa: str
    marca: str
    modelo: str
    cliente_id: str

class VehiculoOut(BaseModel):
    placa: str
    marca: str
    modelo: str

    class Config:
        from_attributes = True
