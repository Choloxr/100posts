# Guía de Estilo — 100posts

## Visión General

100posts es un SaaS premium orientado a generación de contenido para Instagram. La identidad visual transmite:

* Tecnología premium
* Automatización inteligente
* Minimalismo editorial
* Sensación de herramienta avanzada y exclusiva
* Ambiente oscuro cinematográfico
* Interfaz limpia con foco absoluto en el contenido

La experiencia debe sentirse cercana a:

* Linear
* Raycast
* Vercel
* Notion AI
* Midjourney
* Framer

Pero con una personalidad propia basada en:

* Dark mode dominante
* Glow violeta sofisticado
* Contraste fuerte
* Mucho aire visual
* Tarjetas modernas tipo dashboard

---

# Principios de Diseño

## 1. El contenido es protagonista

La UI nunca debe competir con el contenido generado.

Todo elemento visual debe existir para:

* guiar
* jerarquizar
* enfocar
* acelerar decisiones

Nunca decorar.

---

## 2. Oscuridad premium

El dark mode no es solamente un color.

Debe sentirse:

* profundo
* elegante
* tecnológico
* silencioso
* caro

Evitar negros absolutos planos.

Usar capas de grises azulados.

---

## 3. Una sola identidad cromática fuerte

El violeta es el ADN visual.

No introducir:

* verdes saturados
* amarillos fuertes
* rojos intensos innecesarios
* gradientes arcoíris

El producto debe verse consistente.

---

## 4. Menos ruido, más intención

Evitar:

* bordes innecesarios
* sombras exageradas
* demasiados iconos
* widgets inútiles
* densidad visual alta

El dashboard debe respirar.

---

# Paleta de Colores

## Core Palette

| Uso                   | Color         | HEX     |
| --------------------- | ------------- | ------- |
| Background Principal  | Rich Black    | #070B14 |
| Background Secundario | Deep Navy     | #0D1320 |
| Sidebar               | Midnight      | #0A0F1A |
| Surface / Cards       | Slate Dark    | #121826 |
| Border Soft           | Graphite      | #1E2638 |
| Hover Surface         | Soft Navy     | #182235 |
| Primary Accent        | Violet        | #7C5CFC |
| Primary Hover         | Bright Violet | #9277FF |
| Glow Accent           | Purple Glow   | #8B5CF6 |
| Texto Principal       | White Smoke   | #F5F7FA |
| Texto Secundario      | Muted Gray    | #98A2B3 |
| Texto Inactivo        | Low Contrast  | #667085 |
| Success               | Emerald       | #12B76A |
| Warning               | Amber         | #F79009 |
| Error                 | Soft Red      | #F04438 |

---

# Gradientes

## Gradiente Principal

```css
background: linear-gradient(135deg, #7C5CFC 0%, #8B5CF6 100%);
```

## Glow Ambiental

```css
background: radial-gradient(circle, rgba(124,92,252,0.25) 0%, rgba(0,0,0,0) 70%);
```

## Hover Premium

```css
background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
```

---

# Tipografía

## Fuente Principal

Recomendada:

* Inter

Alternativas:

* Geist
* SF Pro Display

---

## Jerarquía Tipográfica

### Display

```css
font-size: 48px;
font-weight: 700;
line-height: 1.05;
letter-spacing: -0.04em;
```

### H1

```css
font-size: 36px;
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.03em;
```

### H2

```css
font-size: 28px;
font-weight: 600;
line-height: 1.2;
```

### H3

```css
font-size: 20px;
font-weight: 600;
line-height: 1.3;
```

### Body

```css
font-size: 15px;
font-weight: 400;
line-height: 1.7;
```

### Small

```css
font-size: 13px;
font-weight: 400;
line-height: 1.5;
```

---

# Layout System

## Grid Base

Usar:

```css
max-width: 1440px;
padding-inline: 32px;
```

---

## Sidebar

```css
width: 260px;
```

Características:

* fija
* oscura
* minimalista
* separada por border suave
* navegación vertical limpia

Nunca usar:

* backgrounds claros
* demasiadas categorías
* iconos coloridos

---

## Espaciado

Sistema basado en múltiplos de 4.

| Token | Valor |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 12px  |
| lg    | 16px  |
| xl    | 24px  |
| 2xl   | 32px  |
| 3xl   | 48px  |
| 4xl   | 64px  |

---

# Componentes

# Botones

## Primary Button

Características:

* fondo violeta
* brillo sutil
* texto blanco
* bordes suaves
* hover luminoso

```css
height: 44px;
padding-inline: 18px;
border-radius: 12px;
font-weight: 600;
```

Hover:

```css
transform: translateY(-1px);
box-shadow: 0 0 30px rgba(124,92,252,0.35);
```

---

## Secondary Button

```css
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.06);
```

---

# Cards

Las cards son el corazón visual del producto.

## Estilo

```css
background: #121826;
border: 1px solid #1E2638;
border-radius: 20px;
```

---

## Hover

```css
transform: translateY(-2px);
border-color: rgba(124,92,252,0.4);
box-shadow: 0 10px 40px rgba(124,92,252,0.12);
```

---

# Inputs

## Estilo Base

```css
height: 48px;
border-radius: 14px;
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.06);
```

Focus:

```css
border-color: #7C5CFC;
box-shadow: 0 0 0 4px rgba(124,92,252,0.15);
```

---

# Shadows

Evitar sombras negras pesadas.

Usar sombras suaves y atmosféricas.

## Card Shadow

```css
box-shadow: 0 10px 30px rgba(0,0,0,0.35);
```

## Glow Shadow

```css
box-shadow: 0 0 50px rgba(124,92,252,0.18);
```

---

# Bordes

Todos los bordes deben ser:

* suaves
* casi invisibles
* sutiles

Nunca usar:

```css
border: 1px solid #FFFFFF;
```

Eso destruye la estética premium.

---

# Iconografía

Biblioteca recomendada:

* Lucide

Estilo:

* outline
* fino
* minimal
* consistente

Tamaño estándar:

```css
18px
```

---

# Motion Design

La animación debe sentirse:

* rápida
* suave
* premium
* invisible

Nunca caricaturesca.

---

## Timing

```css
transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Hover Philosophy

Todo hover debe:

* elevar
* iluminar
* responder

Nunca distraer.

---

# Glassmorphism

Usarlo con extrema moderación.

Si abusás del glassmorphism:

* el producto se ve amateur
* pierde legibilidad
* parece template barato

Usar únicamente en:

* modales
* overlays
* dropdowns premium

---

# Dashboard UX

## Regla crítica

El usuario entra para producir contenido rápido.

No para explorar.

La interfaz debe:

* minimizar clicks
* reducir decisiones
* mantener foco
* acelerar workflow

---

# Arquitectura Visual

## Jerarquía correcta

1. Contenido generado
2. CTA principal
3. Navegación
4. Metadata
5. Decoración

Si la decoración compite con el contenido:

estás diseñando mal.

---

# Estilo de las Previews

Las previews de posts deben verse:

* realistas
* utilizables
* exportables
* premium

No usar placeholders genéricos baratos.

---

# Estados

## Empty States

Minimalistas.

No meter ilustraciones infantiles.

Usar:

* copy claro
* CTA fuerte
* layout limpio

---

## Loading States

Preferencia:

* skeleton loaders
* shimmer sutil
* blur progresivo

Nunca spinners gigantes.

---

# Responsive

## Mobile

El producto NO debe intentar meter desktop completo en mobile.

Priorizar:

* stacks verticales
* navegación simplificada
* contenido prioritario

---

# Stack UI Recomendado

## Framework

* Next.js
* TypeScript
* TailwindCSS
* Framer Motion
* shadcn/ui

---

# Tailwind Tokens

## Ejemplo

```js
colors: {
  background: '#070B14',
  surface: '#121826',
  border: '#1E2638',
  primary: '#7C5CFC',
  primaryHover: '#9277FF',
  text: '#F5F7FA',
  muted: '#98A2B3'
}
```

---

# Qué evitar

## 1. Saturación visual

No conviertas el dashboard en:

* Notion + Discord + crypto app + gaming UI

Eso destruye el posicionamiento premium.

---

## 2. Exceso de colores

Tu sistema vive o muere por consistencia.

---

## 3. Espaciado pobre

La mayoría de productos SaaS se ven baratos por:

* padding insuficiente
* layouts apretados
* demasiada densidad

El espacio vacío es parte del diseño.

---

## 4. Demasiados bordes

Los bordes visibles arruinan el look editorial.

---

## 5. Animaciones lentas

Si el dashboard se siente pesado:

el usuario lo percibe como lento aunque técnicamente no lo sea.

---

# Identidad Emocional

100posts debe sentirse como:

* una herramienta de creators profesionales
* un copiloto creativo
* un software premium
* un sistema inteligente

No como:

* una app genérica de marketing
* una plataforma barata de templates
* un constructor visual amateur

---

# Resumen Estratégico

La ventaja visual de 100posts no viene de agregar más cosas.

Viene de:

* foco
* contraste
* silencio visual
* jerarquía clara
* motion sofisticado
* consistencia brutal

La mayoría de SaaS fracasan visualmente porque intentan parecer “feature-rich”.

Los productos premium parecen simples.

Pero detrás hay una obsesión extrema por:

* spacing
* ritmo visual
* consistencia
* detalle
* restricción

Ese es el estándar que deberías perseguir.
