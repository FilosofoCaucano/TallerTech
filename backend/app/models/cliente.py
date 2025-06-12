from sqlalchemy import Column, String, Date
from app.models.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tecnomecanica = Column(Date, nullable=False)
    email = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    estado = Column(String, nullable=False, default="Activo")  # NUEVO CAMPO

