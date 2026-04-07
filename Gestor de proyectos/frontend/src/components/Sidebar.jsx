import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Settings as ParametrosIcon,
  AttachMoney as MoneyIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: <DashboardIcon />, badge: null },
  { path: '/proyectos', label: 'Proyectos', icon: <FolderIcon />, badge: null },
  { path: '/avance', label: 'Avance Trimestral', icon: <TimelineIcon />, badge: null },
  { path: '/parametros', label: 'Parámetros', icon: <ParametrosIcon />, badge: null },
  { path: '/presupuestos', label: 'Presupuestos', icon: <MoneyIcon />, badge: null },
  { path: '/usuarios', label: 'Usuarios', icon: <PeopleIcon />, badge: null },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #800020 0%, #5c0017 100%)',
          color: 'white',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header con Logo */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
      }}>
        <Box
          sx={{
            position: 'relative',
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a24b4b 0%, #800020 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            border: '3px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
            GP
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 0.5,
            background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Gestor de Proyectos
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <CircleIcon sx={{ fontSize: 8, color: '#4caf50' }} />
          <Typography variant="caption" sx={{ opacity: 0.8, color: '#4caf50' }}>
            Sistema activo
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, pt: 2, px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip 
              title={item.label} 
              placement="right" 
              arrow
              sx={{
                '& .MuiTooltip-tooltip': {
                  bgcolor: 'rgba(0,0,0,0.8)',
                  fontSize: '0.75rem',
                }
              }}
            >
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.18)' : 'transparent',
                  border: isActive(item.path) ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': isActive(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    borderRadius: '0 4px 4px 0',
                    bgcolor: 'white',
                  } : {},
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root': {
                      transform: 'scale(1.1)',
                    },
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.8)', 
                    minWidth: 44,
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 'bold' : 'medium',
                    fontSize: '0.95rem',
                  }}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.9)',
                    },
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 2 }} />

      {/* User Info & Logout */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.08)',
            mb: 1,
          }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {getInitials(user?.username)}
          </Avatar>
          <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.username || 'Usuario'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.6)',
                display: 'block',
              }}
            >
              {user?.role_id === 1 ? 'Administrador' : 'Usuario'}
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="Cerrar sesión" placement="top" arrow>
          <Box
            onClick={handleLogout}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1,
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: 'rgba(244,67,54,0.15)',
              border: '1px solid rgba(244,67,54,0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(244,67,54,0.25)',
                transform: 'scale(1.02)',
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: 18, color: '#ff6b6b' }} />
            <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 'medium' }}>
              Cerrar Sesión
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;