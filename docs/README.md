# YNAB en Next.js — Documentación del Proyecto

> **Stack principal:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, PostgreSQL.

Bienvenido a la documentación técnica, de diseño y de planificación para el desarrollo del **Clon de YNAB (You Need A Budget)**. El objetivo es construir una aplicación web de presupuesto personal de base cero que corra en entorno local conectada a una base de datos PostgreSQL.

---

## 📚 Índice de Documentación

La documentación se encuentra dividida en módulos temáticos dentro de esta carpeta `docs/`:

| Archivo | Descripción |
| :--- | :--- |
| **[01. Plan de Implementación y Sprints](01-plan-implementacion.md)** | Plan de trabajo vertical por sprints (0 a 7), checklists de tareas, reglas de trabajo, Definición de Terminado (DoD) y guión de demostración. |
| **[02. Guía de Diseño UI/UX](02-guia-ui-ux.md)** | Sistema de diseño vanguardista y paleta propia (Deep Blue, Money Green, Modern Pink, Soft Powder Pink, Off-White), tokens de Tailwind, skill de diseño, componentes reutilizables, accesibilidad y estados de interfaz. |
| **[03. Alcance, Método YNAB y Casos de Uso](03-alcance-metodo-y-casos-de-uso.md)** | Filosofía base cero, las 5 preguntas del método, matriz de funcionalidades y los 10 casos de uso principales (CU1 a CU10) para pruebas de aceptación. |
| **[04. Especificación Detallada de Módulos (M1 a M11)](04-especificacion-modulos.md)** | Especificación funcional y técnica de cada módulo: M1 (Autenticación) a M11 (Presupuesto Compartido), pantallas, reglas y Server Actions. |
| **[05. Arquitectura y Modelo de Datos](05-arquitectura-y-modelo-datos.md)** | Stack tecnológico, decisiones arquitectónicas, modelo relacional de datos, esquema Prisma completo (`schema.prisma`) y reglas de transferencias. |
| **[06. Fórmulas y Reglas de Negocio](06-formulas-y-reglas-negocio.md)** | Lógica matemática del presupuesto base cero (Disponible, Ready to Assign, prueba de consistencia de saldos), metas y función pura `simulateLoan`. |
| **[07. Rutas, Estructura de Carpetas y Fases](07-rutas-estructura-y-fases.md)** | Mapeo de rutas públicas/privadas, árbol de directorios del proyecto, cronograma estimado en fases y mitigación de riesgos. |

---

## 🎯 Resumen Ejecutivo del Producto

El clon de YNAB implementa el principio de **"dar un trabajo a cada unidad de dinero"** (*zero-based budgeting*). No es un simple registro histórico de gastos: es una herramienta proactiva de asignación donde cada ingreso debe clasificarse antes de gastarse, asegurando que:

$$\text{Ready to Assign} = 0$$

### Arquitectura de un Vistazo
- **Frontend & Backend:** Next.js con React Server Components (RSC) y Server Actions.
- **Persistencia:** PostgreSQL gestionado a través de Prisma ORM.
- **Moneda y Aritmética:** Todos los montos se manejan en centavos enteros (`Int`) para prevenir imprecisiones de coma flotante.
- **Cálculo Derivado:** El presupuesto mensual se deriva de forma pura (`lib/budget.ts`), garantizando consistencia absoluta en el tiempo.
