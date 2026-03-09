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
  Business as UnidadIcon,
  Groups as DepartamentoIcon,
  Flag as EjeIcon,
} from '@mui/icons-material';
import { unidadService, departamentoService, ejeService } from '../services/parametrosService.js';

const Parametros = () => {
  const [tab, setTab] = useState(0);
  const [unidades, setUnidades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ejes, setEjes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidad_administrativa_id: '',
    ano: new Date().getFullYear(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [unidadesData, departamentosData, ejesData] = await Promise.all([
        unidadService.getUnidades(),
        departamentoService.getDepartamentos(),
        ejeService.getEjes(),
      ]);
      setUnidades(unidadesData || []);
      setDepartamentos(departamentosData || []);
      setEjes(ejesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (item = null, tipoTab) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        unidad_administrativa_id: item.unidad_administrativa_id || '',
        ano: item.ano || new Date().getFullYear(),
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        unidad_administrativa_id: '',
        ano: new Date().getFullYear(),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (tab === 0) {
        // Unidad Administrativa
        if (editingItem?.id) {
          await unidadService.updateUnidad(editingItem.id, formData);
        } else {
          await unidadService.createUnidad(formData);
        }
      } else if (tab === 1) {
        // Departamento
        const data = {
          ...formData,
          unidad_administrativa_id: formData.unidad_administrativa_id || null,
        };
        if (editingItem?.id) {
          await departamentoService.updateDepartamento(editingItem.id, data);
        } else {
          await departamentoService.createDepartamento(data);
        }
      } else if (tab === 2) {
        // Eje
        if (editingItem?.id) {
          await ejeService.updateEje(editingItem.id, formData);
        } else {
          await ejeService.createEje(formData);
        }
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
    if (!window.confirm('¿Está seguro de eliminar este elemento?')) return;
    try {
      setIsLoading(true);
      if (tab === 0) {
        await unidadService.deleteUnidad(id);
      } else if (tab === 1) {
        await departamentoService.deleteDepartamento(id);
      } else if (tab === 2) {
        await ejeService.deleteEje(id);
      }
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

  if (isLoading && unidades.length === 0) {
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
            background: 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Parámetros del Sistema
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Administra las unidades administrativas, departamentos y ejes
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { fontWeight: 'bold' },
              '& .Mui-selected': { color: 'primary.main' },
            }}
          >
            <Tab icon={<UnidadIcon />} label="Unidades Administrativas" />
            <Tab icon={<DepartamentoIcon />} label="Departamentos" />
            <Tab icon={<EjeIcon />} label="Ejes" />
          </Tabs>
        </Paper>

        {/* Contenido */}
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(null, tab)}
            >
              Agregar
            </Button>
          </Box>

          {tab === 0 && (
            // Unidades Administrativas
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unidades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No hay unidades administrativas</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    unidades.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.id}</TableCell>
                        <TableCell><Typography fontWeight="medium">{item.nombre}</Typography></TableCell>
                        <TableCell>{item.descripcion}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleOpenDialog(item, tab)}>
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
          )}

          {tab === 1 && (
            // Departamentos
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Unidad Administrativa</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No hay departamentos</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    departamentos.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.id}</TableCell>
                        <TableCell><Typography fontWeight="medium">{item.nombre}</Typography></TableCell>
                        <TableCell>{getUnidadNombre(item.unidad_administrativa_id)}</TableCell>
                        <TableCell>{item.descripcion}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleOpenDialog(item, tab)}>
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
          )}

          {tab === 2 && (
            // Ejes
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Año</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ejes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No hay ejes</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    ejes.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.id}</TableCell>
                        <TableCell><Typography fontWeight="medium">{item.nombre}</Typography></TableCell>
                        <TableCell>{item.descripcion}</TableCell>
                        <TableCell>{item.ano}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleOpenDialog(item, tab)}>
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
          )}
        </Paper>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="medium">
                {editingItem ? 'Editar' : 'Nuevo'} {' '}
                {tab === 0 ? 'Unidad Administrativa' : 
                 tab === 1 ? 'Departamento' : 'Eje'}
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
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                autoFocus
                required
                variant="outlined"
                size="medium"
              />
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                variant="outlined"
                size="medium"
                placeholder="Ingrese una descripción"
              />
              {tab === 1 && (
                <FormControl fullWidth variant="outlined" size="medium">
                  <InputLabel>Unidad Administrativa</InputLabel>
                  <Select
                    value={formData.unidad_administrativa_id || ''}
                    label="Unidad Administrativa"
                    onChange={(e) => setFormData({ ...formData, unidad_administrativa_id: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Seleccione una opción</em>
                    </MenuItem>
                    {unidades.map((u) => (
                      <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {tab === 2 && (
                <TextField
                  fullWidth
                  label="Año"
                  type="number"
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                  variant="outlined"
                  size="medium"
                  inputProps={{ min: 2000, max: 2100 }}
                />
              )}
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

export default Parametros;
