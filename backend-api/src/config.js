export const DB_USER = process.env.DB_USER || "postgres"
export const DB_HOST = process.env.DB_HOST || "localhost"
export const DB_PASSWORD = process.env.DB_PASSWORD || "dirplan34"
export const DB_NAME = process.env.DB_NAME || "nodepg"
export const DB_PORT = parseInt(process.env.DB_PORT) || 5432

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
export const NODE_ENV = process.env.NODE_ENV || "development";
