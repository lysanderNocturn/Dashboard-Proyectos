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
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as ReportIcon,
  CalendarMonth as CalendarIcon,
  Business as UnidadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { proyectosService } from '../services/proyectosService.js';
import { actividadesService } from '../services/actividadesService.js';
import { unidadService } from '../services/parametrosService.js';
import GestionarReportesModal from '../components/GestionarReportesModal.jsx';

const Reportes = () => {
  const [proyectos, setProyectos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [actividadesEjecutadas, setActividadesEjecutadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnidad, setSelectedUnidad] = useState('todos');
  const [selectedProyecto, setSelectedProyecto] = useState('todos');
  const [selectedAno, setSelectedAno] = useState(1);
  const [reporteGenerado, setReporteGenerado] = useState(false);
  const [error, setError] = useState(null);
  // Estado para el modal de gestionar reportes
  const [openReportesModal, setOpenReportesModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [proyectosData, ejecutadasData, unidadesData] = await Promise.all([
        proyectosService.getProyectos(),
        actividadesService.getActividadesEjecutadas(),
        unidadService.getUnidades(),
      ]);
      setProyectos(proyectosData || []);
      setActividadesEjecutadas(ejecutadasData || []);
      setUnidades(unidadesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
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

  // Filtrar proyectos por unidad administrativa (para dropdown)
  const proyectosFiltrados = selectedUnidad === 'todos'
    ? proyectos
    : proyectos.filter(p => p.unidad_administrativa_id === Number(selectedUnidad));

  // Filtrar proyectos para mostrar en tabla (por unidad Y por proyecto)
  const proyectosAMostrar = selectedProyecto === 'todos'
    ? proyectosFiltrados
    : proyectosFiltrados.filter(p => p.id === Number(selectedProyecto));

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const stats = {
      totalProyectos: proyectosAMostrar.length,
      proyectosActivos: proyectosAMostrar.filter(p => p.estado_actual === 'Activo').length,
      proyectosCompletados: proyectosAMostrar.filter(p => p.estado_actual === 'Completado').length,
      proyectosPendientes: proyectosAMostrar.filter(p => p.estado_actual === 'Pendiente').length,
      promedioAvance: 0,
      actividadesRegistradas: 0,
    };

    // Calcular promedio de avance por trimestres
    let totalAvance = 0;
    let proyectosConTrimestres = 0;
    proyectosAMostrar.forEach(p => {
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

  // Obtener nombre de unidad administrativa
  const getUnidadNombre = (unidadId) => {
    const unidad = unidades.find(u => u.id === unidadId);
    return unidad?.nombre || '-';
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
            Reportes e Informes
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1, position: 'relative', zIndex: 1 }}>
            Genera informes detallados del progreso de los proyectos por unidad administrativa
          </Typography>
          <Box sx={{ position: 'relative', zIndex: 1, mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (proyectos.length > 0) {
                  const proyecto = proyectoSeleccionado || proyectos[0];
                  setProyectoSeleccionado(proyecto);
                  setOpenReportesModal(true);
                } else {
                  alert('No hay proyectos disponibles. Cree un proyecto primero.');
                }
              }}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              Nuevo Reporte
            </Button>
            {proyectos.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <Select
                  value={proyectoSeleccionado?.id || ''}
                  onChange={(e) => {
                    const proyecto = proyectos.find(p => p.id === e.target.value);
                    setProyectoSeleccionado(proyecto);
                  }}
                  displayEmpty
                  sx={{ bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1, '& .MuiSelect-select': { py: 1 } }}
                >
                  <MenuItem value="">Seleccionar Proyecto</MenuItem>
                  {proyectos.map((proyecto) => (
                    <MenuItem key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Unidad Administrativa</InputLabel>
                <Select
                  value={selectedUnidad}
                  label="Unidad Administrativa"
                  onChange={(e) => { setSelectedUnidad(e.target.value); setSelectedProyecto('todos'); }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="todos">Todas las Unidades</MenuItem>
                  {unidades.map((unidad) => (
                    <MenuItem key={unidad.id} value={unidad.id}>
                      {unidad.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Proyecto</InputLabel>
                <Select
                  value={selectedProyecto}
                  label="Proyecto"
                  onChange={(e) => setSelectedProyecto(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="todos">Todos los Proyectos</MenuItem>
                  {proyectosFiltrados.map((proyecto) => (
                    <MenuItem key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel>Año</InputLabel>
                <Select
                  value={selectedAno}
                  label="Año"
                  onChange={(e) => setSelectedAno(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ 
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px rgba(128, 0, 32, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(128, 0, 32, 0.4)',
                  }
                }}
              >
                Generar Reporte
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {reporteGenerado && (
          <>
            {/* Resumen Ejecutivo */}
            <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 Resumen Ejecutivo - {selectedAno === 1 ? 'Primer Año' : `Año ${selectedAno}`}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      borderRadius: 4, 
                      textAlign: 'center', 
                      p: 3, 
                      bgcolor: 'grey.50', 
                      transition: 'all 0.3s ease', 
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { 
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)', 
                        transform: 'translateY(-6px)',
                        '& .card-icon': { transform: 'scale(1.3) rotate(10deg)' }
                      } 
                    }}
                  >
                    <Box className="card-icon" sx={{ fontSize: '3rem', mb: 1, transition: 'transform 0.3s ease' }}>📊</Box>
                    <CardContent>
                      <Typography variant="h3" color="primary" fontWeight="bold">
                        {stats.totalProyectos}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="text.secondary">
                        Total Proyectos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      borderRadius: 4, 
                      textAlign: 'center', 
                      p: 3, 
                      bgcolor: 'grey.50', 
                      transition: 'all 0.3s ease', 
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { 
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)', 
                        transform: 'translateY(-6px)',
                        '& .card-icon': { transform: 'scale(1.3) rotate(10deg)' }
                      } 
                    }}
                  >
                    <Box className="card-icon" sx={{ fontSize: '3rem', mb: 1, transition: 'transform 0.3s ease' }}>✅</Box>
                    <CardContent>
                      <Typography variant="h3" color="success.main" fontWeight="bold">
                        {stats.proyectosActivos}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="text.secondary">
                        Proyectos Activos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      borderRadius: 4, 
                      textAlign: 'center', 
                      p: 3, 
                      bgcolor: 'grey.50', 
                      transition: 'all 0.3s ease', 
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { 
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)', 
                        transform: 'translateY(-6px)',
                        '& .card-icon': { transform: 'scale(1.3) rotate(10deg)' }
                      } 
                    }}
                  >
                    <Box className="card-icon" sx={{ fontSize: '3rem', mb: 1, transition: 'transform 0.3s ease' }}>🎯</Box>
                    <CardContent>
                      <Typography variant="h3" color="info.main" fontWeight="bold">
                        {stats.proyectosCompletados}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="text.secondary">
                        Completados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      borderRadius: 4, 
                      textAlign: 'center', 
                      p: 3, 
                      bgcolor: 'grey.50', 
                      transition: 'all 0.3s ease', 
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { 
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)', 
                        transform: 'translateY(-6px)',
                        '& .card-icon': { transform: 'scale(1.3) rotate(10deg)' }
                      } 
                    }}
                  >
                    <Box className="card-icon" sx={{ fontSize: '3rem', mb: 1, transition: 'transform 0.3s ease' }}>📈</Box>
                    <CardContent>
                      <Typography variant="h3" color="warning.main" fontWeight="bold">
                        {stats.promedioAvance.toFixed(1)}%
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="text.secondary">
                        Promedio Avance
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Tabla de Proyectos */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 Detalle de Proyectos - {selectedUnidad === 'todos' ? 'Todas las Unidades' : getUnidadNombre(Number(selectedUnidad))}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    onClick={exportarPDF}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExcelIcon />}
                    onClick={exportarExcel}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Excel
                  </Button>
                </Box>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Proyecto</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Unidad</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Meta</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Duración</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Avance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proyectosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <UnidadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                            <Typography color="text.secondary">No hay proyectos para esta unidad administrativa</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      proyectosAMostrar.map((proyecto) => {
                        const meses = Array.isArray(proyecto.trimestres) ? proyecto.trimestres : [];
                        const avance = Number(meses.reduce((sum, t) => sum + (Number(t.porcentaje) || 0), 0)) || 0;
                        
                        return (
                          <TableRow 
                            key={proyecto.id} 
                            hover
                            sx={{ '&:hover': { bgcolor: 'rgba(128, 0, 32, 0.04)' } }}
                          >
                            <TableCell sx={{ py: 2 }}>
                              <Typography fontWeight="medium">{proyecto.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {proyecto.descripcion?.substring(0, 50)}...
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={getUnidadNombre(proyecto.unidad_administrativa_id)} 
                                size="small" 
                                color="default" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={proyecto.estado_actual || 'Sin estado'} 
                                size="small" 
                                color={proyecto.estado_actual === 'Activo' ? 'success' : 
                                      proyecto.estado_actual === 'Completado' ? 'info' : 
                                      proyecto.estado_actual === 'Pendiente' ? 'warning' : 'default'}
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography fontWeight="medium">{proyecto.meta_total} {proyecto.medida_tipo === 'porcentaje' ? '%' : 'uds'}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography fontWeight="medium">{proyecto.duracion_anos} año(s)</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 70, bgcolor: 'grey.100', borderRadius: 1.5, height: 10 }}>
                                  <Box 
                                    sx={{ 
                                      width: `${Math.min(avance, 100)}%`, 
                                      bgcolor: avance >= 100 ? 'success.main' : 'primary.main', 
                                      height: '100%', 
                                      borderRadius: 1.5,
                                      transition: 'width 0.5s ease'
                                    }} 
                                  />
                                </Box>
                                <Typography variant="body2" fontWeight="medium">{avance.toFixed(0)}%</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
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
              Los informes le mostrarán el progreso detallado de los proyectos por unidad administrativa
            </Typography>
          </Paper>
        )}

        {/* Modal para gestionar reportes trimestrales/anuales */}
        <GestionarReportesModal
          isOpen={openReportesModal}
          onClose={() => setOpenReportesModal(false)}
          proyectoId={proyectoSeleccionado?.id}
          onReporteSeleccionado={(reporte) => {
            setReporteSeleccionado(reporte);
            setOpenReportesModal(false);
          }}
        />
      </Box>
    </Fade>
  );
};

export default Reportes;
