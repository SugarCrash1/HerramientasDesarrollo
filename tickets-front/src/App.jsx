import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import CrearTicket from "./pages/CrearTicket";
import Categorias from "./pages/Categorias";
import Usuarios from "./pages/Usuarios";
import MiPerfil from "./pages/MiPerfil";

import UsuarioDashboard from "./pages/USUARIO/UsuarioDashboard";
import CrearTicketUsuario from "./pages/USUARIO/CrearTicketUsuario";
import MisTickets from "./pages/USUARIO/MisTickets";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/tickets" element={token ? <Tickets /> : <Navigate to="/" />} />
      <Route path="/crear-ticket" element={token ? <CrearTicket /> : <Navigate to="/" />} />
      <Route path="/categorias" element={token ? <Categorias /> : <Navigate to="/" />} />
      <Route path="/usuarios" element={token ? <Usuarios /> : <Navigate to="/" />} />
      <Route path="/perfil" element={token ? <MiPerfil /> : <Navigate to="/" />} />

      <Route path="/usuario/dashboard" element={token ? <UsuarioDashboard /> : <Navigate to="/" />} />
      <Route path="/usuario/crear-ticket" element={token ? <CrearTicketUsuario /> : <Navigate to="/" />} />
      <Route path="/usuario/mis-tickets" element={token ? <MisTickets /> : <Navigate to="/" />} />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}