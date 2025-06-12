from typing import Union
from pydantic import BaseModel

class DetalleDiagnosticoBase(BaseModel):
    id_detalle: str
    id_diagnostico: str
    componente: str
    valor: Union[str, float]  # ✅ permite ambos tipos

class DetalleDiagnosticoOut(DetalleDiagnosticoBase):
    class Config:
        from_attributes = True  # para Pydantic v2 (antes era orm_mode = True)
