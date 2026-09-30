# Guía de Diseño UI/UX y Sistema de Componentes

> **Documento de referencia:** Plan de implementación y guía UI/UX del clon de YNAB  
> **Fecha:** 29 de septiembre de 2026 · @eude  
> **Filosofía UX:** Una app de finanzas fracasa menos por falta de funciones que por generar ansiedad o confusión. El sitio de YNAB insiste en *"dejar de dudar de tus gastos"* y en cambiar planes *"sin culpa"*; ese tono empático guía las decisiones de diseño.

---

## 🧠 Conceptos de UX que Sostienen el Producto

| Concepto | Qué significa | Cómo aplicarlo en el clon |
| :--- | :--- | :--- |
| **Modelo mental** | La imagen que el usuario ya tiene del problema | Presenta las categorías como sobres de dinero: lo asignado es lo que hay dentro, lo gastado lo saca. |
| **Carga cognitiva** | Cuánta información debe retener el usuario a la vez | En Presupuesto muestra solo tres columnas (Asignado, Actividad, Disponible); los detalles se revelan al hacer clic. |
| **Divulgación progresiva** | Mostrar lo avanzado solo cuando se pide | Las metas y la herramienta de mover dinero viven en un panel lateral, no en la tabla principal. |
| **Jerarquía visual** | Lo importante se ve primero | *Ready to Assign* se ubica arriba, grande y con color; el resto en tamaño y peso normal. |
| **Retroalimentación inmediata** | Toda acción tiene una respuesta visible | Al asignar, *Ready to Assign* y *Disponible* cambian al instante (actualización optimista) junto a un aviso breve. |
| **Prevención de errores** | Evitar el error mejor que explicarlo | Impedir guardar un gasto sin categoría; advertir antes de asignar más dinero del disponible. |
| **Reconocer antes que recordar** | Ofrecer opciones en vez de pedir escribir | Selectores con buscador para categoría y cuenta; beneficiario con autocompletado de los usados previamente. |
| **Consistencia** | Lo parecido se comporta igual | Mismo formato de moneda y decimales, mismo diálogo para crear entidades, mismos colores para indicar estado. |
| **Ley de Hick** | Más opciones, más tiempo para decidir | Máximo cinco elementos en la barra lateral de navegación principal. |
| **Ley de Fitts** | Objetivos grandes y cercanos se alcanzan más rápido | Botones de acción clave con al menos 40 px de altura y contiguos al contenido que modifican. |
| **Semántica del color** | El color transmite estado de forma inequívoca | **Verde:** dinero disponible; **Gris:** exactamente cero; **Rojo:** déficit o falta; nunca uses rojo para algo que no sea un problema. |
| **Tono sin culpa** | El lenguaje no juzga al usuario | Escribe *"Categoría sobregastada, mueve dinero para cubrirla"* en vez de *"¡Gastaste de más!"*. |

---

## 🎨 Guía de UI: Tokens de Diseño

Define estos valores una sola vez como variables de Tailwind CSS (`tailwind.config.ts` o `@theme`) para que un cambio de aspecto se aplique globalmente desde un solo archivo.

| Elemento | Valor sugerido | Uso e intención |
| :--- | :--- | :--- |
| **Primario (azul-violeta)** | `#4F5BFF` | Fondo del hero, enlaces interactivos, elementos activos |
| **Marino** | `#1B1E5A` | Barra superior de navegación, textos de encabezados principales |
| **Acento (verde lima)** | `#A5E85A` | Botón principal de llamada a la acción (CTA) y etiquetas de monto positivo |
| **Positivo** | `#1F9D55` | Disponible mayor que cero, meta cumplida satisfactoriamente |
| **Alerta** | `#E5484D` | Disponible negativo, mensajes de error crítico |
| **Advertencia** | `#F5A623` | Meta a medio financiar o que requiere atención |
| **Neutros** | `#F6F7FB`, `#E3E6F0`, `#6B7185`, `#1B1E5A` | Fondo general, bordes divisorios, texto secundario, texto de lectura principal |
| **Tipografía** | Sans redondeada (*Nunito* o *Poppins*) para títulos; *Inter* para tablas y datos | Se cargan de forma optimizada mediante `next/font` |
| **Escala de texto** | 14 px tablas, 16 px cuerpo, 20 y 32 px títulos, 56 px titular del hero | Jerarquía tipográfica uniforme |
| **Espaciado** | Múltiplos de 4 px (8, 12, 16, 24, 32 px) | Márgenes, paddings y separadores consistentes |
| **Radio de esquinas** | 8 px en inputs y botones, 16 px en tarjetas, 999 px en chips de monto | Proporciona un aspecto suave y amigable |

---

## 🧩 Componentes Propios Reutilizables

Construye estos componentes una sola vez dentro de `src/components/`:

1. **`MoneyPill`**: Monto formateado dentro de una pastilla redondeada con color condicional según su estado financiero:
   - Verde: disponible positivo.
   - Gris: exactamente cero.
   - Rojo: sobregasto o déficit.
   *Uso:* Columna "Disponible", prioridades del Home y tarjetas de reportes.
2. **`ReadyToAssignBanner`**: Barra fija situada sobre la tabla del presupuesto mensual con el monto total y un mensaje conciso de estado:
   - *"Todo asignado"* (gris/neutro si es 0).
   - *"Te faltan 120 por asignar"* (verde si es positivo).
   - *"Asignaste 50 de más"* (rojo si es negativo).
3. **`InlineNumberInput`**: Campo editable que se comporta como texto estático hasta que se hace clic o foco sobre él. Acepta números, guarda automáticamente al presionar `Enter` o perder el foco (`blur`), y descarta cambios con `Esc`.
4. **`GoalProgress`**: Barra delgada de progreso visual con el porcentaje de cobertura y la etiqueta descriptiva *"Falta asignar"*.
5. **`EmptyState`**: Ilustración vectorial sencilla, frase explicativa de causa y botón de acción principal para guiar el siguiente paso. Unificada para toda la app.
6. **`ConfirmDialog`**: Diálogo modal para acciones destructivas (borrados). El botón de confirmación destructivo va a la derecha en rojo; el botón de cancelar tiene el foco por defecto.

> [!TIP]
> **Diseño del Hero en la Landing:**  
> Utiliza un degradado que vaya del primario (`#4F5BFF`) a un tono azul más oscuro, aplica sombra difusa suave en la maqueta del teléfono móvil y diseña billetes/monedas en SVG propios con rotación leve. Evita copiar directamente las ilustraciones protegidas de YNAB.

---

## 🖥️ Consejos de UX Pantalla por Pantalla

| Pantalla | Qué hacer | Error común a evitar |
| :--- | :--- | :--- |
| **Landing** | Un solo mensaje claro y un botón principal visible sin scroll; la barra de navegación queda fija al desplazarse. | Colocar varios botones con el mismo peso visual que compitan entre sí. |
| **Registro** | Solicitar únicamente nombre, email y contraseña; incluir toggle "ver contraseña"; validar al salir de cada campo. | Formularios extensos que exigen datos irrelevantes antes de entregar valor. |
| **Primer uso** | Asistente guiado de 3 pasos: crear una cuenta con saldo, ver el dinero en *Ready to Assign*, asignar a categorías iniciales. | Dejar al usuario frente a una aplicación vacía sin indicación clara de por dónde comenzar. |
| **Home** | Priorizar elementos que requieren acción inmediata (transacciones por aprobar, dinero sin asignar) con botón directo en cada tarjeta. | Saturar con gráficos decorativos que no demandan ninguna acción concreta. |
| **Presupuesto** | Alinear montos a la derecha con cifras tabulares (`font-mono` / tabular nums); permitir navegar entre celdas con `Tab`; conservar el mes seleccionado al regresar. | Recargar toda la página o perder el scroll al editar el valor de una celda. |
| **Transacciones** | Flujo pensado primero para teclado: abrir modal con atajo, `Enter` para confirmar, foco inicial en monto; autocompletar última categoría por beneficiario. | Forzar el uso obligatorio del ratón para saltar entre campos. |
| **Metas** | Redactar el objetivo en lenguaje natural (*"Necesitas 250 este mes para llegar al 15 de marzo"*) previo al desglose técnico. | Mostrar porcentajes abstractos sin explicar qué acción financiera concreta realizar. |
| **Reportes** | Un gráfico enfocado por pestaña con titular que exprese la conclusión (*"Comida representa el 32 % de tu gasto"*); etiquetas legibles. | Gráficos de dona ilegibles con más de 7 rebanadas segmentadas. |
| **Importar CSV** | Vista previa de las primeras filas, detección automática de columnas y resumen previo a la importación (*"42 nuevas, 3 duplicadas omitidas"*). | Importar transacciones a ciegas sin ofrecer opción de previsualizar ni deshacer. |
| **Préstamos** | Recalcular resultados reactivamente mientras se escribe (sin botón manual "calcular") y destacar visualmente el ahorro en tiempo e intereses. | Mostrar una tabla de amortización de 240 filas como resultado principal en vez del impacto del ahorro. |

---

## 🔄 Patrones Globales de la Aplicación

- **Actualización optimista:** Refleja la mutación en pantalla de forma instantánea y revierte suavemente con un toast de error si el servidor rechaza la petición.
- **Deshacer en vez de confirmar:** Para acciones reversibles (aprobar movimientos, mover dinero entre categorías), muestra un toast con opción *"Deshacer"* durante 5 segundos; reserva los modales de confirmación para eliminaciones irreversibles.
- **Formato de montos consistente:** Emplea en toda la app la misma configuración regional (`Intl.NumberFormat`), separadores de miles/decimales y un signo negativo claro (`-$40.00`).
- **Navegación estable:** La barra lateral conserva su posición fija entre transiciones y resalta claramente la ruta activa.
- **Mobile-first en lo esencial:** En pantallas estrechas (<768 px), la tabla de presupuesto se transforma fluidamente en tarjetas colapsables por categoría con el indicador *Disponible* prominente.

---

## ♿ Accesibilidad, Estados y Pruebas de Usabilidad

### Criterios de Accesibilidad Mínima
1. **Contraste de color:** Mantener una relación de contraste mínima de **4,5:1** para texto regular (ojo: el verde lima `#A5E85A` sobre blanco no cumple; sobre fondo marino `#1B1E5A` sí funciona adecuadamente).
2. **No depender exclusivamente del color:** Todo estado crítico en rojo debe ir acompañado de texto explícito o un icono descriptivo (*"Falta $30.00"*).
3. **Soporte de teclado y lectores de pantalla:** Cada control debe poseer un `label` visible o `aria-label`; el anillo de foco (`focus-visible`) debe ser nítido al usar `Tab`. Los modales deben atrapar el foco y cerrarse con `Esc` (shadcn/ui lo cubre de fábrica).
4. **Áreas táctiles:** Objetivos de toque de al menos **40 × 40 px** y tipografía que respete el zoom del navegador sin truncarse.

### Matriz de Estados de Pantalla

| Estado | Qué mostrar | Ejemplo concreto |
| :--- | :--- | :--- |
| **Vacío** | Frase explicativa, motivo y botón de acción | *"Aún no tienes transacciones. Agrega la primera o importa un extracto CSV"* |
| **Cargando** | Esqueletos (Skeletons) con la silueta real del contenido, nunca spinners aislados | Filas grises pulsantes en la tabla de transacciones |
| **Error de formulario** | Mensaje específico contiguo al campo infractor | *"El monto debe ser mayor que 0"* |
| **Error del servidor** | Banner o toast indicando lo ocurrido con botón de reintento sin perder datos | *"No se pudo guardar la asignación. Reintentar"* |
| **Éxito** | Notificación breve (toast) que se oculta automáticamente | *"Transacción registrada correctamente"* |

---

## 🧪 Protocolo de Prueba de Usabilidad Rápida

Para la validación del informe técnico y defensa del proyecto, realiza una prueba de guerrilla (una tarde):

1. Convoca a **5 personas** que no conozcan la aplicación.
2. Pídeles completar **3 tareas esenciales** sin proporcionarles ayuda:
   - *Tarea 1:* Crear una cuenta con saldo inicial de 1 000.
   - *Tarea 2:* Asignar dinero a dos categorías diferentes hasta balancear el indicador.
   - *Tarea 3:* Registrar un gasto de $40 en la categoría de Comida.
3. Observa y registra: tiempo transcurrido por tarea, puntos de duda o confusión y comentarios en voz alta (*think aloud*).
4. Aplica correcciones sobre los patrones problemáticos detectados y realiza una prueba de confirmación con 2 usuarios adicionales. Conserva capturas y métricas como evidencia empírica para la defensa del proyecto.
