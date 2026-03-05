// Sistema de permisos basado en roles
// Roles: 1=Administrador, 2=Director, 3=Coordinador, 4=Analista, 5=Auditor

export const ROLES = {
  ADMINISTRADOR: 1,
  DIRECTOR: 2,
  COORDINADOR: 3,
  ANALISTA: 4,
  AUDITOR: 5,
};

export const PERMISOS = {
  // Permisos de Proyectos
  VER_PROYECTOS: [1, 2, 3, 4, 5],
  CREAR_PROYECTOS: [1],
  EDITAR_PROYECTOS: [1],
  ELIMINAR_PROYECTOS: [1],
  
  // Permisos de Avance Trimestral
  VER_AVANCE: [1, 2, 3, 4, 5],
  CAPTURAR_AVANCE: [1, 2, 3, 4], // Todos excepto auditor
  EDITAR_AVANCE: [1, 2, 3],
  
  // Permisos de Reportes
  VER_REPORTES: [1, 2, 3, 4, 5],
  EXPORTAR_REPORTES: [1, 2, 3],
  
  // Permisos de Usuarios
  VER_USUARIOS: [1, 2],
  GESTIONAR_USUARIOS: [1],
  
  // Permisos de Configuración
  VER_CONFIGURACION: [1],
  GESTIONAR_CONFIGURACION: [1],
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

// Función para obtener el nombre del rol
export const getNombreRol = (roleId) => {
  const roles = {
    1: 'Administrador',
    2: 'Director',
    3: 'Coordinador',
    4: 'Analista',
    5: 'Auditor',
  };
  return roles[roleId] || 'Usuario';
};

// Función para obtener el nivel de acceso
export const getNivelAcceso = (roleId) => {
  if (roleId === 1) return 'admin';
  if (roleId === 2) return 'director';
  if (roleId === 3) return 'coordinador';
  if (roleId === 4) return 'analista';
  return 'auditor';
};
