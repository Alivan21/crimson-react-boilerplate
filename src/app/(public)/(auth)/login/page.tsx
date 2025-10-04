import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { loginSchema, type TLoginRequest } from "~/api/auth/schema";
import { type TErrorResponse } from "~/common/types/base-response";
import { useSession } from "~/components/providers/sessions";
import LoginForm from "./_components/form";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const form = useForm<TLoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: TLoginRequest) => {
    try {
      await signIn(data);
      toast.success("Login successful");
      void navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const { message } = error as TErrorResponse;
      toast.error(message);
    }
  };

  return (
    <main className="m-auto flex w-full max-w-lg flex-col items-center p-5">
      <section className="mx-auto items-center space-y-4 text-center">
        <User className="mx-auto h-9 w-9" />
        <div className="space-y-1">
          <h1 className="mt-4 text-xl font-bold tracking-tight">Log in to our application</h1>
          <p className="text-muted-foreground mb-8 text-center text-sm">
            Enter your email and password to login
          </p>
        </div>
      </section>
      <LoginForm form={form} onSubmit={handleSubmit} />
    </main>
  );
}
