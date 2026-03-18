import { useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { usuariosService } from '../services/usuariosService.js';
import api from '../services/api.js';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import {
  Avatar,
} from '@mui/material';

const UsuariosCRUD = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
  });

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load users and roles in parallel
      const [usuariosData, rolesData] = await Promise.all([
        authService.getUsers(),
        api.get('/roles').catch(() => ({ data: [] }))
      ]);
      
      setUsuarios(usuariosData || []);
      setRoles(rolesData.data || []);
    } catch (err) {
      setError('Error al cargar los usuarios: ' + (err.message || 'Error desconocido'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        password: '', // Don't show password for editing
        role_id: usuario.role_id || '',
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role_id: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUsuario(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role_id: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Validation
      if (!formData.username.trim()) {
        setError('El nombre de usuario es obligatorio');
        return;
      }
      if (!formData.email.trim()) {
        setError('El email es obligatorio');
        return;
      }
      if (!editingUsuario && !formData.password) {
        setError('La contraseña es obligatoria para nuevos usuarios');
        return;
      }

      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        role_id: formData.role_id || null,
      };

      if (formData.password) {
        userData.password_hash = formData.password;
      }

      if (editingUsuario) {
        await usuariosService.updateUsuario(editingUsuario.id, userData);
      } else {
        await authService.createUser(userData);
      }

      handleCloseDialog();
      loadUsuarios();
    } catch (err) {
      setError('Error al guardar el usuario: ' + (err.message || 'Error desconocido'));
      console.error(err);
    }
  };

  const handleDeleteClick = (usuario) => {
    setUsuarioToDelete(usuario);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await usuariosService.deleteUsuario(usuarioToDelete.id);
      setDeleteConfirmOpen(false);
      setUsuarioToDelete(null);
      loadUsuarios();
    } catch (err) {
      setError('Error al eliminar el usuario: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleName = (roleId) => {
    if (!roleId) return 'Sin rol';
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Rol desconocido';
  };

  const getRoleColor = (roleId) => {
    if (!roleId) return 'default';
    const role = roles.find(r => r.id === roleId);
    const name = role?.name?.toLowerCase() || '';
    if (name.includes('admin')) return 'error';
    if (name.includes('gerente')) return 'warning';
    if (name.includes('supervisor')) return 'info';
    return 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 3, 
          mt: 3,
          background: 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
          color: 'white',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Gestión de Usuarios
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              Administre los usuarios del sistema
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadUsuarios}
              disabled={isLoading}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.15)' },
                borderRadius: 2,
                px: 3
              }}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                borderRadius: 2,
                px: 3
              }}
            >
              Nuevo Usuario
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Creado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography color="text.secondary">No hay usuarios registrados</Typography>
                        <Button variant="contained" sx={{ mt: 2, borderRadius: 2 }} onClick={() => handleOpenDialog()}>
                          Crear Usuario
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow 
                      key={usuario.id} 
                      hover
                      sx={{ '&:hover': { bgcolor: 'rgba(128, 0, 32, 0.04)' } }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: '0.875rem' }}>
                            {usuario.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight="medium">{usuario.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          {usuario.email}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          label={getRoleName(usuario.role_id)} 
                          color={getRoleColor(usuario.role_id)}
                          size="small"
                          icon={<AdminIcon />}
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">{formatDate(usuario.created_at)}</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(usuario)} 
                            size="small"
                            sx={{ '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(usuario)} 
                            size="small"
                            sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Nombre de Usuario *"
                fullWidth
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Correo Electrónico *"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={editingUsuario ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                helperText={editingUsuario ? 'Dejar en blanco para mantener la contraseña actual' : 'Mínimo 6 caracteres'}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role_id}
                  label="Rol"
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingUsuario ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle color="error">Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Eliminar el usuario <strong>"{usuarioToDelete?.username}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosCRUD;
