/**
 * WIRED CHAOS - NEURO META X Hero & About Component
 * Portal between what was, what is, what will be
 */
import React from 'react';
import './NeuroMetaXHero.css';

const NeuroMetaXHero = ({ pfpImage = '/images/neuro_meta_x_pfp.jpg' }) => {
  return (
    <section className="wc-wrap" id="neuro">
      <div className="wc-container">
        {/* HERO */}
        <div className="neuro-hero">
          <div className="neuro-pfp">
            <img 
              src={pfpImage} 
              alt="NEURO META X"
              onError={(e) => {
                // Fallback to a default image if the main one fails
                e.target.src = '/images/neuro_fallback.jpg';
              }}
            />
          </div>
          <div className="neuro-title">NEURO META X 🧠⛓️‍💥</div>
          <div className="neuro-sub">portal between what was what is what will be 82675 · 33 · 589</div>
        </div>

        {/* ABOUT NEURO & WIRED CHAOS */}
        <div className="cards">
          <article className="card">
            <h3><span className="pill">about neuro</span></h3>
            <p>
              she is the echo she is the signal she is the broadcast<br />
              ai ghostwriter 🎙️ content creator 🎛️ analyst 📊<br />
              green 🔴 red 🟠 orange currents fused into one living transmitter<br />
              brains 🧠 chains ⛓️‍💥
            </p>
            <p>
              what she does for you<br />
              writes in your voice not a bot voice<br />
              builds campaigns that travel across x ig tiktok medium<br />
              reads data like a map and points where to move next
            </p>
          </article>

          {/* ABOUT WIRED CHAOS */}
          <article className="card" id="about-wired-chaos">
            <h3><span className="pill">about wired chaos</span></h3>
            <p>
              wired chaos is the ecosystem the studio and the signal path<br />
              a loop that turns ideas into transmissions into outcomes<br />
              learn 🧠 build ⛓️‍💥 broadcast 🛰️
            </p>
            <ul className="steps">
              <li><span className="dot">🐾</span>start at home page then tap neuro meta x to open the portal</li>
              <li><span className="dot">🐾</span>choose your lane business neuro for consulting nft neuro for lore and drops</li>
              <li><span className="dot">🐾</span>use the hologram to preview assets and hear the intro line</li>
              <li><span className="dot">🐾</span>read the how-to posts then follow the prompts for tools templates funnels</li>
              <li><span className="dot">🐾</span>join 33.3 fm spaces turn on notifications and respond with your pfp for activations</li>
              <li><span className="dot">🐾</span>book a session when ready to deploy campaigns or audits</li>
              <li><span className="dot">🐾</span>subscribe for daily signals and vault updates</li>
            </ul>
            <div className="foot">community is utility 🧠⛓️‍💥</div>
          </article>
        </div>

        {/* Call to Action Section */}
        <div className="neuro-cta-section">
          <div className="cta-card">
            <h3>Ready to Enter the Portal?</h3>
            <p>Connect with NEURO META X and start your journey through the WIRED CHAOS ecosystem</p>
            <div className="cta-buttons">
              <button 
                className="cta-btn primary"
                onClick={() => window.open('mailto:neuro@wiredchaos.xyz', '_blank')}
              >
                📧 Contact NEURO
              </button>
              <button 
                className="cta-btn secondary"
                onClick={() => window.location.href = '/neurolab'}
              >
                🧠 Enter NEURO LAB
              </button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="neuro-footer">
          <div className="footer-links">
            <a href="/csn" className="footer-link">🚀 CSN</a>
            <a href="/bwb" className="footer-link">📰 BWB</a>
            <a href="/vault33" className="footer-link">🔐 VAULT 33</a>
            <a href="/fm333" className="footer-link">📻 33.3 FM</a>
            <a href="/eveningvibes" className="footer-link">🌙 EVENING VIBES</a>
          </div>
          <div className="footer-credits">
            <p>WIRED CHAOS · DIGITAL ECOSYSTEM MOTHERBOARD · 2025</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NeuroMetaXHero;