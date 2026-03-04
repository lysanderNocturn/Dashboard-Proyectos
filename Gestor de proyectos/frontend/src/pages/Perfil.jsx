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
} from '@mui/icons-material';

const Perfil = () => {
  const { user, login } = useAuth();
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
  const [pendingAction, setPendingAction] = useState(null); // 'profile' | 'password'
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cargar datos del usuario y roles
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cargar roles disponibles
        const rolesResponse = await api.get('/roles');
        setRoles(rolesResponse.data);
        
        // Si tenemos el usuario del contexto, cargar sus datos completos
        if (user?.id) {
          const userData = await usuariosService.getUsuarioById(user.id);
          const userInfo = Array.isArray(userData) ? userData[0] : userData;
          setUsuario(userInfo);
          setEditData({
            username: userInfo.username || '',
            email: userInfo.email || '',
            role_id: userInfo.role_id || '',
          });
        }
      } catch (err) {
        setError('Error al cargar los datos del perfil');
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
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      username: usuario?.username || '',
      email: usuario?.email || '',
      role_id: usuario?.role_id || '',
    });
  };

  const handleSaveProfileClick = () => {
    if (!editData.username.trim() || !editData.email.trim()) {
      setError('El nombre de usuario y email son obligatorios');
      return;
    }
    setPendingAction('profile');
    setIsConfirmDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Actualizar el perfil
      await usuariosService.updateUsuario(usuario.id, {
        username: editData.username,
        email: editData.email,
        role_id: editData.role_id,
      });
      
      // Actualizar datos locales
      const updatedUser = await usuariosService.getUsuarioById(usuario.id);
      const userInfo = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser;
      setUsuario(userInfo);
      
      // Actualizar el contexto de autenticación
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const newUserData = { ...currentUser, username: userInfo.username, email: userInfo.email };
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Error al actualizar el perfil. Verifica que el email no esté en uso.');
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
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Sin rol asignado';
  };

  if (isLoading && !usuario) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon fontSize="large" />
        Mi Perfil
        <Chip label={getRoleName(usuario?.role_id)} color="primary" sx={{ ml: 1 }} />
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información del Perfil */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BadgeIcon />
                  Información del Perfil
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    Editar
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfileClick}
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
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={isEditing ? editData.email : usuario?.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel id="role-select-label">Rol</InputLabel>
                    <Select
                      labelId="role-select-label"
                      value={isEditing ? editData.role_id : usuario?.role_id || ''}
                      label="Rol"
                      onChange={(e) => setEditData({ ...editData, role_id: e.target.value })}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones del Perfil */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon />
                Seguridad
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setIsPasswordDialogOpen(true)}
                sx={{ mb: 2 }}
              >
                Cambiar Contraseña
              </Button>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                ID de Usuario: {usuario?.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Creado: {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña Actual"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nueva Contraseña"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                      <IconButton onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPasswordDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handlePasswordChangeClick}>
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación con contraseña */}
      <Dialog open={isConfirmDialogOpen} onClose={() => setIsConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon color="warning" />
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
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsConfirmDialogOpen(false);
            setConfirmPassword('');
            setPendingAction(null);
          }}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmAction} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Perfil;
