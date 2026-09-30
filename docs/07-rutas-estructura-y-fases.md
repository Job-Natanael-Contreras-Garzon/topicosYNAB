# Rutas, Estructura de Carpetas, Fases y Riesgos

> **Documento de referencia:** Clon de YNAB en Next.js: documentación por módulos  
> **Fecha:** 29 de septiembre de 2026 · @eude  
> **Arquitectura de Software:** Next.js (App Router) con segmentación de grupos de rutas (`(marketing)`, `(auth)`, `app/`).

---

## 🗺️ Mapa de Rutas del Sistema

La aplicación delimita claramente una zona pública informativa y una zona privada de aplicación protegida mediante `middleware.ts`.

| Ruta | Pantalla / Vista | Módulo | Acceso |
| :--- | :--- | :--- | :--- |
| `/` | Landing page principal | **M10** | Público |
| `/funcionalidades`, `/metodo`, `/precios` | Páginas estáticas informativas | **M10** | Público |
| `/login`, `/registro` | Formularios de autenticación y alta | **M1** | Público |
| `/app` | Panel de Inicio (*Home* / Dashboard diario) | **M6** | Privado (requiere cookie de sesión) |
| `/app/presupuesto/[mes]` | Presupuesto mensual, tabla y panel de metas | **M4, M5** | Privado |
| `/app/cuentas/[id]` | Vista y conciliación de cuenta individual | **M2, M3, M8** | Privado |
| `/app/cuentas/todas` | Registro global consolidado de transacciones | **M2, M3** | Privado |
| `/app/reportes` | Análisis visual (*Reflect*): categoría, tendencia, patrimonio | **M7** | Privado |
| `/app/prestamos` | Calculadora y simulador de préstamos | **M9** | Privado |
| `/app/ajustes` | Configuración de usuario y preferencias del presupuesto | **M1** | Privado |
| `/app/ajustes/miembros` | Gestión de invitaciones a presupuesto compartido | **M11** | Privado (opcional) |

---

## 📂 Estructura de Directorios Recomendada

```text
ynab-clone/
├─ prisma/
│  ├─ schema.prisma             # Modelo de datos Prisma ORM
│  ├─ migrations/               # Historial de migraciones SQL
│  └─ seed.ts                   # Semilla con usuario de prueba y 3 meses de transacciones
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/           # Grupo de rutas públicas
│  │  │  ├─ page.tsx            # Landing page (Hero, método, CTA)
│  │  │  ├─ funcionalidades/
│  │  │  ├─ metodo/
│  │  │  └─ precios/
│  │  ├─ (auth)/                # Grupo de autenticación
│  │  │  ├─ login/page.tsx
│  │  │  └─ registro/page.tsx
│  │  └─ app/                   # Aplicación autenticada protegida
│  │     ├─ layout.tsx          # Layout con barra lateral persistente
│  │     ├─ page.tsx            # Home / Resumen diario (M6)
│  │     ├─ presupuesto/
│  │     │  └─ [mes]/page.tsx   # Vista mensual del presupuesto (M4, M5)
│  │     ├─ cuentas/
│  │     │  ├─ [id]/page.tsx    # Transacciones de una cuenta (M2, M3, M8)
│  │     │  └─ todas/page.tsx   # Vista consolidada de movimientos
│  │     ├─ reportes/page.tsx   # Vista Reflect con Recharts (M7)
│  │     ├─ prestamos/page.tsx  # Calculadora de amortización (M9)
│  │     └─ ajustes/
│  │        ├─ page.tsx         # Configuración general
│  │        └─ miembros/        # Gestión de miembros (M11)
│  ├─ components/
│  │  ├─ ui/                    # Componentes base de shadcn/ui (Button, Dialog, etc.)
│  │  ├─ budget/                # MoneyPill, ReadyToAssignBanner, InlineNumberInput
│  │  ├─ transactions/          # Tabla interactiva, modales de ingreso y transferencias
│  │  ├─ goals/                 # GoalProgress, panel lateral de metas
│  │  └─ charts/                # Gráficos de dona, barras y líneas con Recharts
│  ├─ lib/
│  │  ├─ budget.ts              # Fórmulas puras de presupuesto
│  │  ├─ budget.test.ts         # Pruebas unitarias de consistencia con Vitest
│  │  ├─ loan.ts                # Función pura simulateLoan
│  │  ├─ loan.test.ts           # Pruebas de la calculadora de préstamos
│  │  ├─ money.ts               # Formato de centavos a moneda regional
│  │  ├─ db.ts                  # Instancia singleton del cliente Prisma
│  │  └─ services/              # Capa de acceso a datos (queries Prisma desacopladas)
│  │     ├─ accounts.ts
│  │     ├─ transactions.ts
│  │     ├─ categories.ts
│  │     ├─ goals.ts
│  │     └─ reports.ts
│  └─ actions/                  # Server Actions agrupadas por dominio funcional
│     ├─ auth.ts
│     ├─ accounts.ts
│     ├─ transactions.ts
│     ├─ budget.ts
│     └─ goals.ts
├─ middleware.ts                # Guardián de rutas: valida sesión y redirige a /login
├─ .env                         # Variables de entorno locales (DATABASE_URL, SECRET)
└─ package.json
```

---

## ⏱️ Plan de Trabajo en Fases

Cronograma estimado para 1 o 2 desarrolladores con dedicación parcial. Adapta los plazos a la disponibilidad del equipo:

| Fase | Módulos vinculados | Entregable funcional | Criterio de aceptación | Estimación |
| :--- | :--- | :--- | :--- | :--- |
| **0. Base** | Infraestructura | Proyecto base, Prisma, Tailwind, shadcn/ui y semilla de prueba inicial. | La app arranca con `npm run dev` y la migración corre limpia. | **1 día** |
| **1. Núcleo** | **M1, M2, M3** | Sistema de registro, login, creación de cuentas y tabla de transacciones. | Casos **CU1**, **CU3** y **CU9** verificados. | **4 a 5 días** |
| **2. Presupuesto** | **M4**, `lib/budget.ts` | Pantalla mensual con asignación interactiva, mover dinero y banner *Ready to Assign*. | Casos **CU2**, **CU4** y prueba matemática de consistencia superada en Vitest. | **4 a 5 días** |
| **3. Valor agregado** | **M6, M5, M7** | Pantalla de Inicio (*Home*), configuración de metas (*Targets*) y pestaña de Reportes. | Casos **CU5** y **CU7** completados. | **4 días** |
| **4. Entradas y deuda** | **M8, M9** | Importador de extractos CSV con deduplicación y calculadora interactiva de préstamos. | Casos **CU6** y **CU8** operativos. | **3 días** |
| **5. Presentación** | **M10**, pulido UI | Landing page pública, adaptación responsiva y dataset completo de prueba (3 meses). | Demostración completa de punta a punta sin errores de interfaz. | **2 a 3 días** |
| **6. Opcional** | **M11** | Presupuesto compartido colaborativo entre usuarios locales. | Caso **CU10** verificado. | **2 días** |

---

## 🚨 Riesgos Críticos a Vigilar y Mitigación

1. **Riesgo 1: Implementar el arrastre mensual sin la prueba de consistencia.**
   - *Peligro:* Los saldos de las categorías se desalinean silenciosamente con el saldo bancario real con cada mes transcurrido.
   - *Mitigación:* Escribir primero los casos de `budget.test.ts` antes de construir los componentes de la interfaz de usuario.
2. **Riesgo 2: Guardar montos como números decimales (`Float`).**
   - *Peligro:* Inconsistencias contables por acumulación de errores de redondeo binario de coma flotante.
   - *Mitigación:* Almacenar exclusivamente enteros en centavos (`amountCents: Int`) tanto en base de datos como en estados internos.
3. **Riesgo 3: Dedicar demasiado tiempo inicial a la Landing Page.**
   - *Peligro:* Quedarse sin tiempo hábil para pulir y depurar el núcleo presupuestario y las reglas financieras.
   - *Mitigación:* Construir la landing en la fase 5, una vez que el motor de presupuesto funcione a la perfección.
4. **Estrategia de contingencia ante falta de tiempo:**
   - Si los plazos se acortan, recorta el alcance estrictamente en el siguiente orden inverso:
     $$\mathbf{M11} \;\longrightarrow\; \mathbf{M9} \;\longrightarrow\; \mathbf{M8} \;\longrightarrow\; \mathbf{M7}$$
   - Nunca recortes **M1**, **M2**, **M3**, **M4** ni **M5**, ya que constituyen la esencia indispensable del producto.
