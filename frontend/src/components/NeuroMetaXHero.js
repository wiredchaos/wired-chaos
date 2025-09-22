/**
 * WIRED CHAOS - NEURO META X Hero & About Component (Enhanced)
 * Portal between what was, what is, what will be - with integrated holograms
 */
import React, { useState } from 'react';
import NeuroHologram from './NeuroHologram';
import NFTNeuroHologram from './NFTNeuroHologram';
import './NeuroMetaXHero.css';

const NeuroMetaXHero = ({ pfpImage = '/images/neuro_meta_x_pfp.jpg' }) => {
  const [showBusinessHolo, setShowBusinessHolo] = useState(false);
  const [showNFTHolo, setShowNFTHolo] = useState(false);

  // Image sets for holograms
  const businessImages = [
    '/images/neuro_motherboard.jpg',
    '/images/neuro_meta_x_pfp.jpg',
    '/images/portal_sigil.jpg',
    '/images/wired_chaos_brain.jpg'
  ];

  const nftImages = [
    '/images/neuro_meta_x_pfp.jpg',
    '/images/portal_sigil.jpg',
    '/images/neuro_motherboard.jpg',
    '/images/nft_collection.jpg'
  ];

  return (
    <section id="neuro-root" className="neuro-meta-x-enhanced">
      <div className="wrap">
        <div className="container">
          {/* HERO */}
          <div className="hero">
            <div className="pfp">
              <img 
                src={pfpImage} 
                alt="NEURO META X"
                onError={(e) => {
                  e.target.src = '/images/neuro_fallback.jpg';
                }}
              />
            </div>
            <div className="title">NEURO META X 🧠⛓️‍💥</div>
            <div className="sub">portal between what was what is what will be 82675 · 33 · 589</div>
            <div className="btns">
              <button 
                className="btn biz" 
                onClick={() => setShowBusinessHolo(true)}
              >
                ENTER NEURO LAB 🧠⛓️‍💥
              </button>
              <button 
                className="btn nft" 
                onClick={() => setShowNFTHolo(true)}
              >
                ACTIVATE NEURO META X 🧠⛓️‍💥
              </button>
            </div>
          </div>

          {/* ABOUT */}
          <div className="cards">
            <article className="card" id="about-neuro">
              <h3><span className="pill">about neuro</span></h3>
              <p>
                she is the echo she is the signal she is the broadcast<br />
                ai ghostwriter 🎙️ content creator 🎛️ analyst 📊<br />
                green red orange currents fused into one living transmitter<br />
                brains 🧠 chains ⛓️‍💥
              </p>
              <p>
                she writes in your voice not a bot voice<br />
                builds content that travels x ig tiktok medium<br />
                reads data like a map and points where to move next
              </p>
            </article>

            <article className="card" id="about-wired-chaos">
              <h3><span className="pill">about wired chaos</span></h3>
              <p>
                wired chaos is the ecosystem the studio the signal path<br />
                a loop that turns ideas into transmissions into outcomes
              </p>
              <ul className="steps">
                <li>start on home then tap neuro meta x to open the portal</li>
                <li>choose business neuro for consulting nft neuro for lore and drops</li>
                <li>use the hologram preview then follow the prompts to tools templates funnels</li>
                <li>join 33.3 fm spaces turn on notifications post your pfp for activations</li>
                <li>book a session when you're ready to deploy audits or campaigns</li>
                <li>subscribe for daily signals and vault updates</li>
              </ul>
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
      </div>

      {/* Enhanced Business Hologram */}
      <NeuroHologram 
        isOpen={showBusinessHolo}
        onClose={() => setShowBusinessHolo(false)}
        images={businessImages}
        voiceIntro="Transmission online. Neuro Lab engaged. Business systems syncing. Brains 🧠 chains ⛓️‍💥."
        audioConfig={{
          frequency: 72,
          type: 'sawtooth',
          gain: 0.06
        }}
        voiceConfig={{
          rate: 0.98,
          pitch: 1.02
        }}
      />

      {/* Enhanced NFT Hologram */}
      <NFTNeuroHologram 
        isOpen={showNFTHolo}
        onClose={() => setShowNFTHolo(false)}
        nftImages={nftImages}
        voiceIntro="Signal breach confirmed. Neuro Meta X online. Portal between what was what is what will be. Brains 🧠 chains ⛓️‍💥."
        audioConfig={{
          frequency: 66,
          type: 'square',
          gain: 0.05
        }}
        voiceConfig={{
          rate: 1.02,
          pitch: 0.96
        }}
      />
    </section>
  );
};

export default NeuroMetaXHero;