import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { tienePermiso, PERMISOS, getNombreRol } from '../utils/permisos.js';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Timeline as TimelineIcon,
  Assessment as ReportesIcon,
  Settings as ParametrosIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/proyectos', label: 'Proyectos', icon: <FolderIcon /> },
    { path: '/avance', label: 'Avance Trimestral', icon: <TimelineIcon /> },
    { path: '/reportes', label: 'Reportes', icon: <ReportesIcon /> },
    { path: '/parametros', label: 'Parámetros', icon: <ParametrosIcon /> },
    { path: '/usuarios', label: 'Usuarios', icon: <PeopleIcon /> },
  ];

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
          >
            GP
          </Box>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              Gestor de Proyectos
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1 }}>
              Sistema de Planificación
            </Typography>
          </Box>
        </Box>
        
        {/* Navigation Items */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: isActive(item.path) ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.3)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Button>
          ))}
          
          {/* Divider */}
          <Box sx={{ 
            borderLeft: '1px solid rgba(255,255,255,0.3)', 
            ml: 1, 
            pl: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            {/* User Profile Button */}
            <Tooltip title="Mi Perfil">
              <Button
                color="inherit"
                onClick={() => navigate('/perfil')}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  backgroundColor: isActive('/perfil') ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: isActive('/perfil') ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  },
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 1,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(user?.username)}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                    {user?.username || 'Usuario'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1, fontSize: '0.7rem' }}>
                    Ver perfil
                  </Typography>
                </Box>
              </Button>
            </Tooltip>
            
            {/* Logout Button */}
            <Tooltip title="Cerrar Sesión">
              <IconButton 
                color="inherit" 
                onClick={handleLogout} 
                size="small"
                sx={{
                  p: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
