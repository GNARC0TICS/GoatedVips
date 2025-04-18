
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, LoginSchema, RegisterSchema, LoginData, RegisterData } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Use the types from the auth hooks for consistency
type LoginFormData = LoginData;
type RegisterFormData = RegisterData;

interface AuthModalProps {
  isMobile?: boolean;
}

export default function AuthModal({ isMobile = false }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register: registerUser } = useAuth();
  const { toast } = useToast();
  
  // Common styles for form inputs - increased font size on mobile to prevent zooming
  const inputStyles = "bg-[#2A2B31] border-[#3A3B41] focus:border-[#D7FF00] focus:ring-1 focus:ring-[#D7FF00] transition-all duration-300 md:text-sm text-base h-12";

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: LoginFormData | RegisterFormData) => {
    setIsLoading(true);
    try {
      if (mode === "login") {
        // Handle login
        const loginValues = values as LoginFormData;
        await login({
          username: loginValues.username,
          password: loginValues.password
        });
        
        toast({
          title: "Success",
          description: "Welcome back!",
        });
      } else {
        // Handle registration
        const registerValues = values as RegisterFormData;
        await registerUser({
          username: registerValues.username,
          email: registerValues.email,
          password: registerValues.password,
          confirmPassword: registerValues.confirmPassword
        });
        
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
      
      setIsOpen(false);
      loginForm.reset();
      registerForm.reset();
    } catch (error) {
      // Set form error
      if (mode === "login") {
        loginForm.setError("root", { 
          message: error instanceof Error ? error.message : "Authentication failed"
        });
      } else {
        registerForm.setError("root", { 
          message: error instanceof Error ? error.message : "Registration failed"
        });
      }
      
      // Show toast notification
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      // Reset forms when closing modal
      if (!open) {
        if (mode === "login") {
          loginForm.reset();
        } else {
          registerForm.reset();
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(true)}
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            minHeight: isMobile ? '48px' : '40px'
          }}
          className={`font-heading uppercase bg-[#1A1B21] border-[#2A2B31] hover:bg-[#2A2B31] hover:border-[#D7FF00] hover:shadow-[0_0_10px_rgba(215,255,0,0.3)] transition-all duration-300 text-sm tracking-wide ${
            isMobile ? "w-full py-2 px-4" : "py-1.5 px-4"
          }`}
        >
          <span className="text-white">LOGIN</span>
          <span className="text-[#8A8B91] mx-1">/</span>
          <span className="text-[#D7FF00]">REGISTER</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1B21] text-white border-[#2A2B31] shadow-lg shadow-black/20 backdrop-blur-sm touch-manipulation" style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
        <DialogHeader>
          <DialogTitle className="text-[#D7FF00]">
            {mode === "login" ? "Welcome Back!" : "Create an Account"}
          </DialogTitle>
          <DialogDescription className="text-[#8A8B91]">
            {mode === "login" 
              ? "Sign in to access your account"
              : "Join us to get started"}
          </DialogDescription>
        </DialogHeader>
        
        {mode === "login" ? (
          <Form {...loginForm}>
            <form 
              onSubmit={loginForm.handleSubmit(onSubmit)} 
              className="space-y-4" 
              autoComplete="off"
              onTouchStart={(e) => e.stopPropagation()}
            >
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className={inputStyles}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginForm.formState.errors.root && (
                <div className="text-red-500 text-sm p-2 rounded bg-red-950/30 border border-red-900">
                  {loginForm.formState.errors.root.message}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full font-heading uppercase tracking-tight text-black bg-[#D7FF00] hover:bg-[#b2d000] hover:shadow-[0_0_12px_rgba(215,255,0,0.4)] transition-all duration-300"
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    minHeight: '48px'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm font-heading uppercase tracking-tight text-[#8A8B91] hover:text-[#D7FF00] transition-colors duration-300"
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    minHeight: '44px'
                  }}
                  onClick={() => {
                    setMode("register");
                    loginForm.reset();
                  }}
                >
                  Need an account? Register
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form 
              onSubmit={registerForm.handleSubmit(onSubmit)} 
              className="space-y-4"
              autoComplete="off"
              onTouchStart={(e) => e.stopPropagation()}
            >
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className={inputStyles}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className={inputStyles}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {registerForm.formState.errors.root && (
                <div className="text-red-500 text-sm p-2 rounded bg-red-950/30 border border-red-900">
                  {registerForm.formState.errors.root.message}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full font-heading uppercase tracking-tight text-black bg-[#D7FF00] hover:bg-[#b2d000] hover:shadow-[0_0_12px_rgba(215,255,0,0.4)] transition-all duration-300"
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    minHeight: '48px'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm font-heading uppercase tracking-tight text-[#8A8B91] hover:text-[#D7FF00] transition-colors duration-300"
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    minHeight: '44px'
                  }}
                  onClick={() => {
                    setMode("login");
                    registerForm.reset();
                  }}
                >
                  Already have an account? Login
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
