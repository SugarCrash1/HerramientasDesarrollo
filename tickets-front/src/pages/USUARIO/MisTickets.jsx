import { useEffect, useState } from "react";
import { Bot } from "lucide-react";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";

export default function MisTickets() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = localStorage.getItem("usuarioId");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarTickets = async () => {
    try {
      if (!usuarioId) {
        setTickets([]);
        return;
      }

      const { data } = await api.get(`/api/tickets/usuario/${usuarioId}`);
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando mis tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <main className="main-content">
        <div className="topbar">
          <div>
            <h2>Mis Tickets</h2>
            <span>Historial de solicitudes creadas por ti</span>
          </div>
          <strong>{usuario.email}</strong>
        </div>

        <section className="cliente-dashboard">
          <div className="cliente-hero">
            <div>
              <span className="cliente-label">Historial de solicitudes</span>
              <h1>Mis tickets</h1>
              <p>
                Consulta el estado, prioridad y análisis inteligente de tus
                solicitudes.
              </p>
            </div>
          </div>

          <div className="cliente-card">
            {loading ? (
              <p className="cliente-empty">Cargando tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="cliente-empty">No tienes tickets registrados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Ticket</th>
                      <th>IA</th>
                      <th>Área</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.codigo || "-"}</td>

                        <td>
                          <strong>{ticket.titulo || "Sin título"}</strong>
                          <br />
                          <small>{ticket.descripcion || "-"}</small>
                        </td>

                        <td>
                          {ticket.analizadoPorIa ? (
                            <div className="ia-cell">
                              <Bot size={16} />
                              <strong>{ticket.tipoSolicitud || "IA"}</strong>
                              <small>
                                {ticket.respuestaIa || "Sin respuesta IA"}
                              </small>
                            </div>
                          ) : (
                            <span className="badge">Manual</span>
                          )}
                        </td>

                        <td>
                          <span className="badge">
                            {ticket.areaDestino || "-"}
                          </span>
                        </td>

                        <td>{ticket.estado || "-"}</td>

                        <td>
                          <span className={`badge priority-${ticket.prioridad}`}>
                            {ticket.prioridad || "-"}
                          </span>
                        </td>

                        <td>
                          {ticket.fechaCreacion
                            ? new Date(ticket.fechaCreacion).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}