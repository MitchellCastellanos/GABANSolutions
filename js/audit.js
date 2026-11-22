// Express site audit widget (EN/FR/ES). Server text rendered via textContent only.
(function () {
  const root = document.getElementById("site-audit");
  if (!root) return;
  const D = {
    en: { title: "Free 30-second website check", sub: "Paste your site address and get a quick read on message clarity, mobile, basic SEO and bilingual presence.", ph: "yourbusiness.com", go: "Check my site", busy: "Checking…", score: "Overall", ok: "Looks good", book: "Book a free call", err: "We couldn't read that page. Check the address and try again.", limit: "Too many checks — please try again later." },
    fr: { title: "Vérification gratuite de votre site en 30 secondes", sub: "Collez l'adresse de votre site : clarté du message, mobile, SEO de base et présence bilingue.", ph: "votreentreprise.com", go: "Vérifier mon site", busy: "Vérification…", score: "Global", ok: "Bien", book: "Réserver un appel gratuit", err: "Impossible de lire cette page. Vérifiez l'adresse et réessayez.", limit: "Trop de vérifications — réessayez plus tard." },
    es: { title: "Revisión gratis de tu sitio en 30 segundos", sub: "Pega la dirección de tu sitio: claridad del mensaje, móvil, SEO básico y presencia bilingüe.", ph: "tunegocio.com", go: "Revisar mi sitio", busy: "Revisando…", score: "General", ok: "Bien", book: "Agendar llamada gratis", err: "No pudimos leer esa página. Revisa la dirección e inténtalo de nuevo.", limit: "Demasiadas revisiones — intenta más tarde." }
  };
  const lang = () => { try { const l = localStorage.getItem("siteLang"); return D[l] ? l : "en"; } catch (e) { return "en"; } };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  const t = D[lang()];
  const card = el("div", "card border-0 shadow-sm"), body = el("div", "card-body p-4"); card.appendChild(body);
  const form = el("form", "d-flex flex-column flex-sm-row gap-2"); form.noValidate = true;
  const input = el("input", "form-control"); input.type = "text"; input.placeholder = t.ph; input.maxLength = 2048; input.autocomplete = "url"; input.setAttribute("aria-label", t.title);
  const trap = el("input", "d-none"); trap.tabIndex = -1; trap.autocomplete = "off"; trap.setAttribute("aria-hidden", "true");
  const btn = el("button", "btn btn-dark text-nowrap", t.go); btn.type = "submit";
  form.append(input, trap, btn);
  const out = el("div", "mt-3"); out.setAttribute("aria-live", "polite");
  body.append(el("h2", "h4 fw-bold mb-2", t.title), el("p", "text-muted mb-3", t.sub), form, out);
  root.replaceChildren(card);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!input.value.trim()) return;
    const T = D[lang()];
    btn.disabled = true; btn.textContent = T.busy; out.replaceChildren();
    try {
      const res = await fetch("/api/assistant/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: input.value, lang: lang(), company_website: trap.value }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { out.appendChild(el("div", "text-danger", res.status === 429 ? T.limit : (data.error || T.err))); return; }
      out.appendChild(el("div", "h5", T.score + ": " + data.overall + " / 100"));
      if (data.summary) out.appendChild(el("p", "", data.summary));
      data.categories.forEach(c => {
        const row = el("div", "mb-2"); row.appendChild(el("div", "fw-semibold", c.label + " — " + c.score + "/100"));
        if (!c.findings.length) row.appendChild(el("div", "small text-muted", T.ok));
        else { const ul = el("ul", "small mb-0"); c.findings.forEach(f => ul.appendChild(el("li", "", f.text))); row.appendChild(ul); }
        out.appendChild(row);
      });
      out.appendChild(el("p", "mt-3 mb-2", data.cta));
      const a = el("a", "btn btn-dark", T.book); a.href = "/book"; out.appendChild(a);
    } catch (err) { out.appendChild(el("div", "text-danger", T.err)); }
    finally { btn.disabled = false; btn.textContent = D[lang()].go; }
  });
})();
