from pydantic import BaseModel
from datetime import date

class ConsumoBase(BaseModel):
    cliente_id: str
    vehiculo_id: str
    servicio: str
    costo: float
    fecha: date

class ConsumoOut(ConsumoBase):
    id_consumo: str
    class Config:
        orm_mode = True
