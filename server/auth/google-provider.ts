import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthProvider, ProfileData } from './auth-types';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class GoogleAuthProvider implements AuthProvider {
  initialize(): void {
    console.log('Initializing Google authentication');
    
    // Check if Google app credentials are available
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientID || !clientSecret) {
      console.warn('Google authentication is disabled due to missing credentials');
      return;
    }
    
    passport.use(new GoogleStrategy({
      clientID,
      clientSecret,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        const profileData: ProfileData = {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          provider: 'google',
          photos: profile.photos,
        };
        
        // Check if user exists
        const existingUsers = await db.select()
          .from(users)
          .where(eq(users.providerUserId, profile.id))
          .where(eq(users.provider, 'google'));
        
        const existingUser = existingUsers[0];
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user
        const [newUser] = await db.insert(users)
          .values({
            username: profileData.displayName || `google-${profileData.id}`,
            email: profileData.email || null,
            provider: 'google',
            providerUserId: profileData.id,
            profilePhotoUrl: profileData.photos?.[0]?.value || null,
          })
          .returning();
        
        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }));
  }
  
  authenticate(req: any, res: any, next: any): void {
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      failureRedirect: '/auth/error' 
    })(req, res, next);
  }
  
  getAuthPath(): string {
    return '/auth/google';
  }
  
  getCallbackPath(): string {
    return '/auth/google/callback';
  }
}