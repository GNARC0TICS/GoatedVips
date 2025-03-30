import React from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Define form schema
const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  adminKey: z.string().min(1, 'Admin key is required'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function GoombasAdminLogin() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Initialize form
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
      adminKey: '',
    },
  });

  async function onSubmit(data: AdminLoginFormValues) {
    setIsLoading(true);
    
    try {
      const response = await fetch('/goombas.net/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Success - store admin session in localStorage
      localStorage.setItem('isGoombasAdmin', 'true');
      
      toast({
        title: 'Login successful',
        description: 'Welcome to the admin dashboard',
        variant: 'default',
      });

      // Redirect to admin dashboard
      setLocation('/goombas-dashboard');

    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#14151A]">
      <Card className="w-full max-w-md border-[#D7FF00]/20 bg-[#1A1C23]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-[#D7FF00]">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Admin username"
                        {...field}
                        disabled={isLoading}
                        className="bg-[#222328] border-[#36383F]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Admin password"
                        {...field}
                        disabled={isLoading}
                        className="bg-[#222328] border-[#36383F]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="adminKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Admin secret key"
                        {...field}
                        disabled={isLoading}
                        className="bg-[#222328] border-[#36383F]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            Protected admin access • {new Date().getFullYear()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}