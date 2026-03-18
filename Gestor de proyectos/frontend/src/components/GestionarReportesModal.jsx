import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportesService } from '@/services/reportesService';
import { actividadesService } from '@/services/actividadesService';
import { Upload, X, Image as ImageIcon, FileText, Trash2, Eye, Activity, CheckCircle, Circle } from 'lucide-react';

export default function GestionarReportesModal({ 
  isOpen, 
  onClose, 
  proyecto,
  onReportesActualizados 
}) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReporte, setEditingReporte] = useState(null);
  const [actividadesTrimestre, setActividadesTrimestre] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);
  
  // Form state
  const [tipoReporte, setTipoReporte] = useState('trimestral');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState(1);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [cumplimientoMeta, setCumplimientoMeta] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState('borrador');
  const [evidencia, setEvidencia] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [vistaPreviaImagen, setVistaPreviaImagen] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (proyecto?.id && isOpen) {
      loadReportes();
    }
  }, [proyecto?.id, isOpen]);

  // Cargar actividades cuando cambia el año o trimestre o al abrir formulario
  useEffect(() => {
    if (showForm && proyecto?.id) {
      loadActividadesTrimestre();
    }
  }, [ano, trimestre, showForm, proyecto?.id]);

  const loadActividadesTrimestre = async () => {
    try {
      setCargandoActividades(true);
      // Cargar actividades planificadas del proyecto
      const planificadas = await actividadesService.getActividadesPlanificadasByProyecto(proyecto.id);
      const filtered = (planificadas || []).filter(a => a.ano === parseInt(ano));
      
      // Obtener las ejecutadas
      const ejecutadas = await actividadesService.getActividadesEjecutadas();
      const ejecutadasTrimestre = (ejecutadas || []).filter(e => 
        e.trimestre === parseInt(trimestre)
      );
      
      // Combinar información
      const actividadesConAvance = filtered.map(act => {
        const exec = ejecutadasTrimestre.find(e => e.actividad_planificada_id === act.id);
        return {
          ...act,
          ejecutada: exec,
          real_actualizado: exec?.real_actualizado || 0,
          porcentaje_cumplimiento: exec?.porcentaje_cumplimiento || 0,
          observaciones: exec?.observaciones || ''
        };
      });
      
      setActividadesTrimestre(actividadesConAvance);
      
      // Calcular cumplimiento automáticamente basado en actividades
      if (actividadesConAvance.length > 0) {
        const actividadesConAvanceReal = actividadesConAvance.filter(a => a.porcentaje_cumplimiento > 0);
        if (actividadesConAvanceReal.length > 0) {
          const promedio = actividadesConAvanceReal.reduce((sum, a) => 
            sum + (a.porcentaje_cumplimiento || 0), 0) / actividadesConAvanceReal.length;
          setCumplimientoMeta(Math.round(promedio));
        }
      }
    } catch (err) {
      console.error('Error al cargar actividades:', err);
    } finally {
      setCargandoActividades(false);
    }
  };

  const loadReportes = async () => {
    try {
      setLoading(true);
      const data = await reportesService.getReportesByProyecto(proyecto.id);
      setReportes(data);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTipoReporte('trimestral');
    setAno(new Date().getFullYear());
    setTrimestre(1);
    setTitulo('');
    setContenido('');
    setCumplimientoMeta(0);
    setObservaciones('');
    setEstado('borrador');
    setEvidencia('');
    setImagenes([]);
    setEditingReporte(null);
    setShowForm(false);
  };

  // Manejar selección de imágenes
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    const nuevasImagenes = files.map(file => ({
      id: Date.now() + Math.random(),
      archivo: file,
      preview: URL.createObjectURL(file),
      nombre: file.name,
      tamano: (file.size / 1024).toFixed(2) + ' KB'
    }));
    setImagenes([...imagenes, ...nuevasImagenes]);
    // Limpiar input para permitir selección del mismo archivo
    event.target.value = '';
  };

  // Eliminar imagen
  const handleRemoveImage = (imagenId) => {
    const imagenEliminada = imagenes.find(img => img.id === imagenId);
    if (imagenEliminada?.preview) {
      URL.revokeObjectURL(imagenEliminada.preview);
    }
    setImagenes(imagenes.filter(img => img.id !== imagenId));
  };

  // Ver imagen en tamaño completo
  const handleViewImage = (imagen) => {
    setVistaPreviaImagen(imagen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combinar texto de evidencia con URLs de imágenes
      const urlsImagenes = imagenes
        .filter(img => img.esExistente || img.preview)
        .map(img => img.esExistente ? img.url : img.preview);
      
      const evidenciaCompleta = {
        texto: evidencia,
        imagenes: urlsImagenes,
        fecha: new Date().toISOString()
      };

      const data = {
        proyecto_id: proyecto.id,
        tipo_reporte: tipoReporte,
        ano: parseInt(ano),
        trimestre: tipoReporte === 'trimestral' ? parseInt(trimestre) : null,
        titulo,
        contenido,
        cumplimiento_meta: parseFloat(cumplimientoMeta),
        observaciones,
        evidencia: JSON.stringify(evidenciaCompleta),
        estado,
        unidad_administrativa_id: proyecto.unidad_administrativa_id
      };

      if (editingReporte) {
        await reportesService.updateReporte(editingReporte.id, data);
      } else {
        await reportesService.createReporte(data);
      }

      loadReportes();
      resetForm();
      onReportesActualizados();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reporte) => {
    setEditingReporte(reporte);
    setTipoReporte(reporte.tipo_reporte);
    setAno(reporte.ano);
    setTrimestre(reporte.trimestre || 1);
    setTitulo(reporte.titulo);
    setContenido(reporte.contenido || '');
    setCumplimientoMeta(reporte.cumplimiento_meta || 0);
    setObservaciones(reporte.observaciones || '');
    setEstado(reporte.estado);
    // Cargar evidencias existentes (imágenes)
    try {
      const evidencias = reporte.evidencia ? JSON.parse(reporte.evidencia) : [];
      if (Array.isArray(evidencias)) {
        const imagenesExistentes = evidencias.map((url, idx) => ({
          id: Date.now() + idx,
          url: url,
          preview: url,
          nombre: `Evidencia ${idx + 1}`,
          esExistente: true
        }));
        setImagenes(imagenesExistentes);
      }
    } catch (e) {
      // Si no es JSON, podría ser texto plano
      setEvidencia(reporte.evidencia || '');
    }
    // Cargar actividades del trimestre del reporte
    setShowForm(true);
    // Usar setTimeout para asegurar que el estado se actualice primero
    setTimeout(() => {
      loadActividadesTrimestre();
    }, 100);
  };

  const handleDelete = async (reporteId) => {
    if (!confirm('¿Está seguro de eliminar este reporte?')) return;

    try {
      await reportesService.deleteReporte(reporteId);
      loadReportes();
      onReportesActualizados();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar reporte');
    }
  };

  if (!isOpen) return null;

  const getEstadoBadge = (estado) => {
    const styles = {
      borrador: 'bg-gray-100 text-gray-800',
      enviado: 'bg-blue-100 text-blue-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    return styles[estado] || styles.borrador;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reportes del Proyecto: {proyecto?.nombre}</CardTitle>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </CardHeader>
        <CardContent>
          {/* Lista de reportes existentes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Reportes Registrados</h3>
              <Button onClick={() => setShowForm(true)}>
                + Nuevo Reporte
              </Button>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">Cargando...</p>
            ) : reportes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay reportes registrados para este proyecto
              </p>
            ) : (
              <div className="space-y-3">
                {reportes.map((reporte) => (
                  <div 
                    key={reporte.id} 
                    className="p-4 border rounded-lg bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${reporte.tipo_reporte === 'trimestral' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {reporte.tipo_reporte === 'trimestral' ? 'Trimestral' : 'Anual'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {reporte.tipo_reporte === 'trimestral' 
                              ? `T${reporte.trimestre} / ` 
                              : ''}{reporte.ano}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(reporte.estado)}`}>
                            {reporte.estado}
                          </span>
                        </div>
                        <h4 className="font-medium">{reporte.titulo}</h4>
                        {reporte.cumplimiento_meta > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Cumplimiento: {reporte.cumplimiento_meta}%
                          </p>
                        )}
                        {/* Mostrar indicador de evidencia */}
                        {reporte.evidencia && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <ImageIcon className="w-3 h-3" />
                            <span>Evidencia adjunta</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(reporte)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(reporte.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
            )}
          </div>

          {/* Formulario de reporte */}
          {showForm && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">
                {editingReporte ? 'Editar Reporte' : 'Nuevo Reporte'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Reporte</label>
                    <select
                      value={tipoReporte}
                      onChange={(e) => setTipoReporte(e.target.value)}
                      className="w-full p-2 border rounded-md min-w-[180px]"
                      required
                    >
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Año</label>
                    <Input
                      type="number"
                      value={ano}
                      onChange={(e) => setAno(e.target.value)}
                      min={2020}
                      max={2030}
                      required
                    />
                  </div>
                </div>

                {tipoReporte === 'trimestral' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Trimestre</label>
                    <select
                      value={trimestre}
                      onChange={(e) => setTrimestre(e.target.value)}
                      className="w-full p-2 border rounded-md min-w-[180px]"
                      required
                    >
                      <option value={1}>T1 (Enero - Marzo)</option>
                      <option value={2}>T2 (Abril - Junio)</option>
                      <option value={3}>T3 (Julio - Septiembre)</option>
                      <option value={4}>T4 (Octubre - Diciembre)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <Input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título del reporte"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contenido</label>
                  <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Describe las actividades realizadas..."
                  />
                </div>

                {/* Sección de Actividades del Trimestre */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Actividades del Trimestre
                    </h4>
                    {cargandoActividades && <span className="text-xs text-gray-500">Cargando...</span>}
                  </div>
                  
                  {actividadesTrimestre.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay actividades planificadas para este período
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {actividadesTrimestre.map((act) => (
                        <div 
                          key={act.id} 
                          className={`p-2 rounded border ${act.porcentaje_cumplimiento > 0 ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              {act.porcentaje_cumplimiento > 0 ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                              )}
                              {act.descripcion}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              act.porcentaje_cumplimiento >= 100 ? 'bg-green-100 text-green-800' :
                              act.porcentaje_cumplimiento >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              act.porcentaje_cumplimiento > 0 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {act.porcentaje_cumplimiento || 0}%
                            </span>
                          </div>
                          {act.observaciones && (
                            <p className="text-xs text-gray-500 mt-1 pl-6">
                              Obs: {act.observaciones}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {actividadesTrimestre.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium">
                        Promedio de cumplimiento: <span className="text-primary">{cumplimientoMeta}%</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Evidencia / Notas</label>
                  <textarea
                    value={evidencia}
                    onChange={(e) => setEvidencia(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Describa las evidencias, enlaces, documentos..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">% de Cumplimiento</label>
                    <Input
                      type="number"
                      value={cumplimientoMeta}
                      onChange={(e) => setCumplimientoMeta(e.target.value)}
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full p-2 border rounded-md min-w-[180px]"
                    >
                      <option value="borrador">Borrador</option>
                      <option value="enviado">Enviado</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observaciones</label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={2}
                    placeholder="Notas adicionales..."
                  />
                </div>

                {/* Sección de carga de imágenes */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Evidencias Fotográficas
                    </h4>
                    <span className="text-xs text-gray-500">
                      {imagenes.length} imagen(es) adjunta(s)
                    </span>
                  </div>
                  
                  {/* Input de archivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {/* Botón para seleccionar imágenes */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-3"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar Imágenes
                  </Button>

                  {/* Preview de imágenes */}
                  {imagenes.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagenes.map((imagen) => (
                        <div
                          key={imagen.id}
                          className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={imagen.preview}
                            alt={imagen.nombre}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay de acciones */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewImage(imagen)}
                              className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                              title="Ver imagen"
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(imagen.id)}
                              className="p-1.5 bg-red-500 rounded-full hover:bg-red-600"
                              title="Eliminar"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          {imagen.esExistente && (
                            <span className="absolute bottom-1 left-1 text-[10px] bg-green-500 text-white px-1 rounded">
                              Guardada
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceptados: JPG, PNG, GIF. Máximo 10MB por imagen.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : (editingReporte ? 'Actualizar' : 'Crear Reporte')}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para vista previa de imagen */}
      {vistaPreviaImagen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setVistaPreviaImagen(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setVistaPreviaImagen(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={vistaPreviaImagen.preview}
              alt="Vista previa"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-2">{vistaPreviaImagen.nombre}</p>
          </div>
        </div>
      )}
    </div>
  );
}
