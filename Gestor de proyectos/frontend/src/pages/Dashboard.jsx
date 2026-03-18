import { useState, useEffect, useMemo } from 'react';
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
  
  // Memoized stats to avoid recalculating on every render
  const stats = useMemo(() => {
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
    
    return { proyectosActivos, proyectosCompletados, proyectosPendientes, promedioProgreso };
  }, [proyectos]);
  
  const { proyectosActivos, proyectosCompletados, proyectosPendientes, promedioProgreso } = stats;

  const statCards = [
    { 
      title: 'Total de Proyectos', 
      value: totalProyectos, 
      icon: <FolderIcon />, 
      gradient: 'linear-gradient(135deg, #ea6666 0%, #a24b4b 100%)',
      badge: '📊',
      description: 'Proyectos registrados'
    },
    { 
      title: 'Proyectos Activos', 
      value: proyectosActivos, 
      icon: <TrendingUpIcon />, 
      gradient: 'linear-gradient(135deg, #991111 0%, #ef3838 100%)',
      badge: '✅',
      description: 'En ejecución'
    },
    { 
      title: 'Completados', 
      value: proyectosCompletados, 
      icon: <CheckCircleIcon />, 
      gradient: 'linear-gradient(135deg, #fe4f4f 0%, #fe0000 100%)',
      badge: '🎯',
      description: 'Objetivos alcanzados'
    },
    { 
      title: 'Pendientes', 
      value: proyectosPendientes, 
      icon: <TimeIcon />, 
      gradient: 'linear-gradient(135deg, #fb9393 0%, #f55757 100%)',
      badge: '⏳',
      description: 'Por iniciar'
    },
  ];

  return (
    <Fade in>
      <Box sx={{ px: 3, pb: 3 }}>
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
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
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                POA
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5, fontSize: '1.1rem' }}>
                Bienvenido al Sistema de Proyectos Presupuestales
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadProyectos}
              disabled={isLoading}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255,255,255,0.15)' 
                },
                borderRadius: 2,
                px: 3
              }}
            >
              {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Actualizar'}
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>Progreso General</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{promedioProgreso.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(promedioProgreso, 100)} 
              sx={{ 
                height: 12, 
                borderRadius: 6,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': { 
                  bgcolor: '#fff', 
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(255,255,255,0.3)'
                } 
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
        <Grid container spacing={4} sx={{ mb: 4 }} justifyContent="center">
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    background: stat.gradient, 
                    color: 'white', 
                    transition: 'all 0.3s ease', 
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 180,
                    '&:hover': { 
                      transform: 'translateY(-8px)', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      '& .stat-icon': { transform: 'scale(1.2) rotate(5deg)' },
                      '& .stat-badge': { opacity: 1, transform: 'scale(1)' }
                    } 
                  }}
                >
                  {/* Decorative circle */}
                  <Box sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                  }} />
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar 
                        className="stat-icon"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          width: 56, 
                          height: 56,
                          transition: 'transform 0.3s ease',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Box 
                        className="stat-badge"
                        sx={{
                          opacity: 0.7,
                          transform: 'scale(0.8)',
                          transition: 'all 0.3s ease',
                          fontSize: '2rem'
                        }}
                      >
                        {stat.badge}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 'medium' }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', mt: 0.5 }}>
                        {stat.description}
                      </Typography>
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
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
              }}
            >
              <Box sx={{ 
                p: 2, 
                mg: 3,
                borderBottom: '1px solid', 
                borderColor: 'divider', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'linear-gradient(135deg, #ea6666 15%, #ffffff 100%)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FlagIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Proyectos Recientes</Typography>
                    <Typography variant="caption" color="text.secondary">Lista de proyectos registrados</Typography>
                  </Box>
                </Box>
                <Button 
                  variant="text" 
                  endIcon={<ArrowForwardIcon />} 
                  onClick={() => navigate('/proyectos')}
                  sx={{ fontWeight: 'medium', borderRadius: 2 }}
                >
                  Ver todos
                </Button>
              </Box>
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Proyecto</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Unidad Adm.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Departamento</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Meta</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Progreso</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proyectos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <FolderIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                              <Typography color="text.secondary" gutterBottom>No hay proyectos</Typography>
                              <Button variant="contained" sx={{ mt: 2, borderRadius: 2 }} onClick={() => navigate('/proyectos')}>Crear proyecto</Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        proyectos.slice(0, 5).map((proyecto) => {
                          const meses = Array.isArray(proyecto.trimestres) ? proyecto.trimestres : [];
                          const progreso = Number(meses.reduce((sum, t) => sum + (Number(t.porcentaje) || 0), 0)) || 0;
                          return (
                            <TableRow 
                              key={proyecto.id} 
                              hover
                              sx={{ 
                                '&:hover': { bgcolor: 'rgba(128, 0, 32, 0.04)' },
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              <TableCell sx={{ py: 2 }}>
                                <Typography fontWeight="medium">{proyecto.nombre}</Typography>
                                <Typography variant="caption" color="text.secondary">{formatDate(proyecto.fecha_inicio)}</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2">{proyecto.unidad_nombre || '-'}</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2">{proyecto.departamento_nombre || '-'}</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Chip 
                                  label={`${proyecto.meta_total || 0}${proyecto.medida_tipo === 'porcentaje' ? '%' : ''}`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                  sx={{ fontWeight: 'medium' }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Chip 
                                  label={proyecto.estado_actual || 'Sin estado'} 
                                  color={getEstadoColor(proyecto.estado_actual)} 
                                  size="small"
                                  sx={{ fontWeight: 'medium' }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Tooltip title={`${progreso.toFixed(0)}%`}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 100 }}>
                                    <Box sx={{ flex: 1, bgcolor: 'grey.100', borderRadius: 1.5, height: 10, minWidth: 70 }}>
                                      <Box sx={{ 
                                        width: `${Math.min(progreso, 100)}%`, 
                                        bgcolor: progreso >= 100 ? 'success.main' : 'primary.main', 
                                        height: '100%', 
                                        borderRadius: 1.5,
                                        transition: 'width 0.5s ease'
                                      }} />
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium" sx={{ minWidth: 40 }}>{progreso.toFixed(0)}%</Typography>
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
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 4, 
                transition: 'all 0.3s ease', 
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                height: '100%',
                '&:hover': { 
                  boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px)'
                } 
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'primary.main',
                    color: 'white',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PieChartIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Resumen de Proyectos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Estado actual
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ my: 3 }}>
                  {[
                    { estado: 'Activo', color: '#11998e' },
                    { estado: 'En Progreso', color: '#4facfe' },
                    { estado: 'Pendiente', color: '#f59e0b' },
                    { estado: 'Completado', color: '#10b981' },
                    { estado: 'Cancelado', color: '#ef4444' }
                  ].map(({ estado, color }) => {
                    const count = proyectos.filter(p => p.estado_actual === estado).length;
                    const percentage = totalProyectos > 0 ? (count / totalProyectos) * 100 : 0;
                    return (
                      <Tooltip key={estado} title={`${count} proyecto(s)`} arrow placement="left">
                        <Box sx={{ 
                          mb: 2.5, 
                          cursor: 'pointer', 
                          transition: 'all 0.2s', 
                          p: 1.5,
                          borderRadius: 2,
                          '&:hover': { 
                            transform: 'scale(1.02)',
                            bgcolor: 'rgba(0,0,0,0.02)'
                          } 
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                              <Typography variant="body2" fontWeight="medium">{estado}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold" color="primary">{count}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: 'grey.100',
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: color,
                                borderRadius: 5,
                                transition: 'width 0.5s ease'
                              } 
                            }} 
                          />
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 16 }} />
                    Actualizado: {new Date().toLocaleDateString('es-ES')}
                  </Typography>
                  <Chip 
                    label={`${proyectos.length} total`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
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
