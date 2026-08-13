# Investigación: estructura de categorías de Odoo aplicada a GABAN

**Fecha:** agosto 2026 (v3 — corregida con auditoría directa de los 7 repos de GitHub)
**Objetivo:** investigar cómo Odoo organiza su tienda de apps (apps.odoo.com) en un formato tipo "shopping cart", identificar qué de eso ya construyó GABAN en proyectos reales, y proponer una estructura de catálogo más amigable para clientes y mejor para SEO.

Maqueta visual interactiva de la propuesta: ver artefacto publicado en la conversación ("Catálogo GABAN") — construida sobre la v2; los hallazgos de la v3 (abajo) todavía no están reflejados ahí.

> **Corrección v2:** la v1 trataba a FieldOS como un producto "disponible" equivalente a GarageOS. **FieldOS no existe** — solo GarageOS es real. A cambio, GarageOS ya cubre más terreno del que el sitio muestra hoy, y dos capacidades probadas en proyectos de cliente reales no se habían detectado porque solo viven dentro de `portfolio.html`, desconectadas de la oferta de venta.
>
> **Corrección v3:** una auditoría directa de los 7 repos de GitHub confirma y profundiza lo anterior, y suma dos proyectos que no se habían considerado:
> - El repo real de "GarageOS" se llama **`Mecanico_Management`** en GitHub. Su alcance es mayor al documentado: genera **facturas PDF con numeración automática y cálculo de TPS/TVQ** (impuestos de Quebec), y sus recordatorios de citas/mantenimiento son **multilingües (ES/EN/FR) por email y SMS**, con confirmaciones y cancelaciones automáticas.
> - **Montreal Spider Co.** — e-commerce bilingüe para un criador de tarántulas, con operación de **consignación con distribuidores, inventario por ejemplar, ubicaciones de almacén y códigos QR**. Storefront completo, pero pagos/autenticación/persistencia de órdenes **aún no están conectados a producción** — es capacidad construida, no capacidad probada en vivo como GarageOS/RCR/Reptiles Concept.
> - **Taller Arquitectura Regional** — sitio institucional para un estudio de arquitectura. Abre un tipo de cliente (consultoría/estudio de alto valor) que hoy no aparece en ningún lado del portafolio de GABAN.
> - El módulo real que se construyó para RCR es más amplio de lo que su nombre de marketing sugiere — ver nota en la sección 2.

---

## 1. Cómo categoriza Odoo su tienda de apps

Odoo vende 80+ aplicaciones agrupadas en 8 categorías, self-serve: el cliente activa la app y se configura solo, sin nadie construyéndosela a medida.

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

## 2. Qué construyó GABAN realmente (diagnóstico corregido)

Basado en **Mecanico_Management** (el repo real detrás de "GarageOS"), el e-commerce de **Reptiles Concept** (catálogo bilingüe, checkout, pagos Stripe/Klarna, cuentas de cliente, sync en tiempo real con terminal Clover POS, ledger financiero, campañas de email), el módulo de **RCR Barbería** (Firebase/Firestore: catálogo de productos, transacciones, generación y lectura de QR, generación de códigos de barra), y **Montreal Spider Co.** (e-commerce bilingüe + operación de consignación con distribuidores, construido pero con integraciones de producción pendientes):

| Categoría Odoo | Estado en GABAN | Dónde vive hoy |
|---|---|---|
| Sitios web | ✅ Cubierto | Núcleo de GABAN Digital: Websites, Landing Pages, Launch 72H, Grow Package |
| Sitios web → eCommerce | ✅ Probado | Reptiles Concept (producción). Montreal Spider Co. (construido, integraciones pendientes). Ninguno se ofrece como servicio, solo como caso de portafolio |
| Finanzas | ✅ Probado, más fuerte de lo pensado | Mecanico_Management genera **facturas PDF con numeración automática y TPS/TVQ**, más métricas de ingresos/facturas pendientes y documentos para el contador. Reptiles Concept tiene ledger unificado con cálculo de impuestos |
| Marketing → Email Marketing | ✅ Probado | Mecanico_Management y Reptiles Concept ya envían campañas/recordatorios reales — Mecanico_Management además es **multilingüe (ES/EN/FR)** por email y SMS |
| Ventas → CRM | 🟡 Parcial | Base de clientes embebida en Mecanico_Management y Reptiles Concept; búsqueda por nombre/correo/teléfono ya existe. No se vende como CRM aparte |
| Ventas → TPV / Inventario | 🟡 Parcial (RCR en producción) / ⚪ Construido sin conectar (Montreal Spider Co.) | RCR: catálogo + código de barras + QR + transacciones, en producción. Montreal Spider Co.: inventario por ejemplar, ubicaciones de almacén, consignación con socios, propuestas de reabastecimiento — construido, no en producción todavía |
| Servicios → Citas | 🟡 Parcial | Citas reales dentro de Mecanico_Management, con confirmaciones/cancelaciones automáticas. "Servicio de campo" (FieldOS) es concepto, no producto |
| Recursos Humanos / Productividad | ⚪ No cubierto | Sin cambios; no es prioridad para el modelo actual |

**El patrón importa más que cada fila:** GABAN ya construyó, en al menos un proyecto real, piezas de 6 de las 8 categorías de Odoo — solo que quedaron enterradas dentro de cuatro entregas de cliente en vez de mostrarse como capacidades propias.

**Nota — "Smart Links" se queda corto:** lo que GABAN vende hoy como "Smart Links" (un lugar para contacto, redes y mapa) es mucho menos de lo que realmente se construyó para RCR: ese módulo real incluye generación y lectura de códigos QR, generación de códigos de barra, catálogo de productos y transacciones sobre Firebase/Firestore. El nombre de marketing no refleja la capacidad real.

---

## 3. Posicionamiento: Odoo es self-serve, GABAN es a la medida

En Odoo el cliente se auto-configura; si algo no encaja, se adapta él al software. En GABAN nadie se auto-configura nada: cada capacidad nació de resolverle algo exacto a un negocio real. Eso es ventaja de venta, no limitación — no se vende "un módulo de CRM", se enseña "así resolvimos el seguimiento de clientes para RCR" y se ofrece lo mismo adaptado.

Esto cambia el catálogo: cada tarjeta no lleva un botón de "Instalar", lleva **"Ver caso real"** + **"Cotizar para tu negocio"**. El catálogo funciona como embudo hacia la cita, no como tienda de autoservicio.

---

## 4. Propuesta de catálogo GABAN (con prueba real por categoría)

1. **🌐 Presencia Digital** — *Negocio principal*: Sitios web, Landing Pages, SEO Local, Perfil de Google Business, Flujo de Reseñas, Smart Links
2. **🛒 E-commerce a Medida** — *Ya lo construimos (Reptiles Concept)*: catálogo bilingüe, checkout + pagos, cuentas de cliente, sync POS en tiempo real, impuestos automáticos
3. **🏷️ Punto de Venta y Catálogo** — *Ya lo construimos (RCR)*: catálogo estático, código de barras, transacciones diarias, segmento de finanzas — **caso sin documentar aún**
4. **🧾 Finanzas y Facturación** — *Ya lo construimos*: cotización → factura y finanzas completas (GarageOS), ledger unificado (Reptiles) · *Por extraer*: facturación standalone
5. **📣 Marketing y Campañas de Email** — *Ya lo construimos*: envío de campañas real (GarageOS/Reptiles), formularios, seguimiento · *Concepto*: SMS marketing
6. **🧰 Software a Medida por Industria** — *Negocio principal*: GarageOS es el producto real; "el siguiente vertical" se vende como patrón replicable, no como FieldOS ya construido
7. **👥 Clientes y Ventas (CRM)** — *Por extraer*: embebido en GarageOS y Reptiles Concept; falta venderlo standalone
8. **🗂️ Equipo y Operación Interna** — *Fase futura, bajo demanda*: horario, ausencias — ideas, no roadmap

---

## 5. Quick wins (bajo esfuerzo, sin construir nada nuevo)

1. **Documentar el admin de RCR en el portafolio** — esfuerzo bajo, impacto medio. Ya existe la plantilla (`docs/NEW_PROJECT_SHOWCASE.md`); es solo escribir el caso.
2. **Convertir Reptiles Concept de "caso de estudio" a "servicio vendible"** — esfuerzo bajo-medio, impacto alto. Enlazarlo desde `digital.html`/`software.html`, no solo dejarlo en `portfolio.html`.
3. **Corregir el estatus de FieldOS** — esfuerzo bajo, impacto alto. El badge "Founder clients / demo available" en `software.html` aplica igual a GarageOS (real) que a FieldOS (concepto); si un lead agenda esperando ver FieldOS, no hay nada que mostrar. Cambiar a algo tipo "Próxima industria — cuéntanos tu caso".
4. **Subirle a la descripción real de GarageOS** — esfuerzo bajo, impacto medio. Hoy no menciona explícitamente finanzas completas ni campañas de email, escondidas dentro de "Payments-ready workflow".
5. **Renombrar "GABAN Software: SaaS Platforms"** — esfuerzo bajo, impacto medio. "SaaS" suena a auto-configuración estilo Odoo; el modelo real es "te lo construimos y lo operamos contigo".
6. **Documentar Taller Arquitectura Regional en el portafolio** — esfuerzo bajo, impacto medio. Abre un tipo de cliente (estudio/consultoría de alto valor) que hoy no aparece en ningún lado del sitio — buen contrapeso a los casos de retail y servicio local que ya existen.
7. **Ampliar el copy de "Smart Links"** — esfuerzo bajo, impacto medio. Hoy se describe como "un lugar para contacto, redes y mapa"; lo construido para RCR incluye QR, códigos de barra, catálogo y transacciones. El nombre y la descripción deberían reflejar eso, no una versión reducida.

---

## 6. Nuevas ofertas de bajo esfuerzo (no son ajustes de copy, son productos que hoy no existen)

A diferencia de la sección 5 (reordenar/corregir lo que ya se vende), esto son **productos que hoy no aparecen en ningún catálogo de GABAN**, pero que reutilizan un motor que ya corre en producción — solo que hoy solo lo usa GABAN internamente, no un cliente.

1. **Sistema de citas propio para clientes** — esfuerzo bajo, impacto alto, reutiliza el motor de `book.html`/`booking/`. Ya es un Calendly self-hosted en producción (disponibilidad configurable, confirmación con .ics, notificaciones por correo, panel de cancelar/bloquear) — solo se usa para las consultas de GABAN. Reconfigurarlo con la marca y horario de un cliente es casi el mismo trabajo ya hecho. *Pitch: "Deja de pagarle $30–50/mes a Calendly — te damos tu propio sistema de citas."*
2. **Blog / contenido SEO como add-on de Presencia Digital** — esfuerzo bajo, impacto medio, reutiliza el motor de `blog/` + `admin/blog.html`. Ya funciona para el contenido propio de GABAN; conectarlo al dominio de un cliente es configuración, no desarrollo desde cero.
3. **Botón de pago o depósito en línea sin tienda completa** — esfuerzo bajo-medio, impacto alto, reutiliza la integración Stripe/Klarna de Reptiles Concept. No hace falta un e-commerce entero para reutilizar solo el checkout — útil para depósitos de cita o pago de facturas de cualquier cliente de servicio.
4. **Catálogo digital ligero — "Ver y pedir por WhatsApp"** — esfuerzo medio, impacto alto, reutiliza el componente de catálogo de Reptiles Concept/RCR sin el checkout ni el sync de POS. Mucho más barato que un e-commerce completo.
5. **Recordatorios y confirmaciones automáticas, sueltos** — esfuerzo bajo, impacto medio, reutiliza los recordatorios ya listos de GarageOS. Vendible a cualquier negocio que solo quiere reducir ausencias, sin comprar un sistema de gestión completo.
6. **Digitalización de inventario con código de barras — servicio único** — esfuerzo bajo, impacto medio, reutiliza el generador de barcode construido para RCR. Vendible como servicio de una sola visita, sin suscripción.
7. **Pedidos en línea para recoger en tienda** — esfuerzo medio, impacto alto, reutiliza el patrón de pickup + seguimiento de estado de Reptiles Concept. Ideal para panaderías, restaurantes y tiendas de barrio sin logística de envío.

**Idea grande, no quick win:** el motor de `leadgen/` (prospección en Google Maps, scoring, propuesta personalizada) hoy es "herramienta interna" según su propio README. Ofrecerlo como servicio de generación de leads a negocios B2B sería un producto nuevo real — no una reconfiguración de algo existente, así que no cuenta como bajo esfuerzo, pero vale la pena anotarlo.

**Otra idea para el radar, no quick win todavía:** Montreal Spider Co. demuestra inventario con seguimiento por unidad + QR + consignación con distribuidores — un patrón que podría convertirse en oferta para negocios de consignación (arte, plantas, coleccionables). Pero como sus integraciones de pago/autenticación/persistencia todavía no están conectadas a producción, no califica como "ya lo construimos y funciona" igual que RCR o Reptiles Concept — primero necesita salir en vivo para su propio cliente antes de revenderse como capacidad de GABAN.

---

## 7. Lenguaje: del término técnico al beneficio del dueño de negocio

| Categoría técnica | Cómo lo dice Odoo | Cómo debería sonar en GABAN |
|---|---|---|
| CRM | Customer Relationship Management | "Nunca más pierdas el rastro de un cliente" |
| Facturación / Finanzas | Invoicing & Accounting | "Cobra rápido, sin Excel ni papeles sueltos" |
| Email Marketing | Email Marketing Automation | "Que tus clientes vuelvan solos" |
| eCommerce | eCommerce Platform | "Vende en línea mientras duermes" |
| POS / Inventario | Point of Sale + Inventory | "Tu mostrador, ordenado y con código de barras" |
| Servicio de campo | Field Service Management | "Tu equipo en la calle, coordinado desde el celular" |
| Citas | Appointments / Scheduling | "Que agenden solos, sin llamadas de ida y vuelta" |

---

## 8. Por qué esta estructura ayuda al SEO

- **Más puertas de entrada (long-tail):** hoy GABAN no tiene página para búsquedas como "tienda en línea sincronizada con caja Clover" o "software de punto de venta con código de barras" — categorías nuevas que antes no existían en el sitio.
- **Autoridad temática:** la jerarquía categoría → subcategoría → servicio le muestra a Google cómo se relaciona todo.
- **Prueba social por capacidad:** un enlace directo a "Ver caso real: Reptiles Concept" desde una página de servicio funciona como reseña, y refuerza el enlazado interno.
- **Menos rebote:** un catálogo navegable como tienda reduce fricción.

---

## 9. Roadmap sugerido — orden de implementación

El orden no es por sección del documento, es por **riesgo, dependencia y a quién le vendes**. Regla general: primero lo que es solo escritura y cero riesgo, después lo que se vende a la base de clientes que ya existe (sin nueva página de marketing), después lo que abre un segmento de cliente nuevo, y solo al final la reestructura grande del sitio — porque para entonces ya se sabe qué categorías tuvieron demanda real y vale la pena documentar con su propia URL. `leadgen/` como producto queda fuera de este roadmap a propósito (ver nota al final de la sección 6).

**Fase 0 — Higiene de confianza (horas, no días)**
- Corregir el badge de FieldOS en `software.html`. Va primero y solo porque es el único ítem con riesgo activo: cada día que sigue así, un lead puede agendar esperando ver algo que no existe.

**Fase 1 — Documentar y conectar lo que ya se vende (misma semana)**
- Caso de RCR en `portfolio.html` (plantilla ya existe)
- Cross-link de Reptiles Concept como servicio, no solo caso de estudio
- Descripción real de GarageOS (finanzas + email marketing)
- Renombrar "GABAN Software: SaaS Platforms"
- Todo esto es solo escritura — cero decisiones de producto nuevo, cero riesgo técnico. Sirve además como validación: mejor corregir la percepción de lo que ya existe antes de anunciar algo nuevo encima.

**Fase 2 — Upsell a la base actual, no lanzamiento nuevo (2-4 semanas, 1-2 ofertas a la vez, no las 7)**
- Empezar por **blog/SEO** y **botón de pago o depósito** — ambas se venden al mismo cliente que ya existe (Grow Package, GarageOS), sin página de marketing nueva, casi un correo o llamada de upsell.
- Recordatorios sueltos como tercera opción si hay ancho de banda — mismo patrón de upsell.
- Por qué antes que las demás: no requieren abrir un segmento de cliente nuevo ni una landing page nueva, solo activar algo que ya funciona con quien ya paga.

**Fase 3 — Un solo producto para segmento nuevo, no los tres a la vez**
- De las opciones que sí abren un cliente nuevo (citas propias, catálogo ligero "pide por WhatsApp", pickup en tienda, digitalización con barcode), elegir **una** para pilotar — recomendado: **citas propias**, porque es la de menor fricción real (cero integración nueva, ya en producción, solo reconfigurar marca/horario) y el dolor que resuelve ("deja de pagarle a Calendly") se explica en una frase.
- Requiere: una landing page nueva, precio definido, 1-2 clientes piloto antes de anunciarlo ampliamente.

**Fase 4 — Recién ahora, la reestructura grande del catálogo**
- Con datos reales de qué se vendió en las fases 2-3, reorganizar `services.html`/`digital.html`/`software.html` en las categorías de la sección 4, con URL propia por subcategoría. Hacerlo antes sería adivinar qué categorías merecen su propia página; hacerlo ahora es documentar demanda ya probada.

**Fase 5 — Productizar CRM y Facturación como standalone**
- El trabajo más grande: extraer de GarageOS/Reptiles Concept la parte genérica (sin lo específico de taller o e-commerce) para venderla sola. Solo tiene sentido si las fases 2-4 muestran que hay negocios pidiendo "solo quiero el CRM/la facturación, no todo el vertical".

**Fase 6 — Equipo interno / RRHH**
- Sin fecha. Solo si un cliente de FieldOS-concepto o GarageOS lo pide directamente.
