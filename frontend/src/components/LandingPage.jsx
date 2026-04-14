const navLinks = ['Home', 'About', 'Reports', 'Contact'];

const featureStats = [
  { label: 'AI detection', value: 'YOLOv8' },
  { label: 'Response time', value: '< 2 min' },
];

const highlights = [
  'Detect waste automatically',
  'Track by location',
  'Escalate urgency instantly',
];

const appChips = [
  { label: 'Android', icon: '🤖' },
  { label: 'iOS', icon: '📱' },
];

const phoneCards = [
  { title: 'Scan', text: 'Upload a garbage photo and let AI detect the waste area.' },
  { title: 'Resolve', text: 'Authorities receive a sorted complaint queue.' },
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="navbar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CleanCity AI</strong>
            <span>Garbage complaint intelligence</span>
          </div>
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`}>
              {link}
            </a>
          ))}
        </nav>

        <a className="button button-light navbar-cta" href="#get-started">
          Download App
        </a>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy reveal">
            <p className="eyebrow">AI-powered civic reporting</p>
            <h1>Keep Your City Clean</h1>
            <h1 className="hero-heading-2">Report and track garbage issues with AI</h1>
            <p className="hero-description">
              Upload photos, detect waste using AI, and notify authorities instantly.
            </p>

            <div className="hero-actions" id="get-started">
              <a className="button button-primary" href="#portal">
                Get Started
              </a>
              <div className="app-icons">
                {appChips.map((chip) => (
                  <span key={chip.label} className="app-chip">
                    <span aria-hidden="true">{chip.icon}</span>
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="feature-strip airy">
              {featureStats.map((stat) => (
                <article key={stat.label} className="feature-stat glass-card rounded-2xl shadow-lg">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </div>

            <div className="highlights">
              {highlights.map((item) => (
                <span key={item} className="highlight-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-visual reveal reveal-delay-1" aria-label="Mobile app preview">
            <div className="phone-frame rounded-3xl shadow-lg bg-gradient-to-r">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-header">
                  <div>
                    <small>Welcome back</small>
                    <h2>CleanCity AI</h2>
                  </div>
                  <div className="status-dot" />
                </div>

                <div className="phone-hero-card gradient-card rounded-2xl shadow-lg bg-gradient-to-r">
                  <span className="phone-hero-badge">AI Active</span>
                  <h3>Garbage detected nearby</h3>
                  <p>2 reports nearby are queued for review.</p>
                  <div className="phone-progress">
                    <span />
                  </div>
                </div>

                <div className="phone-feed">
                  {phoneCards.map((card, index) => (
                    <article key={card.title} className="phone-feed-card glass-card rounded-2xl shadow-lg" style={{ animationDelay: `${index * 120}ms` }}>
                      <div className="feed-bullet">0{index + 1}</div>
                      <div>
                        <h4>{card.title}</h4>
                        <p>{card.text}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="phone-footer">
                  <button type="button" className="phone-button phone-button-primary">
                    Report now
                  </button>
                  <button type="button" className="phone-button phone-button-secondary">
                    View map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-grid airy" id="about">
          <article className="info-card glass-card rounded-3xl shadow-lg">
            <p className="eyebrow">About</p>
            <h3>Designed for faster civic response</h3>
            <p>
              CleanCity AI combines image detection, text urgency cues, and location awareness to help teams prioritize the most critical garbage complaints.
            </p>
          </article>

          <article className="info-card glass-card rounded-3xl shadow-lg" id="reports">
            <p className="eyebrow">Reports</p>
            <h3>Submit evidence in seconds</h3>
            <p>
              Residents can upload a photo, add a short note, and share their coordinates from a phone or desktop.
            </p>
          </article>
        </section>

        <section className="section-grid airy" id="contact">
          <article className="info-card glass-card rounded-3xl shadow-lg">
            <p className="eyebrow">Contact</p>
            <h3>Built for city operations</h3>
            <p>
              Track complaints, monitor severity, and keep cleanup workflows moving with a simple admin-friendly interface.
            </p>
            <p>
              WhatsApp: <a href="https://wa.me/918863010344" target="_blank" rel="noreferrer">+91 8863010344</a>
              <br />
              Email: <a href="mailto:tsuyashdl@gmail.com">tsuyashdl@gmail.com</a>
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
