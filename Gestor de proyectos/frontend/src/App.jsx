import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProyectosCRUD from './pages/ProyectosCRUD.jsx';
import UsuariosCRUD from './pages/UsuariosCRUD.jsx';
import Perfil from './pages/Perfil.jsx';
import AvanceTrimestral from './pages/AvanceTrimestral.jsx';
import Parametros from './pages/Parametros.jsx';
import PresupuestosCRUD from './pages/PresupuestosCRUD.jsx';
import './App.css';

// Función para crear tema
const createAppTheme = (mode, designConfig) => createTheme({
  palette: {
    mode,
    primary: {
      main: designConfig.primaryColor,
      light: designConfig.primaryColor === '#800020' ? '#a3405c' : `${designConfig.primaryColor}CC`,
      dark: designConfig.primaryColor === '#800020' ? '#5c0017' : `${designConfig.primaryColor}88`,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: designConfig.secondaryColor,
      light: designConfig.secondaryColor === '#722F37' ? '#965058' : `${designConfig.secondaryColor}CC`,
      dark: designConfig.secondaryColor === '#722F37' ? '#4d1f25' : `${designConfig.secondaryColor}88`,
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#faf8f9',
      paper: mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
    },
    error: {
      main: '#c62828',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#f57c00',
    },
    info: {
      main: '#800020',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  // Cargar configuración de diseño desde localStorage
  const getDesignConfig = () => {
    const saved = localStorage.getItem('designConfig');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#800020',
      secondaryColor: '#722F37',
      logo: null,
    };
  };

  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const designConfig = getDesignConfig();
  const theme = createAppTheme(mode, designConfig);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout mode={mode} setMode={setMode} />
                  </ProtectedRoute>
                }
              >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="proyectos" element={<ProyectosCRUD />} />
              <Route path="avance" element={<AvanceTrimestral />} />
              <Route path="parametros" element={<Parametros />} />
              <Route path="presupuestos" element={<PresupuestosCRUD />} />
              <Route path="usuarios" element={<UsuariosCRUD />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
