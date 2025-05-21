// Defining shared types for auth system

export type ProfileData = {
  id: string;
  displayName?: string;
  email?: string;
  provider: string;
  photos?: { value: string }[];
  username?: string;
};

export interface AuthProvider {
  initialize(): void;
  authenticate(req: any, res: any, next: any): void;
  getAuthPath(): string;
  getCallbackPath(): string;
}