import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoIcon,
  AttachFile as AttachFileIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { actividadesService } from '../services/actividadesService.js';

const ModalAvanceTrimestral = ({
  open,
  onClose,
  actividad: actividadProp,
  trimestre,
  editingActividad,
  proyectoSeleccionado,
  onSave,
  isLoading: parentLoading,
}) => {
  // Get the actividad from editingActividad or from the prop
  const actividad = editingActividad?.actividad_planificada_id 
    ? { id: editingActividad.actividad_planificada_id }
    : actividadProp;
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    trimestre: trimestre || 1,
    real_actualizado: 0,
    porcentaje_cumplimiento: 0,
    observaciones: '',
    evidencia: '',
    evidencia_urls: [],
    calificacion: 0,
    razon: '',
    obstaculos: '',
    documentacion_adjunta: [],
  });

  // Cargar datos cuando se edita una actividad existente
  useEffect(() => {
    if (editingActividad) {
      setFormData({
        trimestre: editingActividad.trimestre || trimestre,
        real_actualizado: editingActividad.real_actualizado || 0,
        porcentaje_cumplimiento: editingActividad.porcentaje_cumplimiento || 0,
        observaciones: editingActividad.observaciones || '',
        evidencia: editingActividad.evidencia || '',
        evidencia_urls: editingActividad.evidencia_urls || [],
        calificacion: editingActividad.calificacion || 0,
        razon: editingActividad.razon || '',
        obstaculos: editingActividad.obstaculos || '',
        documentacion_adjunta: editingActividad.documentacion_adjunta || [],
      });
    } else {
      // Reset form for new entry
      setFormData({
        trimestre: trimestre,
        real_actualizado: 0,
        porcentaje_cumplimiento: 0,
        observaciones: '',
        evidencia: '',
        evidencia_urls: [],
        calificacion: 0,
        razon: '',
        obstaculos: '',
        documentacion_adjunta: [],
      });
    }
    setUploadedImages([]);
    setUploadedDocuments([]);
    setValidationErrors({});
  }, [editingActividad, trimestre, open]);

  // Auto-calcular porcentaje basado en la meta del proyecto
  useEffect(() => {
    if (proyectoSeleccionado && formData.real_actualizado > 0) {
      const metaTotal = parseFloat(proyectoSeleccionado.meta_total) || 0;
      
      if (proyectoSeleccionado.medida_tipo === 'porcentaje') {
        // Para proyectos tipo porcentaje, usar el valor directamente
        setFormData(prev => ({
          ...prev,
          porcentaje_cumplimiento: Math.min(100, formData.real_actualizado)
        }));
      } else if (metaTotal > 0) {
        // Para proyectos tipo cantidad, calcular automáticamente el porcentaje
        const calculatedPercentage = Math.min(100, (formData.real_actualizado / metaTotal) * 100);
        setFormData(prev => ({
          ...prev,
          porcentaje_cumplimiento: Math.round(calculatedPercentage * 100) / 100
        }));
      }
    }
  }, [formData.real_actualizado, proyectoSeleccionado]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
    const newUrls = newImages.map(img => img.preview);
    setFormData({
      ...formData,
      evidencia_urls: [...formData.evidencia_urls, ...newUrls]
    });
  };

  // Handle document upload
  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocs = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedDocuments([...uploadedDocuments, ...newDocs]);
    setFormData({
      ...formData,
      documentacion_adjunta: [...formData.documentacion_adjunta, ...newDocs.map(d => d.name)]
    });
  };

  // Remove uploaded image
  const removeImage = (index) => {
    const newImages = [...uploadedImages];
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

  // Remove uploaded document
  const removeDocument = (index) => {
    const newDocs = [...uploadedDocuments];
    newDocs.splice(index, 1);
    setUploadedDocuments(newDocs);
    setFormData({
      ...formData,
      documentacion_adjunta: newDocs.map(d => d.name)
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (formData.real_actualizado < 0) {
      errors.real_actualizado = 'La cantidad no puede ser negativa';
    }
    if (formData.porcentaje_cumplimiento < 0 || formData.porcentaje_cumplimiento > 100) {
      errors.porcentaje_cumplimiento = 'El porcentaje debe estar entre 0 y 100';
    }
    if (!formData.evidencia || formData.evidencia.trim().length < 10) {
      errors.evidencia = 'Debe agregar evidencia (mínimo 10 caracteres)';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Combine text evidence with image URLs
      const evidenciaConImagenes = formData.evidencia_urls.length > 0 
        ? JSON.stringify(formData.evidencia_urls)
        : formData.evidencia;
      
      // Prepare data with correct field name for backend
      const data = {
        actividad_planeada_id: editingActividad?.actividad_planificada_id || actividad?.id,
        trimestre: formData.trimestre,
        real_actualizado: formData.real_actualizado,
        porcentaje_cumplimiento: formData.porcentaje_cumplimiento,
        observaciones: formData.observaciones,
        evidencia: evidenciaConImagenes,
        calificacion: formData.calificacion,
        razon: formData.razon,
        obstaculos: formData.obstaculos,
        documentacion_adjunta: JSON.stringify(formData.documentacion_adjunta),
      };

      if (editingActividad?.id) {
        await actividadesService.updateActividadEjecutada(editingActividad.id, data);
      } else {
        await actividadesService.createActividadEjecutada(data);
      }

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (err) {
      console.error('Error saving avance:', err);
      setValidationErrors({ submit: 'Error al guardar el avance. Verifique los datos e intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || parentLoading;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#800020', 
        color: 'white',
        py: 2,
        px: 3,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            📊 Capturar Avance Trimestral
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle2" sx={{ mt: 1, opacity: 0.9 }}>
          {proyectoSeleccionado?.nombre} - Trimestre {trimestre}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, px: 4 }}>
        {validationErrors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {validationErrors.submit}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Sección de Información Principal */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#800020" gutterBottom>
                📈 Información del Avance
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cantidad Real Lograda"
                    type="number"
                    value={formData.real_actualizado}
                    onChange={(e) => setFormData({ ...formData, real_actualizado: Number(e.target.value) })}
                    error={!!validationErrors.real_actualizado}
                    helperText={validationErrors.real_actualizado || `Meta del proyecto: ${proyectoSeleccionado?.meta_total || 0} ${proyectoSeleccionado?.medida_tipo === 'porcentaje' ? '%' : 'uds'}`}
                    inputProps={{ min: 0 }}
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Porcentaje de Cumplimiento (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    value={formData.porcentaje_cumplimiento}
                    onChange={(e) => setFormData({ ...formData, porcentaje_cumplimiento: Number(e.target.value) })}
                    error={!!validationErrors.porcentaje_cumplimiento}
                    helperText={validationErrors.porcentaje_cumplimiento || 'Se calcula automáticamente según la meta'}
                    InputProps={{
                      endAdornment: (
                        <Chip 
                          label={`${Math.round(formData.porcentaje_cumplimiento)}%`} 
                          color={formData.porcentaje_cumplimiento >= 100 ? 'success' : formData.porcentaje_cumplimiento >= 50 ? 'warning' : 'error'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )
                    }}
                    size="medium"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    ⚡ El porcentaje se calcula automáticamente según la meta del proyecto
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, formData.porcentaje_cumplimiento)} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        bgcolor: formData.porcentaje_cumplimiento >= 100 ? 'success.main' : formData.porcentaje_cumplimiento >= 50 ? 'warning.main' : 'error.main'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">0%</Typography>
                    <Typography variant="caption" color="text.secondary">50%</Typography>
                    <Typography variant="caption" color="text.secondary">100%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sección de Evidencia */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#800020" gutterBottom>
                📸 Evidencia y Documentación
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción de Evidencia"
                    multiline
                    rows={4}
                    value={formData.evidencia}
                    onChange={(e) => setFormData({ ...formData, evidencia: e.target.value })}
                    error={!!validationErrors.evidencia}
                    helperText={validationErrors.evidencia || 'Describa las evidencias: fotos, documentos, links, etc.'}
                    placeholder="Ej: Se documentó mediante fotografías el trabajo realizado en..."
                    size="medium"
                  />
                </Grid>
                
                {/* Image Upload Section */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderStyle: 'dashed', 
                      borderColor: '#800020',
                      borderWidth: 2,
                      height: '100%',
                      minHeight: 200,
                      bgcolor: 'white'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom color="#800020" fontWeight="bold">
                      📷 Imágenes de Evidencia
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="modal-image-upload"
                      type="file"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="modal-image-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<PhotoIcon />}
                        fullWidth
                        sx={{ mb: 2, bgcolor: '#800020' }}
                      >
                        Seleccionar Imágenes
                      </Button>
                    </label>
                    {uploadedImages.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          ({uploadedImages.length}) imágenes adjuntas
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
                                    borderRadius: 8
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
                                    width: 24,
                                    height: 24,
                                    '&:hover': {
                                      bgcolor: 'error.dark'
                                    }
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
                
                {/* Document Upload Section */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderStyle: 'dashed', 
                      borderColor: '#800020',
                      borderWidth: 2,
                      height: '100%',
                      minHeight: 200,
                      bgcolor: 'white'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom color="#800020" fontWeight="bold">
                      📄 Documentos Adjuntos
                    </Typography>
                    <input
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      style={{ display: 'none' }}
                      id="modal-document-upload"
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                    />
                    <label htmlFor="modal-document-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<AttachFileIcon />}
                        fullWidth
                        sx={{ mb: 2, bgcolor: '#800020' }}
                      >
                        Seleccionar Documentos
                      </Button>
                    </label>
                    {uploadedDocuments.length > 0 && (
                      <List dense>
                        {uploadedDocuments.map((doc, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <DescriptionIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={doc.name} 
                              secondary={`${(doc.size / 1024).toFixed(1)} KB`} 
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => removeDocument(index)} size="small">
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sección de Análisis */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#800020" gutterBottom>
                📋 Análisis y Observaciones
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Razón / Justificación"
                    multiline
                    rows={3}
                    value={formData.razon}
                    onChange={(e) => setFormData({ ...formData, razon: e.target.value })}
                    placeholder="¿Por qué se obtuvo este resultado? ¿Qué factores influyeron?"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Obstáculos / Dificultades"
                    multiline
                    rows={3}
                    value={formData.obstaculos}
                    onChange={(e) => setFormData({ ...formData, obstaculos: e.target.value })}
                    placeholder="¿Qué obstáculos o dificultades se enfrentaron durante este trimestre?"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones Adicionales"
                    multiline
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Observaciones adicionales, recomendaciones o comentarios sobre el avance del proyecto"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Calificación (0-10)"
                    type="number"
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    value={formData.calificacion}
                    onChange={(e) => setFormData({ ...formData, calificacion: Number(e.target.value) })}
                    helperText="Calificación del avance trimestral"
                    size="medium"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'grey.200' }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          variant="outlined"
          sx={{ borderColor: 'grey.400', color: 'grey.700' }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          sx={{ bgcolor: '#800020', '&:hover': { bgcolor: '#5c0017' } }}
          startIcon={<SaveIcon />}
          disabled={loading}
          size="large"
        >
          {loading ? 'Guardando...' : '💾 Guardar Avance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAvanceTrimestral;
