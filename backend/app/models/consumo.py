 
from sqlalchemy import Column, String, Float, Date, ForeignKey
from app.models.database import Base

class Consumo(Base):
    __tablename__ = "consumos"

    id_consumo = Column(String, primary_key=True, index=True)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=False)
    vehiculo_id = Column(String, ForeignKey("vehiculos.placa"), nullable=False)
    servicio = Column(String, nullable=False)
    costo = Column(Float, nullable=False)
    fecha = Column(Date, nullable=False)
