# Mi Tarjeta Pro — Onboarding por cliente

> Operación recurrente después de que Lemon Squeezy, Tally, Notion y Make.com ya están configurados (ver `AUTOMATION.md` para esa parte técnica).

---

## 1) Flujo de «una venta» — paso a paso (~15 min)

1. **Notif de Make.com:** «Nueva venta + lista de info recibida».
2. Abre el row en Notion. Lee el JSON de la columna `notes`.
3. Descarga los archivos de Drive (logo, fotos).
4. Optimízalos: logo a 400×400 PNG, fotos a 800px lado largo, JPEG calidad 80. Guárdalos en `/Images/clients/<slug>/`.
5. Copia `negocio/_data/_example.json` → `negocio/_data/<slug>.json`.
6. Rellena los campos con la info del cliente. Genera el `ownerToken` (ver `AUTOMATION.md` §6).
7. Commit + push a la rama que publica GitHub Pages.
8. **Pretty URL:** al hacer push de un JSON nuevo, el workflow *Generate negocio pretty-url stubs* crea `negocio/<slug>.html` y `negocio/<slug>/index.html` **solo si no existen** (no sobrescribe stubs manuales). Si el workflow no corre aún, puedes crearlos a mano con `<meta http-equiv="refresh" content="0;url=./?n=<slug>">`.
9. Espera ~30 segundos a que GitHub Pages despliegue.
10. Make.com Scenario C dispara solo y emaila al cliente.

**Total: 10–15 min por cliente** una vez agarras el ritmo.

---

## 2) Flujo de «una orden de cambios» — paso a paso (~3 min)

1. Cliente paga $25 MXN en Lemon Squeezy o entra a `/mi-cuenta/?token=...`.
2. Cliente manda lista por Tally embed o WhatsApp.
3. Abres `negocio/_data/<slug>.json`, editas los campos.
4. Incrementas `change_orders_this_month` en Notion (manual o vía Make.com).
5. Commit + push.
6. Notificas al cliente.

Si es la 2.ª orden del mes → cobras $50. Si es la 3.ª → $75. Si es rediseño completo → manda cotización aparte.

---

## 3) Idioma de la tarjeta (JSON)

El campo opcional `"language": "es-MX" | "en-US" | "fr-CA"` controla textos fijos de la tarjeta (galería, horarios, estados abierto/cerrado, botón de vCard, crédito GABAN). Por defecto es `es-MX` si se omite.

---

## 4) Analytics (Umami) para el cliente

1. Despliega Umami (self-hosted en Vercel/Cloudflare o cuenta Umami Cloud).
2. Crea un sitio apuntando a `gabansolutions.ca`.
3. En `negocio/index.html`, rellena el meta `mitp-umami-config` con JSON válido, por ejemplo:  
   `{"src":"https://TU-UMAMI/script.js","websiteId":"UUID-DEL-SITIO"}`
4. En `mi-cuenta/index.html`, reemplaza `mitp-umami-share-url` por la URL pública de estadísticas compartidas (Umami *share* / API que devuelva JSON con `pageviews`). Mientras lleve `REPLACE-`, el panel mostrará «—».

No subas API keys privadas al repo: usa enlaces de *share* pensados para lectura pública.
