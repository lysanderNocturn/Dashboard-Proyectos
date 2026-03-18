import express from 'express';
import cors from 'cors';
import { PORT, DB_HOST, DB_NAME } from './config.js';
import { pool } from './db.js';

// Import routes
import userRoutes from './routes/users.routes.js';
import unidadAdministrativaRoutes from './routes/unidadAdministrativas.routes.js';
import proyectoRoutes from './routes/proyectos.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import ejesRoutes from './routes/ejes.routes.js';
import departamentosRoutes from './routes/departamentos.routes.js';
import presupuestosRoutes from './routes/presupuestos.routes.js';
import actividadesPlanificadasRoutes from './routes/actividadesPlanificadas.routes.js';
import actividadesEjecutadasRoutes from './routes/actividadesEjecutadas.routes.js';
import accionesRoutes from './routes/acciones.routes.js';
import medidasRoutes from './routes/medidas.routes.js';
import authRoutes from './routes/auth.routes.js';
// Nuevas rutas para el sistema de mejoras
import presupuestoAsignacionesRoutes from './routes/presupuestoAsignaciones.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

// Morgan for logging
import morgan from 'morgan';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Trust proxy for secure cookies
app.set('trust proxy', 1);

// Optimize: Limit request size to 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const dbResponse = Date.now() - start;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        responseTime: `${dbResponse}ms`
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Gestor de Proyectos API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/usuarios',
      proyectos: '/proyectos',
      roles: '/roles',
      // Add more as needed
    }
  });
});

// API Routes
app.use(userRoutes);
app.use(unidadAdministrativaRoutes);
app.use(proyectoRoutes);
app.use(rolesRoutes);
app.use(ejesRoutes);
app.use(departamentosRoutes);
app.use(presupuestosRoutes);
app.use(actividadesPlanificadasRoutes);
app.use(actividadesEjecutadasRoutes);
app.use(accionesRoutes);
app.use(medidasRoutes);
app.use(authRoutes);
// Nuevas rutas del sistema de mejoras
app.use(presupuestoAsignacionesRoutes);
app.use(reportesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint no encontrado',
    path: req.path 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor'
    : err.message;
  
  res.status(err.status || 500).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   🚀 Servidor corriendo en puerto: ${PORT}          ║
║   📡 API: http://localhost:${PORT}/api            ║
║   🏥 Health: http://localhost:${PORT}/health         ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM: Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT: Cerrando servidor...');
  await pool.end();
  process.exit(0);
});
