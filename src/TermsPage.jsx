import { useState, useEffect, useRef } from 'react'
import { useT, SUPPORTED } from './i18n'
import './LandingPage.css'
import './LegalPage.css'
import 'flag-icons/css/flag-icons.min.css'

const FLAG_ISO = { de: 'de', en: 'gb', es: 'es', fr: 'fr', pl: 'pl', pt: 'br', ru: 'ru' }
function Flag({ locale }) {
  return <span className={`fi fi-${FLAG_ISO[locale]} tp-flag`} />
}

function LegalNavbar() {
  const { t, locale, setLocale } = useT()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const mobileLangRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target) && mobileLangRef.current && !mobileLangRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (menuOpen) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  return (
    <header className={`tp-nav-wrap tp-nav-light${scrolled ? ' tp-nav-scrolled' : ''}${menuOpen ? ' tp-nav-menu-open' : ''}`}>
      <nav className="tp-nav">
        <a href="/" className="tp-nav-logo">
          <img src="/nwa_logo.svg" alt="Final Table" className="tp-nav-logo-img" />
        </a>
        <div className="tp-nav-sep" />
        <div className="tp-nav-links">
          <a href="/#how-it-works">{t('nav.howItWorks')}</a>
          <a href="/#features">{t('nav.features')}</a>
          <a href="/#compare">{t('nav.compare')}</a>
          <a href="/#faq">{t('nav.faq')}</a>
        </div>
        <div className="tp-lang-picker" ref={langRef}>
          <button className="tp-lang-btn" onClick={() => setLangOpen(o => !o)}>
            <Flag locale={locale} />
            <svg className={`tp-lang-chevron${langOpen ? ' tp-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langOpen && (
            <div className="tp-lang-dropdown">
              {SUPPORTED.map(l => (
                <button key={l} className={`tp-lang-option${l === locale ? ' tp-lang-option-active' : ''}`} onClick={() => { setLocale(l); setLangOpen(false) }}>
                  <Flag locale={l} />
                  <span>{t(`lang.${l}`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <a href="/#reserve-form" className="tp-nav-waitlist-btn">
          {t('nav.cta')}
        </a>
        <button
          className="tp-nav-hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>
      <div className={`tp-nav-mobile-menu${menuOpen ? ' tp-nav-mobile-menu-open' : ''}`}>
        <a href="/#how-it-works">{t('nav.howItWorks')}</a>
        <a href="/#features">{t('nav.features')}</a>
        <a href="/#compare">{t('nav.compare')}</a>
        <a href="/#faq">{t('nav.faq')}</a>
        <div className="tp-nav-mobile-lang" ref={mobileLangRef}>
          <button className="tp-mobile-lang-current" onClick={() => setLangOpen(o => !o)}>
            <span><Flag locale={locale} /> {t(`lang.${locale}`)}</span>
            <svg className={`tp-mobile-lang-chevron${langOpen ? ' tp-mobile-lang-chevron-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langOpen && (
            <div className="tp-mobile-lang-grid">
              {SUPPORTED.map(l => (
                <button key={l} className={`tp-mobile-lang-btn${l === locale ? ' tp-mobile-lang-active' : ''}`} onClick={() => { setLocale(l); setLangOpen(false) }}>
                  <Flag locale={l} /> {t(`lang.${l}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function LegalFooter() {
  const { t } = useT()
  const year = new Date().getFullYear()

  const company = [
    { title: t('footer.privacy'),  href: '/privacy' },
    { title: t('footer.terms'),    href: '/terms' },
  ]

  const resources = [
    { title: t('nav.howItWorks'),   href: '/#how-it-works' },
    { title: t('nav.features'),     href: '/#features' },
    { title: t('nav.compare'),      href: '/#compare' },
    { title: t('about.nav'),        href: '/about' },
    { title: t('nav.faq'),          href: '/#faq' },
  ]

  return (
    <footer className="mf-footer">
      <div className="mf-inner">
        <a href="/" className="mf-logo">
          <img src="/nwa_logo_dark_v2.svg" alt="Final Table" className="mf-logo-img" />
        </a>
        <div className="mf-grid">
          <div className="mf-brand">
            <div className="mf-brand-content">
              <div className="mf-headline">{t('footer.tagline')}</div>
              <p className="mf-tagline">{t('hero.sub')}</p>
            </div>
            <p className="mf-support">{t('footer.support')}</p>
          </div>
          <div className="mf-nav">
            <div className="mf-col">
              <span className="mf-col-head">{t('footer.resources')}</span>
              {resources.map(({ href, title }, i) => (
                <a key={i} href={href} className="mf-link">{title}</a>
              ))}
            </div>
            <div className="mf-col">
              <span className="mf-col-head">{t('footer.company')}</span>
              {company.map(({ href, title }, i) => (
                <a key={i} href={href} className="mf-link">{title}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="mf-divider" />
        <p className="mf-copy">{t('footer.copy', { year })}</p>
      </div>
    </footer>
  )
}

export default function TermsPage() {
  return (
    <div className="tp-root legal-root">
      <LegalNavbar />
      <main className="legal-main" data-nav-theme="light">
        <h1>Terms of Service</h1>
        <p className="legal-effective"><strong>Effective Date:</strong> May 1, 2026 &nbsp;·&nbsp; <strong>Last Updated:</strong> April 16, 2026</p>

        <p>These Terms of Service ("Terms") govern your access to and use of the <strong>Final Table</strong> mobile application and related services (the "Service"), operated by <strong>Magsud Hajiyev</strong>, a sole proprietor based in the Republic of Azerbaijan ("we", "us", "our", or "Final Table").</p>

        <div className="legal-callout"><strong>By downloading, installing, or using the Service, you agree to these Terms.</strong> If you do not agree, do not use the Service.</div>

        <h2>1. Eligibility</h2>
        <p>You must be at least <strong>18 years old</strong> to use the Service. By using the Service, you represent and warrant that you are 18 or older and have full legal capacity to enter into these Terms in your jurisdiction.</p>
        <p>The Service is not directed to children. If we learn that a person under 18 has registered, we will delete the account.</p>

        <h2>2. The Service — What Final Table Is and Is Not</h2>
        <p>Final Table is a <strong>poker tracking, analytics, and club-management tool</strong>. It helps you:</p>
        <ul>
          <li>Log poker hands and sessions.</li>
          <li>Track statistics (VPIP, PFR, 3-bet, bankroll, etc.) and play style.</li>
          <li>Manage clubs, events, waitlists, and dealer-assisted sessions.</li>
          <li>Receive AI-assisted hand and session analysis.</li>
        </ul>
        <div className="legal-callout">
          <strong>Final Table does NOT:</strong>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>Facilitate real-money gambling, wagering, or betting.</li>
            <li>Process, hold, or transfer stakes, buy-ins, winnings, payouts, or prize money.</li>
            <li>Match players for real-money games or operate any game of chance for money.</li>
            <li>Function as a gambling platform, casino, bookmaker, or skill-game operator.</li>
          </ul>
        </div>
        <p>Any money you record in the app (buy-ins, cash-outs, bankroll figures) is for your personal record-keeping only. You are solely responsible for complying with the gambling, tax, and other laws that apply to you.</p>

        <h2>3. Account Registration</h2>
        <p>To use most features you must create an account (email/password or Google Sign-In). You agree to:</p>
        <ul>
          <li>Provide accurate and current information.</li>
          <li>Keep your credentials confidential.</li>
          <li>Notify us immediately of any unauthorized use at <a href="mailto:support@finaltable.io">support@finaltable.io</a>.</li>
          <li>Be responsible for all activity that occurs under your account.</li>
        </ul>
        <p>We may suspend or terminate accounts that we reasonably believe are fraudulent, abusive, or in violation of these Terms.</p>

        <h2>4. Subscriptions and Billing</h2>

        <h3>4.1 Plans</h3>
        <p>Final Table offers tiered plans:</p>
        <ul>
          <li><strong>Free tier</strong> — Limited features, including up to 5 hands per session, 10 opponent profiles, and a 30-day session history window. Limits may change from time to time.</li>
          <li><strong>Pro</strong> — Unlimited hand logging, unlimited opponents, full history, AI hand analysis, CSV export, advanced statistics. Currently USD $29.99 / month or $249.99 / year.</li>
          <li><strong>Club</strong> — All Pro features plus dealer voice logging, live event management, real-time sync, QR seat assignments, and club analytics, with up to 10 tables included. Currently USD $39.99 / month or $299.99 / year. Additional tables may be available as an add-on for $9.99 / month per 10 tables.</li>
        </ul>
        <p>Promotional offers, such as a 7-day free trial or launch-only lifetime licenses, may be offered from time to time on terms disclosed at purchase.</p>
        <p>Prices, features, and availability may change. Changes will not affect an existing paid term but will apply at renewal.</p>

        <h3>4.2 Payment Processing</h3>
        <p>All purchases are processed by <strong>Apple (App Store)</strong> or <strong>Google (Google Play)</strong> and managed through <strong>RevenueCat</strong>. We do not collect or store your payment card details. Purchases are subject to the Apple Media Services Terms and/or Google Play Terms of Service, which take precedence over these Terms for billing disputes with those platforms.</p>

        <h3>4.3 Auto-Renewal</h3>
        <p>Subscriptions <strong>auto-renew</strong> at the end of each billing period at the then-current price unless you cancel at least 24 hours before the renewal date. You can manage and cancel subscriptions in your App Store or Google Play account settings. Uninstalling the app does <strong>not</strong> cancel a subscription.</p>

        <h3>4.4 Free Trials</h3>
        <p>If you start a free trial, you may be charged the regular subscription price at the end of the trial unless you cancel before the trial ends. Only one trial per user/device/family as determined by the applicable app store.</p>

        <h3>4.5 Refunds</h3>
        <p>Refunds are governed by the policies of the Apple App Store and Google Play. We generally do not issue refunds directly. If you believe you were charged in error, contact the applicable store first, and then contact us at <a href="mailto:support@finaltable.io">support@finaltable.io</a> if needed.</p>

        <h3>4.6 Taxes</h3>
        <p>Prices do not include taxes or similar levies. The app store may add applicable VAT, GST, or sales tax at checkout based on your billing country.</p>

        <h2>5. User Content</h2>

        <h3>5.1 What Is User Content</h3>
        <p>"User Content" means anything you submit or create through the Service, including hand logs, session notes, tags, opponent names and notes, club names and descriptions, event details, display names, avatars, and voice audio you record through dealer mode.</p>

        <h3>5.2 Ownership</h3>
        <p>You retain ownership of your User Content.</p>

        <h3>5.3 License You Grant Us</h3>
        <p>You grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, modify, and display your User Content solely to operate, maintain, and improve the Service, including syncing your data across your devices and sharing it with club members where you have chosen to do so.</p>
        <p>You also grant us the right to <strong>use de-identified and aggregated poker data</strong> (hand actions, positions, board cards, stack sizes, outcomes — without your name, email, or account identifier) to train, evaluate, and improve the AI features of the Service, as described in our Privacy Policy.</p>

        <h3>5.4 Your Responsibilities</h3>
        <p>You represent that you have all rights necessary to grant the license above and that your User Content:</p>
        <ul>
          <li>Does not infringe anyone's intellectual property, privacy, or other rights.</li>
          <li>Does not include sensitive personal data of others (e.g., full names combined with financial information).</li>
          <li>Is not unlawful, defamatory, harassing, hateful, or obscene.</li>
        </ul>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ol>
          <li>Use the Service for any unlawful purpose, including organizing or facilitating illegal gambling in your jurisdiction.</li>
          <li>Circumvent subscription limits or free-tier gating (e.g., by abusing trials or sharing accounts commercially).</li>
          <li>Reverse engineer, decompile, or attempt to extract the source code of the Service, except as permitted by law.</li>
          <li>Interfere with or disrupt the Service, our servers, or other users' accounts.</li>
          <li>Scrape, crawl, or automatically harvest data from the Service.</li>
          <li>Upload malware or exploit vulnerabilities.</li>
          <li>Use the Service to harass, threaten, or defame others.</li>
          <li>Impersonate another person or misrepresent your affiliation with any person or club.</li>
          <li>Share another person's personal information in club or event content without their consent.</li>
          <li>Use the Service in any way that violates applicable law, including poker, gaming, export control, or sanctions laws.</li>
        </ol>
        <p>We may remove User Content and suspend or terminate accounts that violate these rules.</p>

        <h2>7. Clubs, Events, and Community Features</h2>
        <p>Final Table includes features for creating clubs, running events, and sharing hands with other users.</p>
        <ul>
          <li><strong>Club owners and admins</strong> are responsible for the content, conduct, and compliance of their clubs, including ensuring that any in-person events they organize comply with local law (licensing, taxes, etc.).</li>
          <li><strong>We are not a party</strong> to any in-person game, tournament, side bet, or financial arrangement organized through or recorded in the Service.</li>
          <li><strong>Member conduct</strong> is the responsibility of each member. You use community features at your own risk.</li>
        </ul>
        <p>Public leaderboards and club content may be visible to other users. Do not post anything you do not want publicly associated with you.</p>

        <h2>8. Voice Logging (Dealer Mode)</h2>
        <p>Dealer mode uses your device microphone to transcribe poker actions. By enabling dealer voice logging, you:</p>
        <ul>
          <li>Consent to the recording and transmission of short audio segments to our backend and to third-party speech providers (Deepgram/Soniox).</li>
          <li>Represent that any other people present have consented to their voices being processed for transcription, where required by applicable law.</li>
        </ul>
        <p>You can disable voice logging at any time. See our <a href="/privacy">Privacy Policy</a> for details.</p>

        <h2>9. AI Features</h2>
        <p>The Service offers AI-generated hand and session analysis, including coaching reports and leak detection. AI outputs:</p>
        <ul>
          <li>Are <strong>for informational and educational purposes only</strong>.</li>
          <li>May be incomplete, inaccurate, or outdated.</li>
          <li>Do not constitute professional advice (financial, tax, legal, or otherwise).</li>
        </ul>
        <p>You are solely responsible for your poker decisions and for verifying any AI output before relying on it.</p>

        <h2>10. Third-Party Services</h2>
        <p>The Service integrates with third-party services (Firebase, RevenueCat, Deepgram, Soniox, Apple, Google, etc.). Your use of those services is subject to their own terms and privacy policies. We are not responsible for the availability, content, or practices of third-party services.</p>

        <h2>11. Intellectual Property</h2>
        <p>The Service, including its software, design, branding, logos, and content we create, is owned by Magsud Hajiyev and is protected by copyright, trademark, and other laws. Except for the limited license granted below, no rights are transferred to you.</p>
        <p><strong>License to you:</strong> We grant you a personal, non-exclusive, non-transferable, revocable license to install and use the Service on devices you own or control, solely for your personal, non-commercial use, subject to these Terms.</p>
        <p>You may not copy, modify, distribute, sell, or lease any part of the Service, or remove any proprietary notices.</p>

        <h2>12. Feedback</h2>
        <p>If you send us feedback or suggestions, you grant us a perpetual, irrevocable, royalty-free license to use them without restriction or compensation.</p>

        <h2>13. Disclaimers</h2>
        <div className="legal-callout"><strong>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind</strong>, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, reliability, and quiet enjoyment.</div>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Service will be uninterrupted, error-free, or secure.</li>
          <li>Statistics, AI output, or analytics will be accurate or complete.</li>
          <li>Data sync or backup will prevent data loss — you are responsible for maintaining your own backups where important.</li>
          <li>Voice recognition will correctly transcribe poker actions in all conditions.</li>
        </ul>
        <p>You use the Service <strong>at your own risk</strong>.</p>

        <h2>14. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law:</p>
        <ul>
          <li>Neither Magsud Hajiyev nor any affiliate, service provider, or contractor will be liable for any <strong>indirect, incidental, special, consequential, exemplary, or punitive damages</strong>, including loss of profits, data, goodwill, or other intangible losses.</li>
          <li>Our <strong>total liability</strong> for all claims arising out of or relating to the Service in any 12-month period will not exceed the greater of (a) the amount you paid us for the Service during that period, or (b) USD $50.</li>
        </ul>
        <p>Some jurisdictions do not allow the exclusion or limitation of certain damages; in those jurisdictions, our liability is limited to the smallest extent permitted by law.</p>

        <h2>15. Indemnification</h2>
        <p>You agree to indemnify and hold harmless Magsud Hajiyev and his agents from any claim, liability, loss, or expense (including reasonable attorneys' fees) arising out of or related to (a) your use of the Service, (b) your User Content, (c) your violation of these Terms, or (d) your violation of any law or rights of a third party.</p>

        <h2>16. Termination</h2>
        <p>You may stop using the Service at any time. You may delete your account from Profile → Settings → Delete Account, which will delete your poker and opponent data per our Privacy Policy's retention rules.</p>
        <p>We may suspend or terminate your access, with or without notice, if we reasonably believe you have violated these Terms, created risk for us or other users, or if required by law.</p>
        <p>Sections that by their nature should survive termination (including Sections 5.3, 11, 13, 14, 15, 18, and 19) will survive.</p>

        <h2>17. Changes to the Service and to These Terms</h2>
        <p>We may modify or discontinue features at any time. We may also update these Terms. If changes are material, we will notify you via the app or email at least 14 days before the changes take effect. Your continued use of the Service after the effective date of the updated Terms constitutes acceptance.</p>

        <h2>18. Governing Law and Dispute Resolution</h2>
        <p>These Terms are governed by the laws of the <strong>Republic of Azerbaijan</strong>, without regard to its conflict of laws rules. The courts of the Republic of Azerbaijan will have exclusive jurisdiction over any dispute, subject to any mandatory consumer protection rights available to you under the law of the country where you reside.</p>
        <p>Nothing in these Terms limits your statutory consumer rights.</p>

        <h2>19. Apple App Store — Additional Terms</h2>
        <p>If you obtained the Service from the Apple App Store, the following also apply:</p>
        <ul>
          <li>These Terms are between you and Magsud Hajiyev, not with Apple. Apple is not responsible for the Service or its content.</li>
          <li>Apple has no obligation to provide maintenance or support for the Service.</li>
          <li>In the event of any failure of the Service to conform to any applicable warranty, you may notify Apple, and Apple may refund the purchase price (if any); to the maximum extent permitted by law, Apple has no other warranty obligation with respect to the Service.</li>
          <li>Apple is not responsible for addressing any claims by you or a third party relating to the Service or your use of it (including product liability, legal/regulatory compliance, or consumer protection claims).</li>
          <li>In the event of a third-party claim that the Service or your use infringes intellectual property rights, Apple is not responsible for the investigation, defense, settlement, or discharge of the claim.</li>
          <li>You represent that you are not located in a country subject to a U.S. government embargo or designated as a "terrorist supporting" country, and that you are not listed on any U.S. government list of prohibited or restricted parties.</li>
          <li>Apple and Apple's subsidiaries are <strong>third-party beneficiaries</strong> of these Terms and may enforce them against you.</li>
        </ul>

        <h2>20. Google Play — Additional Terms</h2>
        <p>If you obtained the Service from Google Play, your use is also subject to the Google Play Terms of Service. Billing disputes should be raised with Google first.</p>

        <h2>21. Miscellaneous</h2>
        <ul>
          <li><strong>Entire agreement.</strong> These Terms, together with the Privacy Policy, are the entire agreement between you and us regarding the Service.</li>
          <li><strong>No waiver.</strong> Our failure to enforce any right or provision is not a waiver.</li>
          <li><strong>Severability.</strong> If any provision is held invalid, the remaining provisions remain in effect.</li>
          <li><strong>Assignment.</strong> You may not assign these Terms without our consent. We may assign them as part of a merger, acquisition, or sale of assets.</li>
          <li><strong>No agency.</strong> No agency, partnership, joint venture, or employment relationship is created by these Terms.</li>
          <li><strong>Language.</strong> These Terms are provided in English. Translations, if any, are for convenience only; the English version controls.</li>
        </ul>

        <h2>22. Contact</h2>
        <p>
          <strong>Magsud Hajiyev</strong><br />
          Sole Proprietor — Republic of Azerbaijan<br />
          Email: <a href="mailto:support@finaltable.io">support@finaltable.io</a>
        </p>

        <div className="legal-disclaimer">
          This document is provided for transparency and App Store compliance. It is not legal advice. Consult a qualified attorney in your jurisdiction if you require legal guidance.
        </div>
      </main>
      <LegalFooter />
    </div>
  )
}
