import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { proyectosService } from '../services/proyectosService.js';
import { actividadesService } from '../services/actividadesService.js';

const AvanceTrimestral = () => {
  const [proyectos, setProyectos] = useState([]);
  const [actividadesPlanificadas, setActividadesPlanificadas] = useState([]);
  const [actividadesEjecutadas, setActividadesEjecutadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProyecto, setSelectedProyecto] = useState('');
  const [selectedAno, setSelectedAno] = useState(1);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const [trimestreActual, setTrimestreActual] = useState(1);

  // Estado del formulario
  const [formData, setFormData] = useState({
    trimestre: 1,
    real_actualizado: 0,
    porcentaje_cumplimiento: 0,
    observaciones: '',
    evidencia: '',
    calificacion: 0,
  });

  // Cargar proyectos al inicio
  useEffect(() => {
    loadProyectos();
  }, []);

  // Cargar actividades cuando cambia el proyecto o año
  useEffect(() => {
    if (selectedProyecto) {
      loadActividades();
    }
  }, [selectedProyecto, selectedAno]);

  const loadProyectos = async () => {
    try {
      setIsLoading(true);
      const data = await proyectosService.getProyectos();
      setProyectos(data || []);
    } catch (err) {
      console.error('Error loading proyectos:', err);
      setError('Error al cargar los proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActividades = async () => {
    try {
      setIsLoading(true);
      // Cargar actividades planificadas del proyecto
      const planificadas = await actividadesService.getActividadesPlanificadasByProyecto(selectedProyecto);
      setActividadesPlanificadas(planificadas || []);
      
      // Cargar actividades ejecutadas
      const ejecutadas = await actividadesService.getActividadesEjecutadas();
      setActividadesEjecutadas(ejecutadas || []);
    } catch (err) {
      console.error('Error loading actividades:', err);
      setError('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener actividades ejecutadas para un trimestre específico
  const getActividadEjecutada = (actividadPlanificadaId, trimestre) => {
    return actividadesEjecutadas.find(
      (ae) => ae.actividad_planificada_id === actividadPlanificadaId && ae.trimestre === trimestre
    );
  };

  // Calcular progreso de un trimestre
  const calculateProgreso = (actividadPlanificadaId, trimestre) => {
    const ejecutada = getActividadEjecutada(actividadPlanificadaId, trimestre);
    return ejecutada?.porcentaje_cumplimiento || 0;
  };

  // Abrir dialog para capturar avance
  const handleOpenDialog = (actividad, trimestre) => {
    const ejecutada = getActividadEjecutada(actividad.id, trimestre);
    if (ejecutada) {
      setEditingActividad(ejecutada);
      setFormData({
        trimestre: ejecutada.trimestre,
        real_actualizado: ejecutada.real_actualizado || 0,
        porcentaje_cumplimiento: ejecutada.porcentaje_cumplimiento || 0,
        observaciones: ejecutada.observaciones || '',
        evidencia: ejecutada.evidencia || '',
        calificacion: ejecutada.calificacion || 0,
      });
    } else {
      setEditingActividad(null);
      setFormData({
        trimestre,
        real_actualizado: 0,
        porcentaje_cumplimiento: 0,
        observaciones: '',
        evidencia: '',
        calificacion: 0,
      });
    }
    setTrimestreActual(trimestre);
    setOpenDialog(true);
  };

  // Guardar avance trimestral
  const handleSaveAvance = async () => {
    try {
      setIsLoading(true);
      const data = {
        actividad_planificada_id: editingActividad?.actividad_planificada_id || 
          actividadesPlanificadas[0]?.id,
        trimestre: trimestreActual,
        real_actualizado: formData.real_actualizado,
        porcentaje_cumplimiento: formData.porcentaje_cumplimiento,
        observaciones: formData.observaciones,
        evidencia: formData.evidencia,
        calificacion: formData.calificacion,
      };

      if (editingActividad?.id) {
        await actividadesService.updateActividadEjecutada(editingActividad.id, data);
      } else {
        await actividadesService.createActividadEjecutada(data);
      }

      setOpenDialog(false);
      loadActividades(); // Recargar datos
    } catch (err) {
      console.error('Error saving avance:', err);
      setError('Error al guardar el avance');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener color según porcentaje
  const getProgresoColor = (porcentaje) => {
    if (porcentaje >= 100) return 'success';
    if (porcentaje >= 75) return 'info';
    if (porcentaje >= 50) return 'warning';
    return 'error';
  };

  // Trimestres disponibles
  const trimestres = [1, 2, 3, 4];

  // Filtrar actividades por año
  const actividadesFiltradas = actividadesPlanificadas.filter(
    (ap) => ap.ano === selectedAno
  );

  if (isLoading && proyectos.length === 0) {
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
            Avance Trimestral
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Captura el progreso de cada proyecto por trimestre
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Seleccionar Proyecto</InputLabel>
                <Select
                  value={selectedProyecto}
                  label="Seleccionar Proyecto"
                  onChange={(e) => setSelectedProyecto(e.target.value)}
                >
                  {proyectos.map((proyecto) => (
                    <MenuItem key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Año del Proyecto</InputLabel>
                <Select
                  value={selectedAno}
                  label="Año del Proyecto"
                  onChange={(e) => setSelectedAno(e.target.value)}
                >
                  <MenuItem value={1}>Año 1</MenuItem>
                  <MenuItem value={2}>Año 2</MenuItem>
                  <MenuItem value={3}>Año 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {selectedProyecto && (
          <>
            {/* Tabs de Trimestres */}
            <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Grid container>
                  {trimestres.map((tr) => {
                    const promedioTrimestre = actividadesFiltradas.length > 0
                      ? actividadesFiltradas.reduce((sum, ap) => 
                          sum + calculateProgreso(ap.id, tr), 0) / actividadesFiltradas.length
                      : 0;
                    
                    return (
                      <Grid item xs={6} md={3} key={tr}>
                        <Box
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: trimestreActual === tr ? 'primary.main' : 'transparent',
                            color: trimestreActual === tr ? 'white' : 'text.primary',
                            transition: 'all 0.3s',
                            '&:hover': {
                              bgcolor: trimestreActual === tr ? 'primary.dark' : 'grey.100',
                            },
                          }}
                          onClick={() => setTrimestreActual(tr)}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            Trimestre {tr}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={promedioTrimestre}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: trimestreActual === tr ? 'rgba(255,255,255,0.3)' : 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: trimestreActual === tr ? 'white' : 'primary.main',
                                },
                              }}
                            />
                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                              {promedioTrimestre.toFixed(0)}% completado
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>

            {/* Tabla de Actividades */}
            <Paper sx={{ borderRadius: 2 }}>
              {isLoading ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : actividadesFiltradas.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <WarningIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay actividades planificadas para el año {selectedAno}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Primero debe crear actividades planificadas en la gestión de proyectos
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actividad</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Meta Planeada</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Real</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">% Cumplimiento</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Evidencia</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {actividadesFiltradas.map((actividad) => {
                        const ejecutada = getActividadEjecutada(actividad.id, trimestreActual);
                        const progreso = calculateProgreso(actividad.id, trimestreActual);
                        
                        return (
                          <TableRow key={actividad.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {actividad.descripcion}
                              </Typography>
                              {actividad.observaciones && (
                                <Typography variant="caption" color="text.secondary">
                                  Obs: {actividad.observaciones}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={actividad[`meta_trimestral${trimestreActual}`] || 0} 
                                size="small" 
                                color="default" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {ejecutada?.real_actualizado || '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progreso}
                                  sx={{ 
                                    width: 60, 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: 'grey.200',
                                  }}
                                  color={getProgresoColor(progreso)}
                                />
                                <Chip 
                                  label={`${progreso}%`}
                                  size="small"
                                  color={getProgresoColor(progreso)}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {ejecutada?.evidencia ? (
                                <Chip 
                                  icon={<PhotoIcon />}
                                  label="Con evidencia"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip 
                                  label="Sin evidencia"
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(actividad, trimestreActual)}
                              >
                                {ejecutada ? <EditIcon /> : <SaveIcon />}
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}

        {/* Dialog para capturar avance */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Capturar Avance - Trimestre {trimestreActual}
              </Typography>
              <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cantidad Real Lograda"
                  type="number"
                  value={formData.real_actualizado}
                  onChange={(e) => setFormData({ ...formData, real_actualizado: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Porcentaje de Cumplimiento (%)"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={formData.porcentaje_cumplimiento}
                  onChange={(e) => setFormData({ ...formData, porcentaje_cumplimiento: Number(e.target.value) })}
                  helperText="Ingrese el porcentaje de avance (0-100)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Evidencia / Evidencias"
                  multiline
                  rows={3}
                  value={formData.evidencia}
                  onChange={(e) => setFormData({ ...formData, evidencia: e.target.value })}
                  placeholder="Describa las evidencias: fotos, documentos, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Observaciones adicionales sobre el avance"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Calificación (0-10)"
                  type="number"
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  value={formData.calificacion}
                  onChange={(e) => setFormData({ ...formData, calificacion: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAvance} 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Avance'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default AvanceTrimestral;
