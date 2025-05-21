import passport from 'passport';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Express } from 'express';
import { AuthProviderFactory } from './auth-factory';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';

// Setup authentication for the Express application
export function setupAuth(app: Express): void {
  console.log('Setting up authentication...');
  
  // Initialize session store
  const PgSession = connectPgSimple(session);
  const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Setup session middleware
  app.use(session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'session', // Make sure this table exists in your DB
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a proper secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    }
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Serialize and deserialize user (store user ID in session)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const userArray = await db.select().from(users).where(eq(users.id, id));
      const user = userArray.length ? userArray[0] : null;
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Initialize the auth providers
  AuthProviderFactory.initialize();
  
  // Setup routes for all providers
  AuthProviderFactory.setupRoutes(app);
  
  // Setup authentication routes
  setupAuthRoutes(app);
}

// Setup common authentication routes
function setupAuthRoutes(app: Express): void {
  // Status route to check if user is authenticated
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      // Don't send password to the client
      const { password, ...user } = req.user as any;
      res.json({ authenticated: true, user });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // Logout route
  app.get('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
}