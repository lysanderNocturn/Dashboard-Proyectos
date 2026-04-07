import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  Tooltip,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Divider,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';

const pageNames = {
  '/dashboard': 'Panel Principal',
  '/proyectos': 'Gestión de Proyectos',
  '/avance': 'Avance Trimestral',
  '/parametros': 'Configuración',
  '/presupuestos': 'Presupuestos',
  '/usuarios': 'Gestión de Usuarios',
  '/perfil': 'Mi Perfil',
};

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitialsFunc = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const currentPage = pageNames[location.pathname] || 'Gestor de Proyectos';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #ffffff 0%, #fafafa 100%)',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        ml: '280px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
        {/* Page Title / Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#800020',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {currentPage}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Bienvenido • {new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search (visual only for now) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.04)',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              mr: 1,
              width: 200,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.06)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <SearchIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Buscar..."
              sx={{ 
                fontSize: '0.875rem',
                width: '100%',
                '& input::placeholder': {
                  color: 'text.secondary',
                  opacity: 1,
                },
              }}
            />
          </Box>

          {/* Notifications */}
          <Tooltip title="Notificaciones">
            <IconButton
              size="small"
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'rgba(128, 0, 32, 0.08)',
                  color: '#800020',
                },
              }}
            >
              <Badge 
                badgeContent={0} 
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />

          {/* User Profile */}
          <Tooltip title="Mi Perfil">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(128, 0, 32, 0.04)',
                  border: '1px solid rgba(128, 0, 32, 0.1)',
                },
              }}
              onClick={() => navigate('/perfil')}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#800020',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: '2px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 8px rgba(128,0,32,0.3)',
                }}
              >
                {getInitialsFunc(user?.username)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  {user?.username || 'Usuario'}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    lineHeight: 1, 
                    fontSize: '0.7rem',
                  }}
                >
                  {user?.role_id === 1 ? 'Administrador' : 'Usuario'}
                </Typography>
              </Box>
              <ArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Cerrar Sesión">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                ml: 0.5,
                p: 1,
                borderRadius: 2,
                color: 'text.secondary',
                bgcolor: 'rgba(244,67,54,0.08)',
                border: '1px solid rgba(244,67,54,0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(244,67,54,0.15)',
                  color: '#f44336',
                  border: '1px solid rgba(244,67,54,0.4)',
                },
              }}
            >
              <LogoutIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;