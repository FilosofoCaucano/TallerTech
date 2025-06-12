from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import SessionLocal
from app.models.consumo import Consumo
from app.models.cliente import Cliente
from app.models.vehiculo import Vehiculo
from app.schemas.consumo_schema import ConsumoOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.get("/consumos/datos-prueba")
def insertar_datos_prueba(db: Session = Depends(get_db)):
    consumos = [
        Consumo(id_consumo="1", cliente_id="001", vehiculo_id="ABC123", servicio="Cambio Aceite", costo=30.0, fecha="2024-05-01"),
        Consumo(id_consumo="2", cliente_id="002", vehiculo_id="XYZ789", servicio="Alineación", costo=50.0, fecha="2024-05-02"),
        Consumo(id_consumo="3", cliente_id="003", vehiculo_id="LMN456", servicio="Cambio Aceite", costo=30.0, fecha="2024-05-03"),
    ]
    db.add_all(consumos)
    db.commit()
    return {"message": "Datos insertados"}

