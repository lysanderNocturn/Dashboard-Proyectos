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
  Palette as DiseñoIcon,
} from '@mui/icons-material';
import { unidadService, departamentoService, ejeService } from '../services/parametrosService.js';

const Parametros = () => {
  const [tab, setTab] = useState(0);
  const [unidades, setUnidades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ejes, setEjes] = useState([]);
  const [designConfig, setDesignConfig] = useState(() => {
    const saved = localStorage.getItem('designConfig');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#800020',
      secondaryColor: '#722F37',
      logo: null,
    };
  });
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
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ position: 'relative', zIndex: 1 }}>
            Parámetros del Sistema
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1, position: 'relative', zIndex: 1 }}>
            Administra las unidades administrativas, departamentos y ejes
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 64,
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                fontSize: '0.9rem',
                minHeight: 64,
                py: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(128, 0, 32, 0.04)',
                }
              },
              '& .Mui-selected': { color: 'primary.main' },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
              },
            }}
          >
            <Tab 
              icon={<UnidadIcon />} 
              label="Unidades" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<DepartamentoIcon />} 
              label="Departamentos" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<EjeIcon />}
              label="Ejes"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<DiseñoIcon />}
              label="Diseño"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Paper>

        {/* Contenido */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(null, tab)}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Agregar
            </Button>
          </Box>

          {tab === 0 && (
            // Unidades Administrativas
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unidades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <UnidadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography color="text.secondary">No hay unidades administrativas</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    unidades.map((item) => (
                      <TableRow 
                        key={item.id} 
                        hover
                        sx={{ '&:hover': { bgcolor: 'rgba(128, 0, 32, 0.04)' } }}
                      >
                        <TableCell sx={{ py: 2 }}>{item.id}</TableCell>
                        <TableCell sx={{ py: 2 }}><Typography fontWeight="medium">{item.nombre}</Typography></TableCell>
                        <TableCell sx={{ py: 2 }}>{item.descripcion}</TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(item, tab)}
                            sx={{ '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(item.id)}
                            sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                          >
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
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Unidad Administrativa</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <DepartamentoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography color="text.secondary">No hay departamentos</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    departamentos.map((item) => (
                      <TableRow 
                        key={item.id} 
                        hover
                        sx={{ '&:hover': { bgcolor: 'rgba(128, 0, 32, 0.04)' } }}
                      >
                        <TableCell sx={{ py: 2 }}>{item.id}</TableCell>
                        <TableCell sx={{ py: 2 }}><Typography fontWeight="medium">{item.nombre}</Typography></TableCell>
                        <TableCell sx={{ py: 2 }}>{getUnidadNombre(item.unidad_administrativa_id)}</TableCell>
                        <TableCell sx={{ py: 2 }}>{item.descripcion}</TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(item, tab)}
                            sx={{ '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(item.id)}
                            sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                          >
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
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Año</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ejes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <EjeIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography color="text.secondary">No hay ejes</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    ejes.map((item) => (
                      <TableRow 
                        key={item.id} 
                        hover
                        sx={{ '&:hover': { bgcolor: 'rgba(128, 0, 32, 0.04)' } }}
                      >
                        <TableCell sx={{ py: 2 }}>{item.id}</TableCell>
                        <TableCell sx={{ py: 2 }}><Typography fontWeight="medium">{item.nombre}</Typography></TableCell>
                        <TableCell sx={{ py: 2 }}>{item.descripcion}</TableCell>
                        <TableCell sx={{ py: 2 }}>{item.ano}</TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(item, tab)}
                            sx={{ '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(item.id)}
                            sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                          >
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

          {tab === 3 && (
            // Diseño
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 4 }}>
                Configuración de Diseño del Sistema
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 600 }}>
                {/* Color Primario */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                    Color Primario
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={designConfig.primaryColor}
                      onChange={(e) => setDesignConfig({ ...designConfig, primaryColor: e.target.value })}
                      style={{ width: 60, height: 40, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    />
                    <TextField
                      value={designConfig.primaryColor}
                      onChange={(e) => setDesignConfig({ ...designConfig, primaryColor: e.target.value })}
                      placeholder="#800020"
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Color Secundario */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                    Color Secundario
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={designConfig.secondaryColor}
                      onChange={(e) => setDesignConfig({ ...designConfig, secondaryColor: e.target.value })}
                      style={{ width: 60, height: 40, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    />
                    <TextField
                      value={designConfig.secondaryColor}
                      onChange={(e) => setDesignConfig({ ...designConfig, secondaryColor: e.target.value })}
                      placeholder="#722F37"
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Logotipo */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                    Logotipo Principal
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {designConfig.logo && (
                      <Box
                        component="img"
                        src={designConfig.logo}
                        sx={{ width: 60, height: 60, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 1 }}
                      />
                    )}
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ minWidth: 200 }}
                    >
                      {designConfig.logo ? 'Cambiar Logotipo' : 'Seleccionar Logotipo'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setDesignConfig({ ...designConfig, logo: event.target.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Button>
                    {designConfig.logo && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setDesignConfig({ ...designConfig, logo: null })}
                      >
                        Eliminar
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Vista Previa */}
                <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Vista Previa
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 100,
                      borderRadius: 2,
                      bgcolor: designConfig.primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      position: 'relative',
                    }}
                  >
                    {designConfig.logo && (
                      <Box
                        component="img"
                        src={designConfig.logo}
                        sx={{
                          position: 'absolute',
                          width: 40,
                          height: 40,
                          objectFit: 'contain',
                          opacity: 0.8,
                        }}
                      />
                    )}
                    Color Primario con Logotipo
                  </Box>
                </Box>

                {/* Botón Guardar */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      localStorage.setItem('designConfig', JSON.stringify(designConfig));
                      alert('Configuración guardada. Recarga la página para aplicar los cambios.');
                    }}
                    sx={{ minWidth: 200 }}
                  >
                    Guardar Configuración
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ 
            sx: { borderRadius: 3 } 
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" fontWeight="medium">
              {editingItem ? 'Editar' : 'Nuevo'} {' '}
              {tab === 0 ? 'Unidad Administrativa' : 
               tab === 1 ? 'Departamento' : 'Eje'}
            </Typography>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                autoFocus
                required
                variant="outlined"
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />
              {tab === 1 && (
                <FormControl 
                  fullWidth 
                  variant="outlined" 
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                >
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
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              color="inherit" 
              variant="outlined"
              sx={{ minWidth: 120, borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={isLoading}
              sx={{ minWidth: 120, borderRadius: 2 }}
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
