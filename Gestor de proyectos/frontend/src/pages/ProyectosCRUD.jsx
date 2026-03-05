import { useState, useEffect } from 'react';
import { proyectosService } from '../services/proyectosService.js';
import { ejeService } from '../services/parametrosService.js';
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
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  AccessTime as TimeIcon,
  PieChart as PieChartIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const steps = ['Información Básica', 'Objetivo y Meta', 'Distribución Trimestral'];

const ProyectosCRUD = () => {
  const [proyectos, setProyectos] = useState([]);
  const [ejes, setEjes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado_actual: 'Activo',
    evaluacion: '',
    objetivo: '',
    meta_total: 100,
    duracion_anos: 1,
    medida_tipo: 'porcentaje',
    fecha_inicio: '',
    fecha_fin: '',
    ejes_id: '',
    trimestres: [],
  });
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [proyectoToDelete, setProyectoToDelete] = useState(null);

  // Generate trimestres
  const generateTrimestres = (duracionAnos, metaTotal, medidaTipo) => {
    const trimestres = [];
    const totalTrimestres = duracionAnos * 4;
    const metaBase = medidaTipo === 'porcentaje' ? 100 : metaTotal;
    const metaPorTrimestre = metaBase / totalTrimestres;
    const porcentajePorTrimestre = 100 / totalTrimestres;
    
    for (let ano = 1; ano <= duracionAnos; ano++) {
      for (let trimestre = 1; trimestre <= 4; trimestre++) {
        trimestres.push({
          ano,
          trimestre,
          meta: Math.round(metaPorTrimestre * 100) / 100,
          porcentaje: Math.round(porcentajePorTrimestre * 100) / 100,
        });
      }
    }
    return trimestres;
  };

  const loadProyectos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [proyectosData, ejesData] = await Promise.all([
        proyectosService.getProyectos(),
        ejeService.getEjes()
      ]);
      console.log('Proyectos cargados:', proyectosData);
      setProyectos(proyectosData || []);
      setEjes(ejesData || []);
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('Error al cargar los proyectos: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProyectos();
  }, []);

  const handleOpenDialog = (proyecto = null, view = false) => {
    setViewMode(view);
    setActiveStep(0);
    setError(null);
    
    if (proyecto) {
      setEditingProyecto(proyecto);
      const duracion = proyecto.duracion_anos || 1;
      const meta = proyecto.meta_total || 100;
      const medida = proyecto.medida_tipo || 'porcentaje';
      const existingTrimestres = proyecto.trimestres || [];
      
      setFormData({
        nombre: proyecto.nombre || '',
        descripcion: proyecto.descripcion || '',
        estado_actual: proyecto.estado_actual || 'Activo',
        evaluacion: proyecto.evaluacion || '',
        objetivo: proyecto.objetivo || '',
        meta_total: meta,
        duracion_anos: duracion,
        medida_tipo: medida,
        fecha_inicio: proyecto.fecha_inicio ? proyecto.fecha_inicio.split('T')[0] : '',
        fecha_fin: proyecto.fecha_fin ? proyecto.fecha_fin.split('T')[0] : '',
        ejes_id: proyecto.ejes_id || '',
        trimestres: existingTrimestres.length > 0 ? existingTrimestres : generateTrimestres(duracion, meta, medida),
      });
    } else {
      setEditingProyecto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        estado_actual: 'Activo',
        evaluacion: '',
        objetivo: '',
        meta_total: 100,
        duracion_anos: 1,
        medida_tipo: 'porcentaje',
        fecha_inicio: '',
        fecha_fin: '',
        ejes_id: '',
        trimestres: generateTrimestres(1, 100, 'porcentaje'),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProyecto(null);
    setViewMode(false);
    setActiveStep(0);
    setError(null);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = (step) => {
    setError(null);
    switch (step) {
      case 0:
        if (!formData.nombre.trim()) {
          setError('El nombre del proyecto es obligatorio');
          return false;
        }
        return true;
      case 1:
        if (!formData.objetivo.trim()) {
          setError('El objetivo del proyecto es obligatorio');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dataToSend = {
        ...formData,
        trimestres: formData.trimestres
      };
      
      console.log('Enviando datos:', dataToSend);
      
      if (editingProyecto) {
        await proyectosService.updateProyecto(editingProyecto.id, dataToSend);
      } else {
        await proyectosService.createProyecto(dataToSend);
      }
      
      handleCloseDialog();
      await loadProyectos();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al guardar el proyecto: ' + (err.response?.data?.message || err.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (proyecto) => {
    setProyectoToDelete(proyecto);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await proyectosService.deleteProyecto(proyectoToDelete.id);
      setDeleteConfirmOpen(false);
      setProyectoToDelete(null);
      await loadProyectos();
    } catch (err) {
      setError('Error al eliminar el proyecto: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrimestreChange = (index, field, value) => {
    const newTrimestres = [...formData.trimestres];
    newTrimestres[index][field] = parseFloat(value) || 0;
    
    if (field === 'meta') {
      const totalMeta = newTrimestres.reduce((sum, t) => sum + t.meta, 0);
      newTrimestres.forEach(t => {
        t.porcentaje = totalMeta > 0 ? Math.round((t.meta / totalMeta) * 100 * 100) / 100 : 0;
      });
    }
    
    setFormData({ ...formData, trimestres: newTrimestres });
  };

  const handleDuracionChange = (newDuracion) => {
    const newTrimestres = generateTrimestres(newDuracion, formData.meta_total, formData.medida_tipo);
    setFormData({ ...formData, duracion_anos: newDuracion, trimestres: newTrimestres });
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

  // Step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Nombre del Proyecto *"
                fullWidth
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                disabled={viewMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={viewMode}>
                <InputLabel>Eje del Proyecto</InputLabel>
                <Select
                  value={formData.ejes_id}
                  label="Eje del Proyecto"
                  onChange={(e) => setFormData({ ...formData, ejes_id: e.target.value })}
                >
                  <MenuItem value=""><em>Seleccionar eje...</em></MenuItem>
                  {ejes.map((eje) => (
                    <MenuItem key={eje.id} value={eje.id}>{eje.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha de Inicio"
                type="date"
                fullWidth
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                disabled={viewMode}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha de Fin"
                type="date"
                fullWidth
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                disabled={viewMode}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={viewMode}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado_actual}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado_actual: e.target.value })}
                >
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="En Progreso">En Progreso</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="Completado">Completado</MenuItem>
                  <MenuItem value="Cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={viewMode || !!editingProyecto}>
                <InputLabel>Duración (Años) *</InputLabel>
                <Select
                  value={formData.duracion_anos}
                  label="Duración (Años) *"
                  onChange={(e) => handleDuracionChange(parseInt(e.target.value))}
                >
                  <MenuItem value={1}>1 Año (4 trimestres)</MenuItem>
                  <MenuItem value={2}>2 Años (8 trimestres)</MenuItem>
                  <MenuItem value={3}>3 Años (12 trimestres)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Objetivo del Proyecto *"
                fullWidth
                multiline
                rows={4}
                placeholder="Describa el objetivo general del proyecto..."
                value={formData.objetivo}
                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                disabled={viewMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUpIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={viewMode}>
                <InputLabel>Tipo de Medida</InputLabel>
                <Select
                  value={formData.medida_tipo}
                  label="Tipo de Medida"
                  onChange={(e) => setFormData({ ...formData, medida_tipo: e.target.value })}
                >
                  <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>
                  <MenuItem value="cantidad">Cantidad Numérica</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Meta Total ${formData.medida_tipo === 'porcentaje' ? '(%)' : ''}`}
                type="number"
                fullWidth
                value={formData.meta_total}
                onChange={(e) => {
                  const newMeta = parseFloat(e.target.value) || 0;
                  setFormData({ 
                    ...formData, 
                    meta_total: newMeta,
                    trimestres: generateTrimestres(formData.duracion_anos, newMeta, formData.medida_tipo)
                  });
                }}
                disabled={viewMode}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.medida_tipo === 'porcentaje' ? '%' : 'uds'}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Resumen
                  </Typography>
                  <Typography variant="body2">
                    Meta Total: <strong>{formData.meta_total} {formData.medida_tipo === 'porcentaje' ? '%' : 'unidades'}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Duración: <strong>{formData.duracion_anos} año(s)</strong> = {formData.duracion_anos * 4} trimestres
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <TimeIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Distribución por Trimestres
            </Typography>
            
            {[...Array(formData.duracion_anos)].map((_, yearIndex) => {
              const yearNum = yearIndex + 1;
              const yearTrimestres = formData.trimestres.filter(t => t.ano === yearNum);
              
              return (
                <Card key={yearNum} variant="outlined" sx={{ mb: 2, bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                      Año {yearNum}
                    </Typography>
                    <Grid container spacing={2}>
                      {yearTrimestres.map((trimestre, idx) => {
                        const globalIndex = formData.trimestres.findIndex(
                          t => t.ano === yearNum && t.trimestre === trimestre.trimestre
                        );
                        
                        return (
                          <Grid item xs={6} sm={3} key={`${yearNum}-${trimestre.trimestre}`}>
                            <Card variant="outlined">
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="subtitle2" color="primary">
                                  T{trimestre.trimestre}
                                </Typography>
                                <TextField
                                  label="Meta"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  value={trimestre.meta}
                                  onChange={(e) => handleTrimestreChange(globalIndex, 'meta', e.target.value)}
                                  disabled={viewMode}
                                  sx={{ mb: 1 }}
                                />
                                <Chip 
                                  label={`${trimestre.porcentaje}%`}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Gestión de Proyectos
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              Administre proyectos, objetivos y metas trimestrales
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadProyectos}
              disabled={isLoading}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
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
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              Nuevo Proyecto
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Proyecto</strong></TableCell>
                  <TableCell><strong>Objetivo</strong></TableCell>
                  <TableCell><strong>Meta</strong></TableCell>
                  <TableCell><strong>Duración</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Progreso</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No hay proyectos registrados</Typography>
                      <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenDialog()}>
                        Crear Proyecto
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  proyectos.map((proyecto) => {
                    const meses = Array.isArray(proyecto.trimestres) ? proyecto.trimestres : [];
                    const progreso = Number(meses.reduce((sum, t) => sum + (Number(t.porcentaje) || 0), 0)) || 0;
                    
                    return (
                      <TableRow key={proyecto.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{proyecto.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(proyecto.fecha_inicio)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {proyecto.objetivo || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${proyecto.meta_total || 0} ${proyecto.medida_tipo === 'porcentaje' ? '%' : ''}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{proyecto.duracion_anos || 1} año(s)</TableCell>
                        <TableCell>
                          <Chip
                            label={proyecto.estado_actual || 'Sin estado'}
                            color={getEstadoColor(proyecto.estado_actual)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 60, bgcolor: 'grey.200', borderRadius: 1, height: 8, overflow: 'hidden' }}>
                              <Box sx={{ 
                                width: `${Math.min(progreso, 100)}%`,
                                bgcolor: progreso >= 100 ? 'success.main' : 'primary.main',
                                height: '100%'
                              }} />
                            </Box>
                            <Typography variant="caption">{progreso.toFixed(0)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver">
                            <IconButton color="info" onClick={() => handleOpenDialog(proyecto, true)} size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton color="primary" onClick={() => handleOpenDialog(proyecto)} size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error" onClick={() => handleDeleteClick(proyecto)} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {viewMode ? 'Ver Proyecto' : editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {getStepContent(activeStep)}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            {viewMode ? 'Cerrar' : 'Cancelar'}
          </Button>
          
          {!viewMode && (
            <>
              <Box sx={{ flex: 1 }} />
              {activeStep > 0 && (
                <Button onClick={handleBack}>Anterior</Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>Siguiente</Button>
              ) : (
                <Button variant="contained" color="success" onClick={handleSubmit} startIcon={<SaveIcon />}>
                  {editingProyecto ? 'Guardar' : 'Crear'}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle color="error">Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Eliminar el proyecto <strong>"{proyectoToDelete?.nombre}"</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProyectosCRUD;
