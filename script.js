/**
 * HECF Smart Campus — script.js v2.0
 * Production-ready JavaScript
 * Sections: Navigation · Animations · Forms · FAQ · Counter · Utils
 */

'use strict';

/* ==========================================
   NAVIGATION
   ========================================== */

function scrollTo(id) {
  var el = document.getElementById(id);
  if (!el) return;
  var offset = 90;
  var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: top, behavior: 'smooth' });
  // Close mobile menu
  var m = document.getElementById('mobileMenu');
  if (m && m.classList.contains('open')) toggleMobileMenu();
}

function toggleMobileMenu() {
  var m = document.getElementById('mobileMenu');
  var btn = document.getElementById('hamburger');
  if (!m || !btn) return;
  var isOpen = m.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  document.documentElement.style.overflowY = isOpen ? 'hidden' : '';
  // Animate hamburger
  var spans = btn.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
}

/* Scroll handler with rAF throttle */
var _scrollTicking = false;
function onScroll() {
  if (!_scrollTicking) {
    _scrollTicking = true;
    requestAnimationFrame(function () {
      updateNav();
      updateActiveNavLink();
      updateBackToTop();
      _scrollTicking = false;
    });
  }
}

function updateNav() {
  var nav = document.getElementById('mainNav');
  if (!nav) return;
  if (window.scrollY > 30) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

function updateActiveNavLink() {
  var sections = ['about', 'formations', 'chiffres', 'temoignages', 'faq', 'contact'];
  var current = '';
  sections.forEach(function (id) {
    var el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(function (l) {
    l.classList.remove('active');
    if (l.getAttribute('onclick') && l.getAttribute('onclick').includes(current)) {
      l.classList.add('active');
    }
  });
}

function updateBackToTop() {
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;
  btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ==========================================
   INTERSECTION OBSERVER — FADE IN
   ========================================== */

var _observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      _observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '-5% 0px -5% 0px', threshold: 0.06 });

function initFadeIns() {
  document.querySelectorAll('.fade-in, .slide-right, .slide-left').forEach(function (el) {
    _observer.observe(el);
  });
}

/* ==========================================
   COUNTER ANIMATION
   ========================================== */

var _counterObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      _counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

function animateCounter(el) {
  var target = parseInt(el.getAttribute('data-count'), 10);
  if (!target) return;
  var start = 0;
  var duration = 2000;
  var startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    var current = Math.floor(eased * target);
    el.textContent = current >= 1000 ? (current).toLocaleString('fr-FR') : current;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target >= 1000 ? target.toLocaleString('fr-FR') : target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  document.querySelectorAll('[data-count]').forEach(function (el) {
    _counterObserver.observe(el);
  });
}

/* ==========================================
   FAQ
   ========================================== */

function toggleFaq(item) {
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function (f) { f.classList.remove('open'); });
  if (!isOpen) item.classList.add('open');
}

/* ==========================================
   MULTI-STEP FORM (inscription.html)
   ========================================== */

var currentStep = 1;

function nextStep(step) {
  if (!validateStep(step)) return;
  goToStep(step);
}

function prevStep(step) {
  // Remove done from next step
  var nextDot = document.getElementById('fp-' + (step + 1));
  if (nextDot) nextDot.classList.remove('done');
  goToStep(step);
}

function goToStep(step) {
  var prevEl = document.getElementById('step-' + currentStep);
  var prevDot = document.getElementById('fp-' + currentStep);
  if (prevEl) prevEl.classList.remove('active');
  if (prevDot) {
    prevDot.classList.remove('active');
    if (step > currentStep) prevDot.classList.add('done');
  }
  currentStep = step;
  var nextEl = document.getElementById('step-' + currentStep);
  var nextDot = document.getElementById('fp-' + currentStep);
  if (nextEl) nextEl.classList.add('active');
  if (nextDot) { nextDot.classList.add('active'); nextDot.classList.remove('done'); }
  var formSection = document.getElementById('form-section');
  if (formSection) window.scrollTo({ top: formSection.offsetTop - 100, behavior: 'smooth' });
}

function validateStep(toStep) {
  if (toStep === 2) {
    var prenom = (document.getElementById('f-prenom') || {}).value || '';
    var nom = (document.getElementById('f-nom') || {}).value || '';
    var email = (document.getElementById('f-email') || {}).value || '';
    var tel = (document.getElementById('f-tel') || {}).value || '';
    if (!prenom.trim() || !nom.trim() || !email.trim() || !tel.trim()) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error'); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Adresse email invalide.', 'error'); return false;
    }
    if (tel.replace(/\D/g, '').length < 7) {
      showToast('Numéro de téléphone invalide.', 'error'); return false;
    }
  }
  if (toStep === 3) {
    var filiere = (document.getElementById('f-filiere') || {}).value || '';
    var niveau = (document.getElementById('f-niveau') || {}).value || '';
    var diplome = (document.getElementById('f-diplome') || {}).value || '';
    if (!filiere || !niveau || !diplome) {
      showToast('Veuillez compléter tous les champs obligatoires de formation.', 'error'); return false;
    }
  }
  return true;
}

function submitForm() {
  var step3 = document.getElementById('step-3');
  var stepSuccess = document.getElementById('step-success');
  var fp3 = document.getElementById('fp-3');
  if (step3) step3.classList.remove('active');
  if (stepSuccess) stepSuccess.classList.add('active');
  if (fp3) { fp3.classList.remove('active'); fp3.classList.add('done'); }
  var ref = 'HECF-2025-' + Math.floor(1000 + Math.random() * 8999);
  var refEl = document.getElementById('ref-number');
  if (refEl) refEl.textContent = 'REF : ' + ref;
  var formSection = document.getElementById('form-section');
  if (formSection) window.scrollTo({ top: formSection.offsetTop - 100, behavior: 'smooth' });
}

function resetForm() {
  var stepSuccess = document.getElementById('step-success');
  if (stepSuccess) stepSuccess.classList.remove('active');
  for (var i = 1; i <= 3; i++) {
    var dot = document.getElementById('fp-' + i);
    if (dot) dot.classList.remove('active', 'done');
    var step = document.getElementById('step-' + i);
    if (step) step.classList.remove('active');
  }
  currentStep = 1;
  var step1 = document.getElementById('step-1');
  var fp1 = document.getElementById('fp-1');
  if (step1) step1.classList.add('active');
  if (fp1) fp1.classList.add('active');
  document.querySelectorAll('.form-input, .form-select').forEach(function (el) {
    if (el.type !== 'file') el.value = '';
  });
}

/* ==========================================
   FRAIS CALCULATOR
   ========================================== */

function calculateFees() {
  var baseAmount = 800000;
  var boursierSelect = document.getElementById('f-boursier');
  var reductionSelect = document.getElementById('f-reduction');
  if (!boursierSelect || !reductionSelect) return;

  var isBoursier = boursierSelect.value === 'oui';
  var hasReduction = reductionSelect.value === 'oui';
  var reductionPercentGroup = document.getElementById('reduction-percent-group');
  if (reductionPercentGroup) reductionPercentGroup.style.display = hasReduction ? 'block' : 'none';

  var scholarshipAmount = isBoursier ? 200000 : 0;
  var reductionAmount = 0;
  if (hasReduction) {
    var pct = parseInt((document.getElementById('f-reduction-percent') || {}).value, 10) || 0;
    reductionAmount = Math.floor((baseAmount - scholarshipAmount) * pct / 100);
  }
  var total = baseAmount - scholarshipAmount - reductionAmount;

  var fraisBoursierDiv = document.getElementById('frais-boursier-div');
  var fraisBoursier = document.getElementById('frais-boursier');
  var fraisReductionDiv = document.getElementById('frais-reduction-div');
  var fraisReduction = document.getElementById('frais-reduction');
  var fraisTotal = document.getElementById('frais-total');

  if (fraisBoursierDiv) fraisBoursierDiv.style.display = isBoursier ? 'flex' : 'none';
  if (fraisBoursier) fraisBoursier.textContent = '- 200 000 FCFA';
  if (fraisReductionDiv) fraisReductionDiv.style.display = (hasReduction && reductionAmount > 0) ? 'flex' : 'none';
  if (fraisReduction) fraisReduction.textContent = '- ' + reductionAmount.toLocaleString('fr-FR') + ' FCFA';
  if (fraisTotal) fraisTotal.textContent = total.toLocaleString('fr-FR') + ' FCFA';
}

/* ==========================================
   PDF RECEIPT DOWNLOAD
   ========================================== */

function downloadReceiptPDF() {
  var refNumber = (document.getElementById('ref-number') || { textContent: '' }).textContent.replace('REF : ', '');
  var prenom = (document.getElementById('f-prenom') || { value: '' }).value;
  var nom = (document.getElementById('f-nom') || { value: '' }).value;
  var email = (document.getElementById('f-email') || { value: '' }).value;
  var tel = (document.getElementById('f-tel') || { value: '' }).value;
  var filiere = (document.getElementById('f-filiere') || { value: '' }).value;
  var niveau = (document.getElementById('f-niveau') || { value: '' }).value;
  var boursier = (document.getElementById('f-boursier') || { value: '' }).value;
  var reduction = (document.getElementById('f-reduction') || { value: '' }).value;
  var pourcentage = (document.getElementById('f-reduction-percent') || { value: '0' }).value || '0';
  var fraisTotal = (document.getElementById('frais-total') || { textContent: '800 000 FCFA' }).textContent;
  var today = new Date();
  var dateStr = today.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  var htmlContent = '<div style="font-family:Georgia,serif;padding:48px;max-width:760px;margin:0 auto;color:#1a1a2e">' +
    '<div style="text-align:center;padding-bottom:28px;border-bottom:3px double #C9A227;margin-bottom:36px">' +
    '<div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:8px">HECF — Document officiel</div>' +
    '<h1 style="margin:0;font-size:34px;color:#071B45;letter-spacing:2px">HECF</h1>' +
    '<p style="color:#888;margin:6px 0;font-size:12px">Ecole des Hautes Études Financières & Comptables</p>' +
    '<h2 style="margin:18px 0 0;font-size:16px;color:#071B45;letter-spacing:1px;font-weight:400;text-transform:uppercase">REÇU DE CANDIDATURE</h2></div>' +
    '<div style="display:flex;justify-content:space-between;background:#f8f6f0;padding:20px 24px;border-radius:10px;margin-bottom:28px">' +
    '<div><p style="color:#888;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Numéro de dossier</p><p style="color:#071B45;font-weight:700;font-size:18px;margin:0;letter-spacing:1px">' + refNumber + '</p></div>' +
    '<div style="text-align:right"><p style="color:#888;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Date</p><p style="color:#071B45;font-size:14px;margin:0;font-weight:600">' + dateStr + '</p></div></div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:28px">' +
    '<tr style="background:#071B45"><td colspan="2" style="padding:12px 18px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;font-weight:700">Informations personnelles</td></tr>' +
    '<tr style="background:#f8f6f0"><td style="padding:11px 18px;color:#666;font-size:13px;width:35%">Prénom :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + prenom + '</td></tr>' +
    '<tr><td style="padding:11px 18px;color:#666;font-size:13px">Nom :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + nom + '</td></tr>' +
    '<tr style="background:#f8f6f0"><td style="padding:11px 18px;color:#666;font-size:13px">Email :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + email + '</td></tr>' +
    '<tr><td style="padding:11px 18px;color:#666;font-size:13px">Téléphone :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + tel + '</td></tr></table>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:28px">' +
    '<tr style="background:#071B45"><td colspan="2" style="padding:12px 18px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;font-weight:700">Candidature</td></tr>' +
    '<tr style="background:#f8f6f0"><td style="padding:11px 18px;color:#666;font-size:13px;width:35%">Filière :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + filiere + '</td></tr>' +
    '<tr><td style="padding:11px 18px;color:#666;font-size:13px">Niveau :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + niveau + '</td></tr>' +
    '<tr style="background:#f8f6f0"><td style="padding:11px 18px;color:#666;font-size:13px">Boursier :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + (boursier === 'oui' ? 'Oui' : 'Non') + '</td></tr>' +
    '<tr><td style="padding:11px 18px;color:#666;font-size:13px">Réduction admin. :</td><td style="padding:11px 18px;color:#071B45;font-weight:700">' + (reduction === 'oui' ? 'Oui (' + pourcentage + '%)' : 'Non') + '</td></tr></table>' +
    '<div style="background:linear-gradient(135deg,#071B45,#0E2A6B);padding:28px;border-radius:12px;text-align:center;margin-bottom:24px">' +
    '<p style="color:rgba(255,255,255,0.65);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px">Montant de scolarité</p>' +
    '<p style="font-size:34px;font-weight:700;color:#C9A227;margin:0">' + fraisTotal + '</p>' +
    '<p style="color:rgba(255,255,255,0.55);font-size:11px;margin:10px 0 0">À payer avant le commencement des cours</p></div>' +
    '<div style="background:#fef9c3;padding:16px 20px;border-radius:10px;border:1px solid #fde68a;margin-bottom:24px">' +
    '<p style="color:#854d0e;font-size:12.5px;margin:0"><strong>Important :</strong> Votre dossier a été reçu avec succès. Conservez ce reçu et votre numéro de référence pour toute correspondance. Notre équipe vous contactera dans 7 à 10 jours ouvrables.</p></div>' +
    '<div style="text-align:center;border-top:1px solid #e5e5e5;padding-top:20px">' +
    '<p style="color:#aaa;font-size:11px;margin:0">Document généré automatiquement — Ne requiert pas de signature.</p>' +
    '<p style="color:#ccc;font-size:10px;margin:6px 0 0">HECF © 2026 — Niamey, République du Niger — contact@hecf.edu</p></div></div>';

  var element = document.createElement('div');
  element.innerHTML = htmlContent;
  var opt = {
    margin: 0,
    filename: 'HECF_Recu_' + refNumber + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save();
  } else {
    showToast('Téléchargement PDF non disponible.', 'error');
  }
}

/* ==========================================
   CONTACT FORM
   ========================================== */

function sendContact(e) {
  if (e && e.preventDefault) e.preventDefault();
  var form = document.getElementById('contactForm');
  var btn = document.getElementById('contact-send-btn');
  if (!form) return;
  var prenom = (document.getElementById('f-contact-prenom') || { value: '' }).value.trim();
  var nom = (document.getElementById('f-contact-nom') || { value: '' }).value.trim();
  var email = (document.getElementById('f-contact-email') || { value: '' }).value.trim();
  var message = (document.getElementById('f-contact-message') || { value: '' }).value.trim();
  if (!prenom || !nom || !email || !message) {
    showToast('Veuillez remplir tous les champs obligatoires.', 'error'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Adresse email invalide.', 'error'); return;
  }
  if (message.length < 10) {
    showToast('Votre message doit contenir au moins 10 caractères.', 'error'); return;
  }
  if (btn) {
    btn.innerHTML = '<i class="ti ti-loader" style="animation:spin .8s linear infinite"></i>Envoi en cours…';
    btn.disabled = true;
  }
  setTimeout(function () {
    var success = document.getElementById('contact-success');
    if (success) success.style.display = 'block';
    if (btn) {
      btn.innerHTML = '<i class="ti ti-circle-check"></i>Message envoyé !';
      btn.style.background = '#059669';
    }
    form.reset();
    showToast('Message envoyé avec succès !', 'success');
  }, 1200);
}

/* ==========================================
   TOAST NOTIFICATIONS
   ========================================== */

function showToast(msg, type) {
  var existing = document.querySelectorAll('.hecf-toast');
  existing.forEach(function (t) { t.remove(); });
  var t = document.createElement('div');
  t.className = 'hecf-toast';
  var isError = type === 'error';
  t.style.cssText = 'position:fixed;top:90px;right:20px;padding:14px 20px;border-radius:12px;font-size:13.5px;font-family:"Plus Jakarta Sans",sans-serif;font-weight:600;z-index:9999;max-width:320px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,0.18);animation:slideInToast .3s ease;' +
    (isError ? 'background:#fee2e2;color:#991b1b;border:1.5px solid #fca5a5' : 'background:#d1fae5;color:#065f46;border:1.5px solid #6ee7b7');
  t.innerHTML = '<i class="ti ti-' + (isError ? 'alert-circle' : 'circle-check') + '" style="font-size:17px;flex-shrink:0"></i>' + msg;
  document.body.appendChild(t);
  setTimeout(function () {
    t.style.opacity = '0';
    t.style.transform = 'translateX(20px)';
    t.style.transition = 'all .3s';
    setTimeout(function () { t.remove(); }, 300);
  }, 3500);
}

/* ==========================================
   KEYBOARD & ACCESSIBILITY
   ========================================== */

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var m = document.getElementById('mobileMenu');
    if (m && m.classList.contains('open')) toggleMobileMenu();
  }
});

/* ==========================================
   INIT ON DOM READY
   ========================================== */

document.addEventListener('DOMContentLoaded', function () {
  initFadeIns();
  initCounters();

  // Contact form
  var contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', sendContact);

  // Hamburger keyboard
  var hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMobileMenu(); }
    });
  }

  // Adjust nav top based on announcement bar
  function adjustNavTop() {
    var bar = document.getElementById('announceBar');
    var nav = document.getElementById('mainNav');
    if (bar && nav && bar.offsetHeight > 0) {
      nav.style.top = bar.offsetHeight + 'px';
      var mMenu = document.getElementById('mobileMenu');
      if (mMenu) mMenu.style.top = (bar.offsetHeight + (nav.offsetHeight || 70)) + 'px';
    }
  }
  adjustNavTop();

  // FAQ accessible
  document.querySelectorAll('.faq-item').forEach(function (item) {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(item); }
    });
  });

  // Add spinner keyframe
  if (!document.getElementById('hecf-keyframes')) {
    var style = document.createElement('style');
    style.id = 'hecf-keyframes';
    style.textContent = '@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideInToast{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(style);
  }
});
