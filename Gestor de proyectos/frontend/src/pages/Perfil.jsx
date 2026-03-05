import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usuariosService } from '../services/usuariosService.js';
import api from '../services/api.js';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Fade,
  Zoom,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const Perfil = () => {
  const { user, logout } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    role_id: '',
  });
  
  // Estados para cambio de contraseña
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // Estados para diálogo de confirmación
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cargar datos del usuario y roles
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Cargando datos del perfil...');
        
        // Cargar roles disponibles
        try {
          const rolesResponse = await api.get('/roles');
          setRoles(rolesResponse.data);
        } catch (err) {
          console.warn('No se pudieron cargar los roles:', err);
          setRoles([]);
        }
        
        // Si tenemos el usuario del contexto, cargar sus datos completos
        if (user?.id) {
          console.log('Cargando usuario con ID:', user.id);
          try {
            const userData = await usuariosService.getUsuarioById(user.id);
            console.log('Datos del usuario recibidos:', userData);
            
            // Manejar diferentes formatos de respuesta
            const userInfo = Array.isArray(userData) ? userData[0] : userData;
            
            if (userInfo && userInfo.id) {
              setUsuario(userInfo);
              setEditData({
                username: userInfo.username || '',
                email: userInfo.email || '',
                role_id: userInfo.role_id || '',
              });
            } else {
              throw new Error('Datos de usuario no válidos');
            }
          } catch (err) {
            console.error('Error al cargar usuario:', err);
            // Si falla la carga, usar los datos del contexto
            if (user) {
              setUsuario({
                id: user.id,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
                created_at: new Date().toISOString(),
              });
              setEditData({
                username: user.username || '',
                email: user.email || '',
                role_id: user.role_id || '',
              });
            }
          }
        } else {
          setError('No se encontró información del usuario en la sesión');
        }
      } catch (err) {
        setError('Error al cargar los datos del perfil: ' + (err.message || 'Error desconocido'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Handlers para edición de perfil
  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({
      username: usuario?.username || '',
      email: usuario?.email || '',
      role_id: usuario?.role_id || '',
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      username: usuario?.username || '',
      email: usuario?.email || '',
      role_id: usuario?.role_id || '',
    });
    setError(null);
  };

  const handleSaveProfileClick = () => {
    if (!editData.username.trim() || !editData.email.trim()) {
      setError('El nombre de usuario y email son obligatorios');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      setError('El formato del email no es válido');
      return;
    }
    
    setPendingAction('profile');
    setIsConfirmDialogOpen(true);
    setError(null);
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!usuario?.id) {
        throw new Error('No se encontró el ID del usuario');
      }
      
      // Actualizar el perfil
      await usuariosService.updateUsuario(usuario.id, {
        username: editData.username,
        email: editData.email,
        role_id: editData.role_id || null,
      });
      
      // Actualizar datos locales
      try {
        const updatedUser = await usuariosService.getUsuarioById(usuario.id);
        const userInfo = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser;
        setUsuario(userInfo);
      } catch (err) {
        // Si falla la recarga, actualizar con los datos locales
        setUsuario({ ...usuario, ...editData });
      }
      
      // Actualizar el contexto de autenticación
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserData = { 
        ...currentUser, 
        username: editData.username, 
        email: editData.email,
        role_id: editData.role_id 
      };
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Error al actualizar el perfil: ' + (err.response?.data?.message || err.message || 'Error desconocido'));
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setConfirmPassword('');
      setPendingAction(null);
    }
  };

  // Handlers para cambio de contraseña
  const handlePasswordChangeClick = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos los campos de contraseña son obligatorios');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres');
      return;
    }
    setPendingAction('password');
    setIsConfirmDialogOpen(true);
    setError(null);
  };

  const handleSavePassword = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar contraseña actual y actualizar a la nueva
      await api.post('/auth/change-password', {
        userId: usuario.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSuccessMessage('Contraseña actualizada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setConfirmPassword('');
      setPendingAction(null);
    }
  };

  // Handler para confirmación con contraseña
  const handleConfirmAction = async () => {
    if (!confirmPassword) {
      setError('Debes ingresar tu contraseña para confirmar');
      return;
    }
    
    try {
      setIsLoading(true);
      // Verificar que la contraseña ingresada sea la del usuario
      await api.post('/auth/verify-password', {
        userId: usuario.id,
        password: confirmPassword,
      });
      
      // Si la verificación es exitosa, ejecutar la acción pendiente
      if (pendingAction === 'profile') {
        await handleSaveProfile();
      } else if (pendingAction === 'password') {
        await handleSavePassword();
      }
    } catch (err) {
      setError('Contraseña incorrecta. No se pudo autorizar el cambio.');
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setConfirmPassword('');
      setPendingAction(null);
    }
  };

  const getRoleName = (roleId) => {
    if (!roleId) return 'Sin rol asignado';
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Rol desconocido';
  };

  const getRoleColor = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    const roleName = role?.name?.toLowerCase() || '';
    if (roleName.includes('admin')) return 'error';
    if (roleName.includes('gerente')) return 'warning';
    if (roleName.includes('supervisor')) return 'info';
    return 'default';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading && !usuario) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
        {/* Header con gradiente */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
            color: 'white',
            borderRadius: 4,
            textAlign: 'center'
          }}
        >
          <Zoom in>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: 40,
                border: '4px solid rgba(255,255,255,0.3)'
              }}
            >
              {getInitials(usuario?.username)}
            </Avatar>
          </Zoom>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {usuario?.username || 'Usuario'}
          </Typography>
          <Chip 
            label={getRoleName(usuario?.role_id)} 
            color={getRoleColor(usuario?.role_id)}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              '& .MuiChip-label': { color: 'white' }
            }}
            icon={<AdminIcon sx={{ color: 'white !important' }} />}
          />
        </Paper>

        {/* Mensajes */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Información del Perfil */}
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon color="primary" />
                    Información del Perfil
                  </Typography>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditClick}
                      sx={{ borderRadius: 2 }}
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveProfileClick}
                        sx={{ borderRadius: 2 }}
                      >
                        Guardar
                      </Button>
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre de Usuario"
                      value={isEditing ? editData.username : usuario?.username || ''}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color={isEditing ? "primary" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Correo Electrónico"
                      type="email"
                      value={isEditing ? editData.email : usuario?.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color={isEditing ? "primary" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel id="role-select-label">Rol del Usuario</InputLabel>
                      <Select
                        labelId="role-select-label"
                        value={isEditing ? editData.role_id : usuario?.role_id || ''}
                        label="Rol del Usuario"
                        onChange={(e) => setEditData({ ...editData, role_id: e.target.value })}
                        startAdornment={
                          <InputAdornment position="start">
                            <AdminIcon color={isEditing ? "primary" : "action"} />
                          </InputAdornment>
                        }
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">
                          <em>Sin rol asignado</em>
                        </MenuItem>
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Información adicional */}
                <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Información de la Cuenta
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Creado: {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UpdateIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Actualizado: {usuario?.updated_at ? new Date(usuario.updated_at).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          ID de Usuario: {usuario?.id || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Acciones del Perfil */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" />
                  Seguridad
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setIsPasswordDialogOpen(true)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      py: 1.5,
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body1" fontWeight="medium">
                        Cambiar Contraseña
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Actualiza tu contraseña de acceso
                      </Typography>
                    </Box>
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={logout}
                    sx={{ 
                      mt: 'auto',
                      py: 1.5,
                      borderRadius: 2
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Diálogo para cambiar contraseña */}
        <Dialog 
          open={isPasswordDialogOpen} 
          onClose={() => {
            setIsPasswordDialogOpen(false);
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
            setError(null);
          }} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <LockIcon />
            Cambiar Contraseña
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña Actual"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPasswords.current ? 'Ocultar' : 'Mostrar'}>
                          <IconButton onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                            {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  helperText="Mínimo 6 caracteres"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPasswords.new ? 'Ocultar' : 'Mostrar'}>
                          <IconButton onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                            {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPasswords.confirm ? 'Ocultar' : 'Mostrar'}>
                          <IconButton onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                            {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                setError(null);
              }}
              color="inherit"
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handlePasswordChangeClick}
              startIcon={<SaveIcon />}
            >
              Continuar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de confirmación con contraseña */}
        <Dialog 
          open={isConfirmDialogOpen} 
          onClose={() => {
            setIsConfirmDialogOpen(false);
            setConfirmPassword('');
            setPendingAction(null);
          }} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <SecurityIcon />
            Confirmar Cambios
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Para autorizar los cambios, por favor ingresa tu contraseña actual:
            </Typography>
            <TextField
              fullWidth
              label="Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showConfirmPassword ? 'Ocultar' : 'Mostrar'}>
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setConfirmPassword('');
                setPendingAction(null);
              }}
              color="inherit"
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleConfirmAction} 
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Perfil;
