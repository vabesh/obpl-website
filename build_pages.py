# -*- coding: utf-8 -*-
import os
VER = "40"
OUT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://obpl.space"

NAV = """
<div id="loader" class="loader"><div class="loader-in">
  <img class="loader-logo" src="assets/logo-mark.png" alt="Orbit Beyond" />
  <div class="loader-hi">भारत से चंद्रमा तक</div>
  <div class="loader-en">Orbit to Outpost</div>
  <div class="loader-bar"><i></i></div>
</div></div>
<header class="nav"><div class="nav-inner">
  <a href="index.html" class="brand" aria-label="Orbit Beyond India home">
    <img class="mark" src="assets/logo-mark.png" alt="" /><span><img class="word" src="assets/logo-wordmark.png" alt="Orbit Beyond" /><span class="tagline">INDIA · ORBIT TO OUTPOST</span></span>
  </a>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="programmes.html">Capabilities</a></li>
    <li><a href="team.html">People</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
  <div class="nav-cta">
    <a href="contact.html" class="btn">Partner with us <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    <button class="burger" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</div></header>
<nav class="mnav" aria-label="Mobile">
  <a href="index.html">Home</a><a href="about.html">About</a><a href="programmes.html">Capabilities</a><a href="team.html">People</a><a href="contact.html">Contact</a>
  <div class="mnav-foot">DPIIT Recognised Startup · DIPP285038</div>
</nav>
"""

FOOTER = """
<footer class="footer"><div class="wrap">
  <div class="footer-in">
    <div>
      <a href="index.html" class="brand"><img class="mark" src="assets/logo-mark.png" alt="" /><span><img class="word" src="assets/logo-wordmark.png" alt="Orbit Beyond" /><span class="tagline">INDIA · ORBIT TO OUTPOST</span></span></a>
      <div class="hindi">भारत से चंद्रमा तक</div>
      <p><strong style="display:block;color:var(--ivory);font-weight:600">Orbit Beyond Private Limited</strong>designs, integrates and manufactures landers, orbiters and mobility systems for missions worldwide.</p>
    </div>
    <div><h4>Explore</h4><ul>
      <li><a href="about.html">About</a></li><li><a href="programmes.html">Capabilities</a></li><li><a href="team.html">People</a></li><li><a href="contact.html">Contact</a></li>
    </ul></div>
    <div><h4>Offices</h4><ul>
      <li><a href="contact.html">World Trade Center, Brigade Gateway, Bengaluru 560055</a></li>
      <li><a href="contact.html">Regd. office: MIG-A/24, Brit Colony, Nayapalli, Bhubaneswar 751012</a></li>
      <li><a href="mailto:info@obpl.com">info@obpl.com</a></li>
    </ul></div>
    <div><h4>Recognition</h4><ul>
      <li><a href="about.html#recognition">DPIIT Recognised Startup</a></li><li><a href="about.html#recognition">Certificate DIPP285038</a></li><li><a href="about.html#recognition">Aerospace &amp; Defence · Space Technology</a></li>
    </ul></div>
  </div>
  <div class="footer-bot">
    <span>© <span data-year>2026</span> Orbit Beyond Private Limited. All rights reserved.</span>
    <span>Site by <a href="https://zuno-design-studios.com" rel="noopener" target="_blank">Zuno Design Studios</a></span>
  </div>
</div></footer>
<div class="modal" id="teamModal" role="dialog" aria-modal="true">
  <div class="modal-card glass">
    <button class="modal-x" onclick="closeTeam()" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <img src="" alt="" /><div class="modal-body"><h3 class="tm-name"></h3><div class="r tm-role"></div><div class="tm-bio"></div></div>
  </div>
</div>
"""

def shell(name, title, desc, body, three=False, extra_head=""):
    scripts = '<script src="js/main.js?v=VER"></script>'
    if three:
        scripts = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
                   '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/Pass.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>'
                   '<script src="js/main.js?v=VER"></script><script src="js/lander3d.js?v=VER"></script><script src="js/surface.js?v=VER"></script>')
    url = SITE + "/" + ("" if name == "index.html" else name.replace(".html", ""))
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content="{desc}" />
<link rel="canonical" href="{url}" />
<meta property="og:type" content="website" /><meta property="og:site_name" content="ORBITBeyond India" /><meta property="og:title" content="{title}" /><meta property="og:description" content="{desc}" /><meta property="og:url" content="{url}" />
<meta name="theme-color" content="#06081a" />
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Michroma&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/style.css?v=VER" /><link rel="stylesheet" href="css/surface.css?v=VER" />
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"Organization","name":"Orbit Beyond Private Limited","alternateName":"ORBITBeyond India","url":"{SITE}/","foundingDate":"2022-12-27","address":{{"@type":"PostalAddress","streetAddress":"World Trade Center, Brigade Gateway, 26/1 Dr. Rajkumar Road, Malleswaram West","addressLocality":"Bengaluru","postalCode":"560055","addressCountry":"IN"}},"description":"{desc}"}}</script>
{extra_head}
</head>
<body>
{NAV}
<main>
{body}
</main>
{FOOTER}
{scripts}
</body>
</html>
"""
    html = html.replace("?v=VER", "?v=" + VER)
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f: f.write(html)
    print("wrote", name, len(html))

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

def cta(h, p, a1="Partner with us", h1="contact.html", a2="Explore our capabilities", h2="programmes.html"):
    second = f'<a href="{h2}" class="btn btn-ghost">{a2}</a>' if a2 else ""
    return f"""
<section class="section"><div class="wrap"><div class="cta rv">
  <div class="orb"></div><div class="chakra" style="color:var(--marigold)" data-chakra="24" data-stroke=".6"></div>
  <h2>{h}</h2><p>{p}</p>
  <div class="acts"><a href="{h1}" class="btn">{a1} {ARROW}</a>{second}</div>
</div></div></section>"""

ICONS = {
 "chain": '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
 "cube": '<svg viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/></svg>',
 "people": '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 20a5 5 0 0 0-6-5"/></svg>',
 "bolt": '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
 "target": '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
 "globe": '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
 "shield": '<svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
 "layers": '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/></svg>',
}

def flip_cards():
    items = [
      ("chain","Supply Chain","20+ yrs","assets/materials.jpg","CTTC Bhubaneswar has supplied ISRO for over two decades: Mars Orbiter, Chandrayaan-1/2/3 and Gaganyaan. A space-qualified precision base already in the State."),
      ("cube","Materials","Al","assets/wp-legs.jpg","India's aluminium heartland. Lightweight aerospace structures for landing gear and rover chassis, sourced from the State's own metals ecosystem."),
      ("people","Talent","1 lakh+","assets/talent.jpg","Over a lakh technical graduates a year and a World Skill Center with 99% placement. A frontier employer lets Odia engineers do this work at globally benchmarked pay, without leaving the State."),
      ("bolt","Speed","GO SWIFT","assets/stars.jpg","Single-window clearances and a government that converts investment intent into approvals at pace. IP and design authority held in-state."),
    ]
    out = []
    for ic, t, big, img, back in items:
        out.append(f"""<div class="flip rv"><div class="flip-face flip-front"><img src="{img}" alt="{t}" loading="lazy" /><div class="ov"></div><div class="ic">{ICONS[ic]}</div><div class="lab"><h3>{t}</h3><div class="tap">Tap to flip</div></div></div>
<div class="flip-face flip-back"><div class="k">Why Odisha · {t}</div><div class="big">{big}</div><p>{back}</p></div></div>""")
    return '<div class="flip-grid">' + "".join(out) + '</div>'

def roadmap():
    return """
<div class="roadmap"><div class="road-line"><i></i></div><div class="road-grid">
  <div class="phase glass tilt"><div class="node">I</div><div class="when">Phase I · Immediate</div><h3>Design &amp; Engineering Centre</h3><ul><li>Lander and rover systems design</li><li>Avionics, GNC and flight software</li><li>Software-in-the-loop lab with Sim Dot Space</li><li>Supplier qualification with CTTC</li></ul></div>
  <div class="phase glass tilt"><div class="node">II</div><div class="when">Phase II · Permanent facility</div><h3>Full Integration &amp; Mission Control</h3><ul><li>Clean rooms and lander integration hall</li><li>Thermal-vacuum and vibration test</li><li>Rover test yard and drop-test rig</li><li>Bhubaneswar Mission Control · ~500 engineers</li></ul></div>
  <div class="phase glass tilt"><div class="node">III</div><div class="when">Phase III · FY2031 to FY2040</div><h3>Serial Manufacture &amp; Operations</h3><ul><li>Serial rover and satellite manufacture</li><li>AI data-centre payload production</li><li>Continuous mission operations from Odisha</li><li>Export fulfilment: NASA, USSF, global</li></ul></div>
</div></div>"""

def numbers():
    return """
<div class="numbers rv">
  <div><div class="n" data-count="140" data-pre="$" data-suf="M">$0M</div><div class="l">Capital investment through FY2040</div></div>
  <div><div class="n" data-count="115" data-pre="$" data-suf="M">$0M</div><div class="l">Manpower commitment through FY2040</div></div>
  <div><div class="n" data-count="1500" data-pre="≈">≈0</div><div class="l">Jobs at scale · 500 engineers + 1,000 semi-skilled</div></div>
  <div><div class="n" data-count="2029">2029</div><div class="l">First lunar mission from Bhubaneswar</div></div>
  <div><div class="n">1 of 10</div><div class="l">NASA CLPS-certified providers in the group</div></div>
  <div><div class="n">7</div><div class="l">Patents in progress</div></div>
  <div><div class="n">2</div><div class="l">Mission control nodes · Bhubaneswar + Huntsville</div></div>
  <div><div class="n">Export-first</div><div class="l">Revenue orientation · NASA, USSF, global</div></div>
</div>"""

FOUNDERS = [("siba","assets/team-siba.jpg",None,"Siba Prasad Padhi","Founder & Director"),
            ("krishnaswamy","assets/team-krishnaswamy.jpg",None,"Dr. M. Krishnaswamy","Chief Systems Engineer"),
            ("shreya","assets/team-shreya.jpg",None,"Dr. Shreya Santra","Head of Robotics and Autonomy"),
            ("rabindra","assets/team-rabindra.jpg",None,"CA Rabindra Sahu","Finance & Compliance")]
ADVISORS = [("durga","assets/team-durga.jpg",None,"Y. V. Durga Prasad","Head of Propulsion"),
            ("anand","assets/team-anand.jpg",None,"Anand Nagesh","Head of Avionics"),
            ("sashi","assets/team-sashi.jpg",None,"R. Sashi Sekhar","Head, Propulsion"),
            ("kesava","assets/team-kesava.jpg",None,"Dr. V. Kesava Raju","Head of Orbiter Mission Control"),
            ("venugopalan","assets/team-venugopalan.jpg",None,"Dr. Venugopalan Srinivasan","Head, Electrical Power"),
            ("sambasiva","assets/team-sambasiva.jpg",None,"Dr. Sambasiva Rao Venigalla","Head, Communications"),
            ("alok",None,"AS","Dr. Alok Srivastava","Head, Thermal · lunar-night survival"),
            ("rk",None,"RK","Dr. R.K. Srinivasan","Head of Structures"),
            ("monica","assets/team-monica.jpg",None,"Monica Dey","HR & Operations Manager")]

def team_cards(ppl, tag):
    cards = ""
    for k,img,ini,n,r in ppl:
        visual = f'<img src="{img}" alt="{n}" loading="lazy" />' if img else f'<div class="avatar">{ini}</div>'
        cards += f"""<div class="person glass tilt rv" onclick="openTeam('{k}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')openTeam('{k}')">{visual}<div class="ov"></div><span class="tag">{tag}</span><div class="meta"><h3>{n}</h3><div class="r">{r}</div></div></div>"""
    return '<div class="team-grid">' + cards + '</div>'

def team_grid():
    return (f'<div class="team-group rv"><div class="eyebrow">Founding members</div></div>{team_cards(FOUNDERS, "Founding member")}'
            f'<div class="team-group rv" style="margin-top:3rem"><div class="eyebrow">Team members</div></div>{team_cards(ADVISORS, "Team member")}')

def wp_cards():
    data = [("01","Lander Leg Development","assets/wp-legs.jpg","legs","Deployable landing gear, shock-attenuation struts and crushable energy absorbers, machined on CTTC Bhubaneswar's ISRO-qualified base."),
            ("02","Rover Development","assets/rover-color.jpg","rover","Serial manufacture of lunar surface rovers: mobility, autonomy, wheels and drive assemblies. Flown on group missions and sold worldwide."),
            ("03","Satellite Development","assets/sat-color.jpg","antenna","Three product lines on one common bus: lunar 5G relay, cislunar awareness and resource mapping. Export revenue from day one."),
            ("04","Lunar AI Data Centre","assets/wp-compute.jpg","compute","Radiation-tolerant, thermally managed AI compute for the lunar surface, aligned with Odisha's semiconductor packaging ecosystem at Info Valley."),
            ("05","Mission Control &amp; Ground Segment","assets/wp-control.jpg","sensor","Bhubaneswar as primary mission control for all non-US missions, paired with NASA Marshall in Huntsville. Dual control, no single point of failure.")]
    out=[]
    for i,(n,t,img,id_,p) in enumerate(data):
        wide = ' wide' if i in (3,) else ''
        out.append(f"""<a href="programmes.html#wp{n}" class="wp-card glass tilt rv{wide}"><img src="{img}" alt="{t}" loading="lazy" /><div class="ov"></div><span class="num">WORK PACKAGE {n}</span><h3>{t}</h3><p>{p}</p><span class="more">Read more {ARROW}</span></a>""")
    return '<div class="wp-cards">' + "".join(out) + '</div>'

# =============================== INDEX ===============================
def surface_section():
    dots = "".join(f'<button class="sdot" data-l="{t}" aria-label="{t}"></button>' for t in ["VSAT power","Night survival","Rover","Helium-3","OB1 lander","Relay orbiter","AI data centre"])
    return f"""
<section id="surfaceSection">
  <div class="surface" id="surface">
    <canvas aria-label="Scroll-driven lunar surface with Orbit Beyond outpost hardware"></canvas>
    <div class="surface-grain"></div><div class="surface-vignette"></div>
    <div class="s-progress" id="surfaceProgress"></div>
    <div class="surface-load"><div style="text-align:center"><img src="assets/logo-mark.png" alt="" style="width:90px;margin:0 auto" /><div class="l">Loading surface</div></div></div>
    <div class="s-hero" id="surfaceHero"><div class="s-hero-in">
      <div class="tag">Orbit to Outpost</div>
      <h1>Designed in India. <span class="grad">Built for the Moon.</span></h1>
      <p>Lunar infrastructure engineering, built in India: power, night survival, mobility, Helium-3 extraction, landers and orbiters, and AI compute. Scroll to fly across the lunar south pole and meet each system.</p>
      <div class="acts"><a href="programmes.html" class="btn btn-ghost">Our capabilities</a><a href="contact.html" class="btn">Partner with us {ARROW}</a></div>
    </div><div class="cue">Scroll to descend<i></i></div></div>
    <div class="s-caption" id="stationCaption"></div>
    <div class="s-rail">{dots}</div>
    <div class="s-end" id="surfaceEnd"><div><div class="eyebrow" style="justify-content:center">Leaving the surface</div><h2>Seven systems. One outpost. <span class="grad">Built in India.</span></h2><p>Now the people and the services that make it real.</p><div class="cue">Keep scrolling</div></div></div>
  </div>
</section>
<div class="spanel-scrim" onclick="closeStation()"></div>
<aside class="spanel" id="stationPanel" aria-label="Station details">
  <button class="sp-x" onclick="closeStation()" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <img class="sp-img" src="" alt="" />
  <div class="sp-body"><div class="sp-k"></div><h3 class="sp-t"></h3><p class="sp-b"></p><table><tbody class="sp-specs"></tbody></table><div class="sp-note">Draft specification · figures to be confirmed by Orbit Beyond engineering</div><a class="btn sp-link" href="programmes.html">Capability details {ARROW}</a></div>
</aside>"""

index_body = f"""
{surface_section()}

<section class="section" id="people"><div class="wrap">
  <div class="sec-head rv"><div><div class="eyebrow">01 · People</div><h2>Built by engineers who have <span class="grad">landed on the Moon.</span></h2></div>
    <p class="lede">A founding team and the engineers who head each subsystem of the lander, orbiter and surface programmes.</p></div>
  {team_grid()}
</div></section>

<section class="section" id="services" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><div><div class="eyebrow">02 · Services</div><h2>What we deliver, <span class="grad">end to end.</span></h2></div>
    <p class="lede">From a payload slot on OB1 to India-owned products for the lunar economy.</p></div>
  <div class="svc-grid">
    <div class="svc glass tilt rv"><div class="k">S01 · Today</div><div><h3>Contract engineering</h3><p>Full-system lander, orbiter and payload engineering on milestones: SRR, PDR, CDR, structures, integration and test.</p></div></div>
    <div class="svc glass tilt rv rv-d1"><div class="k">S02 · Next</div><div><h3>Own-IP products</h3><p>Rover mobility platforms and Helium-3 extraction systems on India-owned IP, sold per unit with integration and mission support.</p></div></div>
    <div class="svc glass tilt rv rv-d2"><div class="k">S03</div><div><h3>Lunar power-as-a-service</h3><p>VSAT vertical solar arrays with RHU and battery night survival, delivered as recurring power on the surface.</p></div></div>
    <div class="svc glass tilt rv"><div class="k">S04</div><div><h3>Relay communications</h3><p>Communications relay orbiter for landers, rovers and surface payloads.</p></div></div>
    <div class="svc glass tilt rv rv-d1"><div class="k">S05</div><div><h3>Lunar compute</h3><p>LunarEdge AI data-centre prototype for inference, autonomy and sensor processing at the Moon.</p></div></div>
    <div class="svc glass tilt rv rv-d2"><div class="k">S06</div><div><h3>Mission support &amp; manufacturing</h3><p>Mission support services, plus rover, satellite and lander-component production.</p></div></div>
  </div>
</div></section>

<section class="section" id="newsletter" style="padding-top:0"><div class="wrap"><div class="glass news" style="padding:clamp(2rem,4vw,3.5rem)">
  <div class="rv"><div class="eyebrow">03 · Newsletter</div><h2 style="font-size:clamp(1.8rem,3.4vw,2.8rem)">Dispatches from <span class="grad">orbit to outpost.</span></h2>
    <p class="lede" style="margin-top:1rem">Programme milestones and lunar resource notes, a few times a year. No noise.</p>
    <form class="news-form" onsubmit="event.preventDefault();location.href='mailto:info@obpl.com?subject='+encodeURIComponent('Newsletter signup')+'&amp;body='+encodeURIComponent('Please add '+this.email.value+' to the Orbit Beyond India newsletter.')">
      <input type="email" name="email" placeholder="you@organisation.com" required /><button class="btn" type="submit">Subscribe {ARROW}</button></form></div>
  <div class="rv rv-d2"><div class="glass img-card duo" style="min-height:300px;border-radius:var(--r)"><img src="assets/wp-lander.jpg" alt="Lander integration" loading="lazy" /><div class="ov"></div><div class="cap-ov"><span class="chip">Latest · Helium-3 and the return trip</span></div></div></div>
</div></div></section>

{cta("Talk to us about lunar systems engineering in India.", "Payload customers, industry partners, research institutions and press: we respond within two business days.")}
"""

# =============================== ABOUT ===============================
about_body = f"""
<section class="page-hero"><div class="chakra-bg" style="color:var(--marigold)" data-chakra="16" data-stroke=".5"></div><div class="wrap">
  <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>About</span></div>
  <div class="eyebrow">Orbit Beyond Private Limited</div>
  <h1>An Indian company, built to <span class="grad">design and fly</span> lunar systems.</h1>
  <p class="lede">An Indian space-technology company engineering lunar infrastructure: incorporated on 27 December 2022 and recognised by DPIIT as a startup in Space Technology.</p>
</div></section>

<section class="section" style="padding-top:2rem"><div class="wrap"><div class="split">
  <div class="prose rv"><div class="eyebrow">Who we are</div><h2 style="margin-bottom:1.5rem">An Indian company, <span class="grad">engineering for the Moon.</span></h2>
    <p>Orbit Beyond Private Limited is an Indian space-technology company engineering lunar infrastructure: landers, orbiters and mobility systems for missions worldwide.</p>
    <p>Our product scope covers the OB1 lunar lander, a communications relay orbiter, lunar power and night-survival systems, long-range rovers, Helium-3 extraction and AI data-centre payloads for lunar-surface compute.</p></div>
  <div class="glass tilt rv rv-d2"><div class="eyebrow">At a glance</div>
    <table class="table"><tr><td>Legal name</td><td>Orbit Beyond Private Limited</td></tr><tr><td>CIN</td><td>U73100OR2022PTC041555</td></tr><tr><td>Incorporated</td><td>27 December 2022</td></tr><tr><td>Registered office</td><td>MIG-A/24, Brit Colony, Nayapalli, Bhubaneswar 751012</td></tr><tr><td>Recognition</td><td>DPIIT Startup · DIPP285038</td></tr><tr><td>Industry</td><td>Aeronautics, Aerospace &amp; Defence</td></tr><tr><td>Sector</td><td>Space Technology</td></tr><tr><td>Engineering office</td><td>World Trade Center, Bengaluru</td></tr></table></div>
</div></div></section>

<section class="section" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><div><div class="eyebrow">The problem</div><h2>Lunar missions <span class="grad">stall at nightfall.</span></h2></div>
    <p class="lede">The infrastructure a working outpost needs barely exists. Orbit Beyond builds the four pieces that are missing.</p></div>
  <div class="pillars" style="grid-template-columns:repeat(4,1fr)">
    <div class="pillar glass tilt rv"><div class="ic">{ICONS['bolt']}</div><h3>Lunar night</h3><p>About 14 Earth days of darkness below minus 170 °C. Few surface assets survive it today.</p></div>
    <div class="pillar glass tilt rv rv-d1"><div class="ic">{ICONS['layers']}</div><h3>Power</h3><p>Surface infrastructure needs kW-class power. RHUs and lunar batteries have only about two suppliers.</p></div>
    <div class="pillar glass tilt rv rv-d2"><div class="ic">{ICONS['target']}</div><h3>Mobility</h3><p>Mining and logistics need rovers that travel long distances. Very few have been built.</p></div>
    <div class="pillar glass tilt rv rv-d3"><div class="ic">{ICONS['globe']}</div><h3>Communications</h3><p>No lunar relay network exists. Orbiters are needed for relay and exploration.</p></div>
  </div>
</div></section>

<section class="section" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><div><div class="eyebrow">Engineering lineage</div><h2>Engineers who have <span class="grad">flown to the Moon.</span></h2></div></div>
  <div class="bento">
    <div class="glass tilt b-12 rv"><div class="big grad">ISRO</div><div class="cap">Chandrayaan heritage</div><p style="margin-top:1rem;font-size:.92rem">Chief Systems Engineer Dr. M. Krishnaswamy led Cartosat and guided Chandrayaan-1; the structures, propulsion, GNC, power, communications and thermal heads all come from ISRO.</p></div>
  </div>
</div></section>

<section class="section" id="recognition" style="padding-top:0"><div class="wrap"><div class="cert">
  <div class="cert-card rv"><div class="doc"><div class="emblem"></div><div class="gov">Government of India · Ministry of Commerce &amp; Industry · DPIIT</div><div class="title">Certificate of Recognition</div>
    <div class="body">This is to certify that <b>ORBIT BEYOND PRIVATE LIMITED</b>, incorporated as a Private Limited Company on <b>27-12-2022</b>, is recognised as a startup by the Department for Promotion of Industry and Internal Trade. The startup is working in the <b>'Aeronautics Aerospace &amp; Defence'</b> industry and <b>'Space Technology'</b> sector.</div>
    <div class="row"><div><small>Certificate no.</small><strong>DIPP285038</strong></div><div><small>Date of issue</small><strong>25-09-2026</strong></div><div><small>Valid up to</small><strong>26-12-2032</strong></div></div><div class="stamp">Recognised<br>Startup<br>India</div></div></div>
  <div class="rv rv-d2"><div class="eyebrow">Recognition</div><h2>DPIIT <span class="grad">recognised startup.</span></h2>
    <p class="lede" style="margin-top:1.25rem">The certificate is valid for ten years from incorporation, provided turnover in any financial year does not exceed ₹200 crore. It places Orbit Beyond Private Limited inside India's national framework for deep-tech ventures.</p>
    <ul class="cert-pts"><li><i>№</i><div><b>DIPP285038</b><span>Certificate number</span></div></li><li><i>25.9</i><div><b>Issued 25 September 2026</b><span>Valid up to 26 December 2032</span></div></li><li><i>IN</i><div><b>Self-certified sector</b><span>Aeronautics, Aerospace &amp; Defence · Space Technology</span></div></li></ul></div>
</div></div></section>

{cta("Meet the people behind the programme.", "The founding members and the team behind the programme.", "Meet the team", "team.html", "Contact us", "contact.html")}
"""

# =============================== PROGRAMMES ===============================
def wp_section(n, title, img, lead, bullets, meta, flip=False):
    bl = "".join(f"<li>{b}</li>" for b in bullets)
    mt = "".join(f"<tr><td>{k}</td><td>{v}</td></tr>" for k,v in meta)
    img_html = f'<div class="glass img-card rv rv-d2" style="min-height:420px"><img src="{img}" alt="{title}" loading="lazy" /><div class="ov"></div><div class="cap-ov"><span class="chip">Work package {n}</span></div></div>'
    txt = f'<div class="rv"><div class="eyebrow">Work package {n}</div><h2 style="margin-bottom:1.25rem">{title}</h2><p class="lede">{lead}</p><div class="wp-detail" style="margin-top:1.5rem"><ul>{bl}</ul></div><div class="glass" style="padding:1rem 1.4rem;margin-top:1.75rem"><table class="table">{mt}</table></div></div>'
    inner = (img_html + txt) if flip else (txt + img_html)
    return f'<section class="section" id="wp{n}" style="padding-top:0"><div class="wrap"><div class="split">{inner}</div></div></section>'

programmes_body = f"""
<section class="page-hero"><div class="chakra-bg" style="color:var(--marigold)" data-chakra="16" data-stroke=".5"></div><div class="wrap">
  <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>Capabilities</span></div>
  <div class="eyebrow">What we build in India</div>
  <h1>Power, mobility, resources, <span class="grad">landers and orbiters.</span></h1>
  <p class="lede">The integrated lunar infrastructure stack Orbit Beyond engineers in India.</p>
</div></section>
<section class="section" id="stack" style="padding-top:1rem"><div class="wrap">
  <div class="sec-head rv"><div><div class="eyebrow">Product, technology &amp; innovation</div><h2>An integrated <span class="grad">lunar infrastructure stack.</span></h2></div>
    <p class="lede">Six systems, from surface power to the lander and orbiter, engineered in India with the mobility platform and Helium-3 extraction IP owned here.</p></div>
  <div class="pillars">
    <div class="pillar glass tilt rv"><div class="ic">{ICONS['bolt']}</div><div class="k eyebrow" style="margin-bottom:.4rem">Power</div><h3>Lunar power · VSAT</h3><p>6 to 10 kW vertical solar array with radioisotope heater units for lunar night survival.</p></div>
    <div class="pillar glass tilt rv rv-d1"><div class="ic">{ICONS['shield']}</div><div class="k eyebrow" style="margin-bottom:.4rem">Night survival</div><h3>RHUs and lunar batteries</h3><p>Keep landers and surface assets alive. Only about two suppliers serve the surface today.</p></div>
    <div class="pillar glass tilt rv rv-d2"><div class="ic">{ICONS['target']}</div><div class="k eyebrow" style="margin-bottom:.4rem">Mobility</div><h3>Long-range rover platform</h3><p>Mobility for prospecting, mining logistics and site survey, with AI-based autonomous navigation.</p></div>
    <div class="pillar glass tilt rv"><div class="ic">{ICONS['cube']}</div><div class="k eyebrow" style="margin-bottom:.4rem">Resources</div><h3>Helium-3 extraction</h3><p>Regolith processing and Helium-3 separation for quantum computing, medical and fusion demand.</p></div>
    <div class="pillar glass tilt rv rv-d1"><div class="ic">{ICONS['layers']}</div><div class="k eyebrow" style="margin-bottom:.4rem">Lander</div><h3>Lander engineering</h3><p>Full-system design of the OB1 lunar lander: structures and landing legs, propulsion, GNC, thermal, payloads, integration and test.</p></div>
    <div class="pillar glass tilt rv rv-d2"><div class="ic">{ICONS['globe']}</div><div class="k eyebrow" style="margin-bottom:.4rem">Orbiter</div><h3>Orbiter engineering</h3><p>A communications relay orbiter for landers, rovers and surface payloads, with exploration payloads and mission control from India.</p></div>
  </div>
</div></section>

<section class="section" id="growth" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><div><div class="eyebrow">Growth plan</div><h2>From contract engineering to <span class="grad">product supplier.</span></h2></div></div>
  <div class="road-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="phase glass tilt rv" style="transform:none;opacity:1"><div class="node">27</div><div class="when">FY2027</div><h3>Design reviews</h3><ul><li>OB1 SRR and PDR</li><li>Orbiter and AI prototype design reviews</li><li>GENESIS rover and Helium-3 extraction prototypes</li></ul></div>
    <div class="phase glass tilt rv rv-d1" style="transform:none;opacity:1"><div class="node">28</div><div class="when">FY2028</div><h3>Qualification</h3><ul><li>OB1 CDR and qualification structure</li><li>Orbiter testing</li><li>First external LOI, patent filings</li></ul></div>
    <div class="phase glass tilt rv rv-d2" style="transform:none;opacity:1"><div class="node">29</div><div class="when">FY2029</div><h3>Delivery</h3><ul><li>OB1 integration and acceptance</li><li>Orbiter delivery, AI prototype demo</li><li>First product sale</li></ul></div>
    <div class="phase glass tilt rv rv-d3" style="transform:none;opacity:1"><div class="node">30+</div><div class="when">FY2030 and beyond</div><h3>Products</h3><ul><li>Products for agencies and lander firms</li><li>Rover and Helium-3 demonstrators</li></ul></div>
  </div>
</div></section>

{cta("Have a payload, a product line or a partnership in mind?", "Talk to the engineering team about lander, rover, satellite or compute programmes.", "Start a conversation", "contact.html", None, None)}
"""

# =============================== TEAM ===============================
team_body = f"""
<section class="page-hero"><div class="chakra-bg" style="color:var(--marigold)" data-chakra="16" data-stroke=".5"></div><div class="wrap">
  <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>People</span></div>
  <div class="eyebrow">People</div>
  <h1>Built by engineers who have <span class="grad">landed on the Moon.</span></h1>
  <p class="lede">The founding members and the team that heads every subsystem: propulsion, avionics, guidance, power, communications, thermal and structures. Tap a profile to read more.</p>
</div></section>
<section class="section" style="padding-top:1rem"><div class="wrap">
  {team_grid()}</div></section>
"""

# =============================== CONTACT ===============================
contact_body = f"""
<section class="page-hero"><div class="chakra-bg" style="color:var(--marigold)" data-chakra="16" data-stroke=".5"></div><div class="wrap">
  <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>Contact</span></div>
  <div class="eyebrow">Contact</div>
  <h1>Let's build it <span class="grad">in India.</span></h1>
  <p class="lede">Payload customers, industry, research institutions and press: we respond within two business days.</p>
</div></section>
<section class="section" style="padding-top:1rem"><div class="wrap"><div class="contact-grid">
  <div style="display:grid;gap:1.1rem">
    <div class="addr glass tilt rv"><div class="k">Engineering office · Bengaluru</div><h3>World Trade Center</h3><p>Brigade Gateway, 26/1 Dr. Rajkumar Road, Malleswaram West, Bengaluru 560055, Karnataka</p><div class="map"><iframe src="https://maps.google.com/maps?q=World+Trade+Center,+Brigade+Gateway,+26/1+Dr.+Rajkumar+Road,+Malleswaram+West,+Bengaluru+560055&z=16&output=embed" title="Map: World Trade Center, Bengaluru" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div><a class="maplink" href="https://www.google.com/maps/search/?api=1&query=World+Trade+Center,+Brigade+Gateway,+26/1+Dr.+Rajkumar+Road,+Malleswaram+West,+Bengaluru+560055" target="_blank" rel="noopener">Open in Google Maps {ARROW}</a></div>
    <div class="addr glass tilt rv rv-d2"><div class="k">Registered office</div><h3>Orbit Beyond Private Limited</h3><p>MIG-A/24, Brit Colony, Nayapalli, Bhubaneswar, Odisha 751012 · CIN U73100OR2022PTC041555</p><p style="margin-top:.6rem"><a href="mailto:info@obpl.com">info@obpl.com</a> · DPIIT recognised startup DIPP285038</p><div class="map"><iframe src="https://maps.google.com/maps?q=MIG-A/24,+Brit+Colony,+Nayapalli,+Bhubaneswar,+Odisha+751012&z=15&output=embed" title="Map: registered office, Bhubaneswar" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div><a class="maplink" href="https://www.google.com/maps/search/?api=1&query=MIG-A/24,+Brit+Colony,+Nayapalli,+Bhubaneswar,+Odisha+751012" target="_blank" rel="noopener">Open in Google Maps {ARROW}</a></div>
  </div>
  <form class="form glass rv rv-d1" id="contactForm">
    <div class="eyebrow">Send a message</div>
    <div class="f2"><div class="field"><label for="name">Name</label><input id="name" name="name" required /></div><div class="field"><label for="org">Organisation</label><input id="org" name="org" /></div></div>
    <div class="f2"><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required /></div><div class="field"><label for="topic">Topic</label><select id="topic" name="topic"><option>Payload or product enquiry</option><option>Partnership</option><option>Press</option><option>Other</option></select></div></div>
    <div class="field"><label for="msg">Message</label><textarea id="msg" name="msg" rows="6" required></textarea></div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap"><span class="form-note">Opens in your mail client</span><button type="submit" class="btn">Send message {ARROW}</button></div>
  </form>
</div></div></section>
"""

shell("index.html","ORBITBeyond India · Lunar Landers, Rovers & Satellites Designed in India","Orbit Beyond Private Limited, the DPIIT-recognised Indian space technology company engineering the OB1 lunar lander, relay orbiter, lunar power, rovers, Helium-3 extraction and AI compute from India.", index_body, three=True)
shell("about.html","About · ORBITBeyond India","Orbit Beyond Private Limited: incorporated 27 December 2022, DPIIT recognised startup DIPP285038 in Space Technology, an Indian company engineering lunar infrastructure: landers, orbiters and mobility systems.", about_body)
shell("programmes.html","Capabilities · Lunar Infrastructure Stack · ORBITBeyond India","VSAT lunar power, night survival, long-range rovers, Helium-3 extraction, OB1 lander and relay orbiter engineering: Orbit Beyond India's integrated lunar infrastructure stack.", programmes_body)
shell("team.html","People · ORBITBeyond India","The team behind Orbit Beyond Private Limited: the founding members and team heads across systems, propulsion, GNC, power, communications, thermal and structures.", team_body)
shell("contact.html","Contact · ORBITBeyond India","Contact Orbit Beyond Private Limited: engineering office at World Trade Center, Bengaluru, and registered office in Bhubaneswar.", contact_body)
