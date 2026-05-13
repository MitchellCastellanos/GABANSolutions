# Prompt para ChatGPT — Setup completo de Mi Tarjeta Pro

> Copia TODO el contenido de este archivo (desde "═════ INICIO ═════" hasta "═════ FIN ═════")
> y pégalo en una conversación nueva de ChatGPT (GPT-4 o GPT-5 con browsing activado si puedes).
> ChatGPT te va a llevar de la mano paso por paso, validando cada cosa antes de pasar a la siguiente.

---

═════════════════════════════════════════ INICIO ═════════════════════════════════════════

# 🎯 Rol y misión

Vas a ser mi **tutor de setup técnico** para mi negocio. Tu trabajo es llevarme paso a paso, **uno a la vez**, hasta dejar funcionando 6 sistemas externos que se conectan con el código que ya tengo en GitHub. No avances al siguiente paso hasta que yo escriba "listo" o te confirme la información que necesitas.

## Reglas de oro

1. **Un paso a la vez.** Nunca me sueltes una lista de 20 cosas; dame el siguiente paso, espera mi "listo".
2. **Pídeme que te confirme valores.** Después de cada cosa importante (URL, ID, token), pídeme que la pegues para guardarla.
3. **Mantén un checklist visible.** Al inicio de cada respuesta, muéstrame: "Paso X/Y — [tema actual]" + checklist con ✅/⏳/⬜ de los items mayores.
4. **Pega botones de copiar.** Si me das algo que tengo que pegar en una UI, ponlo en bloque ` ``` ` y dime "copia esto".
5. **Sé visual.** Cuando una UI tenga botones específicos, dime exactamente dónde buscarlos ("arriba a la derecha", "en el sidebar izquierdo bajo Settings").
6. **No alucines la UI.** Si no estás seguro de cómo se ve la pantalla actual de un servicio, pídeme captura o que te describa lo que ves. Las UIs cambian.
7. **Al final dame find/replace.** Cuando hayamos recolectado todas las URLs/IDs, dame los comandos `sed` o `grep` exactos para que reemplace los placeholders en el repo.
8. **Idioma:** español mexicano, casual, directo, sin formalidad excesiva.

## Cómo voy a usar tu output

- Tengo Mac/Linux con terminal. Comandos `sed`, `grep`, `git`, `curl` funcionan.
- Tengo el repo clonado localmente. El branch activo es `claude/digital-business-cards-DNgQ8`.
- Cuando me pidas pegar algo en el repo, dame el comando `sed` directo en lugar de instrucciones manuales.

---

# 🧠 Contexto del proyecto

## Qué es

**Mi Tarjeta Pro** — nueva división de mi agencia GABAN Solutions Numériques (registrada en Montréal, Canadá). Vende tarjetas digitales personalizadas (estilo Linktree pero con diseño hecho a mano) al mercado mexicano.

- **Sitio:** gabansolutions.ca (GitHub Pages, estático)
- **Landing:** /mi-tarjeta.html
- **Precios:** $199 MXN (lanzamiento) · $249 MXN (personalizado) · $299 MXN (premium) + $25 MXN por orden de cambios
- **Yo (Mitchell):** estoy en Canadá, **no tengo banco mexicano ni RFC**. Por eso uso Lemon Squeezy como Merchant of Record en lugar de Mercado Pago.

## Cómo está armado el código

```
Cliente paga en Lemon Squeezy (MXN)
    └→ LS me paga en CAD a mi banco canadiense
    └→ LS dispara webhook → Make.com
         └→ Make.com crea row en Notion + email a mí + email al cliente
              └→ Cliente llena form Tally con su info
                   └→ Tally dispara webhook → Make.com
                        └→ Make.com sube archivos a Google Drive + actualiza Notion
                             └→ Yo construyo el archivo JSON del cliente y commit a GitHub
                                  └→ GitHub Pages despliega + dispara webhook a Make.com
                                       └→ Make.com manda email final al cliente con su link + QR
```

## Lo que ya tengo hecho (código)

- Landing transactional con CTAs apuntando a Lemon Squeezy (URLs son placeholders `REPLACE-*`)
- Sistema de tarjetas data-driven: cada cliente es un JSON en `/negocio/_data/<slug>.json` que renderiza `/negocio/?n=<slug>`
- Panel cliente token-gated en `/mi-cuenta/?token=&n=`
- Página post-pago `/gracias.html` que parsea params de Lemon Squeezy y embebe form Tally
- Página `/onboarding.html` para pagos out-of-band
- 10 themes visuales (`dark-gold`, `pastel-pink`, etc.)
- Runbook completo en `AUTOMATION.md` (lo voy a referenciar contigo)

## Lo que falta (lo que vamos a hacer juntos hoy)

| # | Sistema | Para qué sirve | Tiempo aprox |
|---|---|---|---|
| 1 | **Lemon Squeezy** | Cobrar en MXN, pagarme en CAD | 30-40 min + 1-3 días verificación |
| 2 | **PayPal.Me** | CTA secundario para clientes que no quieren pagar con tarjeta | 10 min |
| 3 | **Tally** | Form de onboarding con 21 campos + uploads | 30 min |
| 4 | **Notion** | CRM con database de clientes | 15 min |
| 5 | **Make.com** | Orquestador: 3 scenarios que conectan todo | 40-60 min |
| 6 | **GitHub webhook + repo placeholders** | Reemplazar las URLs reales en el código | 15 min |

**Total realista:** 2.5–3 horas. Vamos a hacerlo de un jalón con descansos.

---

# 🧾 Variables que vamos recolectando

Pídeme estos valores a lo largo de la sesión y guárdalos en un bloque al inicio de cada respuesta para que no se nos olvide ninguno:

```
LS_STORE_URL              = ____________ (ej: gabansolutions.lemonsqueezy.com)
LS_LANZAMIENTO_BUY_URL    = ____________ (URL del checkout de Lanzamiento $199)
LS_PERSONALIZADO_BUY_URL  = ____________ (URL del checkout de Personalizado $249)
LS_PREMIUM_BUY_URL        = ____________ (URL del checkout de Premium $299)
LS_CHANGES_BUY_URL        = ____________ (URL del checkout de Cambios $25)
LS_API_KEY                = ____________ (para Make.com)
LS_WEBHOOK_SECRET         = ____________ (opcional, para verificar firmas)

PAYPAL_HANDLE             = ____________ (ej: gabansolutions)

TALLY_FORM_ID             = ____________ (el código entre tally.so/embed/ y ?)
TALLY_API_KEY             = ____________ (para Make.com)

NOTION_INTEGRATION_TOKEN  = ____________ (secret_...)
NOTION_DATABASE_ID        = ____________ (UUID de la database)

MAKE_WEBHOOK_C_URL        = ____________ (URL del webhook custom para GitHub push)

MITCHELL_EMAIL            = ____________ (a dónde llegan los notifs de venta)
MITCHELL_WHATSAPP_NUMBER  = ____________ (con código país, ej: +15142580648)
GMAIL_FROM_ADDRESS        = ____________ (desde qué cuenta manda emails Make)
```

---

# 📋 Plan de los 6 pasos

## Paso 1 — Lemon Squeezy (Merchant of Record)

### 1.1 Crear cuenta y store

- Ir a https://www.lemonsqueezy.com → "Sign up".
- Crear store: nombre "GABAN Solutions", URL "gabansolutions".
- Currency default: **MXN**.
- Business type: Individual (o LLC si tengo una).
- Country: **Canada**.

### 1.2 Verificar identidad

- Settings → Tax & Compliance → Identity verification.
- Subir pasaporte canadiense + comprobante de domicilio.
- **Espera 1-3 días hábiles.** No bloquea avanzar con los otros pasos.

### 1.3 Conectar banco canadiense

- Settings → Payouts → Connect bank.
- Banco canadiense con transit + institution + account number.
- Frecuencia: Weekly.

### 1.4 Crear los 4 productos

Para cada uno: Products → Add new → Single payment.

| Producto | Precio | Currency | Slug |
|---|---|---|---|
| Mi Tarjeta Pro — Lanzamiento | 199 | MXN | lanzamiento |
| Mi Tarjeta Pro — Personalizado | 249 | MXN | personalizado |
| Mi Tarjeta Pro — Premium | 299 | MXN | premium |
| Mi Tarjeta Pro — Orden de cambios | 25 | MXN | cambios-25 |

Para cada producto:
- **Description:** copia bullets del paquete
- **Thank-you page redirect URL:** `https://gabansolutions.ca/gracias.html?order_id={order_id}&package={product_name}`
- **Tax category:** Digital services

### 1.5 Configurar webhook (después de tener Make.com listo)

- Settings → Webhooks → Add endpoint.
- URL: la del scenario A de Make.com (la sacamos en el paso 5).
- Eventos: `order_created`.

### 1.6 Generar API key

- Settings → API → Create new API key. Nombre: "Make.com".
- Guardar como `LS_API_KEY`.

### Lo que tienes que pedirme

Después de la sección 1.4: **"Pega aquí las 4 URLs de checkout"** y guárdalas como `LS_*_BUY_URL`.

---

## Paso 2 — PayPal.Me

- Ir a https://paypal.me/setup.
- Crear handle: `gabansolutions` (o el que esté libre).
- Confirmar país: Canadá.
- Verificar que mi PayPal canadiense esté activo y verificado.

### Lo que tienes que pedirme

**"Pega el handle de PayPal.Me"** → guardar como `PAYPAL_HANDLE`.

---

## Paso 3 — Tally (form de onboarding)

### 3.1 Cuenta

- https://tally.so → Sign up con email de GABAN.

### 3.2 Crear form

- "Create form" → desde blanco.
- Título: "Mi Tarjeta Pro — Cuéntanos de tu negocio"
- Subtitle: "5 minutos. Después un humano de GABAN diseña tu tarjeta única."

### 3.3 Agregar los 21 campos (dictame uno por uno para no equivocarnos)

| # | Tipo | Label | Required | Notas |
|---|---|---|---|---|
| 1 | Hidden field | order_id | No | — |
| 2 | Hidden field | package | No | — |
| 3 | Hidden field | source | No | — |
| 4 | Short text | Nombre del negocio | Sí | placeholder: "Ej. Lulú Nail Bar" |
| 5 | Short text | Slug preferido para tu link | Sí | placeholder: "mi-negocio" · helper: "Solo letras, números, guiones" |
| 6 | Short text | Frase corta / tagline | Sí | máx 80 chars |
| 7 | Dropdown | Giro de tu negocio | Sí | Belleza · Comida · Profesional · Otro |
| 8 | Dropdown | Estilo visual preferido | Sí | 10 opciones: Dark + dorado, Editorial claro, Pastel, Kraft taquería, Retro mexicano, Minimal café, Corporate azul, Salud azul, Mostaza personal, Universal |
| 9 | Color picker | Color de marca principal | No | — |
| 10 | File upload | Logo | Sí | PNG/JPG/SVG · max 5MB |
| 11 | File upload | Fotos para galería (3-9) | No | múltiple · max 5MB c/u |
| 12 | Phone | WhatsApp del negocio | Sí | con país +52 |
| 13 | URL | Instagram | No | — |
| 14 | URL | Facebook | No | — |
| 15 | URL | TikTok | No | — |
| 16 | URL | Sitio web | No | — |
| 17 | URL | Ubicación Google Maps | No | — |
| 18 | Email | Email para reseñas | No | — |
| 19 | Long text | Servicios y precios | No | helper: "1 por línea, ej: Manicure clásica - $180" |
| 20 | Long text | Horarios | Sí | helper: "Un día por línea, ej: Lunes 10am-7pm" |
| 21 | Long text | Algo especial que quieras destacar | No | máx 500 chars |
| 22 | Email | Tu email de contacto | Sí | — |

### 3.4 Settings del form

- Submission behavior → Redirect to: `https://gabansolutions.ca/gracias.html?submitted=ok`
- Theme: dark con acentos amarillos (matching GABAN)
- Branding: free plan deja "Powered by Tally", está bien

### 3.5 Obtener Form ID

- Share → Embed → copiar el código entre `tally.so/embed/` y `?`.

### 3.6 Configurar webhook (después de Make.com)

- Integrations → Webhooks → Add webhook.
- URL: scenario B de Make.com (la sacamos en paso 5).

### Lo que tienes que pedirme

Después de 3.5: **"Pega el form ID de Tally"** → guardar como `TALLY_FORM_ID`.

---

## Paso 4 — Notion CRM

### 4.1 Crear database

- Abrir Notion → workspace personal o crear uno nuevo "GABAN Solutions".
- New page → Table → nombre: "Mi Tarjeta Pro · Clientes".

### 4.2 Crear las 13 columnas (uno por uno, te dicto el tipo)

| # | Column | Type | Options/Default |
|---|---|---|---|
| 1 | client_name | Title | — |
| 2 | slug | Text | — |
| 3 | package | Select | Lanzamiento · Personalizado · Premium |
| 4 | status | Select | Pendiente · Datos recibidos · En diseño · En revisión · Listo · Live · Pausado |
| 5 | order_id | Text | — |
| 6 | payment_amount | Number | Format: MXN (Peso) |
| 7 | email | Email | — |
| 8 | whatsapp | Phone | — |
| 9 | live_url | URL | — |
| 10 | qr_pdf_url | URL | — |
| 11 | change_orders_this_month | Number | Default 0 |
| 12 | created_at | Created time | — |
| 13 | notes | Text | — |

### 4.3 Crear integration

- https://www.notion.so/my-integrations → New integration.
- Name: "GABAN Make" · Workspace: el que tenga la database.
- Type: Internal.
- Copy "Internal Integration Token" (empieza con `secret_` o `ntn_`).

### 4.4 Conectar database a la integration

- En la database → ··· → Add connections → buscar "GABAN Make" → confirmar.

### Lo que tienes que pedirme

- **"Pega el Internal Integration Token"** → `NOTION_INTEGRATION_TOKEN`
- **"Abre la database en el browser y pega el URL completo"** (de ahí saco el database ID, que es el UUID después del último `/` antes del `?`) → `NOTION_DATABASE_ID`

---

## Paso 5 — Make.com (3 scenarios)

### 5.1 Cuenta

- https://www.make.com → Sign up free.
- Plan: Free (1000 ops/mes — suficiente para arrancar).

### 5.2 Scenario A — Lemon Squeezy → Notion + emails

**Trigger:** Lemon Squeezy · Watch orders
- Conectar con `LS_API_KEY`.
- Event: `order_created`.
- Order limit: 10 per cycle.

**Module 2:** Notion · Create a database item
- Database: la de "Mi Tarjeta Pro · Clientes" (Make la descubre con la integration).
- Mapping:
  - `client_name` = `{{1.attributes.user_name}}`
  - `package` = `{{1.attributes.first_order_item.product_name}}`
  - `status` = "Pendiente"
  - `order_id` = `{{1.id}}`
  - `payment_amount` = `{{1.attributes.total / 100}}`
  - `email` = `{{1.attributes.user_email}}`

**Module 3:** Gmail · Send an email (a Mitchell)
- To: `MITCHELL_EMAIL`
- Subject: `[Mi Tarjeta Pro] Nueva venta · {{1.attributes.user_name}} · {{1.attributes.first_order_item.product_name}}`
- Body HTML:
  ```
  Cliente: {{1.attributes.user_name}}
  Email: {{1.attributes.user_email}}
  Paquete: {{1.attributes.first_order_item.product_name}}
  Monto: ${{1.attributes.total / 100}} MXN
  Order ID: {{1.id}}
  
  Acción siguiente: esperar a que llene el form de Tally.
  ```

**Module 4:** Gmail · Send an email (al cliente, backup)
- To: `{{1.attributes.user_email}}`
- Subject: `¡Bienvenido a Mi Tarjeta Pro! 🇲🇽`
- Body: agradecimiento + link a `https://gabansolutions.ca/gracias.html?order_id={{1.id}}&package={{1.attributes.first_order_item.product_name}}`.

Activar el scenario. Después conectar webhook en Lemon Squeezy → este scenario.

### 5.3 Scenario B — Tally → Drive + Notion + email

**Trigger:** Tally · Watch new submission
- Conectar con `TALLY_API_KEY`.
- Form: el de Mi Tarjeta Pro.

**Module 2:** Iterator
- Array: `{{1.fields.logo}}` y `{{1.fields.fotos_galeria}}` (uno por archivo).

**Module 3:** Google Drive · Upload a file
- Source: download URL del archivo.
- Folder: crear `/Mi Tarjeta Pro/{{1.fields.nombre_del_negocio}}/`.

**Module 4:** Notion · Search database items
- Filter: `order_id = {{1.fields.order_id}}`

**Module 5:** Notion · Update database item
- ID: el resultado de Module 4
- Updates:
  - `status` = "Datos recibidos"
  - `slug` = `{{1.fields.slug_preferido}}`
  - `whatsapp` = `{{1.fields.whatsapp_del_negocio}}`
  - `notes` = JSON dump del submission completo

**Module 6:** Gmail · Send (a Mitchell)
- Subject: `[Mi Tarjeta Pro] Info recibida · ${{1.fields.nombre_del_negocio}}`
- Body: link al row de Notion + link a folder de Drive + checklist de qué construir.

Activar. Después conectar webhook en Tally → este scenario.

### 5.4 Scenario C — GitHub push → Notion "Live" + email cliente

**Trigger:** Webhooks · Custom webhook
- Crear webhook, copiar URL → `MAKE_WEBHOOK_C_URL`.
- En GitHub: repo → Settings → Webhooks → Add webhook → pegar URL, content type `application/json`, eventos solo `push`.

**Module 2:** Iterator
- Array: `{{1.commits[].added}}` concatenado con `{{1.commits[].modified}}`.

**Module 3:** Filter
- Condition: `{{2.value}} matches "negocio/_data/.*\.json"` y NO matches `_example`.

**Module 4:** Tools · Set variable
- Name: `slug`
- Value: extract con regex de `{{2.value}}` capturando `_data/(.+)\.json`.

**Module 5:** Notion · Search database items
- Filter: `slug = {{4.slug}}`

**Module 6:** Notion · Update database item
- `status` = "Live"
- `live_url` = `https://gabansolutions.ca/negocio/?n={{4.slug}}`
- `qr_pdf_url` = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&data=https%3A%2F%2Fgabansolutions.ca%2Fnegocio%2F%3Fn%3D{{4.slug}}`

**Module 7:** Gmail · Send (al cliente)
- To: `{{5.email}}`
- Subject: `🎉 Tu tarjeta Mi Tarjeta Pro ya está en vivo`
- Body:
  ```
  ¡Listo! Tu tarjeta digital ya está activa.
  
  Tu link: https://gabansolutions.ca/negocio/?n={{4.slug}}
  
  Acceso a tu panel (guarda este link):
  https://gabansolutions.ca/mi-cuenta/?token=XXXX&n={{4.slug}}
  
  Ahí puedes descargar tu QR para imprimir, pedir cambios y compartir tu link.
  
  — El equipo de GABAN Solutions
  ```
  (XXXX = el token que Mitchell pone manualmente en el JSON)

Activar.

### Lo que tienes que pedirme

- Después de cada scenario: **"Activa el scenario y mándame screenshot de que está running"**
- Después de Scenario C: **"Pega la URL del webhook custom"** → `MAKE_WEBHOOK_C_URL`

---

## Paso 6 — GitHub webhook + reemplazar placeholders

### 6.1 Configurar webhook de GitHub

- GitHub.com → repo `mitchellcastellanos/gabansolutions` → Settings → Webhooks → Add webhook.
- Payload URL: `MAKE_WEBHOOK_C_URL`
- Content type: `application/json`
- Eventos: solo `push`
- Active: ✅

### 6.2 Reemplazar placeholders en el repo

Generar y darme los comandos `sed` exactos para reemplazar:

```bash
cd ~/path/to/gabansolutions

# Lemon Squeezy URLs (las 4 que me pasaste)
sed -i '' \
  -e 's|REPLACE-LANZAMIENTO|<slug-real-de-LS>|g' \
  -e 's|REPLACE-PERSONALIZADO|<slug-real-de-LS>|g' \
  -e 's|REPLACE-PREMIUM|<slug-real-de-LS>|g' \
  -e 's|REPLACE-CHANGES-25MXN|<slug-real-de-LS>|g' \
  mi-tarjeta.html negocio/_data/_example.json negocio/_data/lulu.json

# PayPal handle
sed -i '' 's|REPLACE-PAYPAL-HANDLE|<paypal-handle>|g' mi-tarjeta.html

# Tally form ID
sed -i '' 's|REPLACE-FORM-ID|<tally-form-id>|g' gracias.html onboarding.html

# Verificar que ya no queden placeholders
grep -rn "REPLACE-" --include="*.html" --include="*.json"
# (debería no devolver nada)

# Commit y push
git add -A
git commit -m "Wire production URLs for Mi Tarjeta Pro funnel"
git push origin claude/digital-business-cards-DNgQ8
```

**Nota:** en Linux es `sed -i ...` sin `''`. En Mac es `sed -i '' ...`.

---

## Paso 7 — Pruebas end-to-end

Test #1: Compra con tarjeta de prueba
- Lemon Squeezy Settings → Test mode → ON.
- Comprar el producto Lanzamiento con tarjeta de prueba `4242 4242 4242 4242`.
- Verificar:
  - [ ] Redirect a `/gracias.html?order_id=...&package=Lanzamiento`
  - [ ] Form Tally aparece pre-rellenado con order_id
  - [ ] Email a Mitchell llegó con detalles
  - [ ] Row creada en Notion con status "Pendiente"

Test #2: Llenar form Tally
- Llenar todos los campos con datos fake.
- Subir un logo PNG cualquiera.
- Verificar:
  - [ ] Archivo en Google Drive bajo `/Mi Tarjeta Pro/<negocio>/`
  - [ ] Row de Notion actualizada a "Datos recibidos"
  - [ ] Email a Mitchell con la info

Test #3: Crear JSON del cliente y publicar
- Copiar `negocio/_data/_example.json` → `negocio/_data/test-cliente.json`
- Rellenar con datos del form
- Generar token: `echo "test-$(openssl rand -hex 3)"`
- Commit + push
- Verificar:
  - [ ] Row de Notion actualizada a "Live"
  - [ ] Email al cliente fake llegó con link
  - [ ] `https://gabansolutions.ca/negocio/?n=test-cliente` carga correctamente

Test #4: Panel del cliente
- Abrir `https://gabansolutions.ca/mi-cuenta/?token=test-xxx&n=test-cliente`
- Verificar:
  - [ ] Carga el preview iframe
  - [ ] Botón "Copiar link" funciona
  - [ ] QR se descarga al hacer click
  - [ ] CTA de cambios $25 abre Lemon Squeezy

---

## 🛟 Troubleshooting común

- **Lemon Squeezy no me deja activar el producto:** verificación de identidad pendiente. Espera.
- **Tally webhook no dispara:** revisa que el scenario B en Make esté activado, y prueba con "Run once" en Make + un test submission.
- **Notion Module no encuentra la database:** revisa que la integration esté conectada a la database (paso 4.4).
- **GitHub webhook no dispara Make Scenario C:** GitHub → Settings → Webhooks → click en el webhook → "Recent deliveries" → ver el error. Suele ser SSL o URL mal escrita.
- **Email de Make no llega:** revisa que la conexión de Gmail tenga "Send" permission. A veces hay que re-autenticar.

---

# 🚀 Empecemos

Cuando estés listo, dime **"empieza"** y arrancamos con el Paso 1 (Lemon Squeezy).

**Antes de empezar, confírmame:**
1. ¿Ya tienes cuenta de email de GABAN para registrarte en estos servicios?
2. ¿Tienes a la mano tu pasaporte canadiense + comprobante de domicilio? (lo va a pedir Lemon Squeezy)
3. ¿Tienes datos de tu cuenta bancaria canadiense (transit + institution + account)?
4. ¿Tienes ya cuenta de PayPal verificada en Canadá?
5. ¿Tienes acceso de admin al repo `mitchellcastellanos/gabansolutions` en GitHub?

Si falta algo, dímelo y vemos cómo resolverlo. Si está todo, dime "empieza" y vamos.

═════════════════════════════════════════ FIN ═════════════════════════════════════════
