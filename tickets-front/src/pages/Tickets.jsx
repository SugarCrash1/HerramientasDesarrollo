import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Bot,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Tickets() {
  const usuarioStorage = localStorage.getItem("usuario");

  const usuario =
    usuarioStorage && usuarioStorage !== "undefined"
      ? JSON.parse(usuarioStorage)
      : null;

  const usuarioAccionId = localStorage.getItem("usuarioId") || usuario?.id;

  const [tickets, setTickets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modo, setModo] = useState("crear");
  const [ticketEditando, setTicketEditando] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "MEDIA",
    categoriaId: "",
    fechaLimite: "",
    tiempoEstimadoHoras: "",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [ticketsRes, categoriasRes, usuariosRes] = await Promise.all([
        api.get("/api/tickets"),
        api.get("/api/categorias"),
        api.get("/usuarios"),
      ]);

      setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : []);
      setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : []);
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const tecnicos = usuarios.filter(
    (u) => u.rol?.nombre === "TECNICO" || u.rol === "TECNICO"
  );

  const abrirCrear = () => {
    setModo("crear");
    setTicketEditando(null);
    setForm({
      titulo: "",
      descripcion: "",
      prioridad: "MEDIA",
      categoriaId: "",
      fechaLimite: "",
      tiempoEstimadoHoras: "",
    });
    setDrawerOpen(true);
  };

  const abrirEditar = (ticket) => {
    setModo("editar");
    setTicketEditando(ticket);

    setForm({
      titulo: ticket.titulo || "",
      descripcion: ticket.descripcion || "",
      prioridad: ticket.prioridad || "MEDIA",
      categoriaId: ticket.categoria?.id || "",
      fechaLimite: ticket.fechaLimite ? ticket.fechaLimite.substring(0, 10) : "",
      tiempoEstimadoHoras: ticket.tiempoEstimadoHoras || "",
    });

    setDrawerOpen(true);
  };

  const cerrarDrawer = () => {
    setDrawerOpen(false);
    setTicketEditando(null);
  };

  const guardarTicket = async (e) => {
    e.preventDefault();

    if (!usuarioAccionId) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if (!form.titulo.trim()) {
      alert("Ingrese el título");
      return;
    }

    if (!form.descripcion.trim()) {
      alert("Ingrese la descripción");
      return;
    }

    if (!form.categoriaId) {
      alert("Seleccione una categoría");
      return;
    }

    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      prioridad: form.prioridad,
      categoriaId: form.categoriaId,
      fechaLimite: form.fechaLimite ? `${form.fechaLimite}T23:59:00` : null,
      tiempoEstimadoHoras: form.tiempoEstimadoHoras
        ? Number(form.tiempoEstimadoHoras)
        : null,
    };

    try {
      if (modo === "crear") {
        await api.post(`/api/tickets?usuarioId=${usuarioAccionId}`, payload);
        alert("Ticket creado correctamente");
      } else {
        await api.put(
          `/api/tickets/${ticketEditando.id}?usuarioAccionId=${usuarioAccionId}`,
          payload
        );
        alert("Ticket editado correctamente");
      }

      cerrarDrawer();
      cargarDatos();
    } catch (error) {
      console.error("Error guardando ticket", error);
      alert("Error guardando ticket");
    }
  };

  const eliminarTicket = async (ticket) => {
    const confirmar = confirm(`¿Eliminar el ticket "${ticket.titulo}"?`);
    if (!confirmar) return;

    try {
      await api.delete(
        `/api/tickets/${ticket.id}?usuarioAccionId=${usuarioAccionId}`
      );

      alert("Ticket eliminado correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error eliminando ticket", error);
      alert("No se pudo eliminar el ticket");
    }
  };

  const asignarTecnico = async (ticketId, tecnicoId) => {
    if (!tecnicoId || !usuarioAccionId) return;

    try {
      await api.put("/api/tickets/asignar", {
        ticketId,
        tecnicoId,
        usuarioAccionId,
      });

      cargarDatos();
    } catch (error) {
      console.error("Error asignando técnico", error);
      alert("No se pudo asignar el técnico");
    }
  };

  const cambiarEstado = async (ticketId, nuevoEstado) => {
    try {
      await api.put("/api/tickets/estado", {
        ticketId,
        nuevoEstado,
        usuarioAccionId,
      });

      cargarDatos();
    } catch (error) {
      console.error("Error cambiando estado", error);
      alert("No se pudo cambiar el estado");
    }
  };

  const cortarTexto = (texto = "", limite = 95) => {
    if (!texto) return "-";
    return texto.length > limite ? `${texto.substring(0, limite)}...` : texto;
  };

  const ticketsFiltrados = tickets.filter((ticket) =>
    `
      ${ticket.codigo || ""}
      ${ticket.titulo || ""}
      ${ticket.descripcion || ""}
      ${ticket.estado || ""}
      ${ticket.prioridad || ""}
      ${ticket.tipoSolicitud || ""}
      ${ticket.areaDestino || ""}
      ${ticket.respuestaIa || ""}
      ${ticket.categoria?.nombre || ""}
      ${ticket.usuario?.nombreCompleto || ""}
      ${ticket.tecnico?.nombreCompleto || ""}
    `
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Tickets</h1>
              <p className="subtitle">
                Gestión de tickets, análisis IA, técnicos y estados
              </p>
            </div>

            <div className="header-actions">
              <button className="secondary-btn" onClick={cargarDatos}>
                <RefreshCw size={17} />
                Actualizar
              </button>

              <button className="primary-btn" onClick={abrirCrear}>
                <Plus size={18} />
                Nuevo Ticket
              </button>
            </div>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar por código, descripción, IA, estado, solicitante..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <span className="table-count">Total: {ticketsFiltrados.length}</span>
            </div>

            <div className="table-responsive tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>IA</th>
                    <th>Área</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Cliente</th>
                    <th>Técnico</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cargando ? (
                    <tr>
                      <td colSpan="9" className="empty-table">
                        Cargando tickets...
                      </td>
                    </tr>
                  ) : ticketsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="empty-table">
                        No hay tickets registrados
                      </td>
                    </tr>
                  ) : (
                    ticketsFiltrados.map((ticket) => (
                      <tr key={ticket.id}>
                        <td data-label="Código">
                          <strong>{ticket.codigo || "-"}</strong>
                          <small className="table-subtext">
                            {ticket.fechaCreacion
                              ? new Date(ticket.fechaCreacion).toLocaleDateString()
                              : ""}
                          </small>
                        </td>

                        <td data-label="Descripción">
                          <strong>{ticket.titulo || "Sin título"}</strong>
                          <small className="table-subtext">
                            {cortarTexto(ticket.descripcion)}
                          </small>
                        </td>

                        <td data-label="IA">
                          {ticket.analizadoPorIa ? (
                            <div className="ia-cell">
                              <Bot size={16} />
                              <strong>{ticket.tipoSolicitud || "IA"}</strong>
                              <small>{cortarTexto(ticket.respuestaIa, 70)}</small>
                            </div>
                          ) : (
                            <span className="badge">Manual</span>
                          )}
                        </td>

                        <td data-label="Área">
                          <span className="badge">
                            {ticket.areaDestino || "-"}
                          </span>
                        </td>

                        <td data-label="Prioridad">
                          <span className={`badge priority-${ticket.prioridad}`}>
                            {ticket.prioridad || "-"}
                          </span>
                        </td>

                        <td data-label="Estado">
                          <select
                            className="table-select"
                            value={ticket.estado || "ABIERTO"}
                            onChange={(e) =>
                              cambiarEstado(ticket.id, e.target.value)
                            }
                          >
                            <option value="ABIERTO">ABIERTO</option>
                            <option value="ASIGNADO">ASIGNADO</option>
                            <option value="EN_PROCESO">EN PROCESO</option>
                            <option value="RESUELTO">RESUELTO</option>
                            <option value="CERRADO">CERRADO</option>
                          </select>
                        </td>

                        <td data-label="Cliente">
                          {ticket.usuario?.nombreCompleto || "-"}
                        </td>

                        <td data-label="Técnico">
                          <select
                            className="table-select"
                            value={ticket.tecnico?.id || ""}
                            onChange={(e) =>
                              asignarTecnico(ticket.id, e.target.value)
                            }
                          >
                            <option value="">Sin asignar</option>
                            {tecnicos.map((tecnico) => (
                              <option key={tecnico.id} value={tecnico.id}>
                                {tecnico.nombreCompleto}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td data-label="Acciones">
                          <div className="action-buttons">
                            <button
                              className="icon-btn edit"
                              title="Editar"
                              onClick={() => abrirEditar(ticket)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="icon-btn delete"
                              title="Eliminar"
                              onClick={() => eliminarTicket(ticket)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={cerrarDrawer}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2>{modo === "crear" ? "Nuevo Ticket" : "Editar Ticket"}</h2>
                <p>
                  {modo === "crear"
                    ? "Registra un ticket manual como administrador"
                    : "Actualiza la información del ticket"}
                </p>
              </div>

              <button className="drawer-close" onClick={cerrarDrawer}>
                <X size={20} />
              </button>
            </div>

            {ticketEditando?.analizadoPorIa && (
              <div className="ia-box">
                <Bot size={20} />
                <div>
                  <strong>Análisis IA</strong>
                  <p><b>Tipo:</b> {ticketEditando.tipoSolicitud}</p>
                  <p><b>Área:</b> {ticketEditando.areaDestino}</p>
                  <p><b>Respuesta:</b> {ticketEditando.respuestaIa}</p>
                </div>
              </div>
            )}

            <form className="drawer-body" onSubmit={guardarTicket}>
              <div className="form-group">
                <label>Título</label>
                <input
                  value={form.titulo}
                  onChange={(e) =>
                    setForm({ ...form, titulo: e.target.value })
                  }
                  placeholder="Ejemplo: Error al iniciar sesión"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="4"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  placeholder="Describe el problema o requerimiento"
                />
              </div>

              <div className="form-group">
                <label>Prioridad</label>
                <select
                  value={form.prioridad}
                  onChange={(e) =>
                    setForm({ ...form, prioridad: e.target.value })
                  }
                >
                  <option value="BAJA">BAJA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="CRITICA">CRÍTICA</option>
                </select>
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={form.categoriaId}
                  onChange={(e) =>
                    setForm({ ...form, categoriaId: e.target.value })
                  }
                >
                  <option value="">Seleccione</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha límite</label>
                <input
                  type="date"
                  value={form.fechaLimite}
                  onChange={(e) =>
                    setForm({ ...form, fechaLimite: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Tiempo estimado en horas</label>
                <input
                  type="number"
                  min="1"
                  value={form.tiempoEstimadoHoras}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tiempoEstimadoHoras: e.target.value,
                    })
                  }
                />
              </div>

              <div className="drawer-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={cerrarDrawer}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary-btn">
                  {modo === "crear" ? "Guardar Ticket" : "Actualizar Ticket"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}