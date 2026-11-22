// Discovery assistant widget (EN/FR/ES). Guided steps, then POST to
// /api/assistant/discover. All server text is rendered with textContent.
(function () {
  const root = document.getElementById("discovery-assistant");
  if (!root) return;

  const D = {
    en: {
      title: "Find the right option in 2 minutes", sub: "Six quick questions → an orientative estimate and next steps. No call needed.",
      next: "Next", back: "Back", send: "Get my estimate", start: "Start",
      q: [
        "What kind of business do you run?", "What do you need?", "Do you already have a domain and branding?",
        "Which languages should the site be in?", "When do you need it?", "Anything else we should know? (optional)"
      ],
      ph: ["e.g. restaurant, auto repair, clinic…", "", "", "", "", "Tell us the idea in your own words"],
      need: { informative: "A website that presents my business", redesign: "Improve my current website", ecommerce: "An online store", custom_app: "Custom software / app", unsure: "Not sure yet" },
      assets: { both: "Yes, both", domain: "Domain only", identity: "Branding only", none: "Neither yet" },
      langs: { en: "English", fr: "Français", es: "Español" }, langsHint: "Pick all that apply (Québec customers usually need French).",
      time: { asap: "As soon as possible", month: "Within a month", flexible: "No rush" },
      name: "Your name", contact: "Email or phone", sending: "Sending…",
      done: "Your orientative estimate", mailed: "We also sent a copy to your email.", steps: "Suggested next steps", book: "Book a free call", err: "Something went wrong. Please try the contact form below.", limit: "Too many attempts — please try later or use the form below."
    },
    fr: {
      title: "Trouvez la bonne option en 2 minutes", sub: "Six questions rapides → une estimation indicative et les prochaines étapes. Sans appel.",
      next: "Suivant", back: "Retour", send: "Obtenir mon estimation", start: "Commencer",
      q: [
        "Quel type d'entreprise dirigez-vous ?", "De quoi avez-vous besoin ?", "Avez-vous déjà un domaine et une identité visuelle ?",
        "Dans quelles langues le site doit-il être ?", "Pour quand en avez-vous besoin ?", "Autre chose à savoir ? (facultatif)"
      ],
      ph: ["ex. restaurant, garage, clinique…", "", "", "", "", "Décrivez votre idée avec vos mots"],
      need: { informative: "Un site qui présente mon entreprise", redesign: "Améliorer mon site actuel", ecommerce: "Une boutique en ligne", custom_app: "Logiciel / application sur mesure", unsure: "Je ne sais pas encore" },
      assets: { both: "Oui, les deux", domain: "Domaine seulement", identity: "Identité seulement", none: "Aucun des deux" },
      langs: { en: "English", fr: "Français", es: "Español" }, langsHint: "Choisissez tout ce qui s'applique (la clientèle québécoise exige généralement le français).",
      time: { asap: "Le plus vite possible", month: "D'ici un mois", flexible: "Pas pressé" },
      name: "Votre nom", contact: "Courriel ou téléphone", sending: "Envoi…",
      done: "Votre estimation indicative", mailed: "Nous vous en avons aussi envoyé une copie par courriel.", steps: "Prochaines étapes suggérées", book: "Réserver un appel gratuit", err: "Une erreur est survenue. Essayez le formulaire ci-dessous.", limit: "Trop de tentatives — réessayez plus tard ou utilisez le formulaire ci-dessous."
    },
    es: {
      title: "Encuentra la opción correcta en 2 minutos", sub: "Seis preguntas rápidas → un estimado orientativo y siguientes pasos. Sin llamada.",
      next: "Siguiente", back: "Atrás", send: "Obtener mi estimado", start: "Empezar",
      q: [
        "¿Qué tipo de negocio tienes?", "¿Qué necesitas?", "¿Ya tienes dominio e identidad de marca?",
        "¿En qué idiomas debe estar el sitio?", "¿Para cuándo lo necesitas?", "¿Algo más que debamos saber? (opcional)"
      ],
      ph: ["ej. restaurante, taller, clínica…", "", "", "", "", "Cuéntanos la idea con tus palabras"],
      need: { informative: "Un sitio que presente mi negocio", redesign: "Mejorar mi sitio actual", ecommerce: "Una tienda en línea", custom_app: "Software / app a medida", unsure: "Aún no estoy seguro" },
      assets: { both: "Sí, ambos", domain: "Solo dominio", identity: "Solo identidad", none: "Ninguno todavía" },
      langs: { en: "English", fr: "Français", es: "Español" }, langsHint: "Elige todos los que apliquen (clientes en Québec normalmente requieren francés).",
      time: { asap: "Lo antes posible", month: "En un mes", flexible: "Sin prisa" },
      name: "Tu nombre", contact: "Correo o teléfono", sending: "Enviando…",
      done: "Tu estimado orientativo", mailed: "También te enviamos una copia a tu correo.", steps: "Siguientes pasos sugeridos", book: "Agendar llamada gratis", err: "Algo salió mal. Prueba el formulario de abajo.", limit: "Demasiados intentos — intenta más tarde o usa el formulario de abajo."
    }
  };

  const ans = { businessType: "", need: "", assets: "", languages: [], timeline: "", description: "" };
  const lead = { name: "", contact: "" };
  let step = -1; // -1 = intro, 0..5 questions, 6 = contact, 7 = result

  const lang = () => { try { const l = localStorage.getItem("siteLang"); return D[l] ? l : "en"; } catch (e) { return "en"; } };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  function chips(options, labels, isSelected, onPick) {
    const wrap = el("div", "d-flex flex-wrap gap-2");
    options.forEach(v => {
      const b = el("button", "btn " + (isSelected(v) ? "btn-dark" : "btn-outline-dark"), labels[v]);
      b.type = "button";
      b.addEventListener("click", () => onPick(v));
      wrap.appendChild(b);
    });
    return wrap;
  }

  function nav(t, canNext, onNext, nextLabel) {
    const row = el("div", "d-flex justify-content-between mt-4");
    const back = el("button", "btn btn-link text-decoration-none", t.back); back.type = "button";
    back.addEventListener("click", () => { step -= 1; render(); });
    const next = el("button", "btn btn-dark", nextLabel || t.next); next.type = "button"; next.disabled = !canNext;
    next.addEventListener("click", onNext);
    row.append(back, next);
    return row;
  }

  function render() {
    const t = D[lang()];
    const card = el("div", "card border-0 shadow-sm");
    const body = el("div", "card-body p-4");
    card.appendChild(body);
    root.replaceChildren(card);

    if (step === -1) {
      body.append(el("h2", "h4 fw-bold mb-2", t.title), el("p", "text-muted mb-3", t.sub));
      const go = el("button", "btn btn-dark", t.start); go.type = "button";
      go.addEventListener("click", () => { step = 0; render(); });
      body.appendChild(go);
      return;
    }

    if (step <= 5) {
      body.append(el("div", "small text-muted mb-1", (step + 1) + " / 6"), el("h2", "h5 fw-bold mb-3", t.q[step]));
      const rerender = () => render();
      if (step === 0 || step === 5) {
        const field = step === 0 ? el("input", "form-control") : el("textarea", "form-control");
        if (step === 5) field.rows = 4;
        field.maxLength = step === 0 ? 80 : 800;
        field.placeholder = t.ph[step];
        field.value = step === 0 ? ans.businessType : ans.description;
        field.addEventListener("input", () => { if (step === 0) { ans.businessType = field.value; nextBtn.disabled = !field.value.trim(); } else ans.description = field.value; });
        body.appendChild(field);
        const n = nav(t, step === 5 || !!ans.businessType.trim(), () => { step += 1; render(); });
        var nextBtn = n.lastChild;
        body.appendChild(n);
      } else if (step === 1) {
        body.appendChild(chips(Object.keys(t.need), t.need, v => ans.need === v, v => { ans.need = v; step += 1; rerender(); }));
        body.appendChild(nav(t, !!ans.need, () => { step += 1; render(); }));
      } else if (step === 2) {
        body.appendChild(chips(Object.keys(t.assets), t.assets, v => ans.assets === v, v => { ans.assets = v; step += 1; rerender(); }));
        body.appendChild(nav(t, !!ans.assets, () => { step += 1; render(); }));
      } else if (step === 3) {
        body.appendChild(el("p", "small text-muted", t.langsHint));
        body.appendChild(chips(["en", "fr", "es"], t.langs, v => ans.languages.includes(v), v => {
          ans.languages = ans.languages.includes(v) ? ans.languages.filter(x => x !== v) : ans.languages.concat(v); rerender();
        }));
        body.appendChild(nav(t, ans.languages.length > 0, () => { step += 1; render(); }));
      } else if (step === 4) {
        body.appendChild(chips(Object.keys(t.time), t.time, v => ans.timeline === v, v => { ans.timeline = v; step += 1; rerender(); }));
        body.appendChild(nav(t, !!ans.timeline, () => { step += 1; render(); }));
      }
      return;
    }

    if (step === 6) {
      const name = el("input", "form-control mb-2"); name.placeholder = t.name; name.maxLength = 120; name.autocomplete = "name"; name.value = lead.name;
      const contact = el("input", "form-control mb-2"); contact.placeholder = t.contact; contact.maxLength = 160; contact.autocomplete = "email"; contact.value = lead.contact;
      const trap = el("input", "d-none"); trap.tabIndex = -1; trap.autocomplete = "off"; trap.setAttribute("aria-hidden", "true");
      const err = el("div", "text-danger small mt-2");
      const n = nav(t, false, submit, t.send);
      const sync = () => { lead.name = name.value; lead.contact = contact.value; n.lastChild.disabled = !(lead.name.trim() && lead.contact.trim()); };
      name.addEventListener("input", sync); contact.addEventListener("input", sync);
      body.append(name, contact, trap, n, err);
      sync();

      async function submit() {
        n.lastChild.disabled = true; n.lastChild.textContent = t.sending; err.textContent = "";
        try {
          const res = await fetch("/api/assistant/discover", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang: lang(), answers: ans, lead, company_website: trap.value })
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) { err.textContent = res.status === 429 ? t.limit : t.err; n.lastChild.disabled = false; n.lastChild.textContent = t.send; return; }
          result = data; step = 7; render();
        } catch (e) { err.textContent = t.err; n.lastChild.disabled = false; n.lastChild.textContent = t.send; }
      }
      return;
    }

    // result
    body.appendChild(el("h2", "h4 fw-bold mb-3", t.done));
    if (result.summary) body.appendChild(el("p", "", result.summary));
    const ul = el("ul", "mb-3"); result.estimate.lines.forEach(l => ul.appendChild(el("li", "", l))); body.appendChild(ul);
    if (result.estimate.notice) body.appendChild(el("div", "alert alert-warning small", result.estimate.notice));
    body.appendChild(el("h3", "h6 fw-bold", t.steps));
    const ol = el("ol", "mb-3"); result.estimate.steps.forEach(s => ol.appendChild(el("li", "", s))); body.appendChild(ol);
    const a = el("a", "btn btn-dark", t.book); a.href = "/book"; body.appendChild(a);
    if (result.emailed) body.appendChild(el("p", "small text-muted mt-3 mb-0", t.mailed));
  }

  let result = null;
  render();
})();
