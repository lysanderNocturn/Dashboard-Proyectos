import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Folder as FolderIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProyectos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await proyectosService.getProyectos();
      setProyectos(data);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error(err);
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
      month: 'long',
      day: 'numeric',
    });
  };

  // Estadísticas
  const totalProyectos = proyectos.length;
  const proyectosActivos = proyectos.filter(p => p.estado_actual === 'Activo').length;
  const proyectosCompletados = proyectos.filter(p => p.estado_actual === 'Completado').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadProyectos}
          disabled={isLoading}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Cards de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3">{totalProyectos}</Typography>
                  <Typography variant="body1">Total de Proyectos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3">{proyectosActivos}</Typography>
                  <Typography variant="body1">Proyectos Activos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3">{proyectosCompletados}</Typography>
                  <Typography variant="body1">Completados</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Proyectos */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography variant="h6">Proyectos Recientes</Typography>
        </Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Descripción</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Fecha de Creación</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay proyectos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  proyectos.slice(0, 5).map((proyecto) => (
                    <TableRow key={proyecto.id} hover>
                      <TableCell>{proyecto.id}</TableCell>
                      <TableCell>{proyecto.nombre}</TableCell>
                      <TableCell>
                        {proyecto.descripcion?.length > 50
                          ? `${proyecto.descripcion.substring(0, 50)}...`
                          : proyecto.descripcion || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={proyecto.estado_actual || 'Sin estado'}
                          color={getEstadoColor(proyecto.estado_actual)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(proyecto.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
