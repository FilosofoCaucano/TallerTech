from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    clientes, consumos, canales,
    servicios, facturas, detalle_factura,
    diagnosticos, detalle_diagnostico,
    inspecciones, detalle_inspeccion,
    vehiculos, citas,
    auth  # Importamos el router de auth.py donde se definen las rutas /usuarios y /login
)

from app.models.database import engine, Base
from app.models import (
    cliente, vehiculo, servicio, cita, factura,
    diagnostico, inspeccion  
)

app = FastAPI(title="API de Gestión de Taller", version="1.0")

# CORS: Permite las solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(clientes.router)
app.include_router(consumos.router)
app.include_router(canales.router)
app.include_router(vehiculos.router)
app.include_router(citas.router)
app.include_router(servicios.router)
app.include_router(facturas.router)
app.include_router(detalle_factura.router)
app.include_router(diagnosticos.router)
app.include_router(detalle_diagnostico.router)
app.include_router(inspecciones.router)
app.include_router(detalle_inspeccion.router)

# Asegúrate de incluir el router de auth.py para que /usuarios y /login estén disponibles
app.include_router(auth.router)  # Aquí añadimos el router de auth.py

@app.get("/")
def read_root():
    return {"message": "🚗 Backend de Taller funcionando correctamente"}

# Crear todas las tablas (solo para desarrollo, no en producción)
Base.metadata.create_all(bind=engine)

@app.get("/tablas-debug")
def debug():
    return {"tablas": list(Base.metadata.tables.keys())}

