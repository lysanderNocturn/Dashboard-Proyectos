import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const validateForm = () => {
    if (!username.trim()) {
      setLoginError('El usuario es requerido');
      return false;
    }
    if (!password) {
      setLoginError('La contraseña es requerida');
      return false;
    }
    if (username.length < 3) {
      setLoginError('El usuario debe tener al menos 3 caracteres');
      return false;
    }
    if (password.length < 4) {
      setLoginError('La contraseña debe tener al menos 4 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginError(null);

    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 50%)',
          animation: 'pulse 15s infinite',
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          maxWidth: 450,
          width: '100%',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeIn 0.6s ease-out',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #800020 0%, #a24b4b 50%, #800020 100%)',
          }
        }}
      >
        {/* Logo/Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              fontSize: '1.75rem',
              fontWeight: 'bold',
              boxShadow: '0 8px 24px rgba(128, 0, 32, 0.35)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 32px rgba(128, 0, 32, 0.45)',
              }
            }}
          >
            GP
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
            Gestor de Proyectos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Sistema de Planificación y Gestión
          </Typography>
        </Box>

        {(loginError || authError) && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light'
            }} 
            onClose={() => setLoginError(null)}
          >
            {loginError || authError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2.5,
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                }
              }
            }}
          />
          
          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                }
              }
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              mt: 1,
              mb: 3,
              py: 1.75,
              fontWeight: 'bold',
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(128, 0, 32, 0.35)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(128, 0, 32, 0.45)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                boxShadow: 'none',
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Help text */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Credenciales de prueba: admin / 123456
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
