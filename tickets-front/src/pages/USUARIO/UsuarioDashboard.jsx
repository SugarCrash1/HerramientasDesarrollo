import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  ArrowRight,
} from "lucide-react";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";

export default function UsuarioDashboard() {
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
      const lista = Array.isArray(data) ? data : data.content || [];

      setTickets(lista.filter((t) => t.usuario?.id === usuarioId));
    } catch (error) {
      console.error("Error cargando tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const total = tickets.length;

  const abiertos = tickets.filter(
    (t) => t.estado === "ABIERTO" || t.estado === "PENDIENTE"
  ).length;

  const proceso = tickets.filter(
    (t) => t.estado === "ASIGNADO" || t.estado === "EN_PROCESO"
  ).length;

  const resueltos = tickets.filter(
    (t) => t.estado === "RESUELTO" || t.estado === "CERRADO"
  ).length;

  const recientes = tickets.slice(0, 4);

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <main className="main-content">
        <div className="topbar">
          <div>
            <h2>Sistema de Gestión de Tickets</h2>
            <span>Panel del cliente</span>
          </div>

          <div className="topbar-user">
            <div className="avatar">
              {usuario.nombreCompleto?.charAt(0) || "U"}
            </div>

            <div>
              <strong>{usuario.nombreCompleto || "Cliente"}</strong>
              <small>{usuario.email}</small>
            </div>
          </div>
        </div>

        <section className="cliente-dashboard">
          <div className="cliente-hero">
            <div>
              <span className="cliente-label">Mesa de ayuda inteligente</span>

              <h1>Hola, {usuario.nombreCompleto || "Cliente"} 👋</h1>

              <p>
                Gestiona tus solicitudes, revisa el avance de tus tickets y recibe
                soporte técnico de forma rápida.
              </p>
            </div>

            <Link className="cliente-hero-btn" to="/usuario/crear-ticket">
              <PlusCircle size={20} />
              Nuevo ticket
            </Link>
          </div>

          <div className="cliente-stats">
            <div className="cliente-stat-card">
              <div className="cliente-stat-icon">
                <Ticket size={28} />
              </div>

              <div>
                <span>Mis tickets</span>
                <h2>{total}</h2>
              </div>
            </div>

            <div className="cliente-stat-card">
              <div className="cliente-stat-icon warning">
                <AlertCircle size={28} />
              </div>

              <div>
                <span>Abiertos</span>
                <h2>{abiertos}</h2>
              </div>
            </div>

            <div className="cliente-stat-card">
              <div className="cliente-stat-icon process">
                <Clock size={28} />
              </div>

              <div>
                <span>En atención</span>
                <h2>{proceso}</h2>
              </div>
            </div>

            <div className="cliente-stat-card">
              <div className="cliente-stat-icon success">
                <CheckCircle size={28} />
              </div>

              <div>
                <span>Finalizados</span>
                <h2>{resueltos}</h2>
              </div>
            </div>
          </div>

          <div className="cliente-grid">
            <div className="cliente-card cliente-tickets-card">
              <div className="cliente-card-header">
                <div>
                  <h2>Mis solicitudes recientes</h2>
                  <p>Últimos tickets registrados por ti.</p>
                </div>

                <Link to="/usuario/mis-tickets">
                  Ver todos
                  <ArrowRight size={16} />
                </Link>
              </div>

              {loading ? (
                <p className="cliente-empty">Cargando tickets...</p>
              ) : recientes.length === 0 ? (
                <div className="cliente-empty-box">
                  <Ticket size={44} />

                  <h3>Aún no tienes tickets</h3>

                  <p>
                    Cuando registres una solicitud, aparecerá aquí con su estado.
                  </p>

                  <Link className="cliente-secondary-btn" to="/usuario/crear-ticket">
                    Crear mi primer ticket
                  </Link>
                </div>
              ) : (
                <div className="cliente-ticket-list">
                  {recientes.map((ticket) => (
                    <div className="cliente-ticket-row" key={ticket.id}>
                      <div>
                        <strong>{ticket.titulo || "Sin título"}</strong>
                        <p>{ticket.codigo || "Sin código"}</p>
                      </div>

                      <span className="cliente-badge">
                        {ticket.estado || "ABIERTO"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cliente-card cliente-ai-card">
              <div className="cliente-ai-icon">
                <Bot size={46} />
              </div>

              <h2>Asistente IA</h2>

              <p>
                Describe tu problema y recibe una sugerencia antes de enviar el ticket.
              </p>

              <div className="cliente-ai-example">
                “No puedo ingresar al correo institucional”
              </div>

              <Link className="cliente-hero-btn" to="/usuario/crear-ticket">
                Probar asistente
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}