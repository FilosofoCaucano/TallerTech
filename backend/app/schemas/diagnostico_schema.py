from pydantic import BaseModel
from datetime import date
from typing import List
from .detalle_diagnostico_schema import DetalleDiagnosticoBase

class DiagnosticoBase(BaseModel):
    id_diagnostico: str
    placa: str
    fecha: date

class DiagnosticoOut(DiagnosticoBase):
    class Config:
        from_attributes = True

class DiagnosticoCompleto(BaseModel):
    id_diagnostico: str
    placa: str
    fecha: date
    detalles: List[DetalleDiagnosticoBase]