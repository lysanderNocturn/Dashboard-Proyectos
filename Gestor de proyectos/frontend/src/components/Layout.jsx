import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';

const drawerWidth = 280;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#f8f9fc',
    }}>
      <Sidebar />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
      }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            background: 'linear-gradient(180deg, #f8f9fc 0%, #eef1f5 100%)',
            minHeight: 'calc(100vh - 80px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background: 'radial-gradient(ellipse at top, rgba(128,0,32,0.03) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              minHeight: '100%',
              bgcolor: 'transparent',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Outlet />
          </Paper>
        </Box>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          bgcolor: '#ffffff',
          borderTop: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          color: 'text.secondary',
          fontSize: '0.8rem',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: '#4caf50',
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4caf50' }} />
            <span>Sistema activo</span>
          </Box>
          <Box sx={{ width: 1, height: 12, bgcolor: 'divider' }} />
          <span>© 2026 Gestor de Proyectos</span>
          <Box sx={{ width: 1, height: 12, bgcolor: 'divider' }} />
          <span>Versión 1.0</span>
        </Box>
      </Box>
    </Box>
  </Box>
  );
};

export default Layout;