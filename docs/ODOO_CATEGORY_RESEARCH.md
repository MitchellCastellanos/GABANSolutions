# Investigación: estructura de categorías de Odoo aplicada a GABAN

**Fecha:** agosto 2026
**Objetivo:** investigar cómo Odoo organiza su tienda de apps (apps.odoo.com) en un formato tipo "shopping cart", identificar qué de eso ya ofrece GABAN, y proponer una estructura de catálogo más amigable para clientes y mejor para SEO.

Maqueta visual interactiva de la propuesta: ver artefacto publicado en la conversación ("Catálogo GABAN").

---

## 1. Cómo categoriza Odoo su tienda de apps

Odoo vende 80+ aplicaciones agrupadas en 8 categorías. Cada categoría agrupa varias "apps" (subcategorías/productos individuales) que el cliente puede activar por separado, como items en un carrito:

| # | Categoría | Apps incluidas |
|---|-----------|-----------------|
| 1 | **Finanzas** | Contabilidad, Facturación, Gastos, Documentos, Firma electrónica, Hojas de cálculo (BI) |
| 2 | **Ventas** | CRM, Ventas, TPV Tienda, TPV Restaurante, Suscripciones, Rentas |
| 3 | **Sitios web** | Constructor de sitios, eCommerce, Blog, Foro, Chat en vivo, eLearning |
| 4 | **Cadena de suministro** | Inventario, Manufactura, PLM, Compras, Mantenimiento, Calidad |
| 5 | **Recursos Humanos** | Empleados, Reclutamiento, Ausencias, Evaluaciones, Referidos, Flotilla |
| 6 | **Marketing** | Marketing Social, Email Marketing, SMS Marketing, Eventos, Automatización de Marketing, Encuestas |
| 7 | **Servicios** | Proyectos, Partes de horas, Servicio de Campo, Mesa de Ayuda, Planificación, Citas |
| 8 | **Productividad** | Discuss, Aprobaciones, IoT, VoIP, Conocimiento, WhatsApp |

Fuentes: [apps.odoo.com/apps](https://apps.odoo.com/apps), [odoo.com/page/all-apps](https://www.odoo.com/page/all-apps), [tech4lyf.com — lista de módulos Odoo 2026](https://www.tech4lyf.com/blog/odoo-modules/).

---

## 2. Qué de esto ya hace GABAN hoy

Basado en el contenido actual de `digital.html`, `software.html`, `automations.html`, `garageos.html` y `fieldos.html`:

| Categoría Odoo | Estado en GABAN | Dónde vive hoy |
|---|---|---|
| Sitios web | ✅ Cubierto | Núcleo de GABAN Digital: Websites, Landing Pages, Launch 72H, Grow Package |
| Servicios (campo) | ✅ Cubierto | FieldOS = Servicio de Campo. Citas y Planificación dentro de FieldOS/GarageOS |
| Ventas (CRM) | 🟡 Parcial | Clientes/vehículos/propiedades embebidos en GarageOS/FieldOS; no se vende como CRM aparte |
| Finanzas | 🟡 Parcial | Cotización → factura embebido en GarageOS/FieldOS; no existe como producto standalone |
| Marketing | 🟡 Parcial | Automatizaciones ligeras, flujo de reseñas y smart links tocan el tema, pero no hay email/SMS marketing como producto |
| Recursos Humanos | ⚪ No cubierto | Solo un rastro en "Horario de equipo" de FieldOS |
| Productividad | ⚪ No cubierto | No se ofrece como producto (uso interno, no oferta) |
| Cadena de suministro | ⚪ No aplica | Fuera del enfoque de GABAN (negocios de servicio local, no manufactura/inventario) |

**Nota:** SEO Local + Perfil de Google Business + Reseñas es una fortaleza de GABAN que Odoo no cataloga de la misma forma — vale la pena darle su propia categoría en vez de esconderla dentro de "Marketing".

---

## 3. Propuesta de catálogo GABAN

En lugar de dos divisiones planas (Digital / Software) con un grid de iconos, aplicar el mismo principio de Odoo al tamaño real de GABAN: **categoría → subcategoría → tarjeta de servicio**, donde cada tarjeta puede convertirse en su propia página.

1. **🌐 Presencia Digital** — *Disponible*: Sitios web, Landing Pages, SEO Local, Perfil de Google Business, Flujo de Reseñas, Smart Links
2. **⚙️ Automatización y Seguimiento** — *Disponible*: Formularios y enrutamiento, Notificaciones, Secuencias de seguimiento, Integraciones · *Próximamente*: Email marketing, SMS marketing
3. **🧰 Operación de Campo y Taller** — *Disponible*: GarageOS, FieldOS, Citas y calendario, Rutas y recurrencias, Historial y recordatorios
4. **👥 Clientes y Ventas (CRM)** — *Por extraer*: hoy embebido en GarageOS/FieldOS; falta venderlo como producto standalone para cualquier negocio local
5. **💳 Facturación y Cobros** — *Por extraer*: cotización → factura ya existe embebido; falta standalone + pagos en línea
6. **🗂️ Equipo y Operación Interna** — *Fase 3, bajo demanda*: horario de equipo ya existe; ausencias/aprobaciones son ideas, no roadmap

---

## 4. Por qué esta estructura ayuda al SEO

- **Más puertas de entrada (long-tail):** cada subcategoría = su propia URL indexable = su propia búsqueda ganada ("software para talleres mecánicos Montreal", "CRM para negocios locales Canadá"), en vez de competir todas por las mismas 3 palabras en una sola página.
- **Autoridad temática:** la jerarquía categoría → subcategoría → servicio le muestra a Google cómo se relaciona todo, reforzando las páginas entre sí.
- **Datos estructurados:** breadcrumbs + schema.org (`Service`/`ItemList`) por categoría habilitan resultados enriquecidos.
- **Menos rebote:** un catálogo navegable como tienda reduce fricción — el visitante encuentra su categoría y decide más rápido que leyendo un párrafo largo.

Hoy `digital.html` es una sola página con 8 tarjetas de servicio y solo 3 tienen link propio (`websites.html`, `landing-pages.html`, `seo.html`, `automations.html`); el resto (Google Business Profile, Review flow, Smart links, Consulting) no tiene página ni URL indexable propia.

---

## 5. Roadmap sugerido

1. **Fase 1 — Reetiquetar:** reorganizar `services.html` / `digital.html` en las categorías de arriba, sin construir nada nuevo, dando URL propia a cada subcategoría que hoy no la tiene.
2. **Fase 2 — Extraer CRM y Facturación:** ofrecer como producto propio lo que ya funciona dentro de GarageOS/FieldOS, vendible a negocios locales que no necesiten el paquete vertical completo.
3. **Fase 3 — Evaluar Marketing como oferta:** envolver las automatizaciones actuales en un servicio de email/SMS marketing con nombre y precio propio, si hay demanda.
4. **Fase 4 — Equipo interno, solo si lo piden:** horarios, ausencias y aprobaciones quedan en el radar hasta que un cliente de FieldOS/GarageOS lo solicite directamente.

Este documento y la maqueta visual son un punto de partida para decidir el alcance de la Fase 1 antes de tocar el sitio en vivo.
