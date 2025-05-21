import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { AuthProvider, ProfileData } from './auth-types';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class FacebookAuthProvider implements AuthProvider {
  initialize(): void {
    console.log('Initializing Facebook authentication');
    
    // Check if Facebook app credentials are available
    const clientID = process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!clientID || !clientSecret) {
      console.warn('Facebook authentication is disabled due to missing credentials');
      return;
    }
    
    passport.use(new FacebookStrategy({
      clientID,
      clientSecret,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'email', 'photos']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        const profileData: ProfileData = {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          provider: 'facebook',
          photos: profile.photos,
        };
        
        // Check if user exists
        const [existingUser] = await db.select()
          .from(users)
          .where(eq(users.providerUserId, profile.id))
          .where(eq(users.provider, 'facebook'));
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user
        const [newUser] = await db.insert(users)
          .values({
            username: profileData.displayName || `facebook-${profileData.id}`,
            email: profileData.email || null,
            provider: 'facebook',
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
    passport.authenticate('facebook', { 
      scope: ['email'],
      failureRedirect: '/auth/error' 
    })(req, res, next);
  }
  
  getAuthPath(): string {
    return '/auth/facebook';
  }
  
  getCallbackPath(): string {
    return '/auth/facebook/callback';
  }
}