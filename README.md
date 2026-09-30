# YNAB Clone — Aplicación de Presupuesto Personal Base Cero

> Clon de **YNAB (You Need A Budget)** desarrollado en **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** y **Prisma ORM** con **PostgreSQL**.

---

## 📖 Documentación del Proyecto

Toda la documentación técnica, especificación de módulos, arquitectura, diseño UI/UX y guías de implementación se encuentran organizadas en la carpeta [`docs/`](docs/README.md):

1. **[Plan de Implementación y Sprints](docs/01-plan-implementacion.md):** Plan vertical de sprints (0 a 7), checklists de tareas, DoD y guión de demostración (8-10 min).
2. **[Guía de Diseño UI/UX](docs/02-guia-ui-ux.md):** Conceptos clave de UX, tokens de diseño Tailwind, componentes reutilizables (`MoneyPill`, `ReadyToAssignBanner`, etc.), pautas pantalla por pantalla y accesibilidad.
3. **[Alcance, Método YNAB y Casos de Uso](docs/03-alcance-metodo-y-casos-de-uso.md):** Filosofía base cero, 5 preguntas del método, matriz de funcionalidades y los 10 casos de uso principales (CU1 a CU10).
4. **[Especificación Detallada de Módulos (M1 a M11)](docs/04-especificacion-modulos.md):** Requisitos, pantallas, reglas de negocio y Server Actions para cada módulo del sistema.
5. **[Arquitectura Técnica y Modelo de Datos](docs/05-arquitectura-y-modelo-datos.md):** Stack, decisiones arquitectónicas clave, modelo relacional, esquema Prisma (`prisma/schema.prisma`) y regla contable de transferencias.
6. **[Fórmulas Matemáticas y Reglas de Negocio](docs/06-formulas-y-reglas-negocio.md):** Fórmulas exactas de *Disponible*, *Ready to Assign*, prueba de consistencia contable, metas y función pura `simulateLoan`.
7. **[Rutas, Estructura de Carpetas y Fases](docs/07-rutas-estructura-y-fases.md):** Mapa de rutas públicas y privadas, árbol de directorios del proyecto, cronograma estimado en fases y mitigación de riesgos.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias (también genera el cliente de Prisma)
npm install

# 2. Configurar variables: copia .env.example a .env y completa DATABASE_URL y SESSION_SECRET
#    (Aiven/Neon/Supabase requieren ?sslmode=require al final de la cadena)

# 3. Crear las tablas y sembrar datos de prueba
npx prisma migrate dev --name init
npx prisma db seed          # usuario demo: demo@sobres.test / demo12345

# 4. Iniciar el servidor de desarrollo
npm run dev                 # http://localhost:3000

# Pruebas de las fórmulas (presupuesto, préstamos, dinero)
npm test
```

> En Next.js 16 el antiguo `middleware.ts` se llama `proxy.ts`; ahí vive la protección de `/app`.

## ✅ Estado de la implementación

| Sprint | Estado |
| :--- | :--- |
| 0 — Base (Next.js, Tailwind, Prisma, semilla, layout con barra lateral) | Hecho |
| 1 — Acceso y cuentas (registro, login, proxy, cuentas con saldo inicial, cerrar cuenta) | Hecho |
| 3 (parcial) — `lib/budget.ts` y `lib/loan.ts` con pruebas Vitest, incluida la de consistencia | Hecho |
| 3 (parcial) — Pantalla `/app/presupuesto/[mes]` en solo lectura con Ready to Assign | Hecho |
| 2 — Transacciones y transferencias | Pendiente |
| 3 — Edición de «Asignado», mover dinero, gestión de categorías | Pendiente |
| 4 a 7 — Metas, reportes, CSV, préstamos, landing completa, compartir | Pendiente |

Desviaciones deliberadas respecto a los docs: `proxy.ts` en lugar de `middleware.ts` (Next.js 16), Prisma 6 (el esquema de los docs usa `url = env(...)` en el datasource) y componentes de UI propios con Tailwind en lugar de shadcn/ui (se puede añadir con `npx shadcn@latest init`).
