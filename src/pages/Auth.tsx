import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waves, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255, { message: "Email muito longo" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).max(100, { message: "Senha muito longa" })
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
      }
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      let result;
      if (isLogin) {
        result = await signIn(email.trim(), password);
      } else {
        result = await signUp(email.trim(), password);
      }

      if (result.error) {
        const errorMessage = result.error.message;
        
        if (errorMessage.includes("User already registered")) {
          setErrors({ email: "Este email já está cadastrado" });
        } else if (errorMessage.includes("Invalid login credentials")) {
          setErrors({ general: "Email ou senha incorretos" });
        } else if (errorMessage.includes("Email not confirmed")) {
          toast({
            title: "Email não confirmado",
            description: "Verifique sua caixa de entrada e clique no link de confirmação",
            variant: "destructive"
          });
        } else {
          setErrors({ general: errorMessage });
        }
      } else {
        if (!isLogin) {
          toast({
            title: "Conta criada!",
            description: "Bem-vindo ao sistema DAEA",
          });
        } else {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta",
          });
        }
        navigate("/");
      }
    } catch (error) {
      setErrors({ general: "Erro inesperado. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Waves className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">DAEA</h1>
            </div>
          </div>
          <p className="text-muted-foreground">Sistema Inteligente de Monitoramento</p>
        </div>

        {/* Auth Form */}
        <Card className="p-8 shadow-lg border-border/50 bg-card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center mb-2">
              {isLogin ? "Entrar" : "Criar Conta"}
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              {isLogin ? "Acesse sua conta DAEA" : "Cadastre-se no sistema DAEA"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password - Only for signup */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  required
                />
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
              disabled={loading}
            >
              {loading ? "Processando..." : (isLogin ? "Entrar" : "Criar Conta")}
            </Button>
          </form>

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </Button>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            DAEA © 2024 • Tecnologia contra enchentes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;