import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proyectosService } from '../services/proyectosService.js';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Fade,
  Zoom,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Folder as FolderIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  PieChart as PieChartIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProyectos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await proyectosService.getProyectos();
      console.log('Dashboard - Proyectos cargados:', data);
      setProyectos(data || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Error al cargar los proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProyectos();
  }, []);

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

  const totalProyectos = proyectos.length;
  const proyectosActivos = proyectos.filter(p => p.estado_actual === 'Activo').length;
  const proyectosCompletados = proyectos.filter(p => p.estado_actual === 'Completado').length;
  const proyectosPendientes = proyectos.filter(p => p.estado_actual === 'Pendiente').length;
  
  const promedioProgreso = proyectos.length > 0
    ? proyectos.reduce((sum, p) => {
        const meses = Array.isArray(p.trimestres) ? p.trimestres : [];
        const prog = Number(meses.reduce((t, tr) => t + (Number(tr.porcentaje) || 0), 0)) || 0;
        return sum + prog;
      }, 0) / proyectos.length
    : 0;

  const statCards = [
    { title: 'Total', value: totalProyectos, icon: <FolderIcon />, gradient: 'linear-gradient(135deg, #800020 0%, #a3405c 100%)' },
    { title: 'Activos', value: proyectosActivos, icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #8B0000 0%, #CD5C5C 100%)' },
    { title: 'Completados', value: proyectosCompletados, icon: <CheckCircleIcon />, gradient: 'linear-gradient(135deg, #722F37 0%, #965058 100%)' },
    { title: 'Pendientes', value: proyectosPendientes, icon: <TimeIcon />, gradient: 'linear-gradient(135deg, #800020 0%, #c44d5e 100%)' },
  ];

  return (
    <Fade in>
      <Box>
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
            color: 'white',
            borderRadius: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold">
                Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Bienvenido al Sistema de Gestión de Proyectos
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<TimelineIcon />}
              onClick={() => navigate('/avance')}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                mr: 1,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Avance Trimestral
            </Button>
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
              {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Actualizar'}
            </Button>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Progreso General</Typography>
              <Typography variant="body2" fontWeight="bold">{promedioProgreso.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(promedioProgreso, 100)} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': { bgcolor: 'white', borderRadius: 5 }
              }}
            />
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
                <Card sx={{ borderRadius: 3, background: stat.gradient, color: 'white', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>{stat.icon}</Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>{stat.title}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Projects Table & Summary */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold"><FlagIcon color="primary" sx={{ mr: 1 }} />Proyectos Recientes</Typography>
                <Button variant="text" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/proyectos')}>Ver todos</Button>
              </Box>
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell><strong>Proyecto</strong></TableCell>
                        <TableCell><strong>Meta</strong></TableCell>
                        <TableCell><strong>Estado</strong></TableCell>
                        <TableCell><strong>Progreso</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proyectos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No hay proyectos</Typography>
                            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/proyectos')}>Crear proyecto</Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        proyectos.slice(0, 5).map((proyecto) => {
                          const meses = Array.isArray(proyecto.trimestres) ? proyecto.trimestres : [];
                          const progreso = Number(meses.reduce((sum, t) => sum + (Number(t.porcentaje) || 0), 0)) || 0;
                          return (
                            <TableRow key={proyecto.id} hover>
                              <TableCell>
                                <Typography fontWeight="medium">{proyecto.nombre}</Typography>
                                <Typography variant="caption" color="text.secondary">{formatDate(proyecto.fecha_inicio)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={`${proyecto.meta_total || 0}${proyecto.medida_tipo === 'porcentaje' ? '%' : ''}`} size="small" color="primary" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Chip label={proyecto.estado_actual || 'Sin estado'} color={getEstadoColor(proyecto.estado_actual)} size="small" />
                              </TableCell>
                              <TableCell>
                                <Tooltip title={`${progreso.toFixed(0)}%`}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8, minWidth: 60 }}>
                                      <Box sx={{ width: `${Math.min(progreso, 100)}%`, bgcolor: progreso >= 100 ? 'success.main' : 'primary.main', height: '100%', borderRadius: 1 }} />
                                    </Box>
                                    <Typography variant="caption">{progreso.toFixed(0)}%</Typography>
                                  </Box>
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
          </Grid>

          {/* Summary Panel */}
          <Grid item xs={12} lg={4}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom><PieChartIcon color="primary" sx={{ mr: 1 }} />Resumen</Typography>
                <Box sx={{ my: 2 }}>
                  {['Activo', 'En Progreso', 'Pendiente', 'Completado', 'Cancelado'].map((estado) => {
                    const count = proyectos.filter(p => p.estado_actual === estado).length;
                    const percentage = totalProyectos > 0 ? (count / totalProyectos) * 100 : 0;
                    return (
                      <Box key={estado} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{estado}</Typography>
                          <Typography variant="body2" fontWeight="medium">{count}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={percentage} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    );
                  })}
                </Box>
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    <CalendarIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Actualizado: {new Date().toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Dashboard;
