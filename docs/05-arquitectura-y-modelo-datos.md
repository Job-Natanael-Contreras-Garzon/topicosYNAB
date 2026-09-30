# Arquitectura Técnica y Modelo de Datos

> **Documento de referencia:** Clon de YNAB en Next.js: documentación por módulos  
> **Fecha:** 29 de septiembre de 2026 · @eude  
> **Entorno:** Ejecución en local con `npm run dev` conectado a PostgreSQL (local, Docker o servicio en la nube como Neon / Supabase).

---

## 🛠️ Stack Tecnológico

| Capa | Herramienta seleccionada | Justificación técnica |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) + TypeScript | Frontend y backend unificados con tipado estático riguroso y Server Components. |
| **Base de datos** | PostgreSQL con Prisma ORM | Motor relacional robusto con control total, migraciones versionadas y tipado autogenerado. |
| **Autenticación** | Auth.js (Credentials) o sesión propia con `bcryptjs` + Cookie HTTP-only firmada | Control de acceso en entorno local sin depender de proveedores OAuth externos. |
| **Backend** | Server Actions + Route Handlers | Mutaciones directas sin boilerplate de API REST; endpoints especializados para lectura y CSV. |
| **Validación** | Zod | Esquemas únicos de validación compartidos entre cliente y servidor. |
| **UI** | Tailwind CSS + shadcn/ui | Colección de componentes accesibles y personalizables: diálogos, tablas, tabs, selects, toasts. |
| **Formularios** | React Hook Form | Manejo performante de formularios complejos sin re-renderizados innecesarios. |
| **Gráficos** | Recharts | Renderizado declarativo en React para gráficos de barras, líneas y donas. |
| **Procesamiento CSV** | Papa Parse | Parser eficiente y liviano para procesar extractos bancarios en el navegador. |
| **Pruebas** | Vitest | Ejecución instantánea de pruebas unitarias para las fórmulas críticas del presupuesto. |

---

## 🏛️ Decisiones de Arquitectura desde el Día Uno

1. **Dinero estrictamente en números enteros:**
   - Todos los montos se almacenan en centavos (`amountCents: Int`).
   - Jamás utilices números de punto flotante (`Float`) para almacenar o calcular dinero, para evitar errores de redondeo acumulativos (`0.1 + 0.2 !== 0.3`). La conversión a decimal formateado se realiza únicamente en la capa visual.
2. **El presupuesto se calcula de forma derivada, no se almacena estático:**
   - Solo se persisten las asignaciones manuales (`MonthlyAssignment`) y las transacciones (`Transaction`).
   - Los valores de *Disponible* y *Ready to Assign* se derivan en tiempo de ejecución mediante funciones puras en `lib/budget.ts`. Esto garantiza consistencia absoluta y simplifica drásticamente las pruebas unitarias.
3. **Capa intermedia de servicios:**
   - Las Server Actions (`src/actions/*`) validan los datos con Zod y delegan la lógica de negocio a servicios desacoplados en `src/lib/services/*`, los cuales interactúan con Prisma. Esto permite refactorizar la interfaz o endpoints sin comprometer la lógica central.
4. **Particionamiento por `budgetId`:**
   - Cada consulta o mutación a la base de datos debe filtrar explícitamente por el `budgetId` del usuario autenticado, preparando la base de código para el soporte de múltiples presupuestos o miembros compartidos.
5. **Representación de meses en formato canónico `YYYY-MM`:**
   - Los periodos presupuestarios se tratan como strings con formato estándar ISO `YYYY-MM` (ej. `"2026-09"`). Esto agiliza las búsquedas indexadas y simplifica la navegación temporal sin lidiar con zonas horarias.

---

## 🚀 Inicialización del Proyecto y Base de Datos

### 1. Creación del esqueleto e instalación de dependencias
```bash
npx create-next-app@latest ynab-clone --typescript --tailwind --app
cd ynab-clone

npm i prisma @prisma/client zod react-hook-form recharts papaparse bcryptjs
npm i -D vitest @types/bcryptjs @types/papaparse

npx prisma init --datasource-provider postgresql
npx shadcn@latest init
```

### 2. Configuración de PostgreSQL y Migraciones
Crea la base de datos localmente (`createdb ynab_clone` o mediante interfaz gráfica en pgAdmin / Docker) y configura la variable en `.env` (este archivo debe estar en `.gitignore`):

```env
DATABASE_URL="postgresql://usuario:clave@localhost:5432/ynab_clone"
```

Ejecuta la migración inicial y la siembra de datos de prueba:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

> [!NOTE]
> Si utilizas un servicio en la nube (como Supabase o Neon), recuerda verificar que la cadena incluya los parámetros SSL requeridos (ej. `?sslmode=require`). Aplica siempre las alteraciones al modelo mediante migraciones de Prisma.

---

## 🗄️ Modelo Relacional de Datos

Siete entidades bastan para cubrir el alcance completo del MVP:

| Entidad | Propósito | Campos clave |
| :--- | :--- | :--- |
| **`User`** | Cuenta del usuario que inicia sesión | `email` (único), `passwordHash`, `name` |
| **`Budget`** | Contenedor principal que agrupa cuentas y categorías | `name`, `currency`, `ownerId` |
| **`Account`** | Cuenta financiera (banco, efectivo, tarjeta, seguimiento) | `name`, `type`, `onBudget`, `closed` |
| **`CategoryGroup`** | Agrupador de sobres presupuestarios (ej. Gastos Fijos) | `name`, `sort`, `budgetId` |
| **`Category`** | Sobre presupuestario individual (ej. Renta, Supermercado) | `name`, `sort`, `hidden`, `groupId` |
| **`MonthlyAssignment`** | Monto asignado por el usuario a una categoría en un mes | `categoryId`, `month` (`YYYY-MM`), `assignedCents` |
| **`Transaction`** | Movimiento individual de ingreso, egreso o transferencia | `date`, `amountCents`, `payee`, `memo`, `approved`, `cleared`, `transferPairId` |
| **`Goal`** | Meta financiera asociada a una categoría | `kind`, `targetCents`, `targetDate` |

---

## 📄 Esquema Prisma Completo (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  createdAt    DateTime  @default(now())
  budgets      Budget[]
}

model Budget {
  id       String          @id @default(cuid())
  name     String
  currency String          @default("BOB")
  ownerId  String
  owner    User            @relation(fields: [ownerId], references: [id])
  accounts Account[]
  groups   CategoryGroup[]
}

model Account {
  id           String        @id @default(cuid())
  budgetId     String
  name         String
  type         String        // checking | savings | cash | credit | tracking
  onBudget     Boolean       @default(true)
  closed       Boolean       @default(false)
  budget       Budget        @relation(fields: [budgetId], references: [id])
  transactions Transaction[]
}

model CategoryGroup {
  id         String     @id @default(cuid())
  budgetId   String
  name       String
  sort       Int        @default(0)
  budget     Budget     @relation(fields: [budgetId], references: [id])
  categories Category[]
}

model Category {
  id          String              @id @default(cuid())
  groupId     String
  name        String
  sort        Int                 @default(0)
  hidden      Boolean             @default(false)
  group       CategoryGroup       @relation(fields: [groupId], references: [id])
  assignments MonthlyAssignment[]
  transactions Transaction[]
  goal        Goal?
}

model MonthlyAssignment {
  id            String   @id @default(cuid())
  categoryId    String
  month         String   // Formato: YYYY-MM
  assignedCents Int      @default(0)
  category      Category @relation(fields: [categoryId], references: [id])

  @@unique([categoryId, month])
}

model Transaction {
  id             String    @id @default(cuid())
  accountId      String
  categoryId     String?   // null = ingreso general (Ready to Assign) o transferencia
  date           DateTime
  amountCents    Int       // Negativo = egreso/gasto, Positivo = ingreso
  payee          String    @default("")
  memo           String    @default("")
  approved       Boolean   @default(true)
  cleared        Boolean   @default(false)
  transferPairId String?   // Identificador que une ambas patas de una transferencia
  account        Account   @relation(fields: [accountId], references: [id])
  category       Category? @relation(fields: [categoryId], references: [id])

  @@index([accountId, date])
}

model Goal {
  id          String    @id @default(cuid())
  categoryId  String    @unique
  kind        String    // monthly | by_date | balance
  targetCents Int
  targetDate  DateTime?
  category    Category  @relation(fields: [categoryId], references: [id])
}
```

---

## 🔁 Regla de Negocio para Transferencias

Una transferencia entre dos cuentas siempre origina **dos registros** en la tabla `Transaction` dentro de una misma transacción de base de datos (`prisma.$transaction`):
1. Una transacción con importe negativo (`-amountCents`) en la cuenta de origen.
2. Una transacción con importe positivo (`+amountCents`) en la cuenta de destino.
3. Ambas transacciones comparten de forma idéntica el mismo valor aleatorio `transferPairId`.

### Comportamiento respecto al Presupuesto:
- **Entre cuentas de presupuesto (`onBudget` $\to$ `onBudget`):**  
  `categoryId` debe ser `null`. No produce alteración alguna en las categorías ni en *Ready to Assign* (el dinero solo cambió de bolsillo físico).
- **Hacia o desde una cuenta de seguimiento (`onBudget` $\leftrightarrow$ `tracking`):**  
  El dinero entra o sale del circuito del presupuesto. Por consiguiente, se requiere asignarle una categoría y computa como un gasto o un ingreso real para el presupuesto.
