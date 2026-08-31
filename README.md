# CUN Creativo

Plataforma interna de la **Corporación Unificada Nacional de Educación Superior (CUN)**
para que el equipo de mercadeo arme las piezas de la campaña **"Encendidos / ¿Piensas
divergente?"** en los tres formatos oficiales, sin depender de diseño para cada pieza.

El usuario elige un **tipo de pieza**, llena **solo los campos que ese tipo necesita**,
define el **sistema visual** (fondo, acento, neón), acomoda foto y elementos en un
**editor**, y exporta los tres formatos aprobados en un `.zip`.

---

## 1. Acceso

Al abrir la app aparece una **pantalla de contraseña**.

- Contraseña: **`campañaenciendete`** (no distingue mayúsculas ni tildes: `campanaenciendete` también entra).
- El acceso se recuerda en ese navegador. En la esquina superior hay un botón **"Salir"**.

> Es una verificación del lado del cliente: frena accesos casuales, no es seguridad
> real. Para control institucional se debe poner el despliegue detrás de Cloudflare
> Access (ver *Notas técnicas*).

---

## 2. Pantallas

| Ruta | Para qué |
|---|---|
| `/` | **Workspace**: armar la pieza (equipo de mercadeo). |
| `/admin` | **Panel de administración**: subir y aprobar assets (diseño). |

El workspace tiene 5 pasos en la columna izquierda y, a la derecha, el **Control de
calidad** y la **Vista previa** de los tres formatos.

---

## 3. Formatos

Cada campaña genera **tres piezas** a resolución nativa:

| Formato | Medidas | Uso |
|---|---|---|
| Cuadrado | 1080 × 1080 | Post de feed |
| Story | 1080 × 1920 | Historia |
| Banner | 1020 × 1080 | Banner |

Los tres comparten el mismo contenido, sistema visual y posiciones de foto/elementos.

---

## 4. Paso 1 — Tipo de pieza y contenido

### 4.1 Identificación
- **Nombre de campaña** y **Ciudad o región**. Solo se usan para el nombre de archivo
  y como bajada en la pieza.
- Ciudad o región es una **lista**: `Nacional`, 6 regiones (Andina, Caribe, Pacífica,
  Orinoquía, Amazonía, Insular) y ~30 ciudades. La opción **"Otra…"** abre un campo libre.

### 4.2 Elegir el tipo de pieza
Se elige **una** de cuatro tarjetas. A partir de ahí el formulario muestra **solo**
los campos de ese tipo:

| Tipo | Campos | Extra |
|---|---|---|
| **Urgencia / Precio** | Hook\*, Precio "antes", Precio "especial" / ahora\*, CTA\* | Muestra el WhatsApp de los datos fijos |
| **Programa específico** | Nombre del programa\*, Tagline del programa, CTA\*, Código SNIES | Pinta `SNIES 0000` en la pieza |
| **Motivacional / Genérica** | Hook\*, Subtexto de apoyo, CTA\* | — |
| **Informativa / Lista** | Título\* + **lista de ítems** | Cada ítem se marca como **✓** o **✗** (útil para piezas de seguridad / fraude) |

`*` = obligatorio. Cambiar de tipo no borra lo que ya escribiste en otro tipo.

**Editor de lista (Informativa):** botón *Agregar ítem*; en cada fila, el botón de la
izquierda alterna **✓ / ✗**, y la papelera lo elimina.

### 4.3 Datos fijos (precargados y editables)
Aplican a todas las piezas de la campaña:
- **Partner en la franja de logos** — por defecto `Telecampus`.
- **WhatsApp de contacto** — se pinta en las piezas de tipo *Urgencia*.
- **Incluir línea legal** — checkbox. Al activarlo se elige el texto:
  `Aplican términos y condiciones`, `Cupos limitados` o **texto libre**.

---

## 5. Paso 2 — Sistema visual (fondo, acento y neón)

- **Color de fondo** — selector de color libre + 6 presets oscuros
  (Azul marino, Morado, Magenta, Rojo oscuro, Naranja, Verde) + fila de **recientes**.
  Los colores usados se guardan solos.
- **Fondos de la campaña** — 7 imágenes a sangre del template "Encendidos" que
  vienen con la app (aurora verde, ondas azul marino, circuito azul, datos morado,
  malla magenta, matriz naranja, globo naranja). Reemplazan al color sólido.
- **Imagen de fondo propia (opcional)** — **Subir fondo** o elegir una de la
  biblioteca. Se guarda en ese navegador.
- **"Quitar imagen de fondo"** vuelve al color sólido; elegir un color también la quita.
- **Color de acento** — CTA, precio "ahora", barras y checks. Carga en el rosa neón
  **`#FF1F8F`**; el botón *Rosa neón* lo restablece. Se puede cambiar pieza por pieza.
- **Efecto neón** — toggle. Agrega glow alrededor del titular y del CTA.

**Fijos de marca (no editables):** titulares en sans condensada mayúscula (Anton),
cuerpo de texto en blanco, franja de logos abajo, ícono de WhatsApp en verde.

---

## 6. Paso 3 — Fotografía y franja de logos

- **Fotografía (opcional)** — se coloca a sangre **detrás del texto**, sobre el fondo.
  Su posición, zoom y opacidad se ajustan en el editor (paso 4).
- **Franja de logos · logo alterno (opcional)** — por defecto la franja usa el logo
  **CUN en blanco**. Aquí se elige una versión alterna o un lockup con el partner.

Todos los assets vienen de la biblioteca; diseño los sube y aprueba en `/admin`.

---

## 7. Paso 4 — Editor: mover la foto y agregar elementos

Un lienzo interactivo (con selector **Cuadrado / Story / Banner** para revisar el
encuadre de cada formato). Las posiciones se comparten entre los tres.

### 7.1 Fotografía
- **Arrastrar** la foto en el lienzo para reencuadrarla.
- **Zoom** — acercar la foto.
- **Opacidad de la foto** — bájala para que el color o la imagen de fondo se vean a
  través de la foto.
- **Velo para el texto** — fuerza del degradado oscuro que mantiene legible el titular.
- **Centrar** — vuelve la foto al encuadre por defecto.

### 7.2 Elementos gráficos
PNG con transparencia que se ponen **encima de todo** (menos la franja): el lockup
**¿P13NS@S D1V3R6ENT3? ENCIÉNDETE**, stickers, sellos, formas.

- **Subir PNG** o elegir uno de la biblioteca. Al agregarlo aparece centrado.
- **Arrastrar** para mover; la **manija de la esquina** o el slider **Tamaño** para
  escalar; **Rotación** y **Opacidad** con sliders.
- **Traer al frente**, **Eliminar**. La lista "En la pieza" muestra el orden de apilado.

---

## 8. Paso 5 — Aprobación y exportación

El **Control de calidad** (columna derecha) revisa en tiempo real:

- Tipo de pieza elegido.
- Campos obligatorios completos.
- Conteo de copy **≤ 24 palabras** (suma de todos los campos + ítems).
- **Validación léxica** — sin palabras bloqueadas (ver 9.1).
- **CTA con ruta aprobada** — 1 a 5 palabras y al menos una ruta permitida (ver 9.2).
- Fondo oscuro y saturado (o imagen de fondo).
- Franja de logos reservada.

**Aprobación secuencial:** solo se puede aprobar el siguiente formato cuando el
control de calidad está en verde y el anterior ya está aprobado. Con los **tres
formatos aprobados** se habilita **Descargar ZIP**.

**Nombres de archivo:**
`NOMBRE_CIUDAD_FORMATO_ANCHOxALTO.png` dentro de `NOMBRE_CAMPAÑA_CUN.zip`
(todo en mayúsculas, sin tildes ni espacios).

---

## 9. Reglas de copy

### 9.1 Palabras bloqueadas
La validación léxica es tolerante a leet y acentos (`3studiar`, `gratis` con puntos, etc.).
Raíces prohibidas: **Estudiar / Estudiantes, Universidad, Academia, Chispa, Gratis,
Becas, Matricúlate, Inscríbete / Inscripción, Diferente, Carrera, Regalar, Rifar,
Obsequiar, Brillar, Futuro, Descuento, Practicante, Educación**, y la frase **"Haz parte"**.

### 9.2 Rutas de CTA permitidas
El CTA debe tener **1–5 palabras** e incluir una de:
**DIVERGENTE · ENCIÉNDETE · ACTÍVATE · CONÉCTATE · EXPLORA · IMPÚLSATE · MUÉVETE · DESCUBRE**.

---

## 10. Panel de administración (`/admin`)

Cuatro bibliotecas de assets curados:

| Categoría | Qué va aquí |
|---|---|
| **Fotografías** | Fotografía publicitaria fotorrealista, persona real sobre fondo oscuro con luz de neón. |
| **Fondos** | Imágenes a sangre: degradados, texturas, tramas oscuras y saturadas. |
| **Elementos gráficos** | PNG con transparencia: lockup ¿Piensas divergente?, stickers, sellos, formas. |
| **Logos institucionales** | Versiones aprobadas (blanco / color) para la franja. |

- Subir con **drag-and-drop** o clic. Al subir, cada imagen se **reescala y comprime**
  automáticamente (fotos/fondos → JPEG máx. 1600 px; logos/elementos → PNG).
- Los assets entran como **pendientes**; mercadeo solo ve los **aprobados**.
- Cada asset lleva una **etiqueta**: `Uso general`, `Programa`, `Ciudad`, `Campaña`.
- La biblioteca se guarda localmente en el navegador (**IndexedDB**). Trae precargados
  la foto de campus, el logo CUN y el lockup divergente.

---

## 11. Notas técnicas

**Stack:** TanStack Start (React 19) · Tailwind v4 · shadcn/ui · Vite · nitro (Cloudflare).
El render de las piezas y la exportación a PNG son 100 % en el navegador
(`html-to-image` + `jszip`). No hay backend: la biblioteca vive en IndexedDB y el
estado de la campaña en `localStorage`.

**Persistencia por navegador:** los assets y la campaña en curso **no se comparten**
entre equipos ni dispositivos. Para trabajo colaborativo hay que conectar un backend.

**Sistema de marca** (`src/lib/brand.ts`):
titulares `Anton`, cuerpo `Montserrat`, acento por defecto `#FF1F8F`, WhatsApp `#25D366`,
presets de fondo en `DARK_BG_PRESETS`, franja y márgenes de seguridad fijos.

**Login institucional sin API de Google:** el despliegue va a Cloudflare (config en
`vite.config.ts` / nitro), así que la ruta recomendada es **Cloudflare Access**
(Zero Trust) con OTP por correo o el SAML/OIDC de la CUN, sin escribir backend.

### Desarrollo local

Requiere Node.js + npm (o Bun).

```sh
npm install
npm run dev        # http://localhost:8080
npm run build      # build de producción
npm run preview
npm run lint
```

Este proyecto está conectado a [Lovable](https://lovable.dev): los commits que se
empujan a `main` se sincronizan de vuelta al editor.
