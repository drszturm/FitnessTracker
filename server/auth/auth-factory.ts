import { AuthProvider } from './auth-types';
import { FacebookAuthProvider } from './facebook-provider';
import { GoogleAuthProvider } from './google-provider';
import { InstagramAuthProvider } from './instagram-provider';

// Auth Provider Factory - implements the Factory pattern
export class AuthProviderFactory {
  private static providers: Map<string, AuthProvider> = new Map();
  
  // Initialize all providers
  static initialize(): void {
    // Register providers
    this.registerProvider('facebook', new FacebookAuthProvider());
    this.registerProvider('google', new GoogleAuthProvider());
    this.registerProvider('instagram', new InstagramAuthProvider());
    
    // Initialize each provider
    this.providers.forEach(provider => provider.initialize());
  }
  
  // Register a new provider
  static registerProvider(name: string, provider: AuthProvider): void {
    this.providers.set(name, provider);
  }
  
  // Get a specific provider
  static getProvider(name: string): AuthProvider | undefined {
    return this.providers.get(name);
  }
  
  // Get all providers
  static getAllProviders(): AuthProvider[] {
    return Array.from(this.providers.values());
  }
  
  // Setup routes for all providers
  static setupRoutes(app: any): void {
    this.providers.forEach((provider, name) => {
      console.log(`Setting up routes for ${name} authentication`);
      
      // Setup the initial auth route
      app.get(provider.getAuthPath(), (req: any, res: any, next: any) => {
        provider.authenticate(req, res, next);
      });
      
      // Setup the callback route
      app.get(provider.getCallbackPath(), (req: any, res: any, next: any) => {
        // This will be handled by Passport
        provider.authenticate(req, res, (err: any) => {
          if (err) {
            return res.redirect('/auth/error');
          }
          return res.redirect('/');
        });
      });
    });
    
    // Setup a general error route
    app.get('/auth/error', (req: any, res: any) => {
      res.status(401).json({ message: 'Authentication failed' });
    });
  }
}