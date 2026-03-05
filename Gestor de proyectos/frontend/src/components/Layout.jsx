import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { Box, Paper } from '@mui/material';

const Layout = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: '#f5f7fa'
    }}>
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            minHeight: 'calc(100vh - 140px)',
            bgcolor: 'transparent'
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
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 1,
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}>
          <span>© 2026 Sistema de Gestión de Proyectos</span>
          <span>|</span>
          <span>Versión 1.0</span>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
