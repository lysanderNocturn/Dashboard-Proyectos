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
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { proyectosService } from '../services/proyectosService.js';
import { actividadesService } from '../services/actividadesService.js';
import { reportesService } from '../services/reportesService.js';
import GestionarReportesModal from '../components/GestionarReportesModal.jsx';

const AvanceTrimestral = () => {
  const [proyectos, setProyectos] = useState([]);
  const [actividadesPlanificadas, setActividadesPlanificadas] = useState([]);
  const [actividadesEjecutadas, setActividadesEjecutadas] = useState([]);
  const [reportes, setReportes] = useState([]);  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProyecto, setSelectedProyecto] = useState('');
  const [selectedAno, setSelectedAno] = useState(1);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const [trimestreActual, setTrimestreActual] = useState(1);
  const [openReportesModal, setOpenReportesModal] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    trimestre: 1,
    real_actualizado: 0,
    porcentaje_cumplimiento: 0,
    observaciones: '',
    evidencia: '',
    evidencia_urls: [],
    calificacion: 0,
  });
  const [uploadedImages, setUploadedImages] = useState([]);

  // Cargar proyectos al inicio
  useEffect(() => {
    loadProyectos();
  }, []);

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

      // Cargar reportes del proyecto
      if (selectedProyecto) {
        try {
          const reportesData = await reportesService.getReportesByProyecto(selectedProyecto);
          setReportes(reportesData || []);
        } catch (err) {
          console.error('Error loading reportes:', err);
          setReportes([]);
        }
      }
    } catch (err) {
      console.error('Error loading actividades:', err);
      setError('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener actividades ejecutadas para un trimestre específico (global 1-12)
  const getActividadEjecutada = (actividadPlanificadaId, trimestreGlobal) => {
    const { ano, trimestre } = getAnoYTrimestre(trimestreGlobal);
    const actividadPlanificada = actividadesPlanificadas.find(ap => ap.id === actividadPlanificadaId);
    if (!actividadPlanificada || actividadPlanificada.ano !== ano) return null;
    
    return actividadesEjecutadas.find(
      (ae) => ae.actividad_planificada_id === actividadPlanificadaId && ae.trimestre === trimestre
    );
  };

  // Calcular progreso de un trimestre global (1-12)
  const calculateProgreso = (actividadPlanificadaId, trimestreGlobal) => {
    const { ano, trimestre } = getAnoYTrimestre(trimestreGlobal);
    const ejecutada = actividadesEjecutadas.find(
      (ae) => ae.actividad_planificada_id === actividadPlanificadaId && 
               ae.trimestre === trimestre &&
               actividadesPlanificadas.find(ap => ap.id === actividadPlanificadaId)?.ano === ano
    );
    return ejecutada?.porcentaje_cumplimiento || 0;
  };
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

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
    // Also update formData with image URLs for saving
    const newUrls = newImages.map(img => img.preview);
    setFormData({
      ...formData,
      evidencia_urls: [...formData.evidencia_urls, ...newUrls]
    });
  };

  // Remove uploaded image
  const removeImage = (index) => {
    const newImages = [...uploadedImages];
    // Revoke the URL to avoid memory leaks
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    setFormData({
      ...formData,
      evidencia_urls: newImages.map(img => img.preview || img)
    });
  };

  // Guardar avance trimestral
  const handleSaveAvance = async () => {
    try {
      setIsLoading(true);
      // Combine text evidence with image URLs
      const evidenciaConImagenes = formData.evidencia_urls.length > 0 
        ? JSON.stringify(formData.evidencia_urls)
        : formData.evidencia;
      
      const data = {
        actividad_planificada_id: editingActividad?.actividad_planificada_id || 
          actividadesPlanificadas[0]?.id,
        trimestre: trimestreActual,
        real_actualizado: formData.real_actualizado,
        porcentaje_cumplimiento: formData.porcentaje_cumplimiento,
        observaciones: formData.observaciones,
        evidencia: evidenciaConImagenes,
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

  // Obtener el año y trimestre del trimestre global
  const getAnoYTrimestre = (trimestreGlobal) => {
    return {
      ano: Math.ceil(trimestreGlobal / 4),
      trimestre: ((trimestreGlobal - 1) % 4) + 1
    };
  };

  // // Filtrar actividades por año del trimestre seleccionado
  // const actividadesFiltradas = actividadesPlanificadas.filter(
  //   (ap) => ap.ano === getAnoYTrimestre(trimestreActual).ano
  // );

  // Obtener el proyecto seleccionado con todos sus datos
  const proyectoSeleccionado = proyectos.find(p => p.id === selectedProyecto);

  // Calcular avance trimestral del proyecto (basado en meta_total y metas trimestrales)
  const getAvanceTrimestralProyecto = () => {
    if (!proyectoSeleccionado) return null;
    
    const metaTotal = parseFloat(proyectoSeleccionado.meta_total) || 0;
    const duracionAnos = parseInt(proyectoSeleccionado.duracion_anos) || 1;
    const medidaTipo = proyectoSeleccionado.medida_tipo || 'porcentaje';
    const totalTrimestres = duracionAnos * 4;
    
    // Obtener las metas trimestrales definidas en el proyecto
    const trimestresData = proyectoSeleccionado.trimestres || [];
    
    // Calcular meta trimestral esperada basada en las metas definidas en el proyecto
    // Si hay metas trimestrales definidas, usarlas; si no, calcular proporcional
    const getMetaTrimestralEsperada = (trimestre) => {
      // Buscar si hay una meta específica definida para este trimestre
      const trData = trimestresData.find(t => 
        t.trimestre === trimestre && t.ano === selectedAno
      );
      
      if (trData && trData.meta > 0) {
        return trData.meta;
      }
      
      // Si no hay meta definida, calcular proporcional
      return metaTotal / totalTrimestres;
    };
    
    // Calcular avance acumulado hasta el trimestre actual usando las metas reales
    let avanceAcumulado = 0;
    let totalEsperadoAcumulado = 0;
    
    for (let tr = 1; tr <= trimestreActual; tr++) {
      const metaTrimestral = getMetaTrimestralEsperada(tr);
      totalEsperadoAcumulado += metaTrimestral;
      
      // Sumar avance de cada actividad en este trimestre
      actividadesFiltradas.forEach(actividad => {
        const ejecutada = getActividadEjecutada(actividad.id, tr);
        if (ejecutada) {
          if (medidaTipo === 'porcentaje') {
            avanceAcumulado += ejecutada.porcentaje_cumplimiento || 0;
          } else {
            avanceAcumulado += ejecutada.real_actualizado || 0;
          }
        }
      });
    }
    
    // Calcular porcentaje de avance
    const avancePorcentaje = totalEsperadoAcumulado > 0 
      ? Math.min(100, (avanceAcumulado / totalEsperadoAcumulado) * 100) 
      : 0;
    
    return {
      metaTotal,
      medidaTipo,
      duracionAnos,
      totalTrimestres,
      metaTrimestralEsperada: getMetaTrimestralEsperada(trimestreActual),
      avanceAcumulado,
      avancePorcentaje,
      avanceTrimestre: tr => {
        // Avance específico de un trimestre
        let avance = 0;
        actividadesFiltradas.forEach(actividad => {
          const ejecutada = getActividadEjecutada(actividad.id, tr);
          if (ejecutada) {
            if (medidaTipo === 'porcentaje') {
              avance += ejecutada.porcentaje_cumplimiento || 0;
            } else {
              avance += ejecutada.real_actualizado || 0;
            }
          }
        });
        return avance;
      },
      getMetaTrimestralEsperada
    };
  };

  const avanceProyecto = getAvanceTrimestralProyecto();

  if (isLoading && proyectos.length === 0) {
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Avance Trimestral
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Captura el progreso de cada proyecto por trimestre
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ReportIcon />}
              onClick={() => selectedProyecto && setOpenReportesModal(true)}
              disabled={!selectedProyecto}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                height: 'fit-content'
              }}
            >
              Generar Reporte
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: 250 }}>
                <InputLabel>Seleccionar Proyecto</InputLabel>
                <Select
                  value={selectedProyecto}
                  label="Seleccionar Proyecto"
                  onChange={(e) => setSelectedProyecto(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">
                    <em>Seleccione un proyecto</em>
                  </MenuItem>
                  {proyectos.map((proyecto) => (
                    <MenuItem key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Año del Proyecto</InputLabel>
                <Select
                  value={selectedAno}
                  label="Año del Proyecto"
                  onChange={(e) => setSelectedAno(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value={1}>Año 1</MenuItem>
                  <MenuItem value={2}>Año 2</MenuItem>
                  <MenuItem value={3}>Año 3</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
          </Grid>
        </Paper>

        {selectedProyecto && (
          <>
            {/* Tabs de Trimestres - Agrupados por Año */}
            <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
              {/* Encabezado con Años */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white', p: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  📅 Trimestres del Proyecto
                </Typography>
              </Box>
              
              {/* Trimestres agrupados por año */}
              {Array.from({ length: proyectoSeleccionado?.duracion_anos || 1 }, (_, yearIndex) => {
                const ano = yearIndex + 1;
                return (
                  <Box key={ano} sx={{ mb: ano < (proyectoSeleccionado?.duracion_anos || 1) ? 2 : 0 }}>
                    {/* Título del Año */}
                    <Box sx={{ bgcolor: 'grey.100', p: 1.5, borderBottom: '1px solid #ddd' }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                        Año {ano}
                      </Typography>
                    </Box>
                    
                    {/* Trimestres del Año */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                      <Grid container>
                        {[1, 2, 3, 4].map((tr) => {
                          const trimestreGlobal = (ano - 1) * 4 + tr;
                          const promedioTrimestre = actividadesFiltradas.length > 0
                            ? actividadesFiltradas.reduce((sum, ap) => 
                                sum + calculateProgreso(ap.id, trimestreGlobal), 0) / actividadesFiltradas.length
                            : 0;
                          
                          return (
                            <Grid item xs={6} md={3} key={trimestreGlobal}>
                              <Box
                                sx={{
                                  p: 2,
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  bgcolor: trimestreActual === trimestreGlobal ? 'primary.main' : 'transparent',
                                  color: trimestreActual === trimestreGlobal ? 'white' : 'text.primary',
                                  transition: 'all 0.3s ease',
                                  borderBottom: trimestreActual === trimestreGlobal ? 'none' : '3px solid transparent',
                                  '&:hover': {
                                    bgcolor: trimestreActual === trimestreGlobal ? 'primary.dark' : 'rgba(128, 0, 32, 0.08)',
                                  },
                                }}
                                onClick={() => setTrimestreActual(trimestreGlobal)}
                              >
                                <Typography variant="subtitle1" fontWeight="bold">
                                  T{tr}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={promedioTrimestre}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: trimestreActual === trimestreGlobal ? 'rgba(255,255,255,0.3)' : 'grey.200',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: trimestreActual === trimestreGlobal ? 'white' : 'primary.main',
                                        borderRadius: 4,
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.9 }}>
                                    {promedioTrimestre.toFixed(0)}%
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Box>
                );
              })}
            </Paper>

            {/* Resumen del Avance Trimestral del Proyecto */}
            {proyectoSeleccionado && avanceProyecto && (
              <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                  📊 Resumen de Avance del Proyecto
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Meta Total
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          {avanceProyecto.metaTotal} {avanceProyecto.medidaTipo === 'porcentaje' ? '%' : 'uds'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Duración: {avanceProyecto.duracionAnos} año(s)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Meta Trimestral Esperada
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="info.main">
                          {avanceProyecto.metaTrimestralEsperada.toFixed(2)} {avanceProyecto.medidaTipo === 'porcentaje' ? '%' : 'uds'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {avanceProyecto.totalTrimestres} trimestres total
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Avance Trimestre {trimestreActual}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                          {avanceProyecto.avanceTrimestre(trimestreActual).toFixed(2)} {avanceProyecto.medidaTipo === 'porcentaje' ? '%' : 'uds'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          vs {avanceProyecto.metaTrimestralEsperada.toFixed(2)} esperado
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: avanceProyecto.avancePorcentaje >= 100 ? 'success.light' : avanceProyecto.avancePorcentaje >= 75 ? 'info.light' : avanceProyecto.avancePorcentaje >= 50 ? 'warning.light' : 'error.light' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Avance Acumulado
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {avanceProyecto.avancePorcentaje.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption">
                          {avanceProyecto.avanceAcumulado.toFixed(2)} / {avanceProyecto.metaTotal} {avanceProyecto.medidaTipo === 'porcentaje' ? '%' : 'uds'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* Indicador visual de avance vs esperado */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    Progreso esperado vs real (Trimestre {trimestreActual}):
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      Esperado:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{ flex: 1, height: 20, borderRadius: 2, bgcolor: 'grey.200' }}
                      color="info"
                    />
                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 60 }}>
                      {avanceProyecto.metaTrimestralEsperada.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      Real:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (avanceProyecto.avanceTrimestre(trimestreActual) / avanceProyecto.metaTrimestralEsperada) * 100)}
                      sx={{ flex: 1, height: 20, borderRadius: 2, bgcolor: 'grey.200' }}
                      color={avanceProyecto.avanceTrimestre(trimestreActual) >= avanceProyecto.metaTrimestralEsperada ? 'success' : 'warning'}
                    />
                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 60 }}>
                      {avanceProyecto.avanceTrimestre(trimestreActual).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
            {/* Sección de Reportes del Trimestre */}
            {reportes.length > 0 && (
              <Paper sx={{ mt: 3, borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6" fontWeight="bold">
                    📋 Reportes del Trimestre
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Cumplimiento</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportes
                        .filter(r => r.trimestre === trimestreActual && r.ano === selectedAno)
                        .map((reporte) => (
                          <TableRow key={reporte.id} hover>
                            <TableCell>{reporte.titulo}</TableCell>
                            <TableCell>
                              <Chip 
                                label={reporte.tipo_reporte === 'trimestral' ? 'Trimestral' : 'Anual'} 
                                size="small" 
                                color={reporte.tipo_reporte === 'trimestral' ? 'primary' : 'secondary'}
                              />
                            </TableCell>
                            <TableCell>{reporte.cumplimiento_meta}%</TableCell>
                            <TableCell>
                              <Chip 
                                label={reporte.estado} 
                                size="small" 
                                color={
                                  reporte.estado === 'aprobado' ? 'success' : 
                                  reporte.estado === 'enviado' ? 'info' : 
                                  reporte.estado === 'rechazado' ? 'error' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
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
              {/* Image Upload Section */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderStyle: 'dashed', borderColor: 'grey.400' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Subir Evidencias (Imágenes)
                  </Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<PhotoIcon />}
                      sx={{ mb: 2 }}
                    >
                      Seleccionar Imágenes
                    </Button>
                  </label>
                  {uploadedImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Imágenes adjuntas ({uploadedImages.length}):
                      </Typography>
                      <Grid container spacing={1}>
                        {uploadedImages.map((img, index) => (
                          <Grid item xs={4} key={index}>
                            <Box sx={{ position: 'relative' }}>
                              <img
                                src={img.preview || img}
                                alt={`Evidencia ${index + 1}`}
                                style={{ 
                                  width: '100%', 
                                  height: 80, 
                                  objectFit: 'cover', 
                                  borderRadius: 8,
                                  border: '1px solid #ddd'
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeImage(index)}
                                sx={{ 
                                  position: 'absolute', 
                                  top: -8, 
                                  right: -8, 
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'error.dark' },
                                  width: 24,
                                  height: 24
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Paper>
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
        
        {/* Modal de Gestionar Reportes */}
        {selectedProyecto && (
          <GestionarReportesModal
            isOpen={openReportesModal}
            onClose={() => setOpenReportesModal(false)}
            proyecto={proyectoSeleccionado}
            onReportesActualizados={() => loadActividades()}
          />
        )}
      </Box>
    </Fade>
  );
};

export default AvanceTrimestral;