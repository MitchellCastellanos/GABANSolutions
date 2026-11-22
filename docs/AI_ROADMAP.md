# AI roadmap — de más a menos útil, de menos a más difícil

Objetivo: usar IA para quitar el cuello de botella de la agencia (calificar
curiosos, aterrizar ideas vagas, cotizar rápido) **y** dejar una base común
para que cualquier función de IA futura (blog, leadgen, scoring) la reutilice.

Hoy el repo no llama ninguna API de IA: los prompts de blog/leadgen son de
copiar-y-pegar. Todo lo de abajo se apoya en una capa compartida nueva: `ai/lib/`.

## Reglas de diseño (aplican a todo punto)

1. **Los precios nunca los inventa el modelo.** El estimado sale de reglas
   deterministas (`ai/lib/discovery.mjs`) basadas en las páginas de precios
   reales. La IA solo redacta. E-commerce y apps a medida = "se cotiza tras
   una llamada", sin cifras.
2. **Las respuestas del modelo son datos, no HTML.** Salida estructurada
   (tool use + schema), escapada en emails y mostrada con `textContent`.
3. **El texto del visitante es no confiable** (prompt injection): va en un
   bloque delimitado, el system prompt dice que se trate como datos.
4. **Sin API key o si falla Anthropic, todo degrada a una plantilla** — el
   lead nunca se pierde.
5. **Cada endpoint de IA** lleva honeypot, límite por IP, tope diario global y
   límites de tamaño de entrada.
6. Un solo serverless por área (límite del plan Hobby): `api/assistant/[...path].js`.

## Plan por fases (orden de implementación)

| # | Punto | Impacto | Dificultad | Estado |
|---|-------|---------|-----------|--------|
| 1 | Capa de IA compartida: cliente Claude, rate limit, tope diario, sanitizado (`ai/lib/`) | Muy alto (habilita todo) | Baja | ✅ Hecho |
| 2 | Asistente de descubrimiento + pre-cotización (EN/FR/ES) con brief para el equipo | Muy alto | Media | ✅ Hecho (en `/contact`) |
| 3 | Auditoría exprés de sitio (URL → diagnóstico) con protección SSRF | Alto | Media-alta | ✅ Hecho (en `/contact`) |
| 4 | Brief a Airtable (pipeline de leads) + auto-respuesta al cliente con su estimado | Alto | Baja | ✅ Hecho |
| 5 | Borradores de blog vía API (reemplaza copiar-pegar de `blog/lib/prompt.mjs`) usando la capa compartida | Medio-alto | Baja | ⏳ |
| 6 | Leadgen: redactar emails/previews personalizados con IA + validación (`leadgen/`) | Medio | Media | ⏳ |
| 7 | Rate limit persistente (Upstash/Vercel KV) en vez de memoria por instancia | Medio | Media | ⏳ |
| 8 | Panel `/admin` para ver briefs, costo/uso de IA y conversión | Medio | Media | ⏳ |

## Detalle por punto

### 1. Capa compartida (`ai/lib/`)
- `claude.mjs`: cliente de la Messages API por `fetch` (sin dependencias),
  salida estructurada forzada por tool, timeout, modelo configurable.
- `guards.mjs`: IP del cliente, límite por ventana deslizante, tope diario
  global, `clean()`, comprobación de honeypot.
- Env: `ANTHROPIC_API_KEY` (opcional), `AI_MODEL` (default `claude-haiku-5-5`),
  `AI_DAILY_CAP` (default 150 llamadas/día/instancia).

### 2. Asistente de descubrimiento
- Cuestionario guiado de 6 pasos + contacto (tipo de negocio, qué necesita,
  dominio/identidad, idiomas — Ley 96 —, plazo, descripción libre).
- Servidor: valida → estimado determinista → IA redacta resumen para el
  cliente y brief para el equipo → email al equipo (Resend) + lead a Formspree.
- Cliente recibe estimado orientativo y siguientes pasos; equipo recibe brief
  limpio con bandera de cumplimiento de idioma (Ley 96) cuando aplica.

### 3. Auditoría exprés (hecho)
- Pegan su URL; checks deterministas (título, meta, viewport, h1, `lang`,
  hreflang, alt, https) + resumen de IA + CTA a `/book`.
- **SSRF**: solo http/https, puertos 80/443, resolver DNS y rechazar IPs
  privadas/loopback/link-local/metadata (`169.254.169.254`), revalidar en cada
  redirect (máx. 3), tope de bytes y tiempo, sin cabeceras del visitante.
- Límites: 3/hora por IP y `AUDIT_DAILY_CAP` (default 100/día). Toda falla o bloqueo devuelve el mismo error genérico (no sirve para sondear la red interna). Código: `ai/lib/ssrf.mjs` (+ `audit.mjs`), tests en `ai/tests/ssrf.test.mjs`.

### 4. Pipeline en Airtable + auto-respuesta (hecho)
- Cada brief se guarda en la tabla **Leads** (`ai/lib/lead-store.mjs`), en paralelo al email al equipo.
  Éxito para el visitante si *cualquiera* (email, Airtable o Formspree) recibió el lead.
- Auto-respuesta al cliente (solo si dio email) en su idioma con estimado y pasos (`clientEmail`).
  Máx. 1 por dirección por día para que el formulario no sirva para enviar correo a terceros.
- **Tabla `Leads` (crearla en la base existente):** Name, Contact, Business Type, Need, Assets,
  Languages, Timeline, Suggested Package, Fit, UI Lang, Source, Status (texto o single select) ·
  Description, Team Summary, Risks, Questions (texto largo) · Bill 96 Flag (checkbox) ·
  Submitted At (fecha/hora). Se envía con `typecast`; un campo inexistente hace fallar el guardado
  (el email sigue funcionando), así que los nombres deben coincidir.
- Env: `AIRTABLE_LEADS_TABLE` (default `Leads`); reutiliza `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID`.

### 5–8
Ver tabla; cada uno reutiliza `ai/lib/` sin cambios de arquitectura.

## Variables de entorno nuevas
| Var | Para qué |
|-----|----------|
| `ANTHROPIC_API_KEY` | Habilita la redacción con IA (sin ella: plantilla) |
| `AI_MODEL` | Modelo (default `claude-haiku-5-5`) |
| `AI_DAILY_CAP` | Tope diario de llamadas a IA |
| `AUDIT_DAILY_CAP` | Tope diario de auditorías (default 100) |
| `AIRTABLE_LEADS_TABLE` | Tabla de leads (default `Leads`) |
| `LEAD_NOTIFY_EMAIL` | Destino de briefs (default `hello@gabansolutions.ca`) |
