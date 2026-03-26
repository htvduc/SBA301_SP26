import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, User, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RegistrationStep = 'info' | 'otp' | 'success';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<RegistrationStep>('info');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isNavigating, setIsNavigating] = useState(false);

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: userApi.sendOTP,
    onSuccess: () => {
      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the verification code.',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
      toast({
        variant: 'destructive',
        title: 'Failed to send OTP',
        description: errorMessage,
      });
    },
  });

  // Validate OTP mutation
  const validateOTPMutation = useMutation({
    mutationFn: userApi.validateOTP,
    onSuccess: (data) => {
      if (data.result) {
        // OTP valid, proceed to signup
        signupMutation.mutate({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid OTP',
          description: 'The code you entered is incorrect or expired.',
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: errorMessage,
      });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: userApi.signup,
    onSuccess: (data) => {
      setStep('success');
      toast({
        title: 'Account created!',
        description: 'Your account has been successfully created.',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: errorMessage,
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 5 || formData.username.length > 25) {
      newErrors.username = 'Username must be between 5 and 25 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      sendOTPMutation.mutate({
        mail: formData.email,
        name: formData.username,
      });
    }
  };

  const handleSubmitOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      validateOTPMutation.mutate({
        email: formData.email,
        otp: otp,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit code.',
      });
    }
  };

  const handleResendOTP = () => {
    sendOTPMutation.mutate({
      mail: formData.email,
      name: formData.username,
    });
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>
              Your account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You can now log in with your email and password.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => {
                setIsNavigating(true);
                navigate('/login');
              }}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Go to Login'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('info')}
              className="w-fit mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitOTP}>
            <CardContent className="space-y-4">
              {(validateOTPMutation.isError || signupMutation.isError) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {validateOTPMutation.error?.response?.data?.message || 
                     signupMutation.error?.response?.data?.message ||
                     'Verification failed. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground text-center">
                  Code expires in 1 minute
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={sendOTPMutation.isPending}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend
                  </button>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={validateOTPMutation.isPending || signupMutation.isPending || otp.length !== 6}
              >
                {(validateOTPMutation.isPending || signupMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify & Create Account
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitInfo}>
          <CardContent className="space-y-4">
            {(sendOTPMutation.isError || signupMutation.isError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {sendOTPMutation.error?.response?.data?.message || 
                   signupMutation.error?.response?.data?.message ||
                   'An error occurred. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="pl-10"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={sendOTPMutation.isPending}
            >
              {sendOTPMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
