import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/features/auth/authStore";
import { toast } from "sonner";

/**
 * LoginPage - User login page component
 * Handles user authentication with email and password
 */
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const defaultValues = {
  email: "reactlover@coderschool.vn",
  password: "password",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
  } = form;

  const onSubmit = async (data) => {
    const from = location.state?.from?.pathname || "/";
    let { email, password } = data;

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login Page Error:", error);
      form.reset({ ...data, password: "" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center items-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center font-bold text-xl">
          Welcome back!
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-sm">
            Don't have an account?{" "}
            <RouterLink
              to="/home"
              className="font-medium underline hover:text-blue-800"
            >
              Register here!
            </RouterLink>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
