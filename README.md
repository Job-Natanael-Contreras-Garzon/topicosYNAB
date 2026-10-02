# Sobres. — Aplicación de Presupuesto Personal Base Cero

> Sistema integral de **Presupuesto Base Cero (Zero-Based Budgeting)** inspirado en la metodología YNAB, desarrollado con arquitectura vanguardista en **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, **Recharts**, **Papa Parse** y **Prisma ORM 6** con **PostgreSQL**.

---

## 📖 Documentación del Proyecto

Toda la documentación técnica, especificación de módulos, arquitectura, diseño UI/UX y guías de implementación se encuentran organizadas en la carpeta [`docs/`](docs/README.md):

1. **[Plan de Implementación y Sprints](docs/01-plan-implementacion.md):** Plan vertical completo de sprints (0 a 7), checklists de tareas, Definition of Done y guión de demostración académica (8-10 min).
2. **[Guía de Diseño UI/UX](docs/02-guia-ui-ux.md):** Conceptos clave de UX, tokens de diseño de la paleta vanguardista (*Deep Blue, Money Green, Modern Pink, Powder Pink, Off-White*), componentes reutilizables (`MoneyPill`, `ReadyToAssignBanner`, `InlineNumberInput`, etc.) y pautas de accesibilidad.
3. **[Alcance, Método YNAB y Casos de Uso](docs/03-alcance-metodo-y-casos-de-uso.md):** Filosofía base cero, 4 reglas fundamentales, matriz de funcionalidades y los casos de uso principales (CU1 a CU10).
4. **[Especificación Detallada de Módulos (M1 a M11)](docs/04-especificacion-modulos.md):** Requisitos, pantallas, reglas contables y Server Actions para cada módulo del sistema.
5. **[Arquitectura Técnica y Modelo de Datos](docs/05-arquitectura-y-modelo-datos.md):** Stack, decisiones arquitectónicas clave, modelo relacional, esquema Prisma (`prisma/schema.prisma`) y regla contable de transferencias de fondos.
6. **[Fórmulas Matemáticas y Reglas de Negocio](docs/06-formulas-y-reglas-negocio.md):** Fórmulas exactas de *Disponible*, *Ready to Assign*, prueba de consistencia contable, metas de amortización y función pura `simulateLoan`.
7. **[Rutas, Estructura de Carpetas y Fases](docs/07-rutas-estructura-y-fases.md):** Mapa de rutas públicas y privadas, árbol de directorios del proyecto y cronograma completado.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias (también genera el cliente de Prisma)
npm install

# 2. Configurar variables de entorno:
#    Copia .env.example a .env y completa DATABASE_URL y SESSION_SECRET
#    (En PostgreSQL en la nube como Aiven o Neon añade ?sslmode=require al final)

# 3. Sincronizar el esquema con la base de datos y sembrar datos de prueba
npx prisma db push
npm run db:seed          # Usuario demo: demo@sobres.test / demo12345

# 4. Iniciar el servidor de desarrollo
npm run dev              # http://localhost:3000

# 5. Ejecutar la suite completa de pruebas unitarias (51 tests)
npm test

# 6. Compilar para producción
npm run build
```

---

## 🏆 Estado de la Implementación (Sprints 0 al 7 Completados)

| Sprint / Módulo | Funcionalidades Principales | Estado |
| :--- | :--- | :---: |
| **Sprint 0: Base e Infraestructura** | Next.js 16, Tailwind 4, Prisma 6, PostgreSQL, `globals.css` vanguardista, layout base y Vitest. | ✅ Hecho |
| **Sprint 1: Acceso y Cuentas (M1 & M2)** | Registro, login seguro con sesión firmada (jose), creación de cuentas con saldo inicial y cierre de cuentas. | ✅ Hecho |
| **Sprint 2: Transacciones (M3)** | Registro de ingresos y gastos, transferencias atómicas entre cuentas, filtros reactivos y aprobación masiva. | ✅ Hecho |
| **Sprint 3: El Presupuesto (M4)** | Motor base cero, banner Ready to Assign tricolor, edición en línea de asignación y diálogo Mover Dinero. | ✅ Hecho |
| **Sprint 4: Home y Metas (M5 & M6)** | Dashboard operativo (4 tarjetas), metas (mensual, por fecha, saldo) y botón de auto-asignación "Asignar lo que falta". | ✅ Hecho |
| **Sprint 5: Reportes y CSV (M7 & M8)** | Gráficos Recharts (dona de gastos, tendencia mensual y patrimonio neto), importador bancario CSV con deduplicación. | ✅ Hecho |
| **Sprint 6: Préstamos y Marketing (M9 & M10)** | Simulador de préstamos con curvas superpuestas de ahorro, landing page vanguardista, páginas de método, funcionalidades y precios. | ✅ Hecho |
| **Sprint 7: Presupuesto Compartido (M11)** | Modelo `BudgetMember` (hasta 6 colaboradores), autorización combinada dueño/miembro y panel de gestión de colaboradores. | ✅ Hecho |

---

## 🧪 Verificación y Calidad

- **51 pruebas unitarias** pasando en Vitest (`budget.test.ts`, `goals.test.ts`, `loan.test.ts`, `csv-import.test.ts`, `money.test.ts`).
- **Prueba de consistencia contable**: Invariante garantizado: $\text{RTA}(m) + \sum \text{Disponible}(m) = \sum \text{Saldos en Presupuesto}$.
- **Cero errores de compilación**: `npm run build` genera 16 rutas estáticas y dinámicas sin advertencias ni fallos de tipo.
