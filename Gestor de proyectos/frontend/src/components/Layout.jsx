import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { Box } from '@mui/material';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#e9e9e9' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
