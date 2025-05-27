import { db } from './db';
import * as schema from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool } from '@neondatabase/serverless';

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const migrationDb = drizzle({ client: pool, schema });
    
    // Push the schema to the database
    await migrate(migrationDb, { migrationsFolder: 'drizzle' });
    
    console.log('Migrations completed successfully!');
    
    // Load exercises after migration
    const { initializeExercises } = require('./initDb');
    await initializeExercises();
    
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
}

// Export the function
export { runMigrations };

// If this script is run directly, execute the migrations
if (require.main === module) {
  runMigrations()
    .then((success) => {
      console.log(`Database migration ${success ? 'completed' : 'failed'}.`);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Database migration failed:', error);
      process.exit(1);
    });
}