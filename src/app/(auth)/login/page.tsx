import { LoginForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Iniciar sesión — Sobres" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">Bienvenida de vuelta</h1>
      <LoginForm />
    </>
  );
}
