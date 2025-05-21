import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Instagram, Mail } from 'lucide-react';
import { useNavigate } from 'wouter';

export default function LoginPage() {
  const { toast } = useToast();
  const [_, navigate] = useNavigate();
  
  // Check if user is already authenticated
  const { data: authData, isLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (authData?.authenticated) {
      navigate('/dashboard');
    }
  }, [authData, navigate]);
  
  const handleSocialLogin = (provider: string) => {
    // Redirect to the provider's auth endpoint
    window.location.href = `/auth/${provider}`;
  };
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
            Sign in to FitTrack
          </CardTitle>
          <CardDescription>
            Continue your fitness journey by signing in with your preferred method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 border-blue-500 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleSocialLogin('facebook')}
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span>Continue with Facebook</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 border-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={() => handleSocialLogin('google')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
              </svg>
              <span>Continue with Google</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 border-purple-500 hover:bg-purple-50 hover:text-purple-700"
              onClick={() => handleSocialLogin('instagram')}
            >
              <Instagram className="w-5 h-5 text-purple-600" />
              <span>Continue with Instagram</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
          <Button variant="default" className="w-full bg-gradient-to-r from-blue-600 to-violet-500 hover:from-blue-700 hover:to-violet-600">
            <Mail className="w-5 h-5 mr-2" />
            Sign in with Email
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <span>Don't have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a></span>
        </CardFooter>
      </Card>
    </div>
  );
}