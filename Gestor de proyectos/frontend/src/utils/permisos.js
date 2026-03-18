// Sistema de permisos basado en roles
// Roles: 1=Administrador, 2=Director, 3=Coordinador, 4=Analista, 5=Auditor, 6=Admin_Unidad

// Roles del sistema
export const ROLES = {
  ADMINISTRADOR: 1,      // Admin global del sistema
  DIRECTOR: 2,          // Director de área
  COORDINADOR: 3,       // Coordinador
  ANALISTA: 4,          // Analista
  AUDITOR: 5,           // Auditor
  ADMIN_UNIDAD: 6,      // Administrador de Unidad Administrativa
  FINANZAS: 7,          // Usuario de Finanzas (puede aprobar presupuestos y crear proyectos)
};

// Permisos del sistema
export const PERMISOS = {
  // Permisos de Proyectos
  VER_PROYECTOS: [1, 2, 3, 4, 5, 6, 7],
  CREAR_PROYECTOS: [1, 6, 7],      // Admin global, Admin Unidad, Finanzas
  EDITAR_PROYECTOS: [1, 6],        // Solo admins pueden editar
  ELIMINAR_PROYECTOS: [1],
  
  // Permisos de Presupuestos
  VER_PRESUPUESTOS: [1, 2, 3, 4, 5, 6, 7],
  CREAR_PRESUPUESTOS: [1, 7],      // Solo Admin global y Finanzas
  APROBAR_PRESUPUESTOS: [1, 7],   // Admin global y Finanzas pueden aprobar
  ASIGNAR_PRESUPUESTO: [1, 7],    // Asignar presupuesto a proyectos (descuento automático)
  
  // Permisos de Avance Trimestral
  VER_AVANCE: [1, 2, 3, 4, 5, 6, 7],
  CAPTURAR_AVANCE: [1, 2, 3, 4, 6], // Todos excepto auditor
  EDITAR_AVANCE: [1, 2, 3, 6],
  
  // Permisos de Reportes (trimestrales y anuales)
  VER_REPORTES: [1, 2, 3, 4, 5, 6, 7],
  CREAR_REPORTES: [1, 6],          // Solo Admin global y Admin de Unidad
  EDITAR_REPORTES: [1, 6],         // Solo Admin global y Admin de Unidad
  EXPORTAR_REPORTES: [1, 2, 3, 6],
  APROBAR_REPORTES: [1, 6],        // Admin de Unidad puede aprobar reportes
  
  // Permisos de Usuarios
  VER_USUARIOS: [1, 2],
  GESTIONAR_USUARIOS: [1],
  
  // Permisos de Configuración
  VER_CONFIGURACION: [1],
  GESTIONAR_CONFIGURACION: [1],
  
  // Permisos específicos por Unidad Administrativa
  GESTIONAR_PROPIA_UNIDAD: [1, 6], // Admin global y Admin Unidad pueden gestionar su unidad
  VER_SOLO_PROPIA_UNIDAD: [6],     // Admin Unidad solo ve su unidad
};

// Función para verificar si el usuario tiene un permiso
export const tienePermiso = (user, permiso) => {
  if (!user) return false;
  
  const roleId = user.role_id;
  
  // Si no tiene role_id, permitir acceso (modo desarrollo)
  if (roleId === undefined || roleId === null) return true;
  
  const rolesPermitidos = PERMISOS[permiso];
  if (!rolesPermitidos) return false;
  
  return rolesPermitidos.includes(roleId);
};

// Función para verificar si el usuario es admin de unidad
export const esAdminUnidad = (user) => {
  if (!user) return false;
  return user.role_id === ROLES.ADMIN_UNIDAD;
};

// Función para verificar si el usuario es de finanzas
export const esFinanzas = (user) => {
  if (!user) return false;
  return user.role_id === ROLES.FINANZAS;
};

// Función para verificar si el usuario es admin global
export const esAdminGlobal = (user) => {
  if (!user) return false;
  return user.role_id === ROLES.ADMINISTRADOR;
};

// Función para obtener el nombre del rol
export const getNombreRol = (roleId) => {
  const roles = {
    1: 'Administrador',
    2: 'Director',
    3: 'Coordinador',
    4: 'Analista',
    5: 'Auditor',
    6: 'Admin Unidad',
    7: 'Finanzas',
  };
  return roles[roleId] || 'Usuario';
};

// Función para obtener el nivel de acceso
export const getNivelAcceso = (roleId) => {
  if (roleId === 1) return 'admin';
  if (roleId === 2) return 'director';
  if (roleId === 3) return 'coordinador';
  if (roleId === 4) return 'analista';
  if (roleId === 6) return 'admin_unidad';
  if (roleId === 7) return 'finanzas';
  return 'auditor';
};
