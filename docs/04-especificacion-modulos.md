# Especificación Detallada de Módulos (M1 a M11)

> **Documento de referencia:** Clon de YNAB en Next.js: documentación por módulos  
> **Fecha:** 29 de septiembre de 2026 · @eude  
> **Secuencia recomendada de construcción:**  
> `M1` $\to$ `M2` $\to$ `M3` $\to$ `M4` $\to$ `M6` $\to$ `M5` $\to$ `M7` $\to$ `M8` $\to$ `M9` $\to$ `M10` $\to$ `M11`.

---

### M1. Autenticación y Perfil

- **Propósito:** Garantizar que cada usuario posea su propio entorno y presupuesto aislado.
- **Pantallas:** `/login`, `/registro` y menú desplegable de usuario en la barra con la opción *"Cerrar sesión"*.
- **Reglas de negocio:**
  - Correo electrónico único en la base de datos.
  - Contraseña de 8 caracteres o más cifrada con `bcryptjs`.
  - Al registrarse un nuevo usuario, se crea automáticamente un registro `Budget` inicial junto con el árbol de categorías semilla (ver M4).
  - `middleware.ts` intercepta todas las peticiones a rutas bajo `/app` y redirige a `/login` si no detecta una sesión válida en cookie HTTP-only.
- **Acciones del servidor (Server Actions):**
  - `registerUser(formData)`
  - `loginUser(formData)`
  - `logoutUser()`
- **Listo cuando:** Un usuario nuevo puede registrarse, acceder a su presupuesto vacío y verificarse que un usuario diferente no tiene visibilidad sobre sus datos.

---

### M2. Cuentas

- **Propósito:** Representar los lugares físicos y digitales donde reside el dinero (efectivo, bancos, tarjetas, ahorros).
- **Pantallas:** Barra lateral con cuentas clasificadas en dos grupos (*Presupuesto* y *Seguimiento*) mostrando sus saldos consolidados; diálogo modal interactivo *"Agregar cuenta"*.
- **Reglas de negocio:**
  - Al crear una cuenta presupuestaria (`onBudget: true`) con un saldo inicial $X$, se genera automáticamente una transacción de ingreso con beneficiario *"Saldo inicial"* y `categoryId = null`, la cual nutre directamente a *Ready to Assign*.
  - Las cuentas de seguimiento (`onBudget: false`) no alteran el indicador de presupuesto mensual.
  - El saldo visible de cada cuenta se deriva de la suma acumulada de todas sus transacciones.
  - Al cerrar una cuenta (`closed: true`), esta se oculta de la barra lateral activa pero conserva intacto todo su historial contable.
- **Acciones del servidor:**
  - `createAccount(data)`
  - `updateAccount(id, data)`
  - `closeAccount(id)`
- **Listo cuando:** Los casos de prueba **CU1** (creación y saldo inicial) y **CU9** (aislamiento de transferencias) se ejecuten satisfactoriamente.

---

### M3. Transacciones

- **Propósito:** Registrar, editar, conciliar y auditar cada movimiento de dinero.
- **Pantallas:** `/app/cuentas/[id]` (vista por cuenta específica) y `/app/cuentas/todas` (vista consolidada global). Incluye tabla interactiva con columnas (fecha, beneficiario, categoría, nota, salida, entrada, estado de conciliación), buscador por texto libre y filtros por rango de fechas, categoría y *"sin aprobar"*. Formulario modal para registro rápido.
- **Reglas de negocio:**
  - Todo gasto (`amountCents < 0`) exige obligatoriamente tener una categoría asignada.
  - Un ingreso (`amountCents > 0`) sin categoría seleccionada se acredita directamente a *Ready to Assign*.
  - Una transferencia entre cuentas genera de forma atómica dos transacciones vinculadas por el campo `transferPairId`. Al editar o borrar una de las transacciones, la contraparte vinculada se actualiza o elimina automáticamente en la misma transacción de base de datos.
  - Las transacciones importadas nacen con la bandera `approved = false` y se destacan visualmente con un chip de alerta hasta que son aprobadas.
- **Acciones del servidor:**
  - `createTransaction(data)`
  - `updateTransaction(id, data)`
  - `deleteTransaction(id)`
  - `approveTransactions(ids[])` (aprobación individual o masiva)
  - `createTransfer(data)`
- **Listo cuando:** Los casos **CU3**, **CU6** y **CU9** pasen y la suma de saldos de las cuentas cuadre de forma exacta con la realidad.

---

### M4. Presupuesto Mensual

- **Propósito:** El núcleo del producto; otorgar una función a cada unidad de dinero asignándolo a categorías mensuales.
- **Pantallas:** `/app/presupuesto/[YYYY-MM]` con selector de mes (mes anterior / mes siguiente), banner destacado de *Ready to Assign* en el encabezado, y tabla jerárquica con grupos colapsables y tres columnas principales: **Asignado**, **Actividad** y **Disponible**.
- **Interacción y comportamientos UI:**
  - La celda de la columna *Asignado* es editable en línea (`InlineNumberInput`), guardando la mutación al presionar `Enter` o perder el foco.
  - Al hacer clic sobre el monto en *Disponible*, se despliega un popover o diálogo para *"Mover dinero"* hacia otra categoría.
  - Semántica de colores en *Disponible*:
    - **Verde:** saldo positivo disponible.
    - **Gris:** exactamente $0.00.
    - **Rojo:** saldo negativo (sobregasto).
  - Semántica de colores en el banner *Ready to Assign*:
    - **Verde:** fondos disponibles pendientes de asignar ($> 0$).
    - **Gris:** equilibrio perfecto ($= 0$, meta del presupuesto base cero alcanzada).
    - **Rojo:** sobre-asignación ($< 0$, se asignó más dinero del existente).
- **Estructura de categorías semilla (Seed):**
  - *Gastos fijos:* Renta, Servicios, Internet, Transporte.
  - *Gastos variables:* Comida, Salidas, Ropa.
  - *Metas de ahorro:* Fondo de emergencia, Vacaciones.
  - *Deudas:* Tarjetas / Préstamos.
- **Gestión:** Capacidad para crear, editar, renombrar, ocultar y reordenar tanto grupos como categorías individuales.
- **Acciones del servidor:**
  - `setAssignment(categoryId, month, cents)`
  - `moveMoney(fromCategoryId, toCategoryId, month, cents)`
  - `createCategory(data)`
  - `updateCategory(id, data)`
  - `reorderCategories(orderedIds[])`
- **Listo cuando:** Se cumplan los casos **CU2**, **CU3** y **CU4**, y el arrastre acumulativo de fondos entre meses respete estrictamente las fórmulas matemáticas.

---

### M5. Metas (*Targets*)

- **Propósito:** Traducir metas financieras de mediano y largo plazo en una cuota mensual precisa y manejable.
- **Pantallas:** Panel lateral (drawer / sheet) que se abre al seleccionar una categoría en la vista de presupuesto, conteniendo el formulario de configuración de la meta y su barra de progreso porcentual. En la tabla del presupuesto, cada fila con meta activa exhibe un indicador textual con el monto pendiente (*"Falta asignar 120"*).
- **Tipos de meta admitidos:**
  1. **Mensual (*monthly*):** Asignar una cantidad fija $X$ cada mes.
  2. **Para una fecha límite (*by_date*):** Acumular una cantidad objetivo $X$ para una fecha determinada (divide el saldo pendiente entre los meses restantes).
  3. **Por saldo acumulado (*balance*):** Mantener de forma permanente al menos un monto disponible $X$.
- **Reglas de negocio:**
  - El faltante del mes se calcula mediante funciones determinísticas puras (ver documento de fórmulas).
  - Botón de conveniencia *"Asignar lo que falta"* que financia automáticamente todas las categorías con meta descubierta en el mes activo según la disponibilidad de *Ready to Assign*.
- **Acciones del servidor:**
  - `upsertGoal(categoryId, data)`
  - `deleteGoal(categoryId)`
  - `autoAssignFromGoals(budgetId, month)`
- **Listo cuando:** El caso **CU5** sea superado y la asignación automática cubra las metas pendientes dejando sus indicadores en verde.

---

### M6. Inicio (*Home*)

- **Propósito:** Centro de control diario del usuario que emula la pantalla del dispositivo móvil de la landing: identifica de un vistazo qué asuntos requieren atención hoy.
- **Pantalla:** `/app` con cuatro tarjetas modulares:
  1. **Nuevas transacciones:** Número de movimientos sin aprobar y botón de acceso directo *"Revisar"*.
  2. **Ready to Assign:** Saldo libre para presupuestar y botón *"Asignar fondos"*.
  3. **Prioridades principales:** Las metas con mayor déficit de financiamiento en el mes actual junto con su importe pendiente (ej. *Comida: 450*, *Salidas: 100*).
  4. **Resumen del mes:** Métricas consolidadas del mes activo (total asignado, total gastado, total subfinanciado).
- **Reglas de negocio:** Se compone enteramente de consultas de lectura sobre los módulos M3, M4 y M5; no crea ni almacena tablas propias.
- **Acciones del servidor:**
  - `getHomeSummary(budgetId, month)`

---

### M7. Reportes (*Reflect*)

- **Propósito:** Proporcionar análisis visual del comportamiento financiero del usuario a lo largo del tiempo.
- **Pantallas:** `/app/reportes` con tres pestañas especializadas:
  1. **Gasto por categoría:** Gráfico de dona o barras horizontales para un rango de fechas seleccionado, indicando monto total y porcentaje por rubro.
  2. **Tendencia de gasto:** Gráfico de barras temporales mes a mes, con capacidad de filtrado por categoría individual o grupo.
  3. **Patrimonio neto (*Net Worth*):** Gráfico de línea histórica que contrasta la evolución mensual de activos (cuentas positivas) menos pasivos (deudas/tarjetas).
- **Reglas de negocio:**
  - Los cálculos de gasto excluyen categóricamente las transferencias entre cuentas.
  - El patrimonio neto al cierre de un mes dado equivale a la sumatoria de saldos de todas las cuentas registradas hasta el último día de ese mes.
  - Las cuentas de tipo tarjeta de crédito o préstamos se computan con signo negativo como pasivos.
- **Acciones del servidor:**
  - `getSpendingByCategory(budgetId, fromDate, toDate)`
  - `getSpendingTrend(budgetId, fromDate, toDate, filterCategoryId?)`
  - `getNetWorth(budgetId, fromDate, toDate)`

---

### M8. Importar Transacciones (CSV)

- **Propósito:** Reemplazar la sincronización bancaria automática por un flujo manual de importación local confiable y sencillo.
- **Pantalla:** Diálogo modal en la vista de cuenta: selector de archivo CSV local, configuración de correspondencia de columnas (fecha, monto o columnas de débito/crédito, beneficiario), previsualización tabular de las 10 primeras filas y botón de confirmación *"Importar transacciones"*.
- **Reglas de negocio:**
  - Algoritmo de deduplicación: detecta transacciones coincidentes en `date`, `amountCents` y `payee` dentro de la cuenta y las descarta notificando al usuario.
  - Las transacciones aprobadas se insertan con `approved = false` y `categoryId = null`, derivándolas a la bandeja de pendientes de M6 y M3.
  - Selector de formato de fecha (`DD/MM/YYYY` vs `YYYY-MM-DD`) y separador decimal (punto `.` o coma `,`) en el modal para adaptarse a extractos bancarios de diferentes entidades.
- **Acciones del cliente / servidor:**
  - Preprocesamiento y parsing en el cliente con `Papa Parse`.
  - Server Action: `importTransactions(accountId, transactionsArray)`.

---

### M9. Calculadora de Préstamos (*Loan Planner*)

- **Propósito:** Simular planes de amortización y calcular con precisión el ahorro en tiempo (meses) y dinero (intereses devengados) al aplicar pagos adicionales mensuales.
- **Pantalla:** `/app/prestamos` con panel de parámetros de entrada (saldo inicial adeudado, tasa nominal anual o APR, cuota mensual regular, pago extra voluntario) y tarjetas de resultados (fecha proyectada de liquidación, total de intereses pagados, meses y dinero ahorrados frente a la cuota base). Gráfico comparativo de evolución de deuda con dos curvas temporales superpuestas (con aporte extra vs. sin aporte extra).
- **Reglas de negocio:**
  - Ejecución mediante la función pura matemática `simulateLoan(balance, apr, payment, extra)`.
  - Se calcula de forma reactiva en el cliente o mediante utilitario sin persistencia obligatoria en base de datos.
- **Acciones:**
  - Función pura TypeScript `simulateLoan` (ver documento de fórmulas).
- **Listo cuando:** Las pruebas de `loan.test.ts` verifiquen escenarios sin pago extra, con pago extra y controlen el caso borde donde la cuota es insuficiente para cubrir el interés mensual.

---

### M10. Sitio Público (*Marketing / Landing*)

- **Propósito:** Recrear con identidad visual propia la página de presentación del producto para dar contexto al proyecto y a su defensa académica.
- **Pantallas públicas:** `/` (landing page principal), `/funcionalidades`, `/metodo` y `/precios` (indicando modelo local libre).
- **Componentes y composición visual:**
  - Barra de navegación en Deep Blue (`#1A2B4C`) con logo `Sobres.` (punto en Modern Pink `#FF8DA1`), enlaces a secciones informativas, botón *"Iniciar sesión"* y CTA principal en Modern Pink (`#FF8DA1`) *"Empieza gratis"*.
  - Sección Hero con gradiente vanguardista de fondo en Deep Blue (`#1A2B4C`) hacia azul profundo (`#0D1627`), iluminación en Soft Powder Pink (`#F9D5E5`), tipografía en Off-White (`#F7F5F0`), titular principal llamativo (*"¿Te preocupa el dinero?"*), subtítulo persuasivo, botón de acción en Modern Pink con texto en Deep Blue y leyenda *"Sin tarjeta de crédito"*.
  - A la derecha del Hero, maqueta inclinada de dispositivo móvil proyectando la vista Home (M6) rodeada de elementos gráficos vectoriales SVG propios.
  - Bloque explicativo del método YNAB en cinco preguntas interactivas.
  - Cuadrícula de tarjetas con las funcionalidades clave y llamado final a la acción.
- **Reglas de negocio:**
  - Si el usuario ya cuenta con una sesión activa, el botón de la barra superior cambia automáticamente a *"Ir a mi presupuesto"*.
  - No usar logos registrados ni marcas comerciales directas de YNAB; los textos deben ser redacciones originales.

---

### M11. Presupuesto Compartido (*Opcional / Fase 7*)

- **Propósito:** Implementar la filosofía de *YNAB Together*: permitir que varios miembros colaboren y administren conjuntamente el mismo presupuesto.
- **Modificaciones al modelo relacional:**
  - Creación de la entidad `BudgetMember(budgetId, userId, role)`.
  - Migración de las consultas de acceso: en lugar de evaluar únicamente `budget.ownerId == currentUser.id`, se autoriza si existe un registro en `BudgetMember`.
- **Pantallas:** `/app/ajustes/miembros` con listado de colaboradores activos, diálogo de invitación por email (con tope máximo de 6 miembros por presupuesto) y opción para revocar accesos.
- **Reglas de negocio:**
  - El creador original del presupuesto ostenta el rol de propietario y es el único facultado para invitar o remover miembros, o eliminar el presupuesto.
  - Los miembros colaboradores tienen permiso para crear y editar cuentas, transacciones y asignaciones, pero no pueden borrar el presupuesto.
