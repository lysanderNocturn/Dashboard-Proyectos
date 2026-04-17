import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { proyectosService } from '../services/proyectosService.js';
import { actividadesService } from '../services/actividadesService.js';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  GridOn as GridOnIcon,
} from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';

export default function AvanceTrimestral() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState({
    actividad_planeada_id: '',
    trimestre: 1,
    observaciones: EditorState.createEmpty(),
    evidencia: '',
    evidenciaFile: null,
    porcentaje_cumplimiento: 0,
    unidades_cumplidas: 0,
    obstaculos: EditorState.createEmpty(),
    calificacion: '',
    fecha_ejecucion: '',
    documentacion_adjunta: null,
    razon: EditorState.createEmpty()
  });
  const [plannedActivities, setPlannedActivities] = useState([]);

  const proyectoId = searchParams.get('proyecto');

  // Calculate total progress - must be before any conditional returns
  const totalProgress = useMemo(() => {
    if (!activities || activities.length === 0) return 0;
    const total = activities.reduce((sum, activity) => sum + (Number(activity.porcentaje_cumplimiento) || 0), 0);
    return activities.length > 0 ? Math.round(total / activities.length) : 0;
  }, [activities]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        if (mountedRef.current) setLoadingProjects(true);
        const projectsData = await proyectosService.getProyectos();
        if (mountedRef.current) {
          setProjects(Array.isArray(projectsData) ? projectsData : []);
          setLoadingProjects(false);
        }
      } catch (err) {
        console.error('Error cargando proyectos:', err);
        if (mountedRef.current) {
          setError('Error al cargar la lista de proyectos');
          setLoadingProjects(false);
        }
      }
    };

    loadProjects();
  }, []);

  // carga el proyecto seleccionado y sus actividades
  useEffect(() => {
    const loadProjectAndActivities = async () => {
      if (!proyectoId) {
        if (mountedRef.current) {
          setProject(null);
          setActivities([]);
          setPlannedActivities([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (mountedRef.current) {
          setLoading(true);
          setError(null);
        }
        const [projectData, activitiesData] = await Promise.all([
          proyectosService.getProyectoById(proyectoId),
          actividadesService.getActividadesEjecutadasByProyecto(proyectoId),
        ]);
        if (mountedRef.current) {
          setProject(projectData);
          setActivities(Array.isArray(activitiesData) ? activitiesData : []);
          setPlannedActivities(Array.isArray(projectData?.actividades) ? projectData.actividades : []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error cargando proyecto y actividades:', err);
        if (mountedRef.current) {
          setError('Error al cargar el proyecto y sus actividades: ' + (err.message || 'Error desconocido'));
          setLoading(false);
        }
      }
    };

    loadProjectAndActivities();
  }, [proyectoId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  // Proyecto no seleccionado
  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            📊 Avance Trimestral de Proyectos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Selecciona un proyecto para ver su avance trimestral
          </Typography>

          {loadingProjects ? (
            <CircularProgress />
          ) : (
            <FormControl fullWidth sx={{ maxWidth: 400, mx: 'auto' }}>
              <InputLabel>Seleccionar Proyecto</InputLabel>
              <Select
                value=""
                label="Seleccionar Proyecto"
                onChange={(e) => {
                  setSearchParams({ proyecto: e.target.value });
                }}
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
                {projects.length === 0 ? (
                  <MenuItem disabled>No hay proyectos disponibles</MenuItem>
                ) : (
                  projects.map((proj) => (
                    <MenuItem
                      key={proj.id}
                      value={proj.id}
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
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                          fontSize: '1rem',
                        }}
                      >
                        {proj.nombre}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.875rem',
                          marginTop: '2px',
                        }}
                      >
                        Estado: {proj.estado_actual}
                      </Typography>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}

          {projects.length === 0 && !loadingProjects && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No hay proyectos registrados. Crea un proyecto primero.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/proyectos')}
                sx={{ bgcolor: '#800020' }}
              >
                Ir a Gestión de Proyectos
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    );
  }

  // 5. Función para guardar el progreso editado de una actividad
  const handleSaveActivityProgress = async (activityId, newProgress) => {
    try {
      const updateData = { porcentaje_cumplimiento: newProgress };
      const updatedActivity = await actividadesService.updateActividadEjecutada(activityId, updateData);
      if (mountedRef.current) {
        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === activityId ? { ...activity, porcentaje_cumplimiento: updatedActivity.porcentaje_cumplimiento } : activity
          )
        );
        setEditingActivity(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Error al guardar el progreso de la actividad: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  // Funciones para el modal de registro de avances
  const handleOpenModal = (activity = null) => {
    if (activity) {
      setModalData({
        actividad_planeada_id: activity.actividad_planeada_id || '',
        trimestre: activity.trimestre || 1,
        observaciones: activity.descripcion ? EditorState.createWithContent(ContentState.createFromText(activity.descripcion)) : EditorState.createEmpty(),
        evidencia: activity.evidencia || '',
        evidenciaFile: null,
        porcentaje_cumplimiento: activity.porcentaje_cumplimiento || 0,
        unidades_cumplidas: 0,
        obstaculos: EditorState.createEmpty(),
        calificacion: '',
        fecha_ejecucion: '',
        documentacion_adjunta: null,
        razon: EditorState.createEmpty()
      });
    } else {
      setModalData({
        actividad_planeada_id: '',
        trimestre: 1,
        observaciones: EditorState.createEmpty(),
        evidencia: '',
        evidenciaFile: null,
        porcentaje_cumplimiento: 0,
        unidades_cumplidas: 0,
        obstaculos: EditorState.createEmpty(),
        calificacion: '',
        fecha_ejecucion: '',
        documentacion_adjunta: null,
        razon: EditorState.createEmpty()
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalData({
      actividad_planeada_id: '',
      trimestre: 1,
      observaciones: EditorState.createEmpty(),
      evidencia: '',
      evidenciaFile: null,
      porcentaje_cumplimiento: 0,
      unidades_cumplidas: 0,
      obstaculos: EditorState.createEmpty(),
      calificacion: '',
      fecha_ejecucion: '',
      documentacion_adjunta: null,
      razon: EditorState.createEmpty()
    });
  };

  const handleSaveModal = async () => {
    try {
      const localSelected = plannedActivities.find(pa => pa.id == modalData.actividad_planeada_id);
      const activityData = {
        actividad_planeada_id: null,
        proyecto_id: parseInt(proyectoId),
        trimestre: parseInt(modalData.trimestre),
        observaciones: draftToHtml(convertToRaw(modalData.observaciones.getCurrentContent())),
        evidencia: modalData.evidenciaFile ? modalData.evidenciaFile.name : modalData.evidencia,
        porcentaje_cumplimiento: parseInt(modalData.porcentaje_cumplimiento),
        obstaculos: draftToHtml(convertToRaw(modalData.obstaculos.getCurrentContent())),
        calificacion: modalData.calificacion ? parseInt(modalData.calificacion) : null,
        razon: draftToHtml(convertToRaw(modalData.razon.getCurrentContent())),
        documentacion_adjunta: modalData.documentacion_adjunta ? modalData.documentacion_adjunta.name : null
      };

      const newActivity = await actividadesService.createActividadEjecutada(activityData);
      if (mountedRef.current) {
        setActivities(prev => [...prev, {
          ...newActivity,
          nombre: localSelected?.descripcion || 'Nueva actividad'
        }]);
        handleCloseModal();
        toast.success('Avance registrado exitosamente');
      }
    } catch (err) {
      const errorMsg = 'Error al registrar el avance: ' + (err.message || 'Error desconocido');
      if (mountedRef.current) {
        setError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  const handleModalDataChange = (field, value) => {
    if (field === 'actividad_planeada_id') {
      setModalData(prev => ({ ...prev, [field]: value, unidades_cumplidas: 0, porcentaje_cumplimiento: 0, obstaculos: EditorState.createEmpty(), calificacion: '', fecha_ejecucion: '', documentacion_adjunta: null, razon: EditorState.createEmpty(), observaciones: EditorState.createEmpty() }));
    } else {
      setModalData(prev => ({ ...prev, [field]: value }));
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
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Avance Trimestral - {project.nombre}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              Vista de progreso por trimestre de todas las actividades del proyecto
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              Registrar Avance
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => navigate('/proyectos')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Volver a Proyectos
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Información del Proyecto */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Información del Proyecto
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Chip
                  label={`Estado: ${project.estado_actual || 'Activo'}`}
                  color={project.estado_actual === 'Activo' ? 'success' : 'info'}
                  size="small"
                />
              </Grid>
               <Grid item xs={6}>
                 <Typography variant="caption" color="text.secondary">Fecha Inicio</Typography>
                 <Typography variant="body2">{formatDate(project.fecha_inicio)}</Typography>
               </Grid>
               <Grid item xs={6}>
                 <Typography variant="caption" color="text.secondary">Fecha Fin</Typography>
                 <Typography variant="body2">{formatDate(project.fecha_fin)}</Typography>
               </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Presupuesto</Typography>
                <Typography variant="body2">
                  {project.presupuesto_id ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(project.presupuesto_monto || 0) : 'Sin presupuesto'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Duración</Typography>
                <Typography variant="body2">{project.duracion_anos || 1} año(s)</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Actividades */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Actividad</strong></TableCell>
                <TableCell align="center"><strong>Trimestre</strong></TableCell>
                <TableCell align="center"><strong>Progreso</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => {
                const isEditing = editingActivity?.id === activity.id;
                const progressValue = Number(activity.porcentaje_cumplimiento) || 0;

                return (
                  <TableRow key={activity.id} hover>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          value={editingActivity?.nombre || ''}
                          onChange={(e) => setEditingActivity((prev) =>
                            prev ? { ...prev, nombre: e.target.value } : prev
                          )}
                          fullWidth
                        />
                      ) : (
                        <Typography variant="body2">{activity.nombre}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {activity.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editingActivity?.trimestre || ''}
                          onChange={(e) => setEditingActivity((prev) =>
                            prev ? { ...prev, trimestre: e.target.value } : prev
                          )}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        <Chip
                          label={`T${activity.trimestre || 1}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <Grid container spacing={1} alignItems="center">
                          <Grid item xs>
                            <TextField
                              size="small"
                              type="number"
                              value={editingActivity?.porcentaje || ''}
                              onChange={(e) => setEditingActivity((prev) =>
                                prev ? { ...prev, porcentaje: e.target.value } : prev
                              )}
                              fullWidth
                            />
                          </Grid>
                          <Grid item>
                            <Chip
                              label={`${editingActivity?.porcentaje || 0}%`}
                              size="small"
                              color="info"
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 100, bgcolor: 'grey.200', borderRadius: 1, height: 8, overflow: 'hidden' }}>
                            <Box
                              sx={{
                                width: `${progressValue}%`,
                                bgcolor: progressValue >= 100 ? 'success.main' : 'primary.main',
                                height: '100%',
                              }}
                            />
                          </Box>
                          <Typography variant="caption">{progressValue}%</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Guardar">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={async () => {
                                if (editingActivity) {
                                  await handleSaveActivityProgress(editingActivity.id, editingActivity.porcentaje);
                                }
                              }}
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancelar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setEditingActivity(null)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Tooltip title="Editar progreso">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditingActivity({
                                  ...activity,
                                  porcentaje: activity.porcentaje_cumplimiento
                                });
                              }}
                            >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Resumen del Progreso Global */}
      <Paper
        elevation={1}
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 3,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
          <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Progreso Global del Proyecto
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 120, bgcolor: 'grey.200', borderRadius: 2, height: 12, flex: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${totalProgress}%`,
                    bgcolor: totalProgress >= 100 ? 'success.main' : 'primary.main',
                    height: '100%',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight="bold" color={totalProgress >= 100 ? 'success.main' : 'primary.main'}>
                {totalProgress}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {activities.map((activity) => (
                <Grid item xs={6} sm={4} key={activity.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {activity.nombre}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {activity.porcentaje_cumplimiento || 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      T{activity.trimestre}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Modal para registrar avances */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#800020', color: 'white' }}>
          Registrar Avance Trimestral
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Planificación */}
          <Typography variant="h6" color="primary" gutterBottom>
            Planificación
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Actividad Planificada</InputLabel>
                <Select
                  value={modalData.actividad_planeada_id}
                  label="Actividad Planificada"
                  onChange={(e) => handleModalDataChange('actividad_planeada_id', e.target.value)}
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
                  {plannedActivities.map((activity) => (
                    <MenuItem key={activity.id} value={activity.id}>
                      {activity.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {modalData.actividad_planeada_id && (() => {
                const selected = plannedActivities.find(pa => pa.id == modalData.actividad_planeada_id);
                return (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Meta planificada: {selected?.descripcion}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Meta: {selected?.meta_total} {selected?.medida_tipo === 'porcentaje' ? '%' : 'unidades'}
                    </Typography>
                  </>
                );
              })()}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Detalles de Ejecución */}
          <Typography variant="h6" color="primary" gutterBottom>
            Detalles de Ejecución
          </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trimestre</InputLabel>
                  <Select
                    value={modalData.trimestre}
                    label="Trimestre"
                    onChange={(e) => handleModalDataChange('trimestre', e.target.value)}
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
                    <MenuItem value={1}>Primer Trimestre</MenuItem>
                    <MenuItem value={2}>Segundo Trimestre</MenuItem>
                    <MenuItem value={3}>Tercer Trimestre</MenuItem>
                    <MenuItem value={4}>Cuarto Trimestre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                ¿Qué se realizó?
              </Typography>
              <Editor
                editorState={modalData.observaciones}
                onEditorStateChange={(editorState) => handleModalDataChange('observaciones', editorState)}
                placeholder="Describe las actividades realizadas en este trimestre..."
                toolbar={{
                  options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'history'],
                  inline: { inDropdown: true },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  link: { inDropdown: true },
                }}
                editorStyle={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  minHeight: '120px',
                  padding: '10px',
                }}
              />
            </Grid>
            </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Evidencias */}
          <Typography variant="h6" color="primary" gutterBottom>
            Evidencias
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Evidencia fotográfica</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleModalDataChange('evidenciaFile', e.target.files[0])}
              />
              <Typography variant="caption" color="text.secondary">
                Sube una imagen de evidencia (opcional)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de ejecución"
                type="date"
                value={modalData.fecha_ejecucion}
                onChange={(e) => handleModalDataChange('fecha_ejecucion', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Calificación</InputLabel>
                <Select
                  value={modalData.calificacion}
                  label="Calificación"
                  onChange={(e) => handleModalDataChange('calificacion', e.target.value)}
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
                  <MenuItem value=""><em>Sin calificación</em></MenuItem>
                  <MenuItem value={1}>1 - Muy malo</MenuItem>
                  <MenuItem value={2}>2 - Malo</MenuItem>
                  <MenuItem value={3}>3 - Regular</MenuItem>
                  <MenuItem value={4}>4 - Bueno</MenuItem>
                  <MenuItem value={5}>5 - Excelente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Documentación adicional</Typography>
              <input
                type="file"
                onChange={(e) => handleModalDataChange('documentacion_adjunta', e.target.files[0])}
              />
              <Typography variant="caption" color="text.secondary">
                Sube documentación adicional (opcional)
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Evaluación */}
          <Typography variant="h6" color="primary" gutterBottom>
            Evaluación
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                Razón del avance
              </Typography>
              <Editor
                editorState={modalData.razon}
                onEditorStateChange={(editorState) => handleModalDataChange('razon', editorState)}
                placeholder="Explica la razón o justificación del avance logrado..."
                toolbar={{
                  options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'history'],
                  inline: { inDropdown: true },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  link: { inDropdown: true },
                }}
                editorStyle={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  minHeight: '80px',
                  padding: '10px',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Documentación adicional</Typography>
              <input
                type="file"
                onChange={(e) => handleModalDataChange('documentacion_adjunta', e.target.files[0])}
              />
              <Typography variant="caption" color="text.secondary">
                Sube documentación adicional (opcional)
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {(() => {
                const selected = plannedActivities.find(pa => pa.id == modalData.actividad_planeada_id);
                const isPorcentaje = selected?.medida_tipo === 'porcentaje';
                return (
                  <TextField
                    fullWidth
                    type="number"
                    label={isPorcentaje ? "Porcentaje de cumplimiento (%)" : "Unidades cumplidas"}
                    value={isPorcentaje ? modalData.porcentaje_cumplimiento : modalData.unidades_cumplidas}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (isPorcentaje) {
                        handleModalDataChange('porcentaje_cumplimiento', value);
                      } else {
                        handleModalDataChange('unidades_cumplidas', value);
                        const meta = selected?.meta_total || 1;
                        const porcentaje = meta > 0 ? (value / meta) * 100 : 0;
                        handleModalDataChange('porcentaje_cumplimiento', Math.min(porcentaje, 100));
                      }
                    }}
                    InputProps={{
                      inputProps: {
                        min: 0,
                        max: isPorcentaje ? 100 : (selected?.meta_total || 0)
                      }
                    }}
                    helperText={isPorcentaje ? "Porcentaje de avance logrado (0-100%)" : `Unidades completadas (0-${selected?.meta_total || 0})`}
                  />
                );
              })()}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveModal}
            variant="contained"
            sx={{ bgcolor: '#800020' }}
            disabled={!modalData.actividad_planeada_id || !modalData.observaciones.getCurrentContent().hasText()}
          >
            Registrar Avance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}