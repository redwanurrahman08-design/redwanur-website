/* =========================================
   REDWANUR — script.js (FINAL)
   Hosting: GitHub Pages (static)
   VIP form sending: FormSubmit (FREE)
   VIP inbox: redwanur.vip.bd@gmail.com
   =========================================

   How it works (simple):
   - On your computer (file:///...), VIP sending is blocked.
   - After you upload to GitHub Pages (https://...), VIP sending works.
   - First live test triggers a verification email from FormSubmit.
     Open VIP inbox -> click VERIFY once -> done forever.
*/

const VIP_RECEIVE_EMAIL = "redwanur.vip.bd@gmail.com";
const VIP_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(VIP_RECEIVE_EMAIL)}`;

function $(sel, root = document){ return root.querySelector(sel); }
function $all(sel, root = document){ return [...root.querySelectorAll(sel)]; }

function toast(msg){
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3800);
}

document.addEventListener("DOMContentLoaded", () => {
  // Set footer year
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  if (menuBtn && mobileMenu){
    menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("open"));
    $all("#mobileMenu a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));
  }

  // Reveal animations
  setupReveal();

  // VIP forms
  setupVipForms();

  // Lightbox (Collections)
  setupLightbox();
});

function setupReveal(){
  const els = $all(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}

function setupVipForms(){
  const forms = $all('form[data-vip-form]');
  if (!forms.length) return;

  forms.forEach(form => {
    const btn = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-status]');

    // Add hidden fields required by FormSubmit
    // (FormSubmit reads these keys from the POST body)
    const ensureHidden = (name, value) => {
      let el = form.querySelector(`input[name="${name}"]`);
      if (!el){
        el = document.createElement("input");
        el.type = "hidden";
        el.name = name;
        form.appendChild(el);
      }
      el.value = value;
    };

    ensureHidden("_subject", "REDWANUR — New VIP Signup");
    ensureHidden("_template", "table");
    ensureHidden("_captcha", "false");

    // Anti-bot honeypot field
    if (!form.querySelector('input[name="_honey"]')){
      const honey = document.createElement("input");
      honey.type = "text";
      honey.name = "_honey";
      honey.style.display = "none";
      form.appendChild(honey);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // VIP sending only works on a real website (GitHub Pages), not file://
      if (location.protocol === "file:") {
        toast("VIP will work after you publish on GitHub Pages.");
        if (status) status.textContent = "Publish to GitHub Pages to activate VIP sending.";
        return;
      }

      const name  = (form.querySelector('[name="name"]')?.value || "").trim();
      const email = (form.querySelector('[name="email"]')?.value || "").trim();
      const phone = (form.querySelector('[name="phone"]')?.value || "").trim();
      const city  = (form.querySelector('[name="city"]')?.value || "").trim();

      if (!email){
        toast("Please enter your email.");
        if (status) status.textContent = "Email is required.";
        return;
      }

      const payload = new FormData();
      payload.append("name", name);
      payload.append("email", email);
      payload.append("phone", phone);
      payload.append("city", city);
      payload.append("_subject", "REDWANUR — New VIP Signup");
      payload.append("_template", "table");
      payload.append("_captcha", "false");

      if (btn){
        btn.disabled = true;
        btn.style.opacity = ".7";
        btn.textContent = "Joining…";
      }
      if (status) status.textContent = "";

      try{
        const res = await fetch(VIP_ENDPOINT, {
          method: "POST",
          body: payload,
          headers: { "Accept": "application/json" }
        });

        if (!res.ok) throw new Error("VIP request failed");

        toast("VIP joined. We will message you before launch.");
        if (status) status.textContent = "Done. You’re on the VIP list.";
        form.reset();

        /* One-time note:
           First time on the LIVE site, FormSubmit will email the VIP inbox
           asking you to verify. Open redwanur.vip.bd@gmail.com and click VERIFY once.
        */
      }catch(err){
        toast("Could not join VIP. Please try again.");
        if (status) status.textContent = "Error. Please try again.";
      }finally{
        if (btn){
          btn.disabled = false;
          btn.style.opacity = "";
          btn.textContent = "Join VIP";
        }
      }
    });
  });
}

function setupLightbox(){
  const lb = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbTitle = $("#lightboxTitle");
  const lbClose = $("#lightboxClose");

  // If the page doesn't have lightbox HTML, do nothing
  if (!lb || !lbImg) return;

  function open(src, title){
    lbImg.src = src;
    if (lbTitle) lbTitle.textContent = title || "PREVIEW";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close(){
    lb.classList.remove("open");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  // Attach to thumbnails
  $all("[data-lightbox]").forEach(el => {
    el.addEventListener("click", () => {
      const src = el.getAttribute("data-src");
      const title = el.getAttribute("data-title");
      if (src) open(src, title);
    });
  });

  if (lbClose) lbClose.addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}