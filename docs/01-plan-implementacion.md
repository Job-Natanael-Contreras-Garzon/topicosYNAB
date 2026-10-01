# Plan de Implementación por Sprints y Guión de Demostración

> **Documento de referencia:** Plan de implementación y guía UI/UX del clon de YNAB  
> **Fecha:** 29 de septiembre de 2026 · @eude  
> **Estrategia:** Construcción por rebanadas verticales (pantalla, Server Action y base de datos) para contar con software demostrable al final de cada sprint.

---

## 📅 Plan de Implementación por Sprints

Este documento complementa la documentación por módulos (M1 a M11). Cada sprint termina con algo funcional que se puede usar y demostrar de punta a punta, evitando construir capas horizontales aisladas.

| Sprint | Objetivo | Qué se construye | Se puede demostrar | Verificación |
| :--- | :--- | :--- | :--- | :--- |
| **0** | Base del proyecto | Next.js, Tailwind, shadcn/ui, Prisma + PostgreSQL, semilla de categorías, layout con barra lateral vacía | La app arranca y muestra el esqueleto | `npm run dev` y `prisma migrate dev` sin errores |
| **1** | Entrar y tener dónde guardar dinero (M1, M2) | Registro, login, cierre de sesión, middleware, crear y cerrar cuentas con saldo inicial | Crear usuario y una cuenta con 1 000 | CU1; otro usuario no ve tus cuentas |
| **2** | Registrar movimientos (M3) | Tabla de transacciones, formulario, editar, borrar, transferencias, filtros | Cargar 10 gastos y una transferencia | CU3 y CU9; el saldo de cuenta siempre cuadra |
| **3** | El núcleo: presupuesto (M4) | `lib/budget.ts` con pruebas, pantalla mensual, edición de Asignado, mover dinero, navegación de meses | Asignar todo el dinero y ver Ready to Assign en 0 | CU2 y CU4; prueba de consistencia en Vitest |
| **4** | Prioridades y metas (M6, M5) | Home con cuatro tarjetas, formulario de meta, progreso, "Asignar lo que falta" | Crear la meta "Viaje" y ver la sugerencia mensual | CU5 |
| **5** | Entender el dinero (M7, M8) | Reportes con tres gráficos e importación de CSV con vista previa y duplicados | Importar un extracto y aprobarlo | CU6 y CU7 |
| **6** | Deuda y presentación (M9, M10) | Calculadora de préstamos, landing y páginas públicas, datos de demostración | Recorrido completo desde la landing | CU8; revisión de estados vacíos y errores |
| **7 (opcional)** | Compartir (M11) | BudgetMember, invitaciones entre usuarios locales | Dos usuarios editando el mismo presupuesto | CU10 |

---

## 💡 Reglas de Trabajo que Ahorran Problemas

1. **Una rama por sprint y un commit por tarea de la checklist:** al cerrar el sprint, etiqueta la versión (`v0.1`, `v0.2`…) para poder volver atrás si algo se rompe antes de la demo.
2. **Pruebas antes que pantalla en el sprint 3:** escribe primero los casos de `budget.test.ts` (mes sin movimientos, sobregasto, meses saltados, transferencia a cuenta de seguimiento).
3. **Datos de demostración desde el sprint 1:** un `prisma/seed.ts` que crea un usuario de prueba con tres meses de movimientos evita empezar cada sesión con la app vacía, y sirve directamente para la defensa.
4. **Congela el alcance al final del sprint 4:** lo que ya corre con el núcleo, las metas y el Home es el producto esencial; los sprints 5 a 7 se recortan en ese orden inverso si el tiempo aprieta (M11, luego M9, luego M8).

---

## ✅ Checklist de Tareas por Sprint

Marca cada tarea cuando cumpla su criterio; así este documento sirve como tablero vivo de avance.

### Sprint 0. Base
- [x] Crear el proyecto con `create-next-app` (TypeScript, Tailwind, App Router) y subirlo a Git
- [x] Crear la base PostgreSQL, definir `DATABASE_URL` en `.env` (fuera de Git), instalar Prisma y definir el esquema del documento de módulos
- [x] Inicializar shadcn/ui y agregar button, input, dialog, table, tabs, select, toast
- [x] Crear `lib/db.ts`, `lib/money.ts` (centavos a texto, con el separador decimal local) y `.env` con `DATABASE_URL`
- [x] Escribir `prisma/seed.ts` con usuario de prueba, cuentas, categorías y transacciones de tres meses
- [x] Layout de `/app` con barra lateral (Inicio, Presupuesto, Reportes, Préstamos, Ajustes)

### Sprint 1. Acceso y cuentas
- [x] `registerUser` con Zod y bcryptjs; `loginUser` con cookie de sesión
- [x] `middleware.ts` que protege `/app` y redirige a `/login`
- [x] Al registrarse, crear el presupuesto y las categorías semilla
- [x] Barra lateral de cuentas con saldo y agrupación Presupuesto / Seguimiento
- [x] Diálogo "Agregar cuenta" con saldo inicial (crea la transacción de ingreso)
- [x] Cerrar cuenta y ocultarla de la lista

### Sprint 2. Transacciones
- [x] Tabla de transacciones por cuenta y vista "todas las cuentas"
- [x] Formulario de gasto e ingreso con validación (categoría obligatoria en gastos)
- [x] Editar y borrar con confirmación
- [x] Transferencias con dos filas enlazadas por `transferPairId`
- [x] Buscador y filtros por fecha, categoría y "sin aprobar"
- [x] Aprobación de varias filas a la vez

### Sprint 3. Presupuesto
- [x] `lib/budget.ts`: `available`, `readyToAssign`, `moveMoney`, con Vitest
- [x] Prueba de consistencia: RTA + suma de disponibles = suma de saldos de presupuesto
- [x] Pantalla `/app/presupuesto/[mes]` con selector de mes y grupos plegables
- [x] Celda "Asignado" editable en línea con guardado al salir del campo
- [x] Banner de Ready to Assign con tres estados de color
- [x] Diálogo "Mover dinero" entre categorías
- [x] Crear, renombrar, ocultar y reordenar categorías y grupos

### Sprint 4. Home y metas
- [x] Home con tarjetas: nuevas transacciones, Ready to Assign, prioridades y resumen del mes
- [x] Formulario de meta con los tres tipos (mensual, para una fecha, saldo)
- [x] Barra de progreso e indicador "Falta asignar" en cada fila del presupuesto
- [x] Botón "Asignar lo que falta" (`autoAssignFromGoals`)

### Sprint 5. Reportes e importación
- [x] Consultas agregadas: gasto por categoría, tendencia mensual, patrimonio neto
- [x] Tres pestañas de gráficos con Recharts y selector de rango de fechas
- [x] Importador CSV: subida, mapeo de columnas, vista previa, formato de fecha y decimal
- [x] Detección de duplicados e ingreso con `approved = false`

### Sprint 6. Deuda y presentación
- [ ] `simulateLoan` con pruebas (préstamo sin extra, con extra, cuota menor a los intereses)
- [ ] Pantalla de préstamos con dos líneas de saldo y tarjetas de ahorro
- [ ] Landing, funcionalidades, método y precios con textos propios
- [ ] Revisión de estados vacíos, mensajes de error y vista en celular
- [ ] Guion de demostración ensayado con los datos de la semilla

### Sprint 7 (opcional). Compartir
- [ ] Tabla `BudgetMember` y migración
- [ ] Cambiar las consultas de "dueño" a "miembro"
- [ ] Pantalla de miembros con invitación por email y límite de seis

---

## 🏆 Definición de Terminado (Definition of Done)

El proyecto se considera terminado cuando se cumplen en su totalidad estas condiciones:

- [ ] Los casos de uso CU1 a CU9 pasan en el orden del documento de módulos con los datos de la semilla.
- [ ] Las pruebas de `budget.test.ts` y `loan.test.ts` pasan satisfactoriamente, incluida la prueba de consistencia.
- [ ] `npm run build` termina sin errores ni advertencias de tipos en TypeScript.
- [ ] Un usuario nuevo puede registrarse, crear su primera cuenta y asignar dinero sin instrucciones previas.
- [ ] No existen pantallas vacías sin mensaje ni botones que no ejecuten ninguna acción.
- [ ] La interfaz responde y se ve bien tanto en un ancho móvil de 375 px como en escritorio a 1280 px.
- [ ] El `README.md` del repositorio explica con claridad cómo instalar, migrar, sembrar y ejecutar en local.

---

## 🎬 Guión Sugerido para la Demostración (8 a 10 minutos)

1. **Landing (1 min):** Presenta el problema (*"¿Te preocupa el dinero?"*) y pulsa el botón de registro.
2. **Primer uso (2 min):** Crea la cuenta "Efectivo" con 1 000 y muestra cómo ese monto aparece automáticamente como **Ready to Assign**.
3. **Presupuesto (2 min):** Asigna a las categorías hasta llevar el indicador a cero ($0$) y explica el significado de los tres colores del disponible (verde, gris, rojo).
4. **Gasto y sobregasto (2 min):** Registra un gasto, sobrepásate intencionalmente en una categoría y cubre la diferencia moviendo dinero desde otra categoría.
5. **Metas y reportes (2 min):** Crea la meta "Viaje", utiliza el botón "Asignar lo que falta" y navega por la sección de Reportes con sus tres pestañas gráficas.
6. **Cierre (1 min):** Muestra la calculadora de préstamos con un pago extra simulado y menciona los ítems futuros para una versión 2.0: sincronización bancaria directa, aplicación móvil nativa y presupuesto compartido multiusuario.
