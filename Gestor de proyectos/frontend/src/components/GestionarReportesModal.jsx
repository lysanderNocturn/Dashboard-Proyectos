import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportesService } from "@/services/reportesService";

export default function GestionarReportesModal({
    isOpen,
    onClose,
    proyectoId,
    onReporteSeleccionado
}) {
    const [reportes, setReportes] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Form state for new report
    const [formData, setFormData] = useState({
        titulo: '',
        tipo_reporte: 'trimestral',
        ano: 1,
        trimestre: 1,
        contenido: '',
        cumplimiento_meta: 0,
        observaciones: ''
    });

    useEffect(() => {
        if (proyectoId && isOpen && !isCreating) {
            loadReportes();
        }
    }, [proyectoId, isOpen, isCreating, loadReportes]);

    const loadReportes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reportesService.getReportesByProyecto(proyectoId);
            setReportes(data || []);
        } catch (err) {
            console.error('Error loading reportes:', err);
            setError('Error al cargar los reportes');
            setReportes([]);
        } finally {
            setLoading(false);
        }
    }, [proyectoId]);

    const handleReporteClick = (reporte) => {
        onReporteSeleccionado(reporte);
        onClose();
    };

    const handleCreateReporte = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const newReporte = await reportesService.createReporte({
                proyecto_id: proyectoId,
                ...formData
            });
            setReportes([...reportes, newReporte]);
            setIsCreating(false);
            setFormData({
                titulo: '',
                tipo_reporte: 'trimestral',
                ano: 1,
                trimestre: 1,
                contenido: '',
                cumplimiento_meta: 0,
                observaciones: ''
            });
            // Optionally select the newly created report
            onReporteSeleccionado(newReporte);
            onClose();
        } catch (err) {
            console.error('Error creating reporte:', err);
            setError(err.response?.data?.message || 'Error al crear el reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'ano' || name === 'trimestre' || name === 'cumplimiento_meta' 
                ? parseInt(value) || 0 
                : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto modal-fade-in">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Gestionar Reportes</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}
                    
                    {isCreating ? (
                        <form onSubmit={handleCreateReporte} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título del Reporte</label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded"
                                    placeholder="Ej: Reporte Trimestral Q1 2024"
                                />
                            </div>
                            
                             <div>
                                 <label className="block text-sm font-medium mb-1">Tipo de Reporte</label>
                                 <Select
                                     value={formData.tipo_reporte}
                                     onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_reporte: value }))}
                                 >
                                     <SelectTrigger className="w-full">
                                         <SelectValue placeholder="Seleccionar tipo" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         <SelectItem value="trimestral" className="py-3 px-4 text-base">
                                           Trimestral
                                         </SelectItem>
                                         <SelectItem value="anual" className="py-3 px-4 text-base">
                                           Anual
                                         </SelectItem>
                                     </SelectContent>
                                 </Select>
                             </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-sm font-medium mb-1">Año</label>
                                     <Select
                                         value={formData.ano.toString()}
                                         onValueChange={(value) => setFormData(prev => ({ ...prev, ano: parseInt(value) }))}
                                     >
                                         <SelectTrigger className="w-full">
                                             <SelectValue placeholder="Seleccionar año" />
                                         </SelectTrigger>
                                         <SelectContent>
                                             <SelectItem value="1" className="py-3 px-4 text-base">Año 1</SelectItem>
                                             <SelectItem value="2" className="py-3 px-4 text-base">Año 2</SelectItem>
                                             <SelectItem value="3" className="py-3 px-4 text-base">Año 3</SelectItem>
                                         </SelectContent>
                                     </Select>
                                 </div>
                                
                                 {formData.tipo_reporte === 'trimestral' && (
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Trimestre</label>
                                         <Select
                                             value={formData.trimestre.toString()}
                                             onValueChange={(value) => setFormData(prev => ({ ...prev, trimestre: parseInt(value) }))}
                                         >
                                             <SelectTrigger className="w-full">
                                                 <SelectValue placeholder="Seleccionar trimestre" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="1" className="py-3 px-4 text-base">Q1 (Enero-Marzo)</SelectItem>
                                                 <SelectItem value="2" className="py-3 px-4 text-base">Q2 (Abril-Junio)</SelectItem>
                                                 <SelectItem value="3" className="py-3 px-4 text-base">Q3 (Julio-Septiembre)</SelectItem>
                                                 <SelectItem value="4" className="py-3 px-4 text-base">Q4 (Octubre-Diciembre)</SelectItem>
                                             </SelectContent>
                                         </Select>
                                     </div>
                                 )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Contenido</label>
                                <textarea
                                    name="contenido"
                                    value={formData.contenido}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    rows={3}
                                    placeholder="Descripción del reporte..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Cumplimiento de Meta (%)</label>
                                <input
                                    type="number"
                                    name="cumplimiento_meta"
                                    value={formData.cumplimiento_meta}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Observaciones</label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    rows={2}
                                    placeholder="Observaciones adicionales..."
                                />
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creando...' : 'Crear Reporte'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <Button 
                                onClick={() => setIsCreating(true)} 
                                className="w-full mb-4"
                            >
                                + Crear Nuevo Reporte
                            </Button>
                            
                            {loading ? (
                                <div className="text-center py-4">Cargando...</div>
                            ) : reportes.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 mb-4">No hay reportes disponibles para este proyecto.</p>
                                    <p className="text-sm text-gray-400">Crea el primer reporte haciendo clic en el botón de arriba.</p>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {reportes.map((reporte) => (
                                        <li key={reporte.id}>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full justify-start text-left"
                                                onClick={() => handleReporteClick(reporte)}
                                            >
                                                <span className="font-medium">{reporte.titulo}</span>
                                                <span className="ml-auto text-xs text-gray-500">
                                                    {reporte.tipo_reporte === 'trimestral' ? `Q${reporte.trimestre}` : 'Anual'} - Año {reporte.ano}
                                                </span>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </CardContent> 
            </Card>
        </div>
    );
}
