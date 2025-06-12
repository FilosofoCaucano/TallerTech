from sqlalchemy import Column, String, ForeignKey
from app.models.database import Base

class Vehiculo(Base):
    __tablename__ = "vehiculos"

    placa = Column(String, primary_key=True, index=True)
    marca = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=False)