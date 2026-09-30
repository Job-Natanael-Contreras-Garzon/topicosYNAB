import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Crear cuenta — Sobres" };

export default function RegistroPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-extrabold">Empieza tu presupuesto</h1>
      <p className="mb-4 text-muted">Solo necesitamos tu nombre, correo y una contraseña.</p>
      <RegisterForm />
    </>
  );
}
