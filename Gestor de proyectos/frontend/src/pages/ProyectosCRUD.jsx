import { useState, useEffect } from 'react';
import { proyectosService } from '../services/proyectosService.js';
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
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const ProyectosCRUD = () => {
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado_actual: 'Activo',
    evaluacion: '',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [proyectoToDelete, setProyectoToDelete] = useState(null);

  const loadProyectos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await proyectosService.getProyectos();
      setProyectos(data);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProyectos();
  }, []);

  const handleOpenDialog = (proyecto = null) => {
    if (proyecto) {
      setEditingProyecto(proyecto);
      setFormData({
        nombre: proyecto.nombre || '',
        descripcion: proyecto.descripcion || '',
        estado_actual: proyecto.estado_actual || 'Activo',
        evaluacion: proyecto.evaluacion || '',
      });
    } else {
      setEditingProyecto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        estado_actual: 'Activo',
        evaluacion: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProyecto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      estado_actual: 'Activo',
      evaluacion: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Validación básica
      if (!formData.nombre.trim()) {
        setError('El nombre del proyecto es obligatorio');
        return;
      }
      
      if (editingProyecto) {
        await proyectosService.updateProyecto(editingProyecto.id, formData);
      } else {
        await proyectosService.createProyecto(formData);
      }
      handleCloseDialog();
      loadProyectos();
    } catch (err) {
      setError('Error al guardar el proyecto: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleDeleteClick = (proyecto) => {
    setProyectoToDelete(proyecto);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await proyectosService.deleteProyecto(proyectoToDelete.id);
      setDeleteConfirmOpen(false);
      setProyectoToDelete(null);
      loadProyectos();
    } catch (err) {
      setError('Error al eliminar el proyecto');
      console.error(err);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Activo': 'success',
      'En Progreso': 'info',
      'Pendiente': 'warning',
      'Completado': 'default',
      'Cancelado': 'error',
    };
    return colores[estado] || 'default';
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Proyectos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadProyectos}
            disabled={isLoading}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Proyecto
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Descripción</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Evaluación</strong></TableCell>
                  <TableCell><strong>Creado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay proyectos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  proyectos.map((proyecto) => (
                    <TableRow key={proyecto.id} hover>
                      <TableCell>{proyecto.id}</TableCell>
                      <TableCell>{proyecto.nombre}</TableCell>
                      <TableCell>
                        {proyecto.descripcion?.length > 50
                          ? `${proyecto.descripcion.substring(0, 50)}...`
                          : proyecto.descripcion || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={proyecto.estado_actual || 'Sin estado'}
                          color={getEstadoColor(proyecto.estado_actual)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {proyecto.evaluacion?.length > 40
                          ? `${proyecto.evaluacion.substring(0, 40)}...`
                          : proyecto.evaluacion || '-'}
                      </TableCell>
                      <TableCell>{formatDate(proyecto.created_at)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(proyecto)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(proyecto)}
                            size="small"
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

      {/* Dialog para Crear/Editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Nombre del Proyecto *"
                fullWidth
                variant="outlined"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Estado Actual *"
                fullWidth
                variant="outlined"
                select
                SelectProps={{ native: true }}
                value={formData.estado_actual}
                onChange={(e) => setFormData({ ...formData, estado_actual: e.target.value })}
                required
              >
                <option value="Activo">Activo</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Evaluación"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                placeholder="Ingrese la evaluación del proyecto..."
                value={formData.evaluacion}
                onChange={(e) => setFormData({ ...formData, evaluacion: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProyecto ? 'Guardar Cambios' : 'Crear Proyecto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmación para Eliminar */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el proyecto "{proyectoToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProyectosCRUD;
