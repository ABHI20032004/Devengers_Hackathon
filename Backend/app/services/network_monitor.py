import socket
import psutil
from datetime import datetime


LOCAL_HOSTS = {
    "127.0.0.1",
    "localhost",
    "::1",
}


def get_network_connections():
    connections = []

    for conn in psutil.net_connections(kind="inet"):

        if not conn.raddr:
            continue

        remote_ip = conn.raddr.ip
        remote_port = conn.raddr.port

        local_ip = conn.laddr.ip if conn.laddr else None
        local_port = conn.laddr.port if conn.laddr else None

        is_local = (
            remote_ip in LOCAL_HOSTS
            or remote_ip.startswith("127.")
        )

        connections.append({
            "timestamp": datetime.now().isoformat(),
            "local_ip": local_ip,
            "local_port": local_port,
            "remote_ip": remote_ip,
            "remote_port": remote_port,
            "scope": "LOCAL" if is_local else "EXTERNAL",
            "status": "SAFE" if is_local else "REVIEW",
        })

    return connections