import { useState, useEffect, useMemo } from 'react';
import { proyectosService } from '../services/proyectosService.js';
import { ejeService, unidadService, departamentoService } from '../services/parametrosService.js';
import { presupuestoService } from '../services/presupuestosService.js';
import { asignacionesService } from '../services/asignacionesService.js';  // Importar servicio de asignaciones
import { useAuth } from '../context/AuthContext.jsx';
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
  Close as CloseIcon,
} from '@mui/icons-material';

const steps = [
  'Unidad y Depto',  // Step 0: Auto-filled from user, then select department
  'Información Básica',  // Step 1: Name, description
  'Objetivo y Meta',  // Step 2: Objective, measurements
  'Distribución Trimestral',  // Step 3: Trimestres
  'Resumen'  // Step 4: Summary before creating
];

const ProyectosCRUD = () => {
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [ejes, setEjes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
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
    presupuesto_id: '',
    monto_asignar: '',  // Nuevo campo para especificar monto a asignar
    unidad_administrativa_id: '',
    departamento_id: '',
    accion_id: '',
    medida_id: '',
    trimestres: [],
  });
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [proyectoToDelete, setProyectoToDelete] = useState(null);

  // Filtrar presupuestos por departamento seleccionado
  const presupuestosFiltrados = useMemo(() => {
    if (!formData.departamento_id) return presupuestos;
    return presupuestos.filter(pres => 
      pres.departamento_id === parseInt(formData.departamento_id)
    );
  }, [presupuestos, formData.departamento_id]);

  // Generate trimestres - iniciar con objetivos en 0 para que el usuario los defina
  const generateTrimestres = (duracionAnos, metaTotal, medidaTipo) => {
    const trimestres = [];
    // Los objetivosinician en 0 para que el usuario los defina manualmente
    // y pueda ir aumentando el porcentaje u objetivo que quiera alcanzar
    
    for (let ano = 1; ano <= duracionAnos; ano++) {
      for (let trimestre = 1; trimestre <= 4; trimestre++) {
        trimestres.push({
          ano,
          trimestre,
          meta: 0, // Objetivo inicia en 0
          porcentaje: 0, // Porcentaje inicia en 0
        });
      }
    }
    return trimestres;
  };

  const loadProyectos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [proyectosData, ejesData, presupuestosData, unidadesData, departamentosData] = await Promise.all([
        proyectosService.getProyectos(),
        ejeService.getEjes(),
        presupuestoService.getPresupuestos(),
        unidadService.getUnidades(),
        departamentoService.getDepartamentos()
      ]);
      setProyectos(proyectosData || []);
      setEjes(ejesData || []);
      setPresupuestos(presupuestosData || []);
      setUnidades(unidadesData || []);
      setDepartamentos(departamentosData || []);
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
        presupuesto_id: proyecto.presupuesto_id || '',
        unidad_administrativa_id: proyecto.unidad_administrativa_id || '',
        departamento_id: proyecto.departamento_id || '',
        accion_id: proyecto.accion_id || '',
        medida_id: proyecto.medida_id || '',
        trimestres: existingTrimestres.length > 0 ? existingTrimestres : generateTrimestres(duracion, meta, medida),
      });
    } else {
      setEditingProyecto(null);
      // Auto-select the user's unidad administrativa if available
      const userUnidadId = user?.unidad_administrativa_id || '';
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
        presupuesto_id: '',
        unidad_administrativa_id: userUnidadId,
        departamento_id: '',
        accion_id: '',
        medida_id: '',
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
        // Validar unidad administrativa (obligatoria) y departamento
        if (!formData.unidad_administrativa_id) {
          setError('La unidad administrativa es obligatoria');
          return false;
        }
        return true;
      case 1:
        // Validar nombre del proyecto
        if (!formData.nombre.trim()) {
          setError('El nombre del proyecto es obligatorio');
          return false;
        }
        return true;
      case 2:
        // Validar objetivo
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
        // Step 1: Unidad Administrativa y Departamento
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Ubicación del Proyecto
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Seleccione la unidad administrativa y departamento donde se realizará el proyecto
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={viewMode || !!editingProyecto}>
                <InputLabel>Unidad Administrativa *</InputLabel>
                <Select
                  value={formData.unidad_administrativa_id}
                  label="Unidad Administrativa *"
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    unidad_administrativa_id: e.target.value,
                    departamento_id: '' 
                  })}
                >
                  <MenuItem value=""><em>Seleccionar unidad...</em></MenuItem>
                  {unidades.map((unidad) => (
                    <MenuItem key={unidad.id} value={unidad.id}>{unidad.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={viewMode || !formData.unidad_administrativa_id || !!editingProyecto}>
                <InputLabel>Departamento *</InputLabel>
                <Select
                  value={formData.departamento_id}
                  label="Departamento *"
                  onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                >
                  <MenuItem value=""><em>Seleccionar departamento...</em></MenuItem>
                  {departamentos
                    .filter(d => !formData.unidad_administrativa_id || d.unidad_administrativa_id === formData.unidad_administrativa_id)
                    .map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.nombre}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nota:</strong> La unidad administrativa se ha seleccionado automáticamente según su perfil de usuario.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 1:
        // Step 2: Información Básica (Nombre, Descripción, Fechas)
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
            <Grid item xs={12} sm={6}>
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
              <FormControl fullWidth disabled={viewMode}>
                <InputLabel>Presupuesto</InputLabel>
                <Select
                  value={formData.presupuesto_id}
                  label="Presupuesto"
                  onChange={(e) => setFormData({ ...formData, presupuesto_id: e.target.value, monto_asignar: '' })}
                >
                  <MenuItem value=""><em>Seleccionar presupuesto...</em></MenuItem>
                  {presupuestosFiltrados.map((pres) => {
                    const montoDisponible = (pres.monto || 0) - (pres.monto_asignado || 0);
                    return (
                      <MenuItem key={pres.id} value={pres.id}>
                        ${(pres.monto || 0).toLocaleString('es-MX')} ({pres.ano}) - Disponible: ${montoDisponible.toLocaleString('es-MX')}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            {formData.presupuesto_id && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Monto a Asignar"
                  type="number"
                  fullWidth
                  value={formData.monto_asignar}
                  onChange={(e) => setFormData({ ...formData, monto_asignar: e.target.value })}
                  disabled={viewMode}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText={`Monto disponible: ${((presupuestosFiltrados.find(p => p.id === formData.presupuesto_id)?.monto || 0) - (presupuestosFiltrados.find(p => p.id === formData.presupuesto_id)?.monto_asignado || 0)).toLocaleString('es-MX')}`}
                />
              </Grid>
            )}
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
      
      case 2:
        // Step 2: Información Básica (Objetivo, Descripción, Fechas)
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Objetivo del Proyecto *"
                fullWidth
                value={formData.objetivo}
                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                disabled={viewMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              </Typography>
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
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: 4, 
                  bgcolor: 'background.default', 
                  transition: 'all 0.3s ease', 
                  '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } 
                }}
              >
                <CardContent sx={{ p: 3 }}>
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
      
      case 3:
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
                <Card 
                  key={yearNum} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 4, 
                    bgcolor: 'background.default', 
                    transition: 'all 0.3s ease', 
                    '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } 
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                borderRadius: 3,
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  transform: 'scale(1.02)'
                                } 
                              }}
                            >
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
      
      case 4:
        // Step 5: Resumen del Proyecto
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Resumen del Proyecto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Revise la información antes de crear el proyecto
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Información General
                    </Typography>
                    <Typography variant="body2"><strong>Nombre:</strong> {formData.nombre || 'Sin nombre'}</Typography>
                    <Typography variant="body2"><strong>Descripción:</strong> {formData.descripcion || 'Sin descripción'}</Typography>
                    <Typography variant="body2"><strong>Objetivo:</strong> {formData.objetivo || 'Sin objetivo'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Ubicación
                    </Typography>
                    <Typography variant="body2">
                      <strong>Unidad:</strong> {unidades.find(u => u.id === formData.unidad_administrativa_id)?.nombre || 'No seleccionada'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Departamento:</strong> {departamentos.find(d => d.id === formData.departamento_id)?.nombre || 'No seleccionado'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Metas y Duración
                    </Typography>
                    <Typography variant="body2">
                      <strong>Meta:</strong> {formData.meta_total} {formData.medida_tipo === 'porcentaje' ? '%' : 'unidades'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duración:</strong> {formData.duracion_anos} año(s)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Eje y Evaluación
                    </Typography>
                    <Typography variant="body2">
                      <strong>Eje:</strong> {ejes.find(e => e.id === formData.ejes_id)?.nombre || 'No seleccionado'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Evaluación:</strong> {formData.evaluacion || 'Sin evaluación'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Presupuesto
                    </Typography>
                    <Typography variant="body2">
                      <strong>Presupuesto:</strong> {
                        presupuestos.find(p => p.id === formData.presupuesto_id)
                          ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(presupuestos.find(p => p.id === formData.presupuesto_id)?.monto)
                          : 'No asignado'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
                  <TableCell><strong>Presupuesto</strong></TableCell>
                  <TableCell><strong>Duración</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Progreso</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                        <TableCell>
                          {proyecto.presupuesto_id ? (
                            <Chip 
                              label={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(proyecto.presupuesto_monto)}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">Sin asignar</Typography>
                          )}
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
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh',
          } 
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="medium">
              {viewMode ? 'Ver Proyecto' : editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </Typography>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, overflow: 'auto' }}>
          {/* View Mode: Show all details in one window */}
          {viewMode ? (
            <Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {/* Información General */}
              <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Información General
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Nombre del Proyecto</Typography>
                    <Typography variant="body1" fontWeight="medium">{formData.nombre || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                    <Chip label={formData.estado_actual || 'Sin estado'} color={getEstadoColor(formData.estado_actual)} size="small" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Unidad Administrativa</Typography>
                    <Typography variant="body1">{unidades.find(u => u.id === formData.unidad_administrativa_id)?.nombre || 'No seleccionada'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Departamento</Typography>
                    <Typography variant="body1">{departamentos.find(d => d.id === formData.departamento_id)?.nombre || 'No seleccionado'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Eje</Typography>
                    <Typography variant="body1">{ejes.find(e => e.id === formData.ejes_id)?.nombre || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Presupuesto</Typography>
                    <Typography variant="body1">
                      {formData.presupuesto_id 
                        ? `${(presupuestos.find(p => p.id === formData.presupuesto_id)?.monto || 0).toLocaleString('es-MX')}` 
                        : 'Sin presupuesto'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Duración</Typography>
                    <Typography variant="body1">{formData.duracion_anos} año(s)</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Meta Total</Typography>
                    <Typography variant="body1">{formData.meta_total} {formData.medida_tipo === 'porcentaje' ? '%' : 'unidades'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de Inicio</Typography>
                    <Typography variant="body1">{formData.fecha_inicio ? formatDate(formData.fecha_inicio) : '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de Fin</Typography>
                    <Typography variant="body1">{formData.fecha_fin ? formatDate(formData.fecha_fin) : '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Objetivo y Descripción */}
              <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Objetivo y Descripción
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Objetivo</Typography>
                    <Typography variant="body1">{formData.objetivo || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                    <Typography variant="body1">{formData.descripcion || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Tipo de Medida</Typography>
                    <Typography variant="body1">{formData.medida_tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Cantidad Numérica'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Evaluación</Typography>
                    <Typography variant="body1">{formData.evaluacion || '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Metas Trimestrales */}
              <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Metas Trimestrales
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Año</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Trimestre</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Meta</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Porcentaje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.trimestres?.map((trimestre, index) => (
                        <TableRow key={index}>
                          <TableCell>{trimestre.ano}</TableCell>
                          <TableCell>T{trimestre.trimestre}</TableCell>
                          <TableCell>{trimestre.meta}</TableCell>
                          <TableCell>{trimestre.porcentaje}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          ) : (
            // Edit/Create Mode: Use Stepper
            <>
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
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<CancelIcon />}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            {viewMode ? 'Cerrar' : 'Cancelar'}
          </Button>
          
          {viewMode ? (
            // View mode - just show close button
            <Box sx={{ flex: 1 }} />
          ) : (
            // Edit/Create mode - navigation buttons
            <>
              <Box sx={{ flex: 1 }} />
              {activeStep > 0 && (
                <Button onClick={handleBack} variant="outlined" sx={{ minWidth: 100 }}>
                  Anterior
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext} sx={{ minWidth: 100 }}>
                  Siguiente
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={handleSubmit} 
                  startIcon={<SaveIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {editingProyecto ? 'Guardar' : 'Crear'}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        PaperProps={{ sx: { borderRadius: 3 } }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'medium' }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de eliminar el proyecto <strong>"{proyectoToDelete?.nombre}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProyectosCRUD;
