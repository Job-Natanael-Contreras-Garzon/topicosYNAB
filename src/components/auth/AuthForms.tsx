"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginUser, registerUser, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

const initial: AuthState = {};

function PasswordField({ error, autoComplete }: { error?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Field
        id="password"
        name="password"
        label="Contraseña"
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        error={error}
        required
      />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        Ver contraseña
      </label>
    </div>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field id="name" name="name" label="Nombre" autoComplete="name" error={state.fieldErrors?.name} required />
      <Field id="email" name="email" label="Correo" type="email" autoComplete="email" error={state.fieldErrors?.email} required />
      <PasswordField autoComplete="new-password" error={state.fieldErrors?.password} />
      {state.error && <p role="alert" className="text-sm text-alert">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creando tu presupuesto…" : "Crear mi presupuesto"}
      </Button>
      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-primary">Inicia sesión</Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field id="email" name="email" label="Correo" type="email" autoComplete="email" error={state.fieldErrors?.email} required />
      <PasswordField autoComplete="current-password" error={state.fieldErrors?.password} />
      {state.error && <p role="alert" className="text-sm text-alert">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-muted">
        ¿Aún no tienes cuenta? <Link href="/registro" className="font-semibold text-primary">Regístrate gratis</Link>
      </p>
    </form>
  );
}
