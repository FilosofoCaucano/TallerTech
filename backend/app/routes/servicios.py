from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.database import SessionLocal
from app.models.servicio import Servicio
from app.schemas.servicio_schema import ServicioBase, ServicioOut

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔹 Listar todos los servicios
@router.get("/servicios", response_model=list[ServicioOut])
def listar_servicios(db: Session = Depends(get_db)):
    return db.query(Servicio).all()

# 🔹 Obtener un servicio por ID
@router.get("/servicios/{id_servicio}", response_model=ServicioOut)
def obtener_servicio(id_servicio: str, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio

# 🔹 Crear un nuevo servicio
@router.post("/servicios", response_model=ServicioOut)
def crear_servicio(servicio: ServicioBase, db: Session = Depends(get_db)):
    existe = db.query(Servicio).filter(Servicio.id_servicio == servicio.id_servicio).first()
    if existe:
        raise HTTPException(status_code=400, detail="El servicio ya existe")
    nuevo = Servicio(**servicio.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# 🔹 Actualizar un servicio
@router.put("/servicios/{id_servicio}", response_model=ServicioOut)
def actualizar_servicio(id_servicio: str, datos: ServicioBase, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for attr, value in datos.dict().items():
        setattr(servicio, attr, value)
    db.commit()
    return servicio

# 🔹 Eliminar un servicio
@router.delete("/servicios/{id_servicio}")
def eliminar_servicio(id_servicio: str, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    db.delete(servicio)
    db.commit()
    return {"message": "Servicio eliminado"}

@router.post("/servicios/cargar-predefinidos")
def cargar_servicios_predefinidos(db: Session = Depends(get_db)):
    servicios = [
        {"id_servicio": "srv001", "nombre": "Cambio de Aceite", "precio": 30},
        {"id_servicio": "srv002", "nombre": "Alineación y Balanceo", "precio": 50},
        {"id_servicio": "srv003", "nombre": "Cambio de Filtros", "precio": 40},
        {"id_servicio": "srv004", "nombre": "Revisión General", "precio": 80},
        {"id_servicio": "srv005", "nombre": "Cambio de Batería", "precio": 100},
        {"id_servicio": "srv006", "nombre": "Cambio de Pastillas de Freno", "precio": 90},
        {"id_servicio": "srv007", "nombre": "Diagnóstico Computarizado", "precio": 60},
        {"id_servicio": "srv008", "nombre": "Reparación de Suspensión", "precio": 120},
    ]

    for s in servicios:
        existente = db.query(Servicio).filter(Servicio.id_servicio == s["id_servicio"]).first()
        if not existente:
            nuevo = Servicio(**s)
            db.add(nuevo)
    db.commit()
    return {"message": "Servicios cargados exitosamente"}
