import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  empresa: {
    nombre: process.env.EMPRESA_NOMBRE || 'SINTECOL S.A.S.',
    nit: process.env.EMPRESA_NIT || '900000000-1'
  }
};
