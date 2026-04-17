import { useState, useEffect, useMemo } from 'react';
import { proyectosService } from '../services/proyectosService.js';
import { ejeService, unidadService, departamentoService } from '../services/parametrosService.js';
import { presupuestoService } from '../services/presupuestosService.js';
import { actividadesService } from '../services/actividadesService.js';

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
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx-js-style';

const steps = [
  'Unidad y Departamento',  // Step 0: Auto-filled from user, then select department
  'Información Básica',  // Step 1: Name, description, dates
  'Actividades del Proyecto',  // Step 2: Define activities with measures, goals, evaluations
  'Presupuesto y Distribución',  // Step 3: Assign budget and distribute to activities
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
    fecha_inicio: '',
    fecha_fin: '',
    ejes_id: '',
    presupuesto_id: '',
    presupuesto_total: '',  // Total budget assigned to project
    unidad_administrativa_id: '',
    departamento_id: '',
    actividades: [],  // Array of activities with their details
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
      // For existing projects, try to load actividades or create default if not present
      const existingActividades = proyecto.actividades || [];
      const defaultActividades = existingActividades.length > 0 ? existingActividades : [
        {
          id: 1,
          nombre: '',
          descripcion: '',
          medida_tipo: 'porcentaje',
          meta_total: proyecto.meta_total || 100,
          evaluacion: proyecto.evaluacion || '',
          presupuesto_asignado: 0
        }
      ];

      setFormData({
        nombre: proyecto.nombre || '',
        descripcion: proyecto.descripcion || '',
        estado_actual: proyecto.estado_actual || 'Activo',
        evaluacion: proyecto.evaluacion || '',
        objetivo: proyecto.objetivo || '',
        fecha_inicio: proyecto.fecha_inicio ? proyecto.fecha_inicio.split('T')[0] : '',
        fecha_fin: proyecto.fecha_fin ? proyecto.fecha_fin.split('T')[0] : '',
        ejes_id: proyecto.ejes_id || '',
        presupuesto_id: proyecto.presupuesto_id || '',
        presupuesto_total: proyecto.presupuesto_total || '',
        unidad_administrativa_id: proyecto.unidad_administrativa_id || '',
        departamento_id: proyecto.departamento_id || '',
        actividades: defaultActividades,
      });
    } else {
      setEditingProyecto(null);
      // Auto-select the user's unidad administrativa if available
      const userUnidadId = user?.unidad_administrativa_id || '';
      const defaultActividades = [
        {
          id: 1,
          nombre: '',
          descripcion: '',
          medida_tipo: 'porcentaje',
          meta_total: 100,
          evaluacion: '',
          presupuesto_asignado: 0
        }
      ];
      setFormData({
        nombre: '',
        descripcion: '',
        estado_actual: 'Activo',
        evaluacion: '',
        objetivo: '',
        fecha_inicio: '',
        fecha_fin: '',
        ejes_id: '',
        presupuesto_id: '',
        presupuesto_total: '',
        unidad_administrativa_id: userUnidadId,
        departamento_id: '',
        actividades: defaultActividades,
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
        // Validar unidad administrativa y departamento
        if (!formData.unidad_administrativa_id) {
          setError('La unidad administrativa es obligatoria');
          return false;
        }
        if (!formData.departamento_id) {
          setError('El departamento es obligatorio');
          return false;
        }
        return true;
      case 1:
        // Validar información básica
        if (!formData.nombre.trim()) {
          setError('El nombre del proyecto es obligatorio');
          return false;
        }
        if (!formData.descripcion.trim()) {
          setError('La descripción del proyecto es obligatoria');
          return false;
        }
        if (!formData.fecha_inicio) {
          setError('La fecha de inicio es obligatoria');
          return false;
        }
        if (!formData.fecha_fin) {
          setError('La fecha de fin es obligatoria');
          return false;
        }
        return true;
      case 2: {
        // Validar actividades
        if (formData.actividades.length === 0) {
          setError('Debe definir al menos una actividad');
          return false;
        }
        for (const actividad of formData.actividades) {
          if (!actividad.nombre.trim()) {
            setError('Todas las actividades deben tener nombre');
            return false;
          }
          if (!actividad.descripcion.trim()) {
            setError('Todas las actividades deben tener descripción');
            return false;
          }
          if (!actividad.evaluacion.trim()) {
            setError('Todas las actividades deben tener evaluación');
            return false;
          }
        }
        return true;
      }
      case 3: {
        // Validar presupuesto
        if (!formData.presupuesto_id) {
          setError('Debe seleccionar un presupuesto');
          return false;
        }
        if (!formData.presupuesto_total || formData.presupuesto_total <= 0) {
          setError('Debe asignar un monto al proyecto');
          return false;
        }
        const totalDistribuido = formData.actividades.reduce((sum, a) => sum + (a.presupuesto_asignado || 0), 0);
        if (totalDistribuido !== parseFloat(formData.presupuesto_total)) {
          setError('El presupuesto distribuido debe ser igual al total asignado');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate derived fields for compatibility
      const totalMeta = formData.actividades.reduce((sum, a) => sum + (a.meta_total || 0), 0);
      const medidaTipo = formData.actividades[0]?.medida_tipo || 'porcentaje';

      const dataToSend = {
        ...formData,
        meta_total: totalMeta,
        medida_tipo: medidaTipo,
        actividades: formData.actividades
      };

      console.log('Enviando datos:', dataToSend);

      const isNew = !editingProyecto;

      if (editingProyecto) {
        await proyectosService.updateProyecto(editingProyecto.id, dataToSend);
      } else {
        await proyectosService.createProyecto(dataToSend);
      }

      handleCloseDialog();
      await loadProyectos();

      // Generate Excel for new projects
      if (isNew) {
        const wb = XLSX.utils.book_new();
        const data = [
          ['Proyecto', formData.nombre],
          ['Descripción', formData.descripcion],
          ['Estado', formData.estado_actual],
          ['Evaluación', formData.evaluacion],
          ['Objetivo', formData.objetivo],
          ['Fecha Inicio', formData.fecha_inicio],
          ['Fecha Fin', formData.fecha_fin],
          ['Eje', ejes.find(e => e.id === formData.ejes_id)?.nombre || ''],
          ['Presupuesto Total', formData.presupuesto_total],
          ['Unidad Administrativa', unidades.find(u => u.id === formData.unidad_administrativa_id)?.nombre || ''],
          ['Departamento', departamentos.find(d => d.id === formData.departamento_id)?.nombre || ''],
          [], // empty row
          ['Actividades'],
          ['Nombre', 'Descripción', 'Meta Total', 'Tipo de Medida', 'Evaluación', 'Presupuesto Asignado'],
          ...formData.actividades.map(a => [a.nombre, a.descripcion, a.meta_total, a.medida_tipo, a.evaluacion, a.presupuesto_asignado])
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Proyecto y Actividades');
        XLSX.writeFile(wb, `${formData.nombre}_registro.xlsx`);
      }
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



  // Activity management functions
  const addActividad = () => {
    const newId = Math.max(...formData.actividades.map(a => a.id), 0) + 1;
    const newActividad = {
      id: newId,
      nombre: '',
      descripcion: '',
      medida_tipo: 'porcentaje',
      meta_total: 100,
      evaluacion: '',
      presupuesto_asignado: 0
    };
    setFormData({
      ...formData,
      actividades: [...formData.actividades, newActividad]
    });
  };

  const removeActividad = (id) => {
    setFormData({
      ...formData,
      actividades: formData.actividades.filter(a => a.id !== id)
    });
  };

  const updateActividad = (id, field, value) => {
    setFormData({
      ...formData,
      actividades: formData.actividades.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    });
  };

  const distributePresupuesto = (totalPresupuesto) => {
    const totalMetas = formData.actividades.reduce((sum, a) => sum + (a.meta_total || 0), 0);
    if (totalMetas === 0) return;

    const updatedActividades = formData.actividades.map(a => ({
      ...a,
      presupuesto_asignado: Math.round((a.meta_total / totalMetas) * totalPresupuesto)
    }));

    setFormData({
      ...formData,
      presupuesto_total: totalPresupuesto,
      actividades: updatedActividades
    });
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
                  size="medium"
                  sx={{
                    minHeight: 56,
                    '& .MuiSelect-select': {
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      fontSize: '1rem',
                    }
                  }}
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
                  size="medium"
                  sx={{
                    minHeight: 56,
                    '& .MuiSelect-select': {
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      fontSize: '1rem',
                    }
                  }}
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
        // Step 1: Información Básica (Nombre, Descripción, Fechas, Eje)
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Información General del Proyecto
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Complete la información básica del proyecto
              </Typography>
            </Grid>
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
                label="Descripción *"
                fullWidth
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Objetivo del Proyecto"
                fullWidth
                multiline
                rows={2}
                value={formData.objetivo}
                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha de Inicio *"
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
                label="Fecha de Fin *"
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
                <InputLabel>Eje del Proyecto</InputLabel>
                <Select
                  value={formData.ejes_id}
                  label="Eje del Proyecto"
                  onChange={(e) => setFormData({ ...formData, ejes_id: e.target.value })}
                  size="medium"
                  sx={{
                    minHeight: 56,
                    '& .MuiSelect-select': {
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      fontSize: '1rem',
                    }
                  }}
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
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado_actual}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado_actual: e.target.value })}
                  size="medium"
                  sx={{
                    minHeight: 56,
                    '& .MuiSelect-select': {
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      fontSize: '1rem',
                    }
                  }}
                >
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="En Progreso">En Progreso</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="Completado">Completado</MenuItem>
                  <MenuItem value="Cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 2:
        // Step 2: Actividades del Proyecto
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Actividades del Proyecto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Defina las actividades que se realizarán para cumplir con el proyecto. Cada actividad debe tener medidas, metas y evaluaciones.
            </Typography>

            {formData.actividades.map((actividad, index) => (
              <Card
                key={actividad.id}
                variant="outlined"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      Actividad {index + 1}
                    </Typography>
                    {formData.actividades.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeActividad(actividad.id)}
                        disabled={viewMode}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Nombre de la Actividad *"
                        fullWidth
                        value={actividad.nombre}
                        onChange={(e) => updateActividad(actividad.id, 'nombre', e.target.value)}
                        disabled={viewMode}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Descripción *"
                        fullWidth
                        multiline
                        rows={2}
                        value={actividad.descripcion}
                        onChange={(e) => updateActividad(actividad.id, 'descripcion', e.target.value)}
                        disabled={viewMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth disabled={viewMode}>
                        <InputLabel>Tipo de Medida</InputLabel>
                        <Select
                          value={actividad.medida_tipo}
                          label="Tipo de Medida"
                          onChange={(e) => updateActividad(actividad.id, 'medida_tipo', e.target.value)}
                          size="medium"
                          sx={{
                            minHeight: 56,
                            '& .MuiSelect-select': {
                              paddingTop: '14px',
                              paddingBottom: '14px',
                              fontSize: '1rem',
                            }
                          }}
                        >
                          <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>
                          <MenuItem value="cantidad">Cantidad Numérica</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={`Meta Total ${actividad.medida_tipo === 'porcentaje' ? '(%)' : ''}`}
                        type="number"
                        fullWidth
                        value={actividad.meta_total}
                        onChange={(e) => updateActividad(actividad.id, 'meta_total', parseFloat(e.target.value) || 0)}
                        disabled={viewMode}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {actividad.medida_tipo === 'porcentaje' ? '%' : 'uds'}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Presupuesto Asignado"
                        type="number"
                        fullWidth
                        value={actividad.presupuesto_asignado}
                        onChange={(e) => updateActividad(actividad.id, 'presupuesto_asignado', parseFloat(e.target.value) || 0)}
                        disabled={viewMode}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Evaluación *"
                        fullWidth
                        multiline
                        rows={2}
                        value={actividad.evaluacion}
                        onChange={(e) => updateActividad(actividad.id, 'evaluacion', e.target.value)}
                        disabled={viewMode}
                        helperText="Describa cómo se evaluará el cumplimiento de esta actividad"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addActividad}
                disabled={viewMode}
                sx={{ minWidth: 200 }}
              >
                Agregar Actividad
              </Button>
            </Box>

            <Card
              variant="outlined"
              sx={{
                mt: 3,
                borderRadius: 3,
                bgcolor: 'grey.50',
                borderColor: 'primary.light'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Resumen de Actividades
                </Typography>
                <Typography variant="body2">
                  Total de actividades: <strong>{formData.actividades.length}</strong>
                </Typography>
                <Typography variant="body2">
                  Meta total del proyecto: <strong>{formData.actividades.reduce((sum, a) => sum + (a.meta_total || 0), 0)} unidades</strong>
                </Typography>
                <Typography variant="body2">
                  Presupuesto total distribuido: <strong>${formData.actividades.reduce((sum, a) => sum + (a.presupuesto_asignado || 0), 0).toLocaleString('es-MX')}</strong>
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      
      case 3:
        // Step 3: Presupuesto y Distribución
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Presupuesto del Proyecto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Seleccione un presupuesto disponible y distribuya el monto entre las actividades definidas.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={viewMode}>
                  <InputLabel>Presupuesto Disponible *</InputLabel>
                  <Select
                    value={formData.presupuesto_id}
                    label="Presupuesto Disponible *"
                    onChange={(e) => setFormData({ ...formData, presupuesto_id: e.target.value, presupuesto_total: '' })}
                    size="medium"
                    sx={{
                      minHeight: 56,
                      '& .MuiSelect-select': {
                        paddingTop: '14px',
                        paddingBottom: '14px',
                        fontSize: '1rem',
                      }
                    }}
                  >
                    <MenuItem value=""><em>Seleccionar presupuesto...</em></MenuItem>
                    {presupuestosFiltrados.map((pres) => {
                      const montoDisponible = (pres.monto || 0) - (pres.monto_asignado || 0);
                      return (
                        <MenuItem
                          key={pres.id}
                          value={pres.id}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '12px 16px',
                            minHeight: '60px',
                            whiteSpace: 'normal',
                            lineHeight: 1.4,
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            sx={{
                              fontSize: '1rem',
                              color: montoDisponible > 0 ? 'success.main' : 'text.primary',
                            }}
                          >
                            ${montoDisponible.toLocaleString('es-MX')} disponible
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.875rem',
                              marginTop: '2px',
                            }}
                          >
                            Año: {pres.ano}
                          </Typography>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Monto Total a Asignar al Proyecto *"
                  type="number"
                  fullWidth
                  value={formData.presupuesto_total}
                  onChange={(e) => {
                    const newTotal = parseFloat(e.target.value) || 0;
                    distributePresupuesto(newTotal);
                  }}
                  disabled={viewMode || !formData.presupuesto_id}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText={formData.presupuesto_id ?
                    `Disponible: ${((presupuestosFiltrados.find(p => p.id === formData.presupuesto_id)?.monto || 0) - (presupuestosFiltrados.find(p => p.id === formData.presupuesto_id)?.monto_asignado || 0)).toLocaleString('es-MX')}` :
                    'Seleccione un presupuesto primero'
                  }
                />
              </Grid>
            </Grid>

            {formData.presupuesto_total > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Distribución del Presupuesto por Actividades
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  El presupuesto se distribuye automáticamente basado en las metas de cada actividad.
                </Typography>

                {formData.actividades.map((actividad, index) => (
                  <Card
                    key={actividad.id}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {actividad.nombre || `Actividad ${index + 1}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Meta: {actividad.meta_total} {actividad.medida_tipo === 'porcentaje' ? '%' : 'unidades'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Presupuesto Asignado"
                            type="number"
                            fullWidth
                            value={actividad.presupuesto_asignado}
                            onChange={(e) => updateActividad(actividad.id, 'presupuesto_asignado', parseFloat(e.target.value) || 0)}
                            disabled={viewMode}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Porcentaje del total:
                          </Typography>
                          <Chip
                            label={`${formData.presupuesto_total > 0 ? Math.round((actividad.presupuesto_asignado / formData.presupuesto_total) * 100) : 0}%`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                <Card
                  variant="outlined"
                  sx={{
                    mt: 3,
                    borderRadius: 3,
                    bgcolor: 'grey.50',
                    borderColor: 'success.light'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Resumen de Distribución
                    </Typography>
                    <Typography variant="body2">
                      Presupuesto total asignado: <strong>${parseFloat(formData.presupuesto_total || 0).toLocaleString('es-MX')}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Total distribuido: <strong>${formData.actividades.reduce((sum, a) => sum + (a.presupuesto_asignado || 0), 0).toLocaleString('es-MX')}</strong>
                    </Typography>
                    <Typography variant="body2" color={formData.actividades.reduce((sum, a) => sum + (a.presupuesto_asignado || 0), 0) === parseFloat(formData.presupuesto_total || 0) ? 'success.main' : 'error.main'}>
                      Estado: {formData.actividades.reduce((sum, a) => sum + (a.presupuesto_asignado || 0), 0) === parseFloat(formData.presupuesto_total || 0) ? 'Distribución correcta' : 'Ajuste necesario'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        );
      
      case 4:
        // Step 4: Resumen del Proyecto
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Resumen del Proyecto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Revise toda la información antes de crear el proyecto
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
                    <Typography variant="body2"><strong>Fechas:</strong> {formData.fecha_inicio ? formatDate(formData.fecha_inicio) : 'No definida'} - {formData.fecha_fin ? formatDate(formData.fecha_fin) : 'No definida'}</Typography>
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
                    <Typography variant="body2">
                      <strong>Eje:</strong> {ejes.find(e => e.id === formData.ejes_id)?.nombre || 'No seleccionado'}
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
                      <strong>Fuente:</strong> {presupuestos.find(p => p.id === formData.presupuesto_id)?.ano || 'No seleccionado'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monto asignado:</strong> ${parseFloat(formData.presupuesto_total || 0).toLocaleString('es-MX')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Actividades ({formData.actividades.length})
                    </Typography>
                    {formData.actividades.map((actividad, index) => (
                      <Box key={actividad.id} sx={{ mb: 2, pb: 2, borderBottom: index < formData.actividades.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                        <Typography variant="subtitle2" color="primary">
                          {index + 1}. {actividad.nombre}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          <strong>Descripción:</strong> {actividad.descripcion}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          <strong>Meta:</strong> {actividad.meta_total} {actividad.medida_tipo === 'porcentaje' ? '%' : 'unidades'}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          <strong>Presupuesto:</strong> ${actividad.presupuesto_asignado?.toLocaleString('es-MX') || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          <strong>Evaluación:</strong> {actividad.evaluacion}
                        </Typography>
                      </Box>
                    ))}
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                      Total presupuesto distribuido: ${formData.actividades.reduce((sum, a) => sum + (a.presupuesto_asignado || 0), 0).toLocaleString('es-MX')}
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
                   <TableCell><strong>Actividades</strong></TableCell>
                   <TableCell><strong>Meta Total</strong></TableCell>
                   <TableCell><strong>Presupuesto</strong></TableCell>
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
                      // Calculate progress based on activities if available, otherwise use old method
                      let progreso = 0;
                      if (proyecto.actividades && proyecto.actividades.length > 0) {
                        // For now, assume 0 progress since we don't have actual progress tracking yet
                        progreso = 0;
                      } else {
                       const meses = Array.isArray(proyecto.trimestres) ? proyecto.trimestres : [];
                       progreso = Number(meses.reduce((sum, t) => sum + (Number(t.porcentaje) || 0), 0)) || 0;
                     }

                     const actividades = proyecto.actividades || [];
                     const totalMeta = actividades.length > 0
                       ? actividades.reduce((sum, a) => sum + (a.meta_total || 0), 0)
                       : proyecto.meta_total || 0;
                     const medidaTipo = actividades.length > 0
                       ? actividades[0]?.medida_tipo || 'porcentaje'
                       : proyecto.medida_tipo || 'porcentaje';

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
                             {actividades.length > 0 ? `${actividades.length} actividades` : proyecto.objetivo || ''}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Chip
                             label={`${totalMeta} ${medidaTipo === 'porcentaje' ? '%' : ''}`}
                             size="small"
                             color="primary"
                             variant="outlined"
                           />
                         </TableCell>
                         <TableCell>
                           {proyecto.presupuesto_total ? (
                             <Chip
                               label={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(proyecto.presupuesto_total)}
                               size="small"
                               color="success"
                               variant="outlined"
                             />
                           ) : proyecto.presupuesto_id ? (
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
                          <Tooltip title="Avance Trimestral">
                            <IconButton
                              color="secondary"
                              onClick={() => window.open(`/avance?proyecto=${proyecto.id}`, '_blank')}
                              size="small"
                            >
                              <TimelineIcon />
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

              {/* Actividades del Proyecto */}
              <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Actividades del Proyecto
                </Typography>
                {formData.actividades?.length > 0 ? (
                  formData.actividades.map((actividad, index) => (
                    <Card key={actividad.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                          {index + 1}. {actividad.nombre}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Descripción</Typography>
                            <Typography variant="body1">{actividad.descripcion}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary">Meta</Typography>
                            <Typography variant="body1">{actividad.meta_total} {actividad.medida_tipo === 'porcentaje' ? '%' : 'unidades'}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary">Presupuesto</Typography>
                            <Typography variant="body1">${actividad.presupuesto_asignado?.toLocaleString('es-MX') || 0}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Evaluación</Typography>
                            <Typography variant="body1">{actividad.evaluacion}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No hay actividades definidas</Typography>
                )}
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
