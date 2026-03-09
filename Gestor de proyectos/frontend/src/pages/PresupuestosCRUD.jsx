import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { presupuestoService } from '../services/presupuestosService.js';
import { unidadService, departamentoService } from '../services/parametrosService.js';

const formatearMonto = (monto) => {
  if (!monto) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(monto);
};

const PresupuestosCRUD = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    monto: '',
    ano: new Date().getFullYear(),
    unidad_administrativa_id: '',
    departamento_id: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [presupuestosData, unidadesData, departamentosData] = await Promise.all([
        presupuestoService.getPresupuestos(),
        unidadService.getUnidades(),
        departamentoService.getDepartamentos(),
      ]);
      setPresupuestos(presupuestosData || []);
      setUnidades(unidadesData || []);
      setDepartamentos(departamentosData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    setFormErrors({});
    if (item) {
      setFormData({
        monto: item.monto || '',
        ano: item.ano || new Date().getFullYear(),
        unidad_administrativa_id: item.unidad_administrativa_id || '',
        departamento_id: item.departamento_id || '',
      });
    } else {
      setFormData({
        monto: '',
        ano: new Date().getFullYear(),
        unidad_administrativa_id: '',
        departamento_id: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.monto || formData.monto === '') {
      errors.monto = 'El monto es requerido';
    } else if (Number(formData.monto) < 0) {
      errors.monto = 'El monto no puede ser negativo';
    } else if (Number(formData.monto) > 999999999999) {
      errors.monto = 'El monto excede el límite permitido';
    }
    
    if (!formData.ano) {
      errors.ano = 'El año es requerido';
    } else if (Number(formData.ano) < 2000 || Number(formData.ano) > 2100) {
      errors.ano = 'El año debe estar entre 2000 y 2100';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      const data = {
        ...formData,
        monto: Number(formData.monto),
        ano: Number(formData.ano),
        unidad_administrativa_id: formData.unidad_administrativa_id || null,
        departamento_id: formData.departamento_id || null,
      };

      if (editingItem?.id) {
        await presupuestoService.updatePresupuesto(editingItem.id, data);
      } else {
        await presupuestoService.createPresupuesto(data);
      }
      handleCloseDialog();
      loadData();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este presupuesto?')) return;
    try {
      setIsLoading(true);
      await presupuestoService.deletePresupuesto(id);
      loadData();
    } catch (err) {
      console.error('Error deleting:', err);
      setError('Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  const getUnidadNombre = (unidadId) => {
    const unidad = unidades.find(u => u.id === unidadId);
    return unidad?.nombre || '-';
  };

  const getDepartamentoNombre = (departamentoId) => {
    const depto = departamentos.find(d => d.id === departamentoId);
    return depto?.nombre || '-';
  };

  if (isLoading && presupuestos.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Fade in>
      <Box>
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Presupuestos
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Administra los presupuestos disponibles para asignar a proyectos
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Contenido */}
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="medium">
              Lista de Presupuestos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(null)}
            >
              Nuevo Presupuesto
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Año</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Unidad Administrativa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Departamento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presupuestos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No hay presupuestos registrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  presupuestos.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <Typography fontWeight="bold" color="primary">
                          {formatearMonto(item.monto)}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.ano}</TableCell>
                      <TableCell>{getUnidadNombre(item.unidad_administrativa_id)}</TableCell>
                      <TableCell>{getDepartamentoNombre(item.departamento_id)}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleOpenDialog(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="medium">
                {editingItem ? 'Editar' : 'Nuevo'} Presupuesto
              </Typography>
              <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                fullWidth
                label="Monto"
                type="number"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                autoFocus
                required
                variant="outlined"
                size="medium"
                error={!!formErrors.monto}
                helperText={formErrors.monto}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                }}
              />
              <TextField
                fullWidth
                label="Año"
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                variant="outlined"
                size="medium"
                error={!!formErrors.ano}
                helperText={formErrors.ano}
                inputProps={{ min: 2000, max: 2100 }}
              />
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel>Unidad Administrativa</InputLabel>
                <Select
                  value={formData.unidad_administrativa_id || ''}
                  label="Unidad Administrativa"
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    unidad_administrativa_id: e.target.value,
                    departamento_id: '' // Reset department when unit changes
                  })}
                >
                  <MenuItem value="">
                    <em>Seleccione una opción</em>
                  </MenuItem>
                  {unidades.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined" size="medium" disabled={!formData.unidad_administrativa_id}>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={formData.departamento_id || ''}
                  label="Departamento"
                  onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Seleccione una opción</em>
                  </MenuItem>
                  {departamentos
                    .filter(d => !formData.unidad_administrativa_id || d.unidad_administrativa_id === formData.unidad_administrativa_id)
                    .map((d) => (
                      <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              color="inherit" 
              variant="outlined"
              sx={{ minWidth: 100 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={isLoading}
              sx={{ minWidth: 100 }}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default PresupuestosCRUD;
