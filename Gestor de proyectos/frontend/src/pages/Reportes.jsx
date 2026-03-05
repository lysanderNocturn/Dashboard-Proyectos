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
  Fade,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as ReportIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { proyectosService } from '../services/proyectosService.js';
import { actividadesService } from '../services/actividadesService.js';

const Reportes = () => {
  const [proyectos, setProyectos] = useState([]);
  const [actividadesEjecutadas, setActividadesEjecutadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProyecto, setSelectedProyecto] = useState('todos');
  const [selectedAno, setSelectedAno] = useState(1);
  const [reporteGenerado, setReporteGenerado] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [proyectosData, ejecutadasData] = await Promise.all([
        proyectosService.getProyectos(),
        actividadesService.getActividadesEjecutadas(),
      ]);
      setProyectos(proyectosData || []);
      setActividadesEjecutadas(ejecutadasData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generar reporte
  const generarReporte = () => {
    setReporteGenerado(true);
  };

  // Exportar a PDF (simulado)
  const exportarPDF = () => {
    alert('Función de exportación a PDF en desarrollo');
  };

  // Exportar a Excel (simulado)
  const exportarExcel = () => {
    alert('Función de exportación a Excel en desarrollo');
  };

  // Filtrar proyectos
  const proyectosFiltrados = selectedProyecto === 'todos'
    ? proyectos
    : proyectos.filter(p => p.id === Number(selectedProyecto));

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const stats = {
      totalProyectos: proyectosFiltrados.length,
      proyectosActivos: proyectosFiltrados.filter(p => p.estado_actual === 'Activo').length,
      proyectosCompletados: proyectosFiltrados.filter(p => p.estado_actual === 'Completado').length,
      promedioAvance: 0,
      actividadesRegistradas: 0,
    };

    // Calcular promedio de avance por trimestres
    let totalAvance = 0;
    let proyectosConTrimestres = 0;
    proyectosFiltrados.forEach(p => {
      if (p.trimestres && Array.isArray(p.trimestres) && p.trimestres.length > 0) {
        const avance = p.trimestres.reduce((sum, t) => sum + (Number(t.porcentaje) || 0), 0);
        totalAvance += avance;
        proyectosConTrimestres++;
      }
    });
    stats.promedioAvance = proyectosConTrimestres > 0 ? totalAvance / proyectosConTrimestres : 0;

    // Contar actividades ejecutadas
    stats.actividadesRegistradas = actividadesEjecutadas.length;

    return stats;
  };

  const stats = calcularEstadisticas();

  // Obtener actividades por proyecto
  const getActividadesPorProyecto = (proyectoId) => {
    return actividadesEjecutadas.filter(ae => {
      const planificada = actividadesEjecutadas.find(a => a.actividad_planificada_id === ae.actividad_planificada_id);
      return true; // Simplificado
    });
  };

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
            Reportes e Informes
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Genera informes detallados del progreso de los proyectos
          </Typography>
        </Paper>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Proyecto</InputLabel>
                <Select
                  value={selectedProyecto}
                  label="Proyecto"
                  onChange={(e) => setSelectedProyecto(e.target.value)}
                >
                  <MenuItem value="todos">Todos los Proyectos</MenuItem>
                  {proyectos.map((proyecto) => (
                    <MenuItem key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Año</InputLabel>
                <Select
                  value={selectedAno}
                  label="Año"
                  onChange={(e) => setSelectedAno(e.target.value)}
                >
                  <MenuItem value={1}>Año 1</MenuItem>
                  <MenuItem value={2}>Año 2</MenuItem>
                  <MenuItem value={3}>Año 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ReportIcon />}
                onClick={generarReporte}
                sx={{ py: 1.5 }}
              >
                Generar Reporte
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {reporteGenerado && (
          <>
            {/* Resumen Ejecutivo */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📊 Resumen Ejecutivo - {selectedAno === 1 ? 'Primer Año' : `Año ${selectedAno}`}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {stats.totalProyectos}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Proyectos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {stats.proyectosActivos}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Proyectos Activos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {stats.proyectosCompletados}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completados
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {stats.promedioAvance.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Promedio Avance
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Tabla de Proyectos */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  📋 Detalle de Proyectos
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    onClick={exportarPDF}
                    size="small"
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExcelIcon />}
                    onClick={exportarExcel}
                    size="small"
                  >
                    Excel
                  </Button>
                </Box>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Proyecto</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Meta</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Duración</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Avance</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Evaluación</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proyectosFiltrados.map((proyecto) => {
                      const meses = Array.isArray(proyecto.trimestres) ? proyecto.trimestres : [];
                      const avance = Number(meses.reduce((sum, t) => sum + (Number(t.porcentaje) || 0), 0)) || 0;
                      
                      return (
                        <TableRow key={proyecto.id} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{proyecto.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {proyecto.descripcion?.substring(0, 50)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={proyecto.estado_actual || 'Sin estado'} 
                              size="small" 
                              color={proyecto.estado_actual === 'Activo' ? 'success' : 
                                    proyecto.estado_actual === 'Completado' ? 'info' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {proyecto.meta_total} {proyecto.medida_tipo === 'porcentaje' ? '%' : 'uds'}
                          </TableCell>
                          <TableCell>
                            {proyecto.duracion_anos} año(s)
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 60, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                                <Box 
                                  sx={{ 
                                    width: `${Math.min(avance, 100)}%`, 
                                    bgcolor: avance >= 100 ? 'success.main' : 'primary.main', 
                                    height: '100%', 
                                    borderRadius: 1 
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2">{avance.toFixed(0)}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {proyecto.evaluacion || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Información adicional */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📅 Información del Período
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Período Reportado
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        Año {selectedAno} - Trimestres 1-4
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReportIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Generación
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date().toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {!reporteGenerado && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <ReportIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Seleccione los filtros y genere un reporte
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los informes le mostrarán el progreso detallado de los proyectos
            </Typography>
          </Paper>
        )}
      </Box>
    </Fade>
  );
};

export default Reportes;
