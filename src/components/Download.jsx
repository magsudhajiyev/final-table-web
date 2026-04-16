export default function Download() {
  return (
    <section className="cta-promo-section observe-me" id="download">
      <div className="cta-promo-card">
        <div className="cta-promo-content">
          <h2>Download the app, and take your stats anywhere.</h2>
          <div className="cta-promo-actions">
            <div className="cta-qr-box">
              <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M7 7h.01" /><path d="M18 7h.01" /><path d="M18 18h.01" /><path d="M7 18h.01" />
                <path d="M10 10v4h4v-4z" />
              </svg>
            </div>
            <div className="cta-store-buttons">
              <div className="store-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                </svg>
                <div className="store-text">
                  <span>Download on the</span>
                  <strong>App Store</strong>
                </div>
              </div>
              <img src="/assets/mockups/google-play-badge.svg" alt="Get it on Google Play" className="store-badge" />
            </div>
          </div>
        </div>
        <div className="cta-promo-mockups">
          <img src="/assets/mockups/cta_cluster.png" alt="App features" className="cta-cluster-img" />
        </div>
      </div>
    </section>
  )
}
