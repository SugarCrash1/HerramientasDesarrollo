import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles, CheckCircle } from "lucide-react";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";

export default function CrearTicketUsuario() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = localStorage.getItem("usuarioId");

  const [previewIA, setPreviewIA] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
  });

  const analizarConIA = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      alert("Escribe el título y la descripción.");
      return;
    }

    try {
      setAnalizando(true);

      const { data } = await api.post("/api/ia/analizar-ticket", {
        titulo: form.titulo,
        descripcion: form.descripcion,
      });

      setPreviewIA(data);
    } catch (error) {
      console.error("Error analizando con IA:", error);
      alert("No se pudo analizar con IA.");
    } finally {
      setAnalizando(false);
    }
  };

  const crearTicketConIA = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      alert("Escribe el título y la descripción.");
      return;
    }

    try {
      setGuardando(true);

      await api.post(`/api/tickets/cliente?usuarioId=${usuarioId}`, {
        titulo: form.titulo,
        descripcion: form.descripcion,
      });

      alert("Ticket creado correctamente con análisis de IA");
      navigate("/usuario/mis-tickets");
    } catch (error) {
      console.error("Error creando ticket:", error);
      alert("No se pudo crear el ticket.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <main className="main-content">
        <div className="topbar">
          <div>
            <h2>Nuevo Ticket</h2>
            <span>Creación asistida con inteligencia artificial</span>
          </div>
          <strong>{usuario.email}</strong>
        </div>

        <section className="cliente-dashboard">
          <div className="cliente-hero">
            <div>
              <span className="cliente-label">Mesa de ayuda inteligente</span>
              <h1>Crear nuevo ticket</h1>
              <p>
                Describe tu solicitud. La IA analizará el caso, determinará si
                corresponde a técnico o administración, y creará el ticket.
              </p>
            </div>
          </div>

          <div className="cliente-grid">
            <div className="cliente-card">
              <div className="form-group">
                <label>Título</label>
                <input
                  value={form.titulo}
                  onChange={(e) => {
                    setPreviewIA(null);
                    setForm({ ...form, titulo: e.target.value });
                  }}
                  placeholder="Ej: No puedo ingresar al sistema"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="8"
                  value={form.descripcion}
                  onChange={(e) => {
                    setPreviewIA(null);
                    setForm({ ...form, descripcion: e.target.value });
                  }}
                  placeholder="Explica con detalle qué ocurre..."
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="cliente-secondary-btn"
                  onClick={analizarConIA}
                  disabled={analizando || guardando}
                >
                  <Sparkles size={18} />
                  {analizando ? "Analizando..." : "Previsualizar IA"}
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={crearTicketConIA}
                  disabled={guardando || analizando}
                >
                  <Send size={18} />
                  {guardando ? "Creando..." : "Analizar y crear ticket"}
                </button>
              </div>
            </div>

            <div className="cliente-card cliente-ai-card">
              <div className="cliente-ai-icon">
                <Bot size={46} />
              </div>

              <h2>Análisis IA</h2>

              {!previewIA ? (
                <p>
                  Puedes previsualizar cómo la IA clasificará el ticket, o crear
                  directamente el ticket con análisis automático.
                </p>
              ) : (
                <div>
                  <p>
                    <strong>Tipo:</strong> {previewIA.tipoSolicitud}
                  </p>

                  <p>
                    <strong>Área destino:</strong> {previewIA.areaDestino}
                  </p>

                  <p>
                    <strong>Prioridad:</strong> {previewIA.prioridad}
                  </p>

                  <div className="cliente-ai-example">
                    {previewIA.respuestaSugerida}
                  </div>

                  <p style={{ marginTop: "16px" }}>
                    <CheckCircle size={18} /> Si estás de acuerdo, presiona
                    <strong> Analizar y crear ticket</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}