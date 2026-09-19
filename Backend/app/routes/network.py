from fastapi import APIRouter
from ..services.network_monitor import get_network_connections

router = APIRouter(
    prefix="/api/network",
    tags=["Network Monitor"]
)


@router.get("/connections")
def network_connections():
    connections = get_network_connections()

    return {
        "status": "monitoring",
        "total_connections": len(connections),
        "connections": connections,
    }


@router.get("/status")
def network_status():

    connections = get_network_connections()

    external = [
        connection
        for connection in connections
        if connection["scope"] == "EXTERNAL"
    ]

    return {
        "mode": "LOCAL",
        "local_connections": len(connections) - len(external),
        "external_connections": len(external),
        "external_detected": len(external) > 0,
    }