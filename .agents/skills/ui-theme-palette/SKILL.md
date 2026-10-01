---
name: ui-theme-palette
description: >-
  Guía y sistema de diseño visual con la paleta de colores vanguardista y exclusiva (Deep Blue, Money Green, Modern Pink, Soft Powder Pink, Off-White / Gold).
  Activa esta skill siempre que se creen, diseñen o modifiquen componentes de UI, pantallas, landing pages, banners, botones, tablas o estilos globales en el proyecto.
---

# Sistema de Diseño y Paleta UI Vanguardista

Este manual de diseño define las directrices cromáticas, tokens y patrones visuales de la aplicación, desmarcándola del diseño tradicional de YNAB mediante una estética moderna, sofisticada y de alto impacto visual.

---

## 🎨 Paleta de Colores de la Marca

| Color | Código HEX | Rol en la Composición | Descripción Visual e Intención |
| :--- | :--- | :--- | :--- |
| **Deep Blue** | `#1A2B4C` | **Base / Dominante** | Azul marino profundo. Aporta la estructura seria, sobria y vanguardista. Se utiliza en fondos de navegación, barra lateral, encabezados hero y textos oscuros. |
| **Money Green** | `#2E5A44` | **Acento Corporativo** | Verde bosque/oliva oscuro. Evoca éxito financiero, elegancia, estabilidad y riqueza. Representa dinero disponible, balances positivos y confirmaciones. |
| **Modern Pink** | `#FF8DA1` | **Contraste / Foco** | Rosa vibrante y fresco. Rompe la sobriedad con energía moderna. Es el punto focal para llamadas a la acción primarias (CTA), botones activos y focos de atención. |
| **Soft Powder Pink** | `#F9D5E5` | **Transición / Fondo** | Rosa pastel suave. Equilibra la fuerza de los tonos oscuros. Se emplea en fondos sutiles, badges secundarios, tarjetas de transición y efectos hover suaves. |
| **Off-White / Gold** | `#F7F5F0` | **Iluminación** | Blanco roto cálido con destellos dorados sutiles. Ilumina la composición y crea un contraste limpio y acogedor con los fondos oscuros. Es el fondo base de la aplicación. |

---

## 💻 Tokens y Variables en el Código

Los tokens están definidos centralmente en `src/app/globals.css` utilizando variables nativas de CSS y `@theme inline` de Tailwind CSS v4.

```css
@theme inline {
  /* Paleta cromática nominal */
  --color-deep-blue: #1a2b4c;
  --color-money-green: #2e5a44;
  --color-modern-pink: #ff8da1;
  --color-powder-pink: #f9d5e5;
  --color-off-white: #f7f5f0;

  /* Mapeo de roles semánticos del sistema */
  --color-base: var(--color-deep-blue);
  --color-navy: var(--color-deep-blue);
  --color-corporate: var(--color-money-green);
  --color-positive: var(--color-money-green);
  --color-primary: var(--color-modern-pink);
  --color-accent: var(--color-modern-pink);
  --color-focus: var(--color-modern-pink);
  --color-surface: var(--color-off-white);
  --color-transition: var(--color-powder-pink);

  /* Neutros y estados complementarios */
  --color-line: #e3ded5;
  --color-muted: #5e6878;
  --color-alert: #e5484d;
  --color-warning: #e59830;
}
```

---

## 📐 Reglas de Composición y Uso en Componentes

### 1. Botones y Llamadas a la Acción (CTA)
- **Botón Primario / Foco:** Fondo `bg-modern-pink` con texto en `text-deep-blue` (`font-bold`). Esta combinación garantiza legibilidad absoluta y contraste WCAG AAA (~8.8:1).
- **Botón Corporativo:** Fondo `bg-money-green` con texto `text-off-white`.
- **Botón Esquema (Outline):** Borde `border-line`, fondo `bg-white` o `bg-off-white`, texto `text-deep-blue`, hover a `bg-powder-pink/30`.
- **Botón Destructivo:** Fondo `bg-alert` con texto `text-white`.

### 2. Barra Lateral y Navegación
- Fondo dominante en `bg-deep-blue`.
- Logotipo con texto `text-off-white` y punto de acento en `text-modern-pink` (`Sobres.`).
- Enlaces inactivos en `text-off-white/75`, enlaces activos en `bg-white/15 text-off-white`.
- Separadores en `border-white/15`.

### 3. Indicador de Presupuesto (*Ready to Assign Banner*)
- **Superávit / Fondos listos para asignar ($> 0$):**  
  Fondo `bg-money-green text-off-white`. Transmite solidez y abundancia corporativa.
- **Equilibrio ($= 0$):**  
  Fondo `bg-line text-deep-blue`. Muestra neutralidad y control sereno.
- **Sobregasto / Déficit ($< 0$):**  
  Fondo `bg-alert text-white`. Alerta visual inequívoca.

### 4. Pastillas de Monto (*MoneyPill*)
- **Disponible positivo:** Fondo `bg-money-green/15` con texto `text-money-green`.
- **Disponible cero:** Fondo `bg-line` con texto `text-muted`.
- **Sobregasto:** Fondo `bg-alert/15` con texto `text-alert`.

### 5. Sección Hero de la Landing Page
- Fondo con degradado vanguardista: `bg-gradient-to-br from-deep-blue via-[#15233e] to-[#0e1729]`.
- Título y subtítulos en `text-off-white` con luminosidad natural.
- Botón principal de registro en `bg-modern-pink text-deep-blue` con sombra difusa `shadow-lg shadow-modern-pink/25`.

---

## ♿ Pautas de Accesibilidad y Contraste
1. **Nunca colocar texto blanco puro sobre `Modern Pink` (`#FF8DA1`)** en tamaños menores a 18pt: el contraste es insuficiente. Utiliza siempre `text-deep-blue` (`#1A2B4C`) para lograr contraste óptimo de **8.8:1**.
2. **Textos sobre `Deep Blue`:** Utilizar `text-off-white` (`#F7F5F0`) o `text-white/85`.
3. **Foco de teclado (`:focus-visible`):** Anillo de 2px en `var(--color-modern-pink)` con offset de 2px.
