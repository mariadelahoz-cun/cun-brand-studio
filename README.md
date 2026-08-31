# CUN Brand Studio

Quiero construir una aplicación web llamada "CUN Creativo" (o el nombre que prefieras): una plataforma interna para que el equipo de mercadeo y coordinación académica de la CUN (Corporación Unificada Nacional de Educación Superior) genere piezas de marketing digital (posts para redes, banners, flyers, historias) siguiendo el manual de marca de la institución, sin depender de diseño gráfico para cada pieza.
1. Objetivo funcional
Un usuario debe poder:
Elegir una plantilla de pieza (post cuadrado 1080x1080, historia 1080x1920, banner horizontal 1200x628, flyer A4).
Subir o seleccionar de una biblioteca: logos institucionales, avatares/fotos de personas, e imágenes de fondo o apoyo.
Editar el texto de la pieza (título, subtítulo, cuerpo, call to action) en campos separados, con vista previa en tiempo real.
Ver cómo el sistema aplica automáticamente las reglas de marca (colores, tipografías, márgenes de seguridad del logo, proporciones) sin que el usuario pueda romperlas accidentalmente.
Descargar la pieza final en PNG/JPG de alta resolución, o copiar un enlace para compartir.
2. Sistema de diseño de marca (parametrizar como design tokens)
Define estas reglas como constantes reutilizables en el código, no hardcodeadas por pantalla:
Paleta de colores institucional: el color principal de la marca CUN es el verde, en dos tonos:
Verde base — Pantone 365 C ≈ #C2E189 (valor aproximado por conversión de Pantone a hex, no confirmado contra el PDF oficial del manual)
Verde claro, usado para resaltar el símbolo de la "U" — Pantone 376 C ≈ #84BD00 (mismo aviso de aproximación)
⚠️ Verifica estos dos códigos contra el manual de marca oficial antes de darlos por definitivos: la fuente consultada describe el 365 C como el tono "oscuro" y el 376 C como el "claro", pero la conversión a hex los muestra al revés, lo que sugiere una posible imprecisión en la transcripción de origen.
Falta definir: acentos y neutros (grises, blancos, negro institucional) — no encontrados en fuentes públicas. Déjalos como variables editables desde un panel de "Configuración de marca" hasta confirmarlos.
Tipografías: el manual menciona que el logotipo usa una tipografía de estilo manuscrito (para transmitir cercanía y contemporaneidad), pero no se encontró el nombre específico de la fuente ni la tipografía de cuerpo de texto en fuentes públicas. Déjalas como variables editables hasta confirmar el nombre exacto; mientras tanto, Lovable puede usar una fuente script de Google Fonts como placeholder para títulos y una sans-serif neutra (ej. Inter o Roboto) para el cuerpo.
Logo: reglas de área de protección (espacio mínimo alrededor del logo, ej. igual a la altura de la "C"), tamaño mínimo permitido, versiones aceptadas (color, blanco, negro) y en qué fondos usar cada una.
Retícula: márgenes de seguridad en cada plantilla (ej. 5% del ancho en los bordes) para que ningún texto ni logo quede pegado al borde.
Jerarquía tipográfica: tamaños relativos para título, subtítulo, cuerpo y CTA, y su alineación por defecto.
Si aún no tienes el manual de marca digitalizado en códigos exactos, dile a Lovable que deje estos valores como variables editables desde un panel de "Configuración de marca" en vez de hardcodearlos, para poder ajustarlos después sin tocar código.
3. Gestión de assets (logos, avatares, imágenes)
Biblioteca de medios con tres categorías: Logos institucionales, Avatares/personas, Imágenes de apoyo.
Permitir subir archivos (PNG, JPG, SVG para logos) con drag-and-drop.
Guardar los assets subidos asociados al usuario/organización (no solo en memoria del navegador) para que persistan entre sesiones.
Mostrar miniaturas en grilla, con opción de eliminar o reemplazar.
Al insertar un logo en una pieza, respetar automáticamente el área de protección definida en el punto 2 (no dejar que el usuario lo pegue al borde ni lo deforme fuera de proporción).
4. Editor de piezas
Lienzo visual (canvas) que muestra la plantilla seleccionada con capas: fondo/imagen, logo, avatar (si aplica), bloques de texto.
Panel lateral con campos de texto independientes (título, subtítulo, cuerpo, CTA) que actualizan el lienzo en tiempo real.
El usuario puede reposicionar imagen y avatar dentro de zonas permitidas, pero no puede cambiar colores ni tipografías fuera de la paleta institucional (limitar las opciones de personalización a lo que el manual de marca permite).
Botón de "Restablecer a plantilla" por si el usuario descuadra algo.
5. Exportación
Exportar la pieza final como imagen PNG/JPG en la resolución nativa de la plantilla.
Opcional: exportar en PDF para piezas tipo flyer.
Nombrar el archivo automáticamente con un patrón tipo cun-[tipo-pieza]-[fecha].png.
6. Autenticación y organización (si aplica)
Login simple (email institucional) para que cada usuario tenga su propia biblioteca de piezas guardadas y su historial.
Si el equipo es pequeño, esto puede ser opcional al inicio; indícalo si prefieres arrancar sin login y agregarlo después.
7. Alcance para la primera versión (MVP)
Empieza solo con:
1 plantilla (post cuadrado 1080x1080).
Biblioteca de logos y una imagen de fondo.
3 campos de texto editables (título, subtítulo, CTA).
Exportación a PNG.
Una vez funcione ese flujo completo, se amplía a más plantillas y tipos de asset.
8. Estilo de la interfaz de la plataforma (no de las piezas)
La interfaz del editor debe verse limpia y profesional, con paleta neutra (grises/blancos) para que no compita visualmente con la vista previa de la pieza, que es donde deben resaltar los colores institucionales de la CUN.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c9b91bde-01c2-4f31-a8a9-acea34d94519).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
