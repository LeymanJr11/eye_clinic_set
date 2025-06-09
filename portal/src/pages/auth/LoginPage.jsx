// src/pages/auth/LoginPage.jsx - Simplified for Fire Emergency System
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, KeyRound, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const doctorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginWithWallet, loginWithEmail, isConnecting } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const handleDoctorLogin = async (data) => {
    try {
      setError(null);
      setIsLoading(true);
      await loginWithEmail(data.email, data.password);
      toast({
        title: "Login successful",
        description: "Welcome back, Doctor!",
      });
    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await loginWithWallet();
      toast({
        title: "Login successful",
        description: "Welcome back, Administrator!",
      });
    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your wallet and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg mb-4">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Choose your role and sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="doctor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger 
                value="doctor" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                <User className="h-4 w-4 mr-2" />
                Doctor
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="doctor" className="mt-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(handleDoctorLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in as Doctor"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                className="w-full" 
                onClick={handleAdminLogin}
                disabled={isLoading || isConnecting}
              >
                {(isLoading || isConnecting) ? (
                  "Connecting..."
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            Don't have an account? Contact the administrator
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};