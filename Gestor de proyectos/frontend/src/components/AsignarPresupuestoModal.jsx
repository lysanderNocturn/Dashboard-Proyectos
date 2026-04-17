import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { asignacionesService } from '@/services/asignacionesService';

export default function AsignarPresupuestoModal({ 
  isOpen, 
  onClose, 
  presupuesto, 
  proyectos, 
  onAsignacionExitosa 
}) {
  const [selectedProyecto, setSelectedProyecto] = useState('');
  const [monto, setMonto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proyectosAsignados, setProyectosAsignados] = useState([]);

  useEffect(() => {
    if (presupuesto?.id && isOpen) {
      loadAsignaciones();
    }
  }, [presupuesto?.id, isOpen, loadAsignaciones]);

  const loadAsignaciones = useCallback(async () => {
    try {
      const data = await asignacionesService.getAsignacionesByPresupuesto(presupuesto.id);
      setProyectosAsignados(data.asignaciones || []);
    } catch (err) {
      console.error('Error al cargar asignaciones:', err);
    }
  }, [presupuesto?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const montoNum = parseFloat(monto);
      const montoDisponible = presupuesto.monto - (presupuesto.monto_asignado || 0);

      if (montoNum > montoDisponible) {
        setError(`El monto excede el disponible: $${montoDisponible.toFixed(2)}`);
        setLoading(false);
        return;
      }

      await asignacionesService.asignarPresupuesto({
        presupuesto_id: presupuesto.id,
        proyecto_id: parseInt(selectedProyecto),
        monto_asignado: montoNum,
        observaciones
      });

      onAsignacionExitosa();
      onClose();
      setSelectedProyecto('');
      setMonto('');
      setObservaciones('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asignar presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarAsignacion = async (asignacionId) => {
    if (!confirm('¿Está seguro de eliminar esta asignación? El monto será revertido al presupuesto.')) {
      return;
    }

    try {
      await asignacionesService.eliminarAsignacion(asignacionId);
      loadAsignaciones();
      onAsignacionExitosa();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar asignación');
    }
  };

  if (!isOpen) return null;

  const montoDisponible = presupuesto.monto - (presupuesto.monto_asignado || 0);
  const proyectosDisponibles = proyectos.filter(
    p => !proyectosAsignados.some(pa => pa.proyecto_id === p.id)
  );

    return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Asignar Presupuesto a Proyectos</CardTitle>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </CardHeader>
        <CardContent>
          {/* Información del presupuesto */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">Presupuesto Total:</span>
                <p className="text-lg text-green-600">${parseFloat(presupuesto.monto).toFixed(2)}</p>
              </div>
              <div>
                <span className="font-semibold">Asignado:</span>
                <p className="text-lg text-orange-600">${parseFloat(presupuesto.monto_asignado || 0).toFixed(2)}</p>
              </div>
              <div>
                <span className="font-semibold">Disponible:</span>
                <p className="text-lg text-blue-600">${montoDisponible.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Lista de proyectos ya asignados */}
          {proyectosAsignados.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Proyectos Asignados:</h3>
              <div className="space-y-2">
                {proyectosAsignados.map((asignacion) => (
                  <div 
                    key={asignacion.id} 
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{asignacion.proyecto_nombre}</p>
                      <p className="text-sm text-gray-500">
                        Asignado: ${parseFloat(asignacion.monto_asignado).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleEliminarAsignacion(asignacion.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de nueva asignación */}
          {montoDisponible > 0 && proyectosDisponibles.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold">Nueva Asignación</h3>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

               <div>
                 <label className="block text-sm font-medium mb-1">Proyecto</label>
                 <Select
                   value={selectedProyecto}
                   onValueChange={setSelectedProyecto}
                 >
                   <SelectTrigger className="w-full">
                     <SelectValue placeholder="Seleccionar proyecto..." />
                   </SelectTrigger>
                   <SelectContent>
                      {proyectosDisponibles.map((proyecto) => (
                        <SelectItem
                          key={proyecto.id}
                          value={proyecto.id.toString()}
                          className="py-3 px-4 text-base"
                        >
                          <span className="block truncate max-w-full">
                            {proyecto.nombre}
                          </span>
                        </SelectItem>
                      ))}
                   </SelectContent>
                 </Select>
               </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto a Asignar (Max: ${montoDisponible.toFixed(2)})
                </label>
                <Input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={montoDisponible}
                  required
                />
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Asignando...' : 'Asignar Presupuesto'}
                </Button>
              </div>
            </form>
          )}

          {montoDisponible <= 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-700">No hay presupuesto disponible para asignar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
