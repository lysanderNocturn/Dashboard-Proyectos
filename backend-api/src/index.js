import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
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
import morgan from 'morgan';

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Routes
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

app.listen(PORT);
console.log('Todo funcionando por el puerto:', PORT, '✅');
