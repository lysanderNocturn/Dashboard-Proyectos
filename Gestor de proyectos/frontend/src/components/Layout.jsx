import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useState } from 'react';

const drawerWidthExpanded = 280;
const drawerWidthCollapsed = 72;

const Layout = ({ mode, setMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const drawerWidth = sidebarOpen ? drawerWidthExpanded : drawerWidthCollapsed;

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: mode === 'dark' ? '#121212' : '#f8f9fc',
    }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} mode={mode} setMode={setMode} />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        transition: 'min-width 0.3s ease-in-out',
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
      </Box>
    </Box>
  );
};

export default Layout;