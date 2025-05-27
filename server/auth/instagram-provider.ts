import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { AuthProvider, ProfileData } from './auth-types';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class InstagramAuthProvider implements AuthProvider {
  initialize(): void {
    console.log('Initializing Instagram authentication');
    
    // Check if Instagram app credentials are available
    const clientID = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    
    if (!clientID || !clientSecret) {
      console.warn('Instagram authentication is disabled due to missing credentials');
      return;
    }
    
    // Instagram now uses the Facebook Graph API for authentication
    // This is a simplified implementation
    passport.use('instagram', new OAuth2Strategy({
      authorizationURL: 'https://api.instagram.com/oauth/authorize',
      tokenURL: 'https://api.instagram.com/oauth/access_token',
      clientID,
      clientSecret,
      callbackURL: '/auth/instagram/callback',
    }, async (accessToken, refreshToken, profile: any, done) => {
      try {
        // Get profile data from Instagram API
        const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
        if (!response.ok) {
          return done(new Error('Failed to fetch Instagram profile'));
        }
        
        const data = await response.json();
        
        // Find or create user
        const profileData: ProfileData = {
          id: data.id,
          username: data.username,
          provider: 'instagram',
        };
        
        // Check if user exists
        const existingUsers = await db.select()
          .from(users)
          .where(eq(users.providerUserId, profileData.id));
          
        // Filter in JS since multiple where clauses aren't working as expected
        const existingUser = existingUsers.find(user => user.provider === 'instagram');
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user
        const [newUser] = await db.insert(users)
          .values({
            username: profileData.username || `instagram-${profileData.id}`,
            email: null,
            provider: 'instagram',
            providerUserId: profileData.id,
            profilePhotoUrl: null,
          })
          .returning();
        
        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }));
  }
  
  authenticate(req: any, res: any, next: any): void {
    passport.authenticate('instagram', { 
      scope: ['user_profile'],
      failureRedirect: '/auth/error' 
    })(req, res, next);
  }
  
  getAuthPath(): string {
    return '/auth/instagram';
  }
  
  getCallbackPath(): string {
    return '/auth/instagram/callback';
  }
}