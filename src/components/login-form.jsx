import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch } from "react-redux";
import { login } from "@/features/auth/auth-slice";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

export function LoginForm({ className, ...props }) {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "", // Set initial value for site_name
      password: "", // Set initial value for site_code
    },
  });

  const dispatch = useDispatch();
  const { toast } = useToast();

  const loginReq = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = {
      email: username,
      password: password,
    };

    try {
      let res = await api.post("auth/login", user);
      dispatch(login(res.data));
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your credentials below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        {/* <div className="grid gap-2">
          <Label htmlFor="role">Select Department</Label>
          <Select onValueChange={(value) => setDepartment(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select department</SelectLabel>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="civil">Civil</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="accounts">Accounts</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Select role</Label>
          <Select onValueChange={(value) => setRole(value)}>
            <SelectTrigger className="w-full">
              <SelectValue
                onSelect={(e) => setRole(e.target.value)}
                placeholder="Select role"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select role</SelectLabel>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="site-manager">Site Manager</SelectItem>
                <SelectItem value="machine-manager">Machine Manager</SelectItem>
                <SelectItem value="hr">
                  Human Resources Manager (HRM)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div> */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="username"
            type="text"
            placeholder="john.doe@bpc.com"
            required
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
        </div>
        <Button loading={loading} onClick={loginReq} className="w-full">
          Login
        </Button>
      </div>
    </form>
  );
}
