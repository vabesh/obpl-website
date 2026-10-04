/* ORBITBeyond India — shared behaviours */
(function () {
  'use strict';

  /* ---------- Konark-wheel inspired orbit mark ---------- */
  function chakra(spokes, size, stroke) {
    spokes = spokes || 8; size = size || 100; stroke = stroke || 1.2;
    var c = size / 2, r1 = size * .47, r2 = size * .36, r3 = size * .12, out = [];
    out.push('<svg viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="' + stroke + '">');
    out.push('<circle cx="' + c + '" cy="' + c + '" r="' + r1 + '"/>');
    out.push('<circle cx="' + c + '" cy="' + c + '" r="' + r2 + '" stroke-dasharray="3 5"/>');
    out.push('<circle cx="' + c + '" cy="' + c + '" r="' + r3 + '"/>');
    for (var i = 0; i < spokes; i++) {
      var a = (i / spokes) * Math.PI * 2, a2 = a + Math.PI / spokes;
      out.push('<line x1="' + (c + Math.cos(a) * r3) + '" y1="' + (c + Math.sin(a) * r3) + '" x2="' + (c + Math.cos(a) * r1) + '" y2="' + (c + Math.sin(a) * r1) + '"/>');
      out.push('<circle cx="' + (c + Math.cos(a2) * r2) + '" cy="' + (c + Math.sin(a2) * r2) + '" r="' + (size * .018) + '" fill="currentColor" stroke="none"/>');
      out.push('<circle cx="' + (c + Math.cos(a) * r1) + '" cy="' + (c + Math.sin(a) * r1) + '" r="' + (size * .03) + '" fill="#06081a"/>');
    }
    out.push('<circle cx="' + c + '" cy="' + c + '" r="' + (size * .035) + '" fill="currentColor" stroke="none"/>');
    out.push('</svg>');
    return out.join('');
  }
  window.OBChakra = chakra;
  document.querySelectorAll('[data-chakra]').forEach(function (el) {
    var n = parseInt(el.getAttribute('data-chakra'), 10) || 8;
    el.innerHTML = chakra(n, 100, parseFloat(el.getAttribute('data-stroke')) || 1.2);
  });

  /* ---------- preloader ---------- */
  var loader = document.getElementById('loader');
  if (loader) {
    var done = function () { loader.classList.add('done'); document.body.classList.add('ready'); };
    window.addEventListener('load', function () { setTimeout(done, 1500); });
    setTimeout(done, 4200);
  } else { document.body.classList.add('ready'); }

  /* ---------- nav ---------- */
  var nav = document.querySelector('.nav');
  var onScroll = function () { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var burger = document.querySelector('.burger'), mnav = document.querySelector('.mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var o = mnav.classList.toggle('open'); burger.classList.toggle('open', o);
      document.body.style.overflow = o ? 'hidden' : '';
    });
    mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mnav.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = ''; }); });
  }
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mnav a').forEach(function (a) {
    var h = a.getAttribute('href').split('#')[0];
    if (h === here || (here === '' && h === 'index.html')) a.classList.add('active');
  });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv, .roadmap, .bars-wrap').forEach(function (el) { io.observe(el); });

  /* ---------- counters ---------- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, target = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
      var dec = (el.getAttribute('data-dec') | 0), t0 = performance.now(), dur = 1800;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 4);
        el.textContent = pre + (target * k).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- growth bars ---------- */
  var bio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; bio.unobserve(e.target);
      e.target.querySelectorAll('.bar i').forEach(function (b, i) {
        setTimeout(function () { b.style.height = b.getAttribute('data-h'); }, 120 * i);
      });
    });
  }, { threshold: .4 });
  document.querySelectorAll('.bars').forEach(function (el) { bio.observe(el); });

  /* ---------- 3D tilt ---------- */
  var fine = window.matchMedia('(pointer:fine)').matches;
  if (fine) document.querySelectorAll('.tilt').forEach(function (card) {
    if (!card.querySelector('.shine')) { var s = document.createElement('i'); s.className = 'shine'; card.appendChild(s); }
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = 'perspective(1100px) rotateX(' + ((.5 - y) * 10).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 12).toFixed(2) + 'deg) translateY(-4px)';
      card.style.setProperty('--mx', (x * 100) + '%'); card.style.setProperty('--my', (y * 100) + '%');
    });
    card.addEventListener('pointerleave', function () { card.style.transform = ''; });
  });

  /* ---------- flip cards ---------- */
  document.querySelectorAll('.flip').forEach(function (f) {
    f.addEventListener('click', function () { f.classList.toggle('on'); });
    f.setAttribute('tabindex', '0');
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.classList.toggle('on'); } });
  });

  /* ---------- cursor glow ---------- */
  if (fine) {
    var g = document.createElement('div'); g.className = 'cursor-glow'; document.body.appendChild(g);
    var gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
    window.addEventListener('pointermove', function (e) { gx = e.clientX; gy = e.clientY; }, { passive: true });
    (function loop() { cx += (gx - cx) * .08; cy += (gy - cy) * .08; g.style.transform = 'translate(' + (cx - 260) + 'px,' + (cy - 260) + 'px)'; requestAnimationFrame(loop); })();
  }

  /* ---------- team modal ---------- */
  var TEAM = {
    siba: { img: 'assets/team-siba.jpg', name: 'Siba Prasad Padhi', role: 'Founder & Chief Executive', tag: 'Leadership', bio: [
      'Siba Prasad Padhi is the founder of the ORBITBeyond group and the architect of Orbit Beyond Private Limited, the Indian company recognised by DPIIT as a startup in the Aerospace & Defence and Space Technology sector.',
      'He leads a two-entity structure: a US parent delivering lunar missions for NASA under the Commercial Lunar Payload Services programme, and the India company that designs and manufactures the OB-1 lunar lander, surface rovers, satellites and lunar AI compute payloads.',
      'An Odisha native, he is the driving force behind the proposed Global Space Systems Centre in Bhubaneswar, a programme designed to anchor India\'s private lunar story in his home state.'] },
    somanath: { img: 'assets/team-somanath.jpg', name: 'Dr. S. Somanath', role: 'Strategic Advisor · Former ISRO Chairman', tag: 'Advisory', bio: [
      'Dr. S. Somanath is a distinguished space scientist with a career spanning nearly 40 years in launch vehicle systems engineering. He served as ISRO Chairman and Secretary of the Department of Space through January 2025.',
      'He oversaw the historic Chandrayaan-3 lunar south-pole landing, established India\'s National Space Policy and directed Space Vision-2047, including the Gaganyaan human spaceflight programme and the Bharatiya Antariksha Station. He previously directed the Vikram Sarabhai Space Centre and the Liquid Propulsion Systems Centre.',
      'He is a member of the US National Academy of Engineering, an IAF Hall of Fame inductee and recipient of the Von Kármán Award. He currently serves as Vikram Sarabhai Professor at ISRO and Chancellor of Chanakya University.'] },
    krishnaswamy: { img: 'assets/team-krishnaswamy.jpg', name: 'Dr. M. Krishnaswamy', role: 'Chief Systems Engineer', tag: 'Engineering', bio: [
      'Dr. M. Krishnaswamy leads lunar lander configuration across the group and anchors the systems-engineering design authority that the India centre is built around.',
      'With over 40 years in space systems, he served as Programme Director and Outstanding Scientist at ISRO Satellite Centre, leading the Cartosat and TES high-resolution imaging programmes, guiding Chandrayaan-1 and IMS-1, and directing the NIUSAT nanosatellite mission.',
      'His honours include the IAA Laurel and ISRO\'s award for Overall Outstanding Contribution to Space.'] },
    rabindra: { img: 'assets/team-rabindra.jpg', name: 'CA Rabindra Sahu', role: 'CFO Advisory', tag: 'Finance', bio: [
      'CA Rabindra Sahu serves as CFO Advisory for Orbit Beyond Private Limited, specialising as a Growth Partner and Virtual CFO Advisor for enterprises navigating finance and compliance in India.',
      'He transforms legacy business management systems into modern digitalised management systems, and advises global companies on setting up Indian subsidiaries as a transfer pricing consultant.',
      'He is also a business valuer for numerous startups across India.'] }
  };
  var modal = document.getElementById('teamModal');
  window.openTeam = function (k) {
    var t = TEAM[k]; if (!t || !modal) return;
    modal.querySelector('img').src = t.img; modal.querySelector('img').alt = t.name;
    modal.querySelector('.tm-name').textContent = t.name; modal.querySelector('.tm-role').textContent = t.role;
    modal.querySelector('.tm-bio').innerHTML = t.bio.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  window.closeTeam = function () { if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; } };
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeTeam(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTeam(); });

  /* ---------- contact form (mailto fallback) ---------- */
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form), body = 'Name: ' + d.get('name') + '\nOrganisation: ' + d.get('org') + '\nEmail: ' + d.get('email') + '\nTopic: ' + d.get('topic') + '\n\n' + d.get('msg');
    location.href = 'mailto:info@orbitbeyond.com?subject=' + encodeURIComponent('[' + d.get('topic') + '] Enquiry from ' + d.get('name')) + '&body=' + encodeURIComponent(body);
  });

  /* ---------- year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
