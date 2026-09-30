# Alcance del MVP, Método YNAB y Casos de Uso

> **Documento de referencia:** Clon de YNAB en Next.js: documentación por módulos  
> **Fecha:** 29 de septiembre de 2026 · @eude  
> **Premisa Central:** El objetivo es construir una aplicación web de presupuesto personal "base cero" al estilo YNAB (*You Need A Budget*), construida en Next.js y ejecutada en entorno local conectada a una base de datos PostgreSQL. La idea central es **dar un trabajo a cada unidad de dinero que entra**, en vez de limitarse a un registro pasivo de gastos.

---

## 🎯 Alcance del Producto Mínimo Viable (MVP)

La aplicación diferencia claramente la presentación de marketing (`/`) de la aplicación de presupuesto real (`/app`). La prueba gratuita de 34 días y las pasarelas de pago no aplican en local: el registro da acceso directo e ilimitado. Las reseñas y testimonios del sitio original se sustituyen por contenido propio.

| Área | Qué se implementa | Qué se simplifica | Qué se omite |
| :--- | :--- | :--- | :--- |
| **Presupuesto** | Asignación por categoría, *Ready to Assign*, disponible con arrastre mensual acumulativo. | Sin plantillas automáticas complejas de categorías. | Reglas avanzadas de sobregiro y saldo de tarjetas de crédito complejas. |
| **Cuentas y transacciones** | Cuentas, transacciones, transferencias entre cuentas, flujo de aprobar/categorizar. | Importación exclusivamente vía archivo CSV manual. | Sincronización bancaria automática (Plaid/Open Banking), sincronización con Apple Card. |
| **Metas (Targets)** | Metas por categoría con tres modalidades: mensual, por fecha límite y por saldo acumulado. | Limitado estrictamente a 3 tipos de meta estándar. | Algoritmos automáticos avanzados de auto-asignación probabilística. |
| **Reportes** | Desglose de gasto por categoría, tendencia temporal del gasto y gráfico de patrimonio neto. | Gráficos implementados con la librería Recharts. | Reportes altamente personalizables con filtros guardados en base de datos. |
| **Deuda** | Calculadora de amortización de préstamos con simulación de pagos extra. | Simulación de un préstamo a la vez. | Integración directa con cuentas de pasivo reales en el presupuesto. |
| **Cuenta de usuario** | Registro y autenticación mediante credenciales locales. | Sin autenticación en dos pasos (2FA) ni recuperación de clave por correo SMTP. | Planes de suscripción comercial, cobros recurrentes, códigos de referido o regalos. |
| **Multiusuario** | Un usuario exclusivo por cada presupuesto local. | Opcional: membresía de presupuesto compartido (*BudgetMember*) en fase final. | Aplicaciones móviles nativas (iOS/Android), widgets de escritorio y sincronización offline PWA. |
| **Sitio de marketing** | Landing page moderna y páginas informativas estáticas (*Funcionalidades*, *Método*, *Precios*). | Contenido redactado propio, sin sección de blog dinámico. | Hangouts en vivo, programas de coaching financiero, comunidad de usuarios y tienda de merchandising. |

---

## 🧭 El Método YNAB: La Lógica de Negocio a Respetar

Si la aplicación no implementa fielmente esta lógica, se degrada a un simple anotador de gastos. El método YNAB se fundamenta en responder proactivamente a cinco preguntas esenciales:

| Idea del método | Pregunta guía | Qué debe resolver la aplicación |
| :--- | :--- | :--- |
| **Realidad** | *¿Qué necesita hacer este dinero antes de mi próximo pago?* | Todo ingreso se deposita en *Ready to Assign*; el usuario debe asignarlo a categorías hasta que el indicador llegue a exactamente $0$. |
| **Estabilidad** | *¿Qué gastos grandes y poco frecuentes debo preparar?* | Metas con fecha límite (*by date*): divide un gasto anual o estacional (seguro, matrícula, vacaciones) en cuotas mensuales manejables. |
| **Resiliencia** | *¿Qué puedo reservar para el gasto del próximo mes?* | El saldo positivo disponible de una categoría se arrastra automáticamente al mes siguiente. |
| **Creación** | *¿Qué metas quiero priorizar?* | Metas de ahorro proyectadas con barras de progreso visuales y cálculo del faltante. |
| **Flexibilidad** | *¿Qué cambios necesito hacer?* | Posibilidad de mover dinero entre categorías libremente en cualquier instante sin alterar ni bloquear meses cerrados. |

### Conceptos Técnicos Fundamentales en la Interfaz

- **Ready to Assign (Listo para asignar):** Total de dinero disponible en cuentas presupuestarias que aún no ha recibido una categoría asignada.
- **Categoría y Grupo de Categorías:** Estructura jerárquica de sobres presupuestarios (por ejemplo, el grupo *"Gastos Fijos"* que contiene *"Renta"*, *"Luz"*, *"Internet"*).
- **Asignado, Actividad y Disponible:** Las tres columnas maestras de la vista mensual del presupuesto:
  - *Asignado:* Fondos presupuestados deliberadamente en el mes en curso.
  - *Actividad:* Suma de gastos (negativos) e ingresos clasificados a esa categoría durante el mes.
  - *Disponible:* Saldo neto restante para gastar en esa categoría.
- **Cuentas de Presupuesto vs. Cuentas de Seguimiento (*Tracking*):** Las cuentas de presupuesto inyectan liquidez a *Ready to Assign*; las de seguimiento (inversiones, inmuebles, hipotecas) solo inciden en el cálculo de patrimonio neto.
- **Transacción Aprobada vs. Sin Aprobar:** Movimientos importados desde CSV se registran en estado pendiente (`approved = false`) hasta que el usuario valida su monto y categoría.

> [!NOTE]
> **Las cuatro reglas clásicas de YNAB:** (1) Dar trabajo a cada dólar, (2) Abrazar tus gastos reales, (3) Adaptarte a los imprevistos y (4) Envejecer tu dinero. En este MVP, las tres primeras quedan garantizadas por las fórmulas de asignación; el indicador *"Age of Money"* es opcional para fases posteriores.

---

## ⚡ Matriz de Funcionalidades y Prioridades

| Funcionalidad en YNAB | Qué hace en el producto | Prioridad en el Clon | Módulo Responsable |
| :--- | :--- | :--- | :--- |
| **Presupuesto base cero** | Asignar cada peso/dólar a una categoría específica | **Imprescindible** | **M4** |
| **Cuentas y transacciones** | Registro y control de ingresos, gastos y transferencias | **Imprescindible** | **M2, M3** |
| **Conexión bancaria** | Reemplazada por importación manual mediante archivo CSV | **Alta** | **M8** |
| **Metas (*Targets*)** | Objetivos financieros de gasto y ahorro con cálculo de progreso | **Alta** | **M5** |
| **Vistas Home y Reflect** | Pantalla principal de resumen: prioridades, pendientes y gasto mensual | **Alta** | **M6, M7** |
| **Reportes de gasto y patrimonio** | Gráficos interactivos de desglose por categoría, tendencias y balance neto | **Alta** | **M7** |
| **Calculadora de préstamos** | Simulador financiero que calcula ahorro en tiempo e intereses con aportes extra | **Media** | **M9** |
| **Plantillas de categorías** | Generación automática de categorías iniciales comunes | **Media** (mediante *seed*) | **M4** |
| **Vistas personalizables** | Filtros rápidos de visualización focalizada en el presupuesto | **Baja** (filtros básicos) | **M4** |
| **YNAB Together** | Compartir presupuesto entre un grupo familiar de hasta 6 personas | **Baja** (opcional en fase 7) | **M11** |
| **Sincronización multi-dispositivo** | Aplicación web adaptada con diseño responsivo móvil | **Cubierto con diseño responsive** | Transversal |
| **Seguridad de datos** | Hashing seguro de contraseñas y cookies de sesión HTTP-only | **Imprescindible** | **M1** |

---

## 📋 Casos de Uso Principales (Pruebas de Aceptación)

Estos 10 casos de uso representan los criterios formales de aceptación y la ruta de validación para la defensa del proyecto:

| # | Caso de uso | Flujo resumido | Resultado esperado |
| :--- | :--- | :--- | :--- |
| **CU1** | **Empezar mi presupuesto** | Registrar usuario y crear cuenta *"Efectivo"* con saldo inicial de 1 000. | El saldo ingresado aparece reflejado íntegramente en el banner de *Ready to Assign*. |
| **CU2** | **Dar trabajo al dinero** | En la vista de Presupuesto, asignar 450 a *Comida* y 100 a *Salidas*. | *Ready to Assign* se reduce exactamente en 550; cada categoría muestra su *Disponible* respectivo. |
| **CU3** | **Registrar un gasto** | Ingresar una nueva transacción de gasto por 40 asignada a *Comida*. | El *Disponible* de *Comida* disminuye en 40; el saldo de la cuenta disminuye en 40. |
| **CU4** | **Cubrir un sobregasto** | Gastar más de lo disponible en una categoría y transferir fondos desde otra. | La categoría en déficit deja de estar en rojo y el presupuesto vuelve a balance. |
| **CU5** | **Ahorrar para algo grande** | Crear una meta de ahorro *"Viaje"* por 3 000 para una fecha futura determinada. | La app calcula la cuota mensual sugerida y visualiza el porcentaje de cumplimiento. |
| **CU6** | **Revisar extractos importados** | Importar un archivo CSV bancario; aprobar y asignar categorías a los movimientos. | El contador de transacciones sin aprobar en el Home llega a cero ($0$). |
| **CU7** | **Entender en qué gasto mi dinero** | Abrir la sección de Reportes y seleccionar el rango mensual deseado. | Se despliega el gráfico interactivo por categoría con subtotales y porcentajes. |
| **CU8** | **Salir de una deuda** | En la calculadora, ingresar saldo, tasa anual, cuota fija y un pago extra mensual. | Se visualiza la reducción de meses y el monto total ahorrado en intereses. |
| **CU9** | **Mover dinero entre cuentas** | Registrar una transferencia entre la cuenta de Banco y la cuenta de Efectivo. | Ningún impacto en el presupuesto ni en categorías; ambos saldos de cuenta se actualizan. |
| **CU10** | **Compartir con mi pareja** *(Opcional)* | Invitar a un segundo usuario local al presupuesto mediante su correo. | Ambos usuarios acceden, visualizan y sincronizan las mismas cuentas y transacciones. |
