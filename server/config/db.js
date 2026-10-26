import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

// Create a MariaDB/MySQL connection pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'scholar_db',
  connectionLimit: 10,
});

const adapter = new PrismaMariaDb(pool);

const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Extend Prisma Client so every query result automatically has `_id` matching `id`
// This guarantees 100% backward compatibility with existing React client components
export const prisma = basePrisma.$extends({
  result: {
    user: {
      _id: {
        needs: { id: true },
        compute(user) {
          return user.id;
        },
      },
    },
    studentProfile: {
      _id: {
        needs: { id: true },
        compute(profile) {
          return profile.id;
        },
      },
    },
    academicRecord: {
      _id: {
        needs: { id: true },
        compute(record) {
          return record.id;
        },
      },
    },
    sponsorProfile: {
      _id: {
        needs: { id: true },
        compute(profile) {
          return profile.id;
        },
      },
    },
    sponsorship: {
      _id: {
        needs: { id: true },
        compute(s) {
          return s.id;
        },
      },
    },
    application: {
      _id: {
        needs: { id: true },
        compute(app) {
          return app.id;
        },
      },
    },
    applicationDocument: {
      _id: {
        needs: { id: true },
        compute(doc) {
          return doc.id;
        },
      },
    },
    fraudResult: {
      _id: {
        needs: { id: true },
        compute(fr) {
          return fr.id;
        },
      },
    },
    payment: {
      _id: {
        needs: { id: true },
        compute(p) {
          return p.id;
        },
      },
    },
    documentRequest: {
      _id: {
        needs: { id: true },
        compute(dr) {
          return dr.id;
        },
      },
    },
    submittedDocument: {
      _id: {
        needs: { id: true },
        compute(sd) {
          return sd.id;
        },
      },
    },
    notification: {
      _id: {
        needs: { id: true },
        compute(n) {
          return n.id;
        },
      },
    },
    activityLog: {
      _id: {
        needs: { id: true },
        compute(log) {
          return log.id;
        },
      },
    },
  },
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('MySQL Database Connected successfully via Prisma MariaDB Adapter');
  } catch (error) {
    console.error(`Error connecting to MySQL: ${error.message}`);
    process.exit(1);
  }
};

export default prisma;
