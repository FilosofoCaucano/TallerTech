from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.models.database import SessionLocal
from app.models.detalle_diagnostico import DetalleDiagnostico
from app.models.diagnostico import Diagnostico  # Importado para join si necesario
from app.schemas.detalle_diagnostico_schema import DetalleDiagnosticoBase, DetalleDiagnosticoOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/detalle-diagnostico", response_model=list[DetalleDiagnosticoOut])
def listar_detalles(db: Session = Depends(get_db)):
    return db.query(DetalleDiagnostico).all()

@router.get("/detalle-diagnostico/{id_detalle}", response_model=DetalleDiagnosticoOut)
def obtener_detalle(id_detalle: str, db: Session = Depends(get_db)):
    detalle = db.query(DetalleDiagnostico).filter(DetalleDiagnostico.id_detalle == id_detalle).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
    return detalle

# ✅ Nuevo endpoint por placa
@router.get("/detalle-diagnostico-por-placa", response_model=list[DetalleDiagnosticoOut])
def obtener_por_placa(placa: str = Query(...), db: Session = Depends(get_db)):
    detalles = db.query(DetalleDiagnostico).join(Diagnostico).filter(Diagnostico.placa == placa).all()
    if not detalles:
        raise HTTPException(status_code=404, detail="No se encontraron detalles para la placa")
    return detalles

@router.post("/detalle-diagnostico", response_model=DetalleDiagnosticoOut)
def crear_detalle(detalle: DetalleDiagnosticoBase, db: Session = Depends(get_db)):
    existe = db.query(DetalleDiagnostico).filter(DetalleDiagnostico.id_detalle == detalle.id_detalle).first()
    if existe:
        raise HTTPException(status_code=400, detail="El detalle ya existe")
    nuevo = DetalleDiagnostico(**detalle.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/detalle-diagnostico/{id_detalle}", response_model=DetalleDiagnosticoOut)
def actualizar_detalle(id_detalle: str, datos: DetalleDiagnosticoBase, db: Session = Depends(get_db)):
    detalle = db.query(DetalleDiagnostico).filter(DetalleDiagnostico.id_detalle == id_detalle).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
    for attr, value in datos.dict().items():
        setattr(detalle, attr, value)
    db.commit()
    return detalle

@router.delete("/detalle-diagnostico/{id_detalle}")
def eliminar_detalle(id_detalle: str, db: Session = Depends(get_db)):
    detalle = db.query(DetalleDiagnostico).filter(DetalleDiagnostico.id_detalle == id_detalle).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
    db.delete(detalle)
    db.commit()
    return {"message": "Detalle eliminado"}
