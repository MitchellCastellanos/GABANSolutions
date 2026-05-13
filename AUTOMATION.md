# Mi Tarjeta Pro — Automation Runbook

> Para Mitchell. Configurar **una sola vez**. Después todo corre solo.
> Tiempo estimado: 90–120 min (sin contar verificación de identidad de Lemon Squeezy).
> Stack: Lemon Squeezy + Tally + Notion + Make.com + GitHub Pages.

---

## TL;DR del flujo

```
Cliente paga en Lemon Squeezy (MXN)
       │
       ▼
LS te paga en CAD a tu banco canadiense (semanal)
LS dispara webhook → Make.com
       │
       ▼
Make.com crea row en Notion (status: Pendiente)
Make.com manda email a ti + email al cliente
       │
       ▼
Cliente llena form Tally en /gracias.html
Tally dispara webhook → Make.com
       │
       ▼
Make.com actualiza Notion + sube archivos a Drive
Make.com manda email a ti: "build this card"
       │
       ▼
Tú duplicas /negocio/_data/_example.json, lo nombras <slug>.json,
   pegas la info del cliente, commiteas a main
       │
       ▼
GitHub Pages despliega automáticamente
GitHub webhook → Make.com
       │
       ▼
Make.com actualiza Notion a "Live"
Make.com manda email al cliente con link + QR descargable
```

---

## 1) Lemon Squeezy (Merchant of Record)

### 1.1 Crear cuenta

1. Ir a https://www.lemonsqueezy.com
2. Sign up con email de GABAN.
3. Verificar email.

### 1.2 Configurar Store

1. Dashboard → **Stores** → **Create store**
2. Store name: `GABAN Solutions`
3. Store URL: `gabansolutions`  (queda: `gabansolutions.lemonsqueezy.com`)
4. Default currency: **MXN**
5. Business type: **Individual** (o tu LLC canadiense si la tienes)
6. Country: **Canada**

### 1.3 Verificar identidad (1–3 días hábiles)

1. Dashboard → **Settings** → **Tax & Compliance** → **Identity verification**
2. Sube: pasaporte canadiense + comprobante de domicilio (factura de luz/internet).
3. Espera aprobación (1–3 días).

### 1.4 Conectar banco / payout

1. **Settings** → **Payouts** → **Connect bank**
2. Banco canadiense (RBC, TD, BMO, Tangerine, etc.) con transit + institution + account number.
3. Frecuencia: **Weekly** (o Daily si prefieres).
4. *Opcional:* agrega tu cuenta de Wise multi-currency como respaldo.

### 1.5 Crear los 4 productos

Para cada uno: Dashboard → **Products** → **Add new** → **Single payment**.

| Nombre | Precio | Currency | URL slug |
|---|---|---|---|
| Mi Tarjeta Pro — Lanzamiento | 199 | MXN | `lanzamiento` |
| Mi Tarjeta Pro — Personalizado | 249 | MXN | `personalizado` |
| Mi Tarjeta Pro — Premium | 299 | MXN | `premium` |
| Mi Tarjeta Pro — Orden de cambios | 25 | MXN | `cambios-25` |

Para cada producto:
- **Description**: copia el bullet list del paquete desde `mi-tarjeta.html`.
- **Image**: cuando los tengas, sube el mockup PNG correspondiente.
- **Thank-you page redirect URL**: `https://gabansolutions.ca/gracias.html?order_id={order_id}&package={product_name}`
- **Receipt notes** (instrucciones que ve el cliente en el email): `¡Gracias! En 1 minuto llena la info de tu negocio en https://gabansolutions.ca/gracias.html`
- **Tax category**: Digital services.

### 1.6 Copiar las URLs de checkout

Una vez creado cada producto, en su página verás un botón **Share** → copia el "Checkout URL". Va a verse así:
`https://gabansolutions.lemonsqueezy.com/buy/abc123-def456`

Pega cada una en estas líneas del repo (find/replace):

```
REPLACE-LANZAMIENTO   →  el slug del checkout de Lanzamiento
REPLACE-PERSONALIZADO →  el slug del checkout de Personalizado
REPLACE-PREMIUM       →  el slug del checkout de Premium
REPLACE-CHANGES-25MXN →  el slug del checkout de Cambios
```

Archivos donde aparecen:
- `mi-tarjeta.html` (los 3 primeros)
- `negocio/_data/_example.json` y `negocio/_data/lulu.json` (cambios-25)
- Cualquier futuro `negocio/_data/*.json` que crees

### 1.7 Webhook a Make.com (lo configuras después en sección 4)

Por ahora: ten a la mano dónde está → **Settings** → **Webhooks** → **Add endpoint**.

---

## 2) PayPal (CTA secundario)

1. Asegúrate de tener PayPal Personal o Business en Canadá.
2. Configurar **PayPal.Me** link: https://paypal.me/setup → escoge handle `gabansolutions` (o el que prefieras).
3. En el repo, find/replace `REPLACE-PAYPAL-HANDLE` por tu handle.
4. Mexicanos pueden pagar con tarjeta sin tener PayPal — el link funciona igual.
5. **Importante:** PayPal cobra ~4.4% + $0.30 USD por transacción internacional. Más caro que Lemon Squeezy. Úsalo como fallback.

---

## 3) Tally (form de onboarding)

### 3.1 Crear form

1. https://tally.so → Sign up con email de GABAN.
2. **Create form** → desde blanco.

### 3.2 Campos del form (copia y pega)

| Tipo | Label | Campos / opciones | Required |
|---|---|---|---|
| Hidden field | `order_id` | (recibido por URL) | No |
| Hidden field | `package` | (recibido por URL) | No |
| Hidden field | `source` | (recibido por URL) | No |
| Short text | Nombre del negocio | — | Sí |
| Short text | Slug preferido para tu link | placeholder: `mi-negocio` | Sí |
| Short text | Frase corta / tagline | máx 80 chars | Sí |
| Dropdown | Giro de tu negocio | Belleza · Comida · Profesional · Otro | Sí |
| Dropdown | Estilo visual preferido | Dark + dorado · Editorial claro · Pastel · Kraft · Retro mexicano · Minimal café · Corporate azul · Salud azul · Mostaza personal · Universal | Sí |
| Color picker | Color de marca principal | — | No |
| File upload | Logo | PNG/JPG/SVG · max 5MB | Sí |
| File upload | Fotos para galería (3–9) | múltiple · max 5MB c/u | No |
| Phone | WhatsApp del negocio | con país (+52…) | Sí |
| URL | Instagram | https://instagram.com/… | No |
| URL | Facebook | — | No |
| URL | TikTok | — | No |
| URL | Sitio web | — | No |
| URL | Ubicación Google Maps | link de Maps | No |
| Email | Email para reseñas | — | No |
| Long text | Lista de servicios y precios | 1 por línea, ej: `Manicure clásica - $180` | No |
| Long text | Horarios | un día por línea | Sí |
| Long text | Algo especial que quieras destacar | máx 500 chars | No |
| Short text | Email de contacto | — | Sí |

### 3.3 Settings

- **Submission behavior** → Redirect to URL: `https://gabansolutions.ca/gracias.html?submitted=ok`
- **Theme** → match tu marca (dark or light).
- **Branding** → free plan muestra "Powered by Tally" (ok). Plan Pro $29/mes lo quita.

### 3.4 Embed

1. **Share** → **Embed** → copia el form ID (el código entre `tally.so/embed/` y `?`).
2. En el repo, find/replace `REPLACE-FORM-ID` por ese ID.
3. Archivos: `gracias.html`, `onboarding.html`.

### 3.5 Webhook → Make.com

1. **Integrations** → **Webhooks** → **Add webhook**.
2. URL: la que te dé Make.com en sección 4.

---

## 4) Notion (CRM)

### 4.1 Crear database

1. Crea un workspace o usa el tuyo.
2. **New page** → **Table** → nómbralo "Mi Tarjeta Pro · Clientes".

### 4.2 Columnas

| Nombre | Tipo |
|---|---|
| client_name | Title |
| slug | Text |
| package | Select (Lanzamiento / Personalizado / Premium) |
| status | Select (Pendiente / Datos recibidos / En diseño / En revisión / Listo / Live / Pausado) |
| order_id | Text |
| payment_amount | Number (formato MXN) |
| email | Email |
| whatsapp | Phone |
| live_url | URL |
| qr_pdf_url | URL |
| change_orders_this_month | Number (default 0) |
| created_at | Created time |
| notes | Text |

### 4.3 Integration

1. https://www.notion.so/my-integrations → **New integration**.
2. Name: `GABAN Make` · Workspace: el tuyo.
3. Copia el **Internal Integration Token** (la guardas para Make.com).
4. En la database de Notion → **…** → **Add connections** → selecciona "GABAN Make".

---

## 5) Make.com (orquestador)

### 5.1 Cuenta

1. https://www.make.com → Sign up free.
2. Plan free: 1000 operaciones/mes (más que suficiente para empezar).

### 5.2 Scenario A — Lemon Squeezy → Notion + emails

Trigger: **Lemon Squeezy · Watch orders**
- Conecta con tu API key de Lemon Squeezy (Settings → API).
- Event: `order_created`.

Module 2: **Notion · Create a database item**
- Database: "Mi Tarjeta Pro · Clientes".
- Mapping:
  - `client_name` = `{{1.attributes.user_name}}`
  - `slug` = (vacío por ahora, se llena en Scenario B)
  - `package` = `{{1.attributes.first_order_item.product_name}}`
  - `status` = `Pendiente`
  - `order_id` = `{{1.id}}`
  - `payment_amount` = `{{1.attributes.total / 100}}`
  - `email` = `{{1.attributes.user_email}}`

Module 3: **Gmail · Send email** (a ti)
- To: tu correo
- Subject: `[Mi Tarjeta Pro] Nueva venta · {{1.attributes.user_name}} · {{1.attributes.first_order_item.product_name}}`
- Body: incluye order_id, package, monto.

Module 4: **Gmail · Send email** (al cliente — backup, LS ya manda uno)
- To: `{{1.attributes.user_email}}`
- Subject: `¡Bienvenido a Mi Tarjeta Pro!`
- Body: agradecimiento + link a `https://gabansolutions.ca/gracias.html?order_id={{1.id}}&package={{1.attributes.first_order_item.product_name}}`.

Activa el scenario.

### 5.3 Scenario B — Tally → Notion + Drive + email

Trigger: **Tally · Watch new submission**
- Conecta con tu API key de Tally.
- Form: el de onboarding.

Module 2: **Google Drive · Upload file** (loop por cada file uploaded)
- Folder: `Mi Tarjeta Pro / <client_name> /`

Module 3: **Notion · Search database items**
- Filter: `order_id = {{1.fields.order_id}}`
- Si no encuentra, salta a "Create" en lugar de "Update".

Module 4: **Notion · Update database item**
- Status = `Datos recibidos`
- slug = `{{1.fields.slug_preferido}}`
- whatsapp = `{{1.fields.whatsapp}}`
- notes = JSON dump del form (para tener todo a la mano).

Module 5: **Gmail · Send email** (a ti)
- Subject: `[Mi Tarjeta Pro] Lista de info recibida · {{1.fields.business_name}}`
- Body: link al row de Notion + link a la carpeta de Drive + checklist "Hora de diseñar".

Activa.

### 5.4 Scenario C — GitHub push → Notion "Live" + email cliente

Trigger: **Webhooks · Custom webhook**
- Copia la URL del webhook.

En GitHub: Repo → **Settings** → **Webhooks** → **Add webhook**.
- Payload URL: la de Make.com.
- Content type: `application/json`.
- Events: solo `push`.

Module 2: **Iterator** sobre `{{1.commits[].added}}` y `{{1.commits[].modified}}`.

Module 3: **Router** con filter `{{2.value}} matches "negocio/_data/.*\.json"`.

Module 4: **Tools · Set variable**
- slug = extracted from filename (regex `_data/(.+)\.json`).

Module 5: **Notion · Search database items**
- Filter: `slug = {{4.slug}}`.

Module 6: **Notion · Update database item**
- status = `Live`
- live_url = `https://gabansolutions.ca/negocio/?n={{4.slug}}`
- qr_pdf_url = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&data=https%3A%2F%2Fgabansolutions.ca%2Fnegocio%2F%3Fn%3D{{4.slug}}`

Module 7: **Gmail · Send email** (al cliente)
- To: `{{5.email}}`
- Subject: `🎉 Tu tarjeta Mi Tarjeta Pro ya está en vivo`
- Body: enlace + link a `/mi-cuenta/?token=...&n={{4.slug}}` (genera el token tú al crear el JSON).
- Attachment: QR PNG.

Activa.

### 5.5 Plan de operaciones consumidas

Con 50 ventas al mes:
- Scenario A: 50 × 4 modules = 200 ops
- Scenario B: 50 × 5 modules = 250 ops
- Scenario C: 50 × 7 modules = 350 ops
- Total: ~800 ops · cabe en el free tier de 1000.

A los 100 ventas/mes súbete al plan Core ($9 USD/mes, 10k ops).

---

## 6) Generación de tokens (cuando creas un cliente)

Cuando tomes el form de Tally y construyas el `<slug>.json`:

1. Genera un token aleatorio corto:
   ```bash
   echo "${USER:-cli}-$(openssl rand -hex 3)"
   # ejemplo: lulu-x7a9k2
   ```
2. Ponlo en el JSON: `"ownerToken": "lulu-x7a9k2"`.
3. Manda al cliente su link: `https://gabansolutions.ca/mi-cuenta/?token=lulu-x7a9k2&n=lulu`.

---

## 7) Flujo de "una venta" — paso a paso (tú, manual, ~15 min)

1. **Notif de Make.com:** "Nueva venta + lista de info recibida".
2. Abre el row en Notion. Lee el JSON de la columna `notes`.
3. Descarga los archivos de Drive (logo, fotos).
4. Optimízalos: logo a 400×400 PNG, fotos a 800px lado largo, JPEG calidad 80. Guárdalos en `/Images/clients/<slug>/`.
5. Copia `negocio/_data/_example.json` → `negocio/_data/<slug>.json`.
6. Rellena los campos con la info del cliente. Genera el `ownerToken`.
7. Commit + push.
8. (Opcional) Crea `negocio/<slug>.html` con `<meta refresh>` para pretty URL.
9. Espera ~30 segundos a que GitHub Pages despliegue.
10. Make.com Scenario C dispara solo y emaila al cliente.

**Total: 10–15 min por cliente** una vez agarras el ritmo.

---

## 8) Flujo de "una orden de cambios" — paso a paso (~3 min)

1. Cliente paga $25 MXN en Lemon Squeezy o entra a `/mi-cuenta/?token=...`.
2. Cliente manda lista por Tally embed o WhatsApp.
3. Abres `negocio/_data/<slug>.json`, editas los campos.
4. Incrementas `change_orders_this_month` en Notion (manual o vía Make.com).
5. Commit + push.
6. Notificas al cliente.

Si es la 2da orden del mes → cobras $50. Si es la 3ra → $75. Si es rediseño completo → manda cotización aparte.

---

## 9) Backup / disaster recovery

- **El repo es la fuente de verdad.** Si Notion o Make se caen, las tarjetas siguen funcionando.
- Make.com tiene historial de ejecuciones por 30 días (free tier).
- Notion exporta a CSV o Markdown desde la UI.
- Lemon Squeezy guarda todas las órdenes y los puedes exportar a CSV.

---

## 10) Roadmap V2 (cuando crezca)

- [ ] Mover storage de logos/fotos a Cloudinary (transformaciones gratis, mejor CDN).
- [ ] GitHub Action que regenere `negocio/<slug>.html` (pretty URL) automáticamente al detectar `_data/<slug>.json` nuevo.
- [ ] Plausible Analytics ($9/mes) o Umami self-hosted para mostrar al cliente cuántas visitas/escaneos.
- [ ] WhatsApp Business API (Twilio) para notificaciones automáticas.
- [ ] Soporte para tarjetas en EN y FR (clientes outside MX).
- [ ] Modo NFC: imprimimos tarjetas físicas con chip NFC apuntando al link del cliente.

---

## Apéndice A: Lista de placeholders en el repo

Ejecuta esto para verlos todos:

```bash
grep -rn "REPLACE-" --include="*.html" --include="*.json" --include="*.md"
```

Debe mostrar:
- `REPLACE-LANZAMIENTO` · `REPLACE-PERSONALIZADO` · `REPLACE-PREMIUM` (Lemon Squeezy)
- `REPLACE-CHANGES-25MXN` (Lemon Squeezy)
- `REPLACE-PAYPAL-HANDLE` (PayPal.Me)
- `REPLACE-FORM-ID` (Tally)

Reemplaza todos antes de lanzar.

---

## Apéndice B: Costos totales mensuales

| Servicio | Plan | Costo CAD |
|---|---|---|
| Lemon Squeezy | Pay-per-sale | $0 fijo + 5%+$0.50 por venta |
| PayPal | Pay-per-sale | $0 fijo + 4.4%+$0.30 USD por venta |
| Tally | Free | $0 |
| Notion | Free | $0 |
| Make.com | Free | $0 (hasta 1000 ops/mes) |
| GitHub Pages | — | $0 |
| Dominio | gabansolutions.ca | ya pagado |
| **Total fijo** | | **$0/mes** |

A 50 ventas/mes (~$12,500 MXN ingresos):
- Comisiones: ~$650 MXN (5.2%)
- Net: **~$11,850 MXN ≈ $890 CAD/mes**

A 200 ventas/mes: ~$3,500 CAD/mes net.
