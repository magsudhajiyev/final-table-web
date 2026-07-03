import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'ft_lang'
const SUPPORTED = ['de', 'en', 'es', 'fr', 'pl', 'pt', 'ru', 'tr']

function detectLocale() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED.includes(stored)) return stored
  const lang = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase()
  if (lang.startsWith('pl')) return 'pl'
  if (lang.startsWith('ru')) return 'ru'
  if (lang.startsWith('fr')) return 'fr'
  if (lang.startsWith('es')) return 'es'
  if (lang.startsWith('de')) return 'de'
  if (lang.startsWith('pt')) return 'pt'
  if (lang.startsWith('tr')) return 'tr'
  return 'en'
}

/* ─────────────────────────────────────────────── */
/*  ENGLISH                                        */
/* ─────────────────────────────────────────────── */
const en = {
  // Navbar
  'nav.features': 'Features',
  'nav.howItWorks': 'How it works?',
  'nav.compare': 'Compare',
  'nav.faq': 'FAQ',
  'nav.cta': 'Download on iOS',

  // How it works section title
  'howSection.sans': 'How it ',
  'howSection.italic': 'works?',

  // Hero
  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Log a hand in</span>
      <span className="tp-hero-hl-italic">three gestures</span>
      <span className="tp-hero-hl-sans">Not three minutes.</span>
    </>
  ),
  'hero.sub': 'Final Table is the live poker tracker built for the table. Fast enough to log a hand one-handed between deals. Accurate enough to study every session later.',
  'hero.emailPlaceholder': 'Enter your email',
  'hero.errorGeneric': 'Something went wrong. Please try again.',
  'hero.btnLoading': 'Reserving…',
  'hero.btnSubmit': 'Reserve My Spot',
  'hero.proof': (p) => `Free · Takes 10 seconds · ${p.count}+ players already reserved`,
  'hero.successText': 'You\'re on the list! We\'ll reach out when Final Table opens.',
  'hero.already': 'You\'re already on the list! We\'ll notify you when we launch.',
  'hero.resetBtn': 'Reserve another',

  // Comparison
  'compare.eyebrow': 'What makes it different?',
  'compare.title': () => <>Built for the <em>live game</em>.<br />Designed for the <em>player at the rail</em>.</>,
  'compare.subtitle': 'Live poker trackers exist. None of them feel like they belong at the table. Final Table feels like part of the game.',
  'compare.card1.title': 'Three-gesture logging',
  'compare.card1.desc': 'Log any action — raise, call, fold — in three taps. No typing, no menus. Fast enough to use between hands without missing a beat.',
  'compare.card2.title': 'Opponent reads in real time',
  'compare.card2.desc': 'Build stat-backed profiles on every player you face. Know their VPIP, aggression, and tendencies before you act.',
  'compare.card3.title': 'Session + hand-level data',
  'compare.card3.desc': 'Track everything from a quick buy-in/cash-out to full hand-by-hand action logging. Use what fits your game.',
  'compare.card4.title': 'Dealer Mode',
  'compare.card4.desc': 'Dealers run the table hands-free with voice commands. Players follow along on their own phones in real time.',
  'compare.comingSoon': 'COMING SOON · VENUE PARTNERSHIPS',

  // Tabs (BgSection)
  'tabs.0.label': 'Before the session',
  'tabs.1.label': 'At the table',
  'tabs.2.label': 'After the session',
  'tabs.3.label': 'Over time',
  'tabs.0.eyebrow': 'BEFORE THE SESSION',
  'tabs.0.title': "Walk in knowing\nwho you're playing.",
  'tabs.0.body': "Review opponent profiles and past hand history before you even sit down. Know who's tight, who's wild, and where the money is.",
  'tabs.1.eyebrow': 'AT THE TABLE',
  'tabs.1.title': 'Three gestures.\nZero lost flow.',
  'tabs.1.body': 'Log any action — raise, call, fold — by just swiping and tapping. Monitor your session progress. Fast enough to use one-handed between hands.',
  'tabs.2.eyebrow': 'AFTER THE SESSION',
  'tabs.2.title': "See the leaks\nyou couldn't feel.",
  'tabs.2.body': 'Review every hand, spot patterns in your play, share any hands with your friends, export solver compatible hand data and compare your decisions to GTO baselines. The data tells the truth.',

  // What Final Table isn't
  'notHud.title': () => <><span className="nh-hl-sans">What Final Table</span><span className="nh-hl-italic"> isn't?</span></>,
  'notHud.item1Title': 'Not a HUD',
  'notHud.item1Desc': "Final Table doesn't display stats or player data during live play. It's a logger, not a heads-up display.",
  'notHud.item2Title': 'Locked during sessions',
  'notHud.item2Desc': "While a session is active, the app locks into logging mode. You can't browse hands, share data, use AI analysis, or access analytics until the session ends.",
  'notHud.item3Title': 'Built for fair play',
  'notHud.item3Desc': 'Everything happens after the session. Review, share, and analyze — but never at the table with an unfair edge.',

  'tabs.3.eyebrow': 'OVER TIME',
  'tabs.3.title': 'Know your real\nwin rate. Finally.',
  'tabs.3.body': 'Track your true $/hr by stakes, casino, and game type. Make stake decisions based on data, not gut feelings.',

  // Problems (Stack Cards)
  'problems.0.stat': () => <>Live poker players play<br /><strong>~25–30 hands/hour</strong> on average.</>,
  'problems.0.question': 'How many of those hands do you actually remember?',
  'problems.0.body': 'Final Table tracks every hand you play, so you can review every action and find leaks you never knew you had.',
  'problems.1.stat': 'Ask any live player their win rate. Most guess.',
  'problems.1.question': 'Do you actually know your $/hr by stakes, casino, or game type?',
  'problems.1.body': 'Final Table tracks every session with precision — win rate, duration, stakes — so you always know exactly where you stand.',
  'problems.2.stat': 'Position is the single biggest edge in poker.',
  'problems.2.question': 'Do you know your actual stats from the BTN vs the BB vs UTG?',
  'problems.2.body': 'Final Table breaks down your performance by position, so you can see where you print money and where you bleed chips.',
  'problems.3.stat': () => <>"He always 3-bets light." "She never folds the river."</>,
  'problems.3.question': 'Are those real reads or just feelings from one memorable hand?',
  'problems.3.body': 'Final Table builds opponent profiles from logged hands — real stats, real tendencies — so your reads are backed by data, not memory.',

  // Features Showcase
  'features.title': () => <>Buckle up —<br /><em>there's more coming</em>.</>,
  'features.subtitle': 'Hand logging is just the tip of the iceberg. Final Table has many other intelligent features.',
  'features.opponentProfiles.title': 'Statistics',
  'features.opponentProfiles.desc': "See your statistics generated over time to identify your play style. Track VPIP, aggression, win rates, and more — the numbers don't lie.",
  'features.bankroll.title': 'Bankroll Tracking',
  'features.bankroll.desc': 'Set a bankroll goal and watch your progress. See your hourly rate, net profit, ROI and many more bankroll metrics.',
  'features.sessionLogger.title': 'AI Analysis',
  'features.sessionLogger.desc': "Get AI-powered insights on your play. Analyze hand histories, identify patterns, and receive personalized recommendations to improve your game.",
  'features.handReview.title': 'Hand Review',
  'features.handReview.desc': "Replay every hand you logged. Walk through each street, compare your decisions to GTO baselines, and spot the leaks you couldn't feel at the table.",
  'features.mtt.title': 'Multi-Table Tournaments',
  'features.mtt.desc': 'Run live tournaments with multiple tables, real-time rankings, and prize distribution. Create clubs, manage members and roles — all from the app.',
  'features.dealerMode.title': 'Dealer Mode',
  'features.dealerMode.comingSoon': 'COMING SOON',
  'features.dealerMode.desc': 'Dealers can run a table hands-free using voice commands. Players follow along on their own phones in real time.',

  // Final CTA
  'cta.eyebrow': 'Early access',
  'cta.title': () => <>Reserve your username<br />before anyone else does.</>,
  'cta.titleLine1': 'Reserve your username',
  'cta.titleLine2': 'before anyone else does.',
  'cta.body': "Claim your permanent handle ahead of launch. Usernames are first-come, first-served — once it's gone, it's gone.",
  'cta.proof': (p) => <><strong>{p.count}+</strong> players already on the waitlist</>,
  'cta.support': () => <>Questions? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Claim your handle',
  'cta.cardSub': 'Free · Takes 10 seconds',
  'cta.labelEmail': 'Email',
  'cta.emailPlaceholder': 'you@example.com',
  'cta.hintEmail': "Your future sign-in email — can't be changed later.",
  'cta.labelUsername': 'Username',
  'cta.usernamePlaceholder': 'yourhandle',
  'cta.hintUsername': 'Letters, numbers and underscores only. 3–20 characters.',
  'cta.errorTaken': 'That username is already taken. Try a different one.',
  'cta.errorGeneric': 'Something went wrong. Please try again.',
  'cta.btnLoading': 'Reserving…',
  'cta.btnSubmit': 'Reserve my spot →',
  'cta.successChip': '✓ Reserved',
  'cta.successTitle': "You're on the list.",
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> is reserved for you. We'll reach out when Final Table opens.</>
  ),
  'cta.resetBtn': 'Reserve another',

  // FAQ
  'faq.0.q': 'Can I change my username later?',
  'faq.0.a': 'Once reserved, your username is locked in. Choose carefully — this becomes your permanent handle in Final Table.',
  'faq.1.q': 'Is reserving free?',
  'faq.1.a': 'Yes, as long as that username is not taken, you can.',
  'faq.2.q': 'What if my username is taken?',
  'faq.2.a': "Usernames are first-come, first-served. If your preferred handle is gone, try a variation — underscores and numbers are fair game.",
  'faq.3.q': 'When will the app launch?',
  'faq.3.a': 'Final Table is in closed beta. Waitlist members get early access before the public launch.',

  // Bottom CTA
  'bottomCta.title': () => (
    <>
      <span className="bc-hl-sans">Ready to</span>
      <span className="bc-hl-italic"> track your hands?</span>
      <span className="bc-hl-sans">.</span>
    </>
  ),
  'bottomCta.sub': 'Join the early waitlist and get notified the moment we go live.',

  // Footer
  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Log a hand in </span><span className="mf-hl-italic">three gestures.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">Not three minutes.</span></p>
    </>
  ),
  'footer.support': () => <>Questions? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Resources',
  'footer.company': 'Company',
  'footer.privacy': 'Privacy Policy',
  'footer.terms': 'Terms of Service',
  'footer.copy': (p) => `© Final Table. All rights reserved ${p.year}`,

  // About
  'about.nav': 'About',
  'about.missionEyebrow': 'Our Mission',
  'about.missionTitle': () => <>Make live poker<br /><em>smarter for everyone.</em></>,
  'about.missionP1': 'Final Table started with a frustration we couldn\'t shake.',
  'about.missionP2': 'After diving into live events, we kept hitting the same wall: there\'s no good way to capture what actually happens at the table. We love the live game, but relying on memory to recall a few hands days later isn\'t study — it\'s nostalgia. And without real session data, the leaks in our game stayed invisible.',
  'about.missionP3': 'The tools out there were worse than nothing. Outdated, clunky, heavy — the kind of thing you\'d never pull out mid-session because it would pull you out of the game entirely. It\'s 2026. That felt wrong.',
  'about.missionP4': 'So we built the one we wanted — and we built it the only way an app like this can honestly be built: by living with it. Eight months of prototyping, taking it into real sessions, studying what worked, tearing apart what didn\'t, and playing again. Over and over. Every interaction has been pressure-tested under casino lights, on real hands, with real money on the line.',
  'about.missionP5': 'Final Table is for every live player who\'s ever finished a session knowing they misplayed something, but couldn\'t remember what. Every hand tells a story. We\'re just making sure you don\'t have to lose it.',
  'about.value1Title': 'Speed first',
  'about.value1Desc': 'If it slows you down at the table, it\'s not worth building. Every feature is designed to work in seconds, not minutes.',
  'about.value2Title': 'Data over gut',
  'about.value2Desc': 'Feelings lie, data doesn\'t. We help you replace guesswork with real numbers — win rates, tendencies, patterns.',
  'about.value3Title': 'Built for live',
  'about.value3Desc': 'Not a port from online. Every interaction, every screen is designed for the chaos and speed of a live poker table.',
  'about.teamEyebrow': 'The Team',
  'about.teamTitle': () => <>The people behind <em>Final Table</em></>,
  'about.member1Bio': 'Software engineer passionate about building products that solve real problems. Leading the technical vision behind Final Table.',
  'about.member2Bio': 'Design-driven product thinker focused on creating intuitive experiences. Shaping the look, feel, and user experience of Final Table.',
  'about.ctaTitle': () => <>Want to be part of <em>the journey?</em></>,
  'about.ctaBody': 'Final Table is in closed beta. Reserve your spot and be the first to know when we launch.',
  'about.ctaBtn': 'Reserve my spot →',

  // Language
  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  POLISH                                         */
/* ─────────────────────────────────────────────── */
const pl = {
  'nav.features': 'Funkcje',
  'nav.howItWorks': 'Jak to działa?',
  'nav.compare': 'Porównaj',
  'nav.faq': 'FAQ',
  'nav.cta': 'Pobierz na iOS',

  'howSection.sans': 'Jak to ',
  'howSection.italic': 'działa?',

  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Zapisz rozdanie w</span>
      <span className="tp-hero-hl-italic">trzech gestach</span>
      <span className="tp-hero-hl-sans">Nie w trzy minuty.</span>
    </>
  ),
  'hero.sub': 'Final Table to tracker pokerowy stworzony dla żywego stołu. Wystarczająco szybki, by zapisać rozdanie jedną ręką między rozdaniami. Wystarczająco dokładny, by analizować każdą sesję później.',
  'hero.emailPlaceholder': 'Wpisz swój email',
  'hero.errorGeneric': 'Coś poszło nie tak. Spróbuj ponownie.',
  'hero.btnLoading': 'Rezerwuję…',
  'hero.btnSubmit': 'Zarezerwuj miejsce',
  'hero.proof': (p) => `Darmowe · 10 sekund · ${p.count}+ graczy już zarezerwowało`,
  'hero.successText': 'Jesteś na liście! Odezwiemy się, gdy Final Table wystartuje.',
  'hero.already': 'Już jesteś na liście! Powiadomimy Cię, gdy wystartujemy.',
  'hero.resetBtn': 'Zarezerwuj kolejny',

  'compare.eyebrow': 'CO NAS WYRÓŻNIA',
  'compare.title': () => <>Stworzony dla żywej gry.<br />Zaprojektowany dla gracza przy stole.</>,
  'compare.subtitle': 'Trackery pokerowe istnieją. Żaden nie pasuje do żywego stołu. Final Table jest częścią gry.',
  'compare.card1.title': 'Logowanie trzema gestami',
  'compare.card1.desc': 'Zapisz dowolną akcję — raise, call, fold — trzema tapnięciami. Bez pisania, bez menu. Wystarczająco szybko, by nie tracić rytmu.',
  'compare.card2.title': 'Odczyty przeciwników na żywo',
  'compare.card2.desc': 'Buduj profile statystyczne każdego gracza. Znaj ich VPIP, agresję i tendencje, zanim zagrasz.',
  'compare.card3.title': 'Dane sesji i rozdań',
  'compare.card3.desc': 'Śledź wszystko — od szybkiego buy-in/cash-out po pełne logowanie akcji hand-by-hand. Używaj tego, co pasuje do Twojej gry.',
  'compare.card4.title': 'Tryb Dealera',
  'compare.card4.desc': 'Dealerzy prowadzą stół głosem. Gracze śledzą grę na swoich telefonach w czasie rzeczywistym.',
  'compare.comingSoon': 'WKRÓTCE · PARTNERSTWA Z OBIEKTAMI',

  'tabs.0.label': 'Przed sesją',
  'tabs.1.label': 'Przy stole',
  'tabs.2.label': 'Po sesji',
  'tabs.3.label': 'Z czasem',
  'tabs.0.eyebrow': 'PRZED SESJĄ',
  'tabs.0.title': 'Idź na stół wiedząc,\nz kim grasz.',
  'tabs.0.body': 'Przejrzyj profile przeciwników i historię rozdań, zanim usiądziesz. Wiedz, kto gra tight, kto luzem, i gdzie są pieniądze.',
  'tabs.1.eyebrow': 'PRZY STOLE',
  'tabs.1.title': 'Trzy gesty.\nZero przerw.',
  'tabs.1.body': 'Zapisz dowolną akcję — raise, call, fold — jednym przesunięciem i tapnięciem. Monitoruj postępy swojej sesji. Wystarczająco szybko, by grać jedną ręką.',
  'tabs.2.eyebrow': 'PO SESJI',
  'tabs.2.title': 'Zobacz błędy,\nktórych nie czułeś.',
  'tabs.2.body': 'Przejrzyj każde rozdanie, znajdź wzorce w swojej grze, udostępnij dowolne rozdania znajomym, eksportuj dane kompatybilne z solverem i porównaj decyzje z GTO. Dane mówią prawdę.',

  'notHud.title': () => <><span className="nh-hl-sans">Czym Final Table </span><span className="nh-hl-italic">nie jest?</span></>,
  'notHud.item1Title': 'To nie HUD',
  'notHud.item1Desc': 'Final Table nie wyświetla statystyk ani danych graczy podczas gry na żywo. To rejestrator, nie heads-up display.',
  'notHud.item2Title': 'Zablokowany podczas sesji',
  'notHud.item2Desc': 'Gdy sesja jest aktywna, aplikacja blokuje się w trybie logowania. Nie możesz przeglądać rąk, udostępniać danych, korzystać z analizy AI ani z analityki do zakończenia sesji.',
  'notHud.item3Title': 'Stworzone dla fair play',
  'notHud.item3Desc': 'Wszystko dzieje się po sesji. Przeglądaj, udostępniaj i analizuj — ale nigdy przy stole z nieuczciwą przewagą.',

  'tabs.3.eyebrow': 'Z CZASEM',
  'tabs.3.title': 'Poznaj swój prawdziwy\nwin rate. Wreszcie.',
  'tabs.3.body': 'Śledź swoje prawdziwe $/hr według stawek, kasyna i typu gry. Podejmuj decyzje na podstawie danych, nie przeczuć.',

  'problems.0.stat': () => <>Gracze live grają<br /><strong>~25–30 rozdań/godzinę</strong> średnio.</>,
  'problems.0.question': 'Ile z tych rozdań naprawdę pamiętasz?',
  'problems.0.body': 'Final Table śledzi każde rozdanie, abyś mógł przejrzeć każdą akcję i znaleźć błędy, o których nie wiedziałeś.',
  'problems.1.stat': 'Zapytaj dowolnego gracza live o jego win rate. Większość zgaduje.',
  'problems.1.question': 'Czy naprawdę znasz swoje $/hr według stawek, kasyna czy typu gry?',
  'problems.1.body': 'Final Table śledzi każdą sesję z precyzją — win rate, czas, stawki — więc zawsze wiesz, gdzie stoisz.',
  'problems.2.stat': 'Pozycja to największa przewaga w pokerze.',
  'problems.2.question': 'Czy znasz swoje statystyki z BTN vs BB vs UTG?',
  'problems.2.body': 'Final Table rozbija Twoje wyniki według pozycji — widzisz, gdzie zarabiasz i gdzie tracisz żetony.',
  'problems.3.stat': () => <>"On zawsze 3-betuje lekko." "Ona nigdy nie folduje na riverze."</>,
  'problems.3.question': 'Czy to prawdziwe odczyty, czy uczucia z jednego pamiętnego rozdania?',
  'problems.3.body': 'Final Table buduje profile przeciwników z zalogowanych rozdań — prawdziwe statystyki, prawdziwe tendencje — Twoje odczyty oparte na danych, nie pamięci.',

  'features.title': () => <>Trzymaj się —<br /><em>to jeszcze nie koniec</em>.</>,
  'features.subtitle': 'Logowanie rozdań to tylko wierzchołek góry lodowej. Final Table ma wiele innych inteligentnych funkcji.',
  'features.opponentProfiles.title': 'Statystyki',
  'features.opponentProfiles.desc': 'Zobacz swoje statystyki generowane w czasie, aby zidentyfikować swój styl gry. Śledź VPIP, agresję, współczynniki wygranych i więcej — liczby nie kłamią.',
  'features.bankroll.title': 'Śledzenie Bankrolla',
  'features.bankroll.desc': 'Ustaw cel bankrollowy i obserwuj postępy. Zobacz swoją stawkę godzinową, zysk netto, ROI i wiele innych wskaźników bankrolla.',
  'features.sessionLogger.title': 'Analiza AI',
  'features.sessionLogger.desc': 'Otrzymuj analizy oparte na AI. Analizuj historię rozdań, identyfikuj wzorce i otrzymuj spersonalizowane rekomendacje, aby poprawić swoją grę.',
  'features.handReview.title': 'Przegląd Rozdań',
  'features.handReview.desc': 'Odtwórz każde zalogowane rozdanie. Przejdź ulicę po ulicy, porównaj decyzje z GTO i znajdź błędy, których nie czułeś przy stole.',
  'features.mtt.title': 'Turnieje Multi-Table',
  'features.mtt.desc': 'Prowadź turnieje na wielu stołach z rankingiem na żywo i dystrybucją nagród. Twórz kluby, zarządzaj członkami — wszystko z aplikacji.',
  'features.dealerMode.title': 'Tryb Dealera',
  'features.dealerMode.comingSoon': 'WKRÓTCE',
  'features.dealerMode.desc': 'Dealerzy prowadzą stół głosem. Gracze śledzą grę na swoich telefonach w czasie rzeczywistym.',

  'cta.eyebrow': 'Wczesny dostęp',
  'cta.title': () => <>Zarezerwuj swój nick<br />zanim ktoś inny to zrobi.</>,
  'cta.titleLine1': 'Zarezerwuj swój nick',
  'cta.titleLine2': 'zanim ktoś inny to zrobi.',
  'cta.body': 'Zabezpiecz swój nick przed startem. Nicki są na zasadzie kto pierwszy, ten lepszy — jak zniknie, to zniknie.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> graczy już na liście oczekujących</>,
  'cta.support': () => <>Pytania? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Zabezpiecz swój nick',
  'cta.cardSub': 'Darmowe · 10 sekund',
  'cta.labelEmail': 'Email',
  'cta.emailPlaceholder': 'ty@example.com',
  'cta.hintEmail': 'Twój przyszły email logowania — nie można go zmienić.',
  'cta.labelUsername': 'Nick',
  'cta.usernamePlaceholder': 'twojnick',
  'cta.hintUsername': 'Tylko litery, cyfry i podkreślenia. 3–20 znaków.',
  'cta.errorTaken': 'Ten nick jest już zajęty. Spróbuj innego.',
  'cta.errorGeneric': 'Coś poszło nie tak. Spróbuj ponownie.',
  'cta.btnLoading': 'Rezerwuję…',
  'cta.btnSubmit': 'Zarezerwuj nick →',
  'cta.successChip': '✓ Zarezerwowano',
  'cta.successTitle': 'Jesteś na liście.',
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> jest zarezerwowany. Odezwiemy się, gdy Final Table wystartuje.</>
  ),
  'cta.resetBtn': 'Zarezerwuj kolejny',

  'faq.0.q': 'Czy mogę zmienić nick później?',
  'faq.0.a': 'Po zarezerwowaniu nick jest zablokowany. Wybierz mądrze — to Twój stały nick w Final Table.',
  'faq.1.q': 'Czy rezerwacja jest darmowa?',
  'faq.1.a': 'Tak, o ile ten nick nie jest już zajęty.',
  'faq.2.q': 'Co jeśli mój nick jest zajęty?',
  'faq.2.a': 'Nicki działają na zasadzie kto pierwszy, ten lepszy. Jeśli Twój jest zajęty, spróbuj wariacji — podkreślenia i cyfry są dozwolone.',
  'faq.3.q': 'Kiedy aplikacja ruszy?',
  'faq.3.a': 'Final Table jest w zamkniętej becie. Osoby z listy oczekujących dostaną wczesny dostęp przed publicznym startem.',

  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Zapisz rozdanie w </span><span className="mf-hl-italic">trzech gestach.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">Nie w trzy minuty.</span></p>
    </>
  ),
  'footer.support': () => <>Pytania? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Zasoby',
  'footer.company': 'Firma',
  'footer.privacy': 'Polityka Prywatności',
  'footer.terms': 'Regulamin',
  'footer.copy': (p) => `© Final Table. Wszelkie prawa zastrzeżone ${p.year}`,

  // About
  'about.nav': 'O nas',
  'about.missionEyebrow': 'Nasza Misja',
  'about.missionTitle': () => <>Spraw, by poker na żywo<br /><em>był mądrzejszy dla każdego.</em></>,
  'about.missionP1': 'Final Table zaczął się od frustracji, której nie mogliśmy się pozbyć.',
  'about.missionP2': 'Po zanurzeniu się w wydarzenia na żywo, ciągle napotykaliśmy ten sam mur: nie ma dobrego sposobu na uchwycenie tego, co naprawdę dzieje się przy stole. Kochamy grę na żywo, ale poleganie na pamięci, by przypomnieć sobie kilka rąk po dniach, to nie nauka — to nostalgia. A bez prawdziwych danych z sesji, wycieki w naszej grze pozostawały niewidoczne.',
  'about.missionP3': 'Narzędzia na rynku były gorsze niż nic. Przestarzałe, nieporęczne, ciężkie — rodzaj rzeczy, których nigdy nie wyciągnąłbyś w trakcie sesji, bo wyrwałyby cię z gry całkowicie. Jest 2026. To wydawało się złe.',
  'about.missionP4': 'Więc zbudowaliśmy to, czego chcieliśmy — i zbudowaliśmy to jedynym sposobem, w jaki taka aplikacja może być uczciwie zbudowana: żyjąc z nią. Osiem miesięcy prototypowania, zabierania jej na prawdziwe sesje, badania co działa, rozbierania na części tego co nie działa i ponownej gry. Raz za razem. Każda interakcja została przetestowana pod światłami kasyna, na prawdziwych rękach, z prawdziwymi pieniędzmi na stole.',
  'about.missionP5': 'Final Table jest dla każdego gracza na żywo, który kiedykolwiek skończył sesję wiedząc, że coś zagrał źle, ale nie mógł sobie przypomnieć co. Każda ręka opowiada historię. My po prostu dbamy o to, żebyś jej nie stracił.',
  'about.value1Title': 'Szybkość przede wszystkim',
  'about.value1Desc': 'Jeśli spowalnia cię przy stole, nie warto tego budować. Każda funkcja jest zaprojektowana tak, by działała w sekundach, nie minutach.',
  'about.value2Title': 'Dane ponad intuicję',
  'about.value2Desc': 'Uczucia kłamią, dane nie. Pomagamy zastąpić domysły prawdziwymi liczbami — wskaźniki wygranych, tendencje, wzorce.',
  'about.value3Title': 'Stworzone dla gry na żywo',
  'about.value3Desc': 'To nie port z gry online. Każda interakcja, każdy ekran jest zaprojektowany z myślą o chaosie i szybkości pokera na żywo.',
  'about.teamEyebrow': 'Zespół',
  'about.teamTitle': () => <>Ludzie stojący za <em>Final Table</em></>,
  'about.member1Bio': 'Inżynier oprogramowania z pasją do tworzenia produktów rozwiązujących realne problemy. Prowadzi wizję techniczną Final Table.',
  'about.member2Bio': 'Myśliciel produktowy zorientowany na design, skupiony na tworzeniu intuicyjnych doświadczeń. Kształtuje wygląd i wrażenia użytkownika Final Table.',
  'about.ctaTitle': () => <>Chcesz być częścią <em>tej podróży?</em></>,
  'about.ctaBody': 'Final Table jest w zamkniętej becie. Zarezerwuj swoje miejsce i bądź pierwszym, który dowie się o premierze.',
  'about.ctaBtn': 'Zarezerwuj miejsce →',

  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  RUSSIAN                                        */
/* ─────────────────────────────────────────────── */
const ru = {
  'nav.features': 'Функции',
  'nav.howItWorks': 'Как это работает?',
  'nav.compare': 'Сравнить',
  'nav.faq': 'FAQ',
  'nav.cta': 'Скачать на iOS',

  'howSection.sans': 'Как это ',
  'howSection.italic': 'работает?',

  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Запиши раздачу за</span>
      <span className="tp-hero-hl-italic">три жеста</span>
      <span className="tp-hero-hl-sans">Не за три минуты.</span>
    </>
  ),
  'hero.sub': 'Final Table — покерный трекер, созданный для живого стола. Достаточно быстрый, чтобы записать раздачу одной рукой между сдачами. Достаточно точный, чтобы разобрать каждую сессию позже.',
  'hero.emailPlaceholder': 'Введите ваш email',
  'hero.errorGeneric': 'Что-то пошло не так. Попробуйте снова.',
  'hero.btnLoading': 'Бронирую…',
  'hero.btnSubmit': 'Забронировать место',
  'hero.proof': (p) => `Бесплатно · 10 секунд · ${p.count}+ игроков уже забронировали`,
  'hero.successText': 'Вы в списке! Мы свяжемся, когда Final Table запустится.',
  'hero.already': 'Вы уже в списке! Мы сообщим, когда запустимся.',
  'hero.resetBtn': 'Забронировать ещё',

  'compare.eyebrow': 'ЧЕМ МЫ ОТЛИЧАЕМСЯ',
  'compare.title': () => <>Создан для живой игры.<br />Разработан для игрока за столом.</>,
  'compare.subtitle': 'Покерные трекеры существуют. Ни один не чувствуется своим за столом. Final Table — часть игры.',
  'compare.card1.title': 'Логирование тремя жестами',
  'compare.card1.desc': 'Запишите любое действие — рейз, колл, фолд — тремя нажатиями. Без набора текста, без меню. Достаточно быстро, чтобы не терять ритм.',
  'compare.card2.title': 'Чтение оппонентов в реальном времени',
  'compare.card2.desc': 'Создавайте статистические профили каждого игрока. Знайте их VPIP, агрессию и тенденции до того, как действовать.',
  'compare.card3.title': 'Данные сессий и раздач',
  'compare.card3.desc': 'Отслеживайте всё — от быстрого buy-in/cash-out до полного логирования действий. Используйте то, что подходит вашей игре.',
  'compare.card4.title': 'Режим Дилера',
  'compare.card4.desc': 'Дилеры ведут стол голосовыми командами. Игроки следят за игрой на своих телефонах в реальном времени.',
  'compare.comingSoon': 'СКОРО · ПАРТНЁРСТВА С ЗАВЕДЕНИЯМИ',

  'tabs.0.label': 'До сессии',
  'tabs.1.label': 'За столом',
  'tabs.2.label': 'После сессии',
  'tabs.3.label': 'Со временем',
  'tabs.0.eyebrow': 'ДО СЕССИИ',
  'tabs.0.title': 'Приходи за стол зная,\nс кем играешь.',
  'tabs.0.body': 'Просмотри профили оппонентов и историю раздач до того, как сядешь. Знай, кто тайтовый, кто лузовый, и где деньги.',
  'tabs.1.eyebrow': 'ЗА СТОЛОМ',
  'tabs.1.title': 'Три жеста.\nНоль потерь темпа.',
  'tabs.1.body': 'Запиши любое действие — рейз, колл, фолд — простым свайпом и нажатием. Отслеживай прогресс своей сессии. Достаточно быстро для одной руки.',
  'tabs.2.eyebrow': 'ПОСЛЕ СЕССИИ',
  'tabs.2.title': 'Увидь ошибки,\nкоторых не чувствовал.',
  'tabs.2.body': 'Просмотри каждую раздачу, найди паттерны в своей игре, поделись любыми раздачами с друзьями, экспортируй данные в формате солвера и сравни решения с GTO. Данные говорят правду.',

  'notHud.title': () => <><span className="nh-hl-sans">Чем Final Table </span><span className="nh-hl-italic">не является?</span></>,
  'notHud.item1Title': 'Это не HUD',
  'notHud.item1Desc': 'Final Table не показывает статистику или данные игроков во время живой игры. Это логгер, а не хедз-ап дисплей.',
  'notHud.item2Title': 'Заблокирован во время сессии',
  'notHud.item2Desc': 'Пока сессия активна, приложение блокируется в режиме логирования. Нельзя просматривать руки, делиться данными, использовать AI анализ или аналитику до окончания сессии.',
  'notHud.item3Title': 'Создано для честной игры',
  'notHud.item3Desc': 'Всё происходит после сессии. Просматривай, делись и анализируй — но никогда за столом с нечестным преимуществом.',

  'tabs.3.eyebrow': 'СО ВРЕМЕНЕМ',
  'tabs.3.title': 'Узнай свой настоящий\nвинрейт. Наконец.',
  'tabs.3.body': 'Отслеживай свой истинный $/час по ставкам, казино и типу игры. Принимай решения на основе данных, а не интуиции.',

  'problems.0.stat': () => <>Игроки в лайве играют<br /><strong>~25–30 раздач/час</strong> в среднем.</>,
  'problems.0.question': 'Сколько из этих раздач ты реально помнишь?',
  'problems.0.body': 'Final Table отслеживает каждую раздачу, чтобы ты мог просмотреть каждое действие и найти ошибки, о которых не знал.',
  'problems.1.stat': 'Спроси любого лайв-игрока его винрейт. Большинство гадают.',
  'problems.1.question': 'Ты реально знаешь свой $/час по ставкам, казино или типу игры?',
  'problems.1.body': 'Final Table отслеживает каждую сессию с точностью — винрейт, длительность, ставки — ты всегда знаешь, где стоишь.',
  'problems.2.stat': 'Позиция — самое большое преимущество в покере.',
  'problems.2.question': 'Знаешь ли ты свою статистику с BTN vs BB vs UTG?',
  'problems.2.body': 'Final Table разбирает твои результаты по позициям — ты видишь, где зарабатываешь и где теряешь фишки.',
  'problems.3.stat': () => <>"Он всегда 3-бетит лайтово." "Она никогда не фолдит на ривере."</>,
  'problems.3.question': 'Это реальные риды или ощущения от одной запомнившейся раздачи?',
  'problems.3.body': 'Final Table строит профили оппонентов из записанных раздач — настоящая статистика, настоящие тенденции — твои риды основаны на данных, а не памяти.',

  'features.title': () => <>Пристегнитесь —<br /><em>это ещё не всё</em>.</>,
  'features.subtitle': 'Логирование рук — это лишь верхушка айсберга. У Final Table есть множество других интеллектуальных функций.',
  'features.opponentProfiles.title': 'Статистика',
  'features.opponentProfiles.desc': 'Смотри свою статистику, генерируемую со временем, чтобы определить свой стиль игры. Отслеживай VPIP, агрессию, винрейт и многое другое — цифры не врут.',
  'features.bankroll.title': 'Отслеживание Банкролла',
  'features.bankroll.desc': 'Установи цель банкролла и следи за прогрессом. Смотри часовую ставку, чистую прибыль, ROI и множество других метрик банкролла.',
  'features.sessionLogger.title': 'AI Анализ',
  'features.sessionLogger.desc': 'Получай аналитику на основе ИИ. Анализируй историю раздач, выявляй паттерны и получай персонализированные рекомендации для улучшения игры.',
  'features.handReview.title': 'Обзор Раздач',
  'features.handReview.desc': 'Воспроизведи каждую записанную раздачу. Пройди улицу за улицей, сравни решения с GTO и найди ошибки, которых не чувствовал за столом.',
  'features.mtt.title': 'Мультистоловые Турниры',
  'features.mtt.desc': 'Проводи турниры на нескольких столах с рейтингами и призами. Создавай клубы, управляй участниками — всё из приложения.',
  'features.dealerMode.title': 'Режим Дилера',
  'features.dealerMode.comingSoon': 'СКОРО',
  'features.dealerMode.desc': 'Дилеры ведут стол голосовыми командами. Игроки следят на своих телефонах в реальном времени.',

  'cta.eyebrow': 'Ранний доступ',
  'cta.title': () => <>Забронируй свой ник<br />пока кто-то другой не сделал это.</>,
  'cta.titleLine1': 'Забронируй свой ник',
  'cta.titleLine2': 'пока кто-то другой не сделал это.',
  'cta.body': 'Закрепи свой постоянный ник до запуска. Ники — кто первый, тот и забрал. Как уйдёт — уйдёт.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> игроков уже в списке ожидания</>,
  'cta.support': () => <>Вопросы? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Закрепи свой ник',
  'cta.cardSub': 'Бесплатно · 10 секунд',
  'cta.labelEmail': 'Email',
  'cta.emailPlaceholder': 'you@example.com',
  'cta.hintEmail': 'Ваш будущий email для входа — изменить нельзя.',
  'cta.labelUsername': 'Ник',
  'cta.usernamePlaceholder': 'вашник',
  'cta.hintUsername': 'Только буквы, цифры и подчёркивания. 3–20 символов.',
  'cta.errorTaken': 'Этот ник уже занят. Попробуйте другой.',
  'cta.errorGeneric': 'Что-то пошло не так. Попробуйте снова.',
  'cta.btnLoading': 'Бронирую…',
  'cta.btnSubmit': 'Забронировать ник →',
  'cta.successChip': '✓ Забронировано',
  'cta.successTitle': 'Вы в списке.',
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> забронирован. Мы свяжемся, когда Final Table запустится.</>
  ),
  'cta.resetBtn': 'Забронировать ещё',

  'faq.0.q': 'Могу ли я изменить ник позже?',
  'faq.0.a': 'После бронирования ник закреплён. Выбирайте внимательно — это ваш постоянный ник в Final Table.',
  'faq.1.q': 'Бронирование бесплатное?',
  'faq.1.a': 'Да, если этот ник ещё не занят.',
  'faq.2.q': 'Что если мой ник занят?',
  'faq.2.a': 'Ники работают по принципу «кто первый». Если ваш занят, попробуйте вариацию — подчёркивания и цифры допустимы.',
  'faq.3.q': 'Когда запустится приложение?',
  'faq.3.a': 'Final Table в закрытой бете. Участники списка ожидания получат ранний доступ до публичного запуска.',

  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Запиши раздачу за </span><span className="mf-hl-italic">три жеста.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">Не за три минуты.</span></p>
    </>
  ),
  'footer.support': () => <>Вопросы? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Ресурсы',
  'footer.company': 'Компания',
  'footer.privacy': 'Политика Конфиденциальности',
  'footer.terms': 'Условия Использования',
  'footer.copy': (p) => `© Final Table. Все права защищены ${p.year}`,

  // About
  'about.nav': 'О нас',
  'about.missionEyebrow': 'Наша Миссия',
  'about.missionTitle': () => <>Сделать живой покер<br /><em>умнее для каждого.</em></>,
  'about.missionP1': 'Final Table начался с разочарования, от которого мы не могли избавиться.',
  'about.missionP2': 'Погрузившись в живые турниры, мы раз за разом натыкались на одну и ту же стену: нет хорошего способа зафиксировать то, что на самом деле происходит за столом. Мы любим живую игру, но полагаться на память, чтобы вспомнить пару рук через несколько дней — это не учёба, это ностальгия. А без реальных данных о сессиях утечки в нашей игре оставались невидимыми.',
  'about.missionP3': 'Инструменты на рынке были хуже, чем ничего. Устаревшие, неуклюжие, тяжёлые — такие, которые никогда не достанешь посреди сессии, потому что они полностью выбивают из игры. На дворе 2026 год. Это казалось неправильным.',
  'about.missionP4': 'Поэтому мы создали то, что хотели сами — и создали единственным честным способом: живя с этим. Восемь месяцев прототипирования, тестирования на реальных сессиях, изучения что работает, разбора того что не работает, и снова игра. Снова и снова. Каждое взаимодействие было проверено под светом казино, на реальных руках, с реальными деньгами на кону.',
  'about.missionP5': 'Final Table — для каждого живого игрока, который хоть раз заканчивал сессию, зная что сыграл что-то неправильно, но не мог вспомнить что. Каждая рука рассказывает историю. Мы просто помогаем вам её не потерять.',
  'about.value1Title': 'Скорость прежде всего',
  'about.value1Desc': 'Если это замедляет вас за столом, это не стоит создавать. Каждая функция разработана так, чтобы работать за секунды, а не минуты.',
  'about.value2Title': 'Данные важнее интуиции',
  'about.value2Desc': 'Чувства обманывают, данные — нет. Мы помогаем заменить догадки реальными цифрами — процент побед, тенденции, закономерности.',
  'about.value3Title': 'Создано для живой игры',
  'about.value3Desc': 'Это не порт из онлайна. Каждое взаимодействие, каждый экран разработан для хаоса и скорости живого покерного стола.',
  'about.teamEyebrow': 'Команда',
  'about.teamTitle': () => <>Люди, стоящие за <em>Final Table</em></>,
  'about.member1Bio': 'Инженер-программист, увлечённый созданием продуктов, решающих реальные проблемы. Руководит технической визией Final Table.',
  'about.member2Bio': 'Продуктовый мыслитель, ориентированный на дизайн, создающий интуитивно понятные интерфейсы. Формирует внешний вид и пользовательский опыт Final Table.',
  'about.ctaTitle': () => <>Хотите стать частью <em>этого пути?</em></>,
  'about.ctaBody': 'Final Table находится в закрытой бете. Забронируйте место и узнайте первыми о запуске.',
  'about.ctaBtn': 'Забронировать место →',

  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  FRENCH                                         */
/* ─────────────────────────────────────────────── */
const fr = {
  'nav.features': 'Fonctionnalités',
  'nav.howItWorks': 'Comment ça marche ?',
  'nav.compare': 'Comparer',
  'nav.faq': 'FAQ',
  'nav.cta': 'Télécharger sur iOS',

  'howSection.sans': 'Comment ça ',
  'howSection.italic': 'marche ?',

  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Enregistre une main en</span>
      <span className="tp-hero-hl-italic">trois gestes</span>
      <span className="tp-hero-hl-sans">Pas en trois minutes.</span>
    </>
  ),
  'hero.sub': 'Final Table est le tracker de poker live conçu pour la table. Assez rapide pour enregistrer une main d\'une seule main entre les donnes. Assez précis pour analyser chaque session après coup.',
  'hero.emailPlaceholder': 'Entrez votre email',
  'hero.errorGeneric': 'Une erreur est survenue. Veuillez réessayer.',
  'hero.btnLoading': 'Réservation…',
  'hero.btnSubmit': 'Réserver ma place',
  'hero.proof': (p) => `Gratuit · 10 secondes · ${p.count}+ joueurs déjà inscrits`,
  'hero.successText': 'Vous êtes sur la liste ! Nous vous contacterons au lancement de Final Table.',
  'hero.resetBtn': 'Réserver un autre',
  'hero.already': 'Vous êtes déjà sur la liste ! Nous vous préviendrons au lancement.',

  'compare.eyebrow': 'CE QUI NOUS DISTINGUE',
  'compare.title': () => <>Conçu pour le jeu live.<br />Pensé pour le joueur à la table.</>,
  'compare.subtitle': 'Les trackers de poker live existent. Aucun ne semble fait pour la table. Final Table fait partie du jeu.',
  'compare.card1.title': 'Enregistrement en trois gestes',
  'compare.card1.desc': 'Enregistrez n\'importe quelle action — relance, suivi, couché — en trois taps. Pas de saisie, pas de menus. Assez rapide pour ne pas perdre le rythme.',
  'compare.card2.title': 'Lecture des adversaires en temps réel',
  'compare.card2.desc': 'Construisez des profils statistiques de chaque joueur. Connaissez leur VPIP, agressivité et tendances avant d\'agir.',
  'compare.card3.title': 'Données de session et de mains',
  'compare.card3.desc': 'Suivez tout — du simple buy-in/cash-out au log complet main par main. Utilisez ce qui convient à votre jeu.',
  'compare.card4.title': 'Mode Dealer',
  'compare.card4.desc': 'Les dealers gèrent la table par commandes vocales. Les joueurs suivent en temps réel sur leurs téléphones.',
  'compare.comingSoon': 'BIENTÔT · PARTENARIATS AVEC LES SALLES',

  'tabs.0.label': 'Avant la session',
  'tabs.1.label': 'À la table',
  'tabs.2.label': 'Après la session',
  'tabs.3.label': 'Au fil du temps',
  'tabs.0.eyebrow': 'AVANT LA SESSION',
  'tabs.0.title': 'Arrivez en sachant\ncontre qui vous jouez.',
  'tabs.0.body': 'Consultez les profils adverses et l\'historique des mains avant de vous asseoir. Sachez qui est serré, qui est large, et où est l\'argent.',
  'tabs.1.eyebrow': 'À LA TABLE',
  'tabs.1.title': 'Trois gestes.\nZéro perte de rythme.',
  'tabs.1.body': 'Enregistrez n\'importe quelle action — relance, suivi, couché — en glissant et tapant. Suivez la progression de votre session. Assez rapide pour jouer d\'une main.',
  'tabs.2.eyebrow': 'APRÈS LA SESSION',
  'tabs.2.title': 'Voyez les erreurs\nque vous ne sentiez pas.',
  'tabs.2.body': 'Revoyez chaque main, trouvez des schémas dans votre jeu, partagez vos mains avec vos amis, exportez des données compatibles avec les solveurs et comparez vos décisions aux références GTO. Les données disent la vérité.',

  'notHud.title': () => <><span className="nh-hl-sans">Ce que Final Table </span><span className="nh-hl-italic">n'est pas?</span></>,
  'notHud.item1Title': 'Pas un HUD',
  'notHud.item1Desc': "Final Table n'affiche pas de statistiques ni de données joueurs pendant le jeu en direct. C'est un enregistreur, pas un heads-up display.",
  'notHud.item2Title': 'Verrouillé pendant les sessions',
  'notHud.item2Desc': "Lorsqu'une session est active, l'application se verrouille en mode enregistrement. Impossible de consulter les mains, partager des données, utiliser l'analyse IA ou accéder aux analyses avant la fin de la session.",
  'notHud.item3Title': 'Conçu pour le fair-play',
  'notHud.item3Desc': "Tout se passe après la session. Analysez, partagez et étudiez — mais jamais à la table avec un avantage déloyal.",

  'tabs.3.eyebrow': 'AU FIL DU TEMPS',
  'tabs.3.title': 'Connaissez votre vrai\nwin rate. Enfin.',
  'tabs.3.body': 'Suivez votre véritable $/h par enjeux, casino et type de jeu. Prenez des décisions basées sur les données, pas sur l\'intuition.',

  'problems.0.stat': () => <>Les joueurs live jouent<br /><strong>~25–30 mains/heure</strong> en moyenne.</>,
  'problems.0.question': 'Combien de ces mains vous rappelez-vous vraiment ?',
  'problems.0.body': 'Final Table suit chaque main que vous jouez pour revoir chaque action et trouver des erreurs que vous ignoriez.',
  'problems.1.stat': 'Demandez à n\'importe quel joueur live son win rate. La plupart devinent.',
  'problems.1.question': 'Connaissez-vous vraiment votre $/h par enjeux, casino ou type de jeu ?',
  'problems.1.body': 'Final Table suit chaque session avec précision — win rate, durée, enjeux — pour toujours savoir où vous en êtes.',
  'problems.2.stat': 'La position est le plus grand avantage au poker.',
  'problems.2.question': 'Connaissez-vous vos stats réelles du BTN vs BB vs UTG ?',
  'problems.2.body': 'Final Table décompose vos performances par position — voyez où vous gagnez et où vous perdez des jetons.',
  'problems.3.stat': () => <>"Il 3-bet toujours léger." "Elle ne couche jamais la rivière."</>,
  'problems.3.question': 'Ce sont de vraies lectures ou des impressions d\'une main mémorable ?',
  'problems.3.body': 'Final Table construit des profils adverses à partir des mains enregistrées — vraies stats, vraies tendances — vos lectures reposent sur les données, pas la mémoire.',

  'features.title': () => <>Accrochez-vous —<br /><em>ce n'est pas fini</em>.</>,
  'features.subtitle': 'L\'enregistrement des mains n\'est que la partie émergée de l\'iceberg. Final Table possède de nombreuses autres fonctionnalités intelligentes.',
  'features.opponentProfiles.title': 'Statistiques',
  'features.opponentProfiles.desc': 'Consultez vos statistiques générées au fil du temps pour identifier votre style de jeu. Suivez le VPIP, l\'agressivité, les taux de victoire et plus encore — les chiffres ne mentent pas.',
  'features.bankroll.title': 'Suivi du Bankroll',
  'features.bankroll.desc': 'Fixez un objectif de bankroll et suivez vos progrès. Consultez votre taux horaire, profit net, ROI et bien d\'autres métriques de bankroll.',
  'features.sessionLogger.title': 'Analyse IA',
  'features.sessionLogger.desc': 'Obtenez des analyses alimentées par l\'IA. Analysez l\'historique des mains, identifiez les schémas et recevez des recommandations personnalisées pour améliorer votre jeu.',
  'features.handReview.title': 'Revue des Mains',
  'features.handReview.desc': 'Rejouez chaque main enregistrée. Parcourez chaque street, comparez vos décisions aux références GTO et trouvez les erreurs invisibles à la table.',
  'features.mtt.title': 'Tournois Multi-Tables',
  'features.mtt.desc': 'Gérez des tournois live sur plusieurs tables avec classements en temps réel et distribution des prix. Créez des clubs, gérez les membres — tout depuis l\'app.',
  'features.dealerMode.title': 'Mode Dealer',
  'features.dealerMode.comingSoon': 'BIENTÔT',
  'features.dealerMode.desc': 'Les dealers gèrent la table par commandes vocales. Les joueurs suivent en temps réel sur leurs téléphones.',

  'cta.eyebrow': 'Accès anticipé',
  'cta.title': () => <>Réservez votre pseudo<br />avant tout le monde.</>,
  'cta.titleLine1': 'Réservez votre pseudo',
  'cta.titleLine2': 'avant tout le monde.',
  'cta.body': 'Sécurisez votre pseudo permanent avant le lancement. Les pseudos sont attribués par ordre d\'arrivée — une fois pris, c\'est pris.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> joueurs déjà sur la liste d'attente</>,
  'cta.support': () => <>Questions ? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Réservez votre pseudo',
  'cta.cardSub': 'Gratuit · 10 secondes',
  'cta.labelEmail': 'Email',
  'cta.emailPlaceholder': 'vous@example.com',
  'cta.hintEmail': 'Votre futur email de connexion — non modifiable.',
  'cta.labelUsername': 'Pseudo',
  'cta.usernamePlaceholder': 'votrepseudo',
  'cta.hintUsername': 'Lettres, chiffres et underscores uniquement. 3–20 caractères.',
  'cta.errorTaken': 'Ce pseudo est déjà pris. Essayez-en un autre.',
  'cta.errorGeneric': 'Une erreur est survenue. Veuillez réessayer.',
  'cta.btnLoading': 'Réservation…',
  'cta.btnSubmit': 'Réserver ma place →',
  'cta.successChip': '✓ Réservé',
  'cta.successTitle': 'Vous êtes sur la liste.',
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> est réservé. Nous vous contacterons au lancement de Final Table.</>
  ),
  'cta.resetBtn': 'Réserver un autre',

  'faq.0.q': 'Puis-je changer mon pseudo plus tard ?',
  'faq.0.a': 'Une fois réservé, votre pseudo est verrouillé. Choisissez bien — c\'est votre pseudo permanent dans Final Table.',
  'faq.1.q': 'La réservation est-elle gratuite ?',
  'faq.1.a': 'Oui, tant que ce pseudo n\'est pas déjà pris.',
  'faq.2.q': 'Et si mon pseudo est pris ?',
  'faq.2.a': 'Les pseudos sont attribués par ordre d\'arrivée. Si le vôtre est pris, essayez une variante — underscores et chiffres sont autorisés.',
  'faq.3.q': 'Quand l\'app sera-t-elle lancée ?',
  'faq.3.a': 'Final Table est en bêta fermée. Les membres de la liste d\'attente auront un accès anticipé avant le lancement public.',

  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Enregistre une main en </span><span className="mf-hl-italic">trois gestes.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">Pas en trois minutes.</span></p>
    </>
  ),
  'footer.support': () => <>Questions ? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Ressources',
  'footer.company': 'Entreprise',
  'footer.privacy': 'Politique de Confidentialité',
  'footer.terms': 'Conditions d\'Utilisation',
  'footer.copy': (p) => `© Final Table. Tous droits réservés ${p.year}`,

  // About
  'about.nav': 'À propos',
  'about.missionEyebrow': 'Notre Mission',
  'about.missionTitle': () => <>Rendre le poker live<br /><em>plus intelligent pour tous.</em></>,
  'about.missionP1': 'Final Table est né d\'une frustration dont on n\'arrivait pas à se défaire.',
  'about.missionP2': 'En plongeant dans les événements live, on se heurtait toujours au même mur : il n\'existe aucun bon moyen de capturer ce qui se passe vraiment à la table. On adore le jeu live, mais compter sur sa mémoire pour se rappeler quelques mains des jours plus tard, ce n\'est pas de l\'étude — c\'est de la nostalgie. Et sans données de session réelles, les fuites dans notre jeu restaient invisibles.',
  'about.missionP3': 'Les outils existants étaient pires que rien. Dépassés, lourds, mal conçus — le genre de chose qu\'on ne sortirait jamais en pleine session parce que ça vous sort complètement du jeu. On est en 2026. Ça semblait aberrant.',
  'about.missionP4': 'Alors on a construit celui qu\'on voulait — et on l\'a construit de la seule façon honnête : en vivant avec. Huit mois de prototypage, de sessions réelles, à étudier ce qui marchait, démolir ce qui ne marchait pas, et rejouer. Encore et encore. Chaque interaction a été testée sous les lumières du casino, sur de vraies mains, avec de l\'argent réel en jeu.',
  'about.missionP5': 'Final Table est pour chaque joueur live qui a fini une session en sachant qu\'il avait mal joué quelque chose, mais sans pouvoir se rappeler quoi. Chaque main raconte une histoire. On s\'assure juste que vous ne la perdiez pas.',
  'about.value1Title': 'La vitesse d\'abord',
  'about.value1Desc': 'Si ça vous ralentit à la table, ça ne vaut pas la peine d\'être construit. Chaque fonctionnalité est conçue pour fonctionner en secondes, pas en minutes.',
  'about.value2Title': 'Les données avant l\'instinct',
  'about.value2Desc': 'Les sentiments mentent, les données non. Nous vous aidons à remplacer les suppositions par de vrais chiffres — taux de victoire, tendances, schémas.',
  'about.value3Title': 'Conçu pour le live',
  'about.value3Desc': 'Pas un portage de l\'online. Chaque interaction, chaque écran est conçu pour le chaos et la vitesse d\'une table de poker live.',
  'about.teamEyebrow': 'L\'Équipe',
  'about.teamTitle': () => <>Les personnes derrière <em>Final Table</em></>,
  'about.member1Bio': 'Ingénieur logiciel passionné par la création de produits qui résolvent de vrais problèmes. Dirige la vision technique de Final Table.',
  'about.member2Bio': 'Penseur produit orienté design, concentré sur la création d\'expériences intuitives. Façonne l\'apparence et l\'expérience utilisateur de Final Table.',
  'about.ctaTitle': () => <>Vous voulez faire partie de <em>l'aventure ?</em></>,
  'about.ctaBody': 'Final Table est en bêta fermée. Réservez votre place et soyez les premiers informés du lancement.',
  'about.ctaBtn': 'Réserver ma place →',

  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  SPANISH                                        */
/* ─────────────────────────────────────────────── */
const es = {
  'nav.features': 'Funciones',
  'nav.howItWorks': '¿Cómo funciona?',
  'nav.compare': 'Comparar',
  'nav.faq': 'FAQ',
  'nav.cta': 'Descargar en iOS',

  'howSection.sans': '¿Cómo ',
  'howSection.italic': 'funciona?',

  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Registra una mano en</span>
      <span className="tp-hero-hl-italic">tres gestos</span>
      <span className="tp-hero-hl-sans">No en tres minutos.</span>
    </>
  ),
  'hero.sub': 'Final Table es el tracker de póker en vivo diseñado para la mesa. Lo bastante rápido para registrar una mano con una sola mano entre repartos. Lo bastante preciso para analizar cada sesión después.',
  'hero.emailPlaceholder': 'Introduce tu email',
  'hero.errorGeneric': 'Algo salió mal. Inténtalo de nuevo.',
  'hero.btnLoading': 'Reservando…',
  'hero.btnSubmit': 'Reservar mi lugar',
  'hero.proof': (p) => `Gratis · 10 segundos · ${p.count}+ jugadores ya registrados`,
  'hero.successText': '¡Estás en la lista! Te contactaremos cuando Final Table se lance.',
  'hero.already': '¡Ya estás en la lista! Te avisaremos cuando lancemos.',
  'hero.resetBtn': 'Reservar otro',

  'compare.eyebrow': 'QUÉ NOS DIFERENCIA',
  'compare.title': () => <>Hecho para el juego en vivo.<br />Diseñado para el jugador en la mesa.</>,
  'compare.subtitle': 'Los trackers de póker en vivo existen. Ninguno se siente parte de la mesa. Final Table es parte del juego.',
  'compare.card1.title': 'Registro en tres gestos',
  'compare.card1.desc': 'Registra cualquier acción — subir, igualar, retirarse — en tres toques. Sin teclear, sin menús. Lo bastante rápido para no perder el ritmo.',
  'compare.card2.title': 'Lectura de oponentes en tiempo real',
  'compare.card2.desc': 'Crea perfiles estadísticos de cada jugador. Conoce su VPIP, agresividad y tendencias antes de actuar.',
  'compare.card3.title': 'Datos de sesión y manos',
  'compare.card3.desc': 'Controla todo — desde un simple buy-in/cash-out hasta el registro completo mano a mano. Usa lo que se adapte a tu juego.',
  'compare.card4.title': 'Modo Dealer',
  'compare.card4.desc': 'Los dealers dirigen la mesa con comandos de voz. Los jugadores siguen en tiempo real desde sus teléfonos.',
  'compare.comingSoon': 'PRÓXIMAMENTE · ALIANZAS CON SALAS',

  'tabs.0.label': 'Antes de la sesión',
  'tabs.1.label': 'En la mesa',
  'tabs.2.label': 'Después de la sesión',
  'tabs.3.label': 'Con el tiempo',
  'tabs.0.eyebrow': 'ANTES DE LA SESIÓN',
  'tabs.0.title': 'Llega sabiendo\ncontra quién juegas.',
  'tabs.0.body': 'Revisa los perfiles de oponentes y el historial de manos antes de sentarte. Sabe quién es tight, quién es loose y dónde está el dinero.',
  'tabs.1.eyebrow': 'EN LA MESA',
  'tabs.1.title': 'Tres gestos.\nCero pérdida de ritmo.',
  'tabs.1.body': 'Registra cualquier acción — subir, igualar, retirarse — solo deslizando y tocando. Monitorea el progreso de tu sesión. Lo bastante rápido para jugar con una mano.',
  'tabs.2.eyebrow': 'DESPUÉS DE LA SESIÓN',
  'tabs.2.title': 'Ve los errores\nque no sentías.',
  'tabs.2.body': 'Revisa cada mano, encuentra patrones en tu juego, comparte manos con tus amigos, exporta datos compatibles con solvers y compara tus decisiones con las referencias GTO. Los datos dicen la verdad.',

  'notHud.title': () => <><span className="nh-hl-sans">Lo que Final Table </span><span className="nh-hl-italic">no es?</span></>,
  'notHud.item1Title': 'No es un HUD',
  'notHud.item1Desc': 'Final Table no muestra estadísticas ni datos de jugadores durante el juego en vivo. Es un registrador, no un heads-up display.',
  'notHud.item2Title': 'Bloqueado durante las sesiones',
  'notHud.item2Desc': 'Mientras una sesión está activa, la app se bloquea en modo de registro. No puedes revisar manos, compartir datos, usar el análisis IA ni acceder a las analíticas hasta que termine la sesión.',
  'notHud.item3Title': 'Hecho para el juego limpio',
  'notHud.item3Desc': 'Todo ocurre después de la sesión. Revisa, comparte y analiza — pero nunca en la mesa con una ventaja injusta.',

  'tabs.3.eyebrow': 'CON EL TIEMPO',
  'tabs.3.title': 'Conoce tu verdadero\nwin rate. Por fin.',
  'tabs.3.body': 'Rastrea tu verdadero $/h por apuestas, casino y tipo de juego. Toma decisiones basadas en datos, no en intuición.',

  'problems.0.stat': () => <>Los jugadores en vivo juegan<br /><strong>~25–30 manos/hora</strong> de media.</>,
  'problems.0.question': '¿Cuántas de esas manos recuerdas realmente?',
  'problems.0.body': 'Final Table rastrea cada mano que juegas para revisar cada acción y encontrar errores que no sabías que tenías.',
  'problems.1.stat': 'Pregunta a cualquier jugador en vivo su win rate. La mayoría adivinan.',
  'problems.1.question': '¿Realmente conoces tu $/h por apuestas, casino o tipo de juego?',
  'problems.1.body': 'Final Table rastrea cada sesión con precisión — win rate, duración, apuestas — para que siempre sepas dónde estás.',
  'problems.2.stat': 'La posición es la mayor ventaja en el póker.',
  'problems.2.question': '¿Conoces tus stats reales del BTN vs BB vs UTG?',
  'problems.2.body': 'Final Table desglosa tu rendimiento por posición — ves dónde ganas dinero y dónde pierdes fichas.',
  'problems.3.stat': () => <>"Siempre hace 3-bet ligero." "Ella nunca se retira en el river."</>,
  'problems.3.question': '¿Son lecturas reales o sensaciones de una mano memorable?',
  'problems.3.body': 'Final Table construye perfiles de oponentes a partir de manos registradas — stats reales, tendencias reales — tus lecturas se basan en datos, no en memoria.',

  'features.title': () => <>Prepárate —<br /><em>hay más en camino</em>.</>,
  'features.subtitle': 'El registro de manos es solo la punta del iceberg. Final Table tiene muchas otras funciones inteligentes.',
  'features.opponentProfiles.title': 'Estadísticas',
  'features.opponentProfiles.desc': 'Consulta tus estadísticas generadas a lo largo del tiempo para identificar tu estilo de juego. Rastrea VPIP, agresión, tasas de victoria y más — los números no mienten.',
  'features.bankroll.title': 'Seguimiento del Bankroll',
  'features.bankroll.desc': 'Establece un objetivo de bankroll y sigue tu progreso. Consulta tu tasa por hora, ganancia neta, ROI y muchas más métricas de bankroll.',
  'features.sessionLogger.title': 'Análisis IA',
  'features.sessionLogger.desc': 'Obtén análisis impulsados por IA. Analiza el historial de manos, identifica patrones y recibe recomendaciones personalizadas para mejorar tu juego.',
  'features.handReview.title': 'Revisión de Manos',
  'features.handReview.desc': 'Reproduce cada mano registrada. Recorre cada street, compara tus decisiones con las referencias GTO y encuentra los errores invisibles en la mesa.',
  'features.mtt.title': 'Torneos Multi-Mesa',
  'features.mtt.desc': 'Organiza torneos en vivo con múltiples mesas, rankings en tiempo real y distribución de premios. Crea clubes, gestiona miembros — todo desde la app.',
  'features.dealerMode.title': 'Modo Dealer',
  'features.dealerMode.comingSoon': 'PRÓXIMAMENTE',
  'features.dealerMode.desc': 'Los dealers dirigen la mesa con comandos de voz. Los jugadores siguen en tiempo real desde sus teléfonos.',

  'cta.eyebrow': 'Acceso anticipado',
  'cta.title': () => <>Reserva tu nick<br />antes que nadie.</>,
  'cta.titleLine1': 'Reserva tu nick',
  'cta.titleLine2': 'antes que nadie.',
  'cta.body': 'Asegura tu nick permanente antes del lanzamiento. Los nicks se asignan por orden de llegada — una vez tomado, desaparece.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> jugadores ya en la lista de espera</>,
  'cta.support': () => <>¿Preguntas? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Reserva tu nick',
  'cta.cardSub': 'Gratis · 10 segundos',
  'cta.labelEmail': 'Email',
  'cta.emailPlaceholder': 'tu@example.com',
  'cta.hintEmail': 'Tu futuro email de inicio de sesión — no se puede cambiar.',
  'cta.labelUsername': 'Nick',
  'cta.usernamePlaceholder': 'tunick',
  'cta.hintUsername': 'Solo letras, números y guiones bajos. 3–20 caracteres.',
  'cta.errorTaken': 'Ese nick ya está en uso. Prueba con otro.',
  'cta.errorGeneric': 'Algo salió mal. Inténtalo de nuevo.',
  'cta.btnLoading': 'Reservando…',
  'cta.btnSubmit': 'Reservar mi lugar →',
  'cta.successChip': '✓ Reservado',
  'cta.successTitle': 'Estás en la lista.',
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> está reservado. Te contactaremos cuando Final Table se lance.</>
  ),
  'cta.resetBtn': 'Reservar otro',

  'faq.0.q': '¿Puedo cambiar mi nick después?',
  'faq.0.a': 'Una vez reservado, tu nick queda fijo. Elige bien — es tu nick permanente en Final Table.',
  'faq.1.q': '¿La reserva es gratis?',
  'faq.1.a': 'Sí, siempre y cuando ese nombre de usuario no esté ocupado.',
  'faq.2.q': '¿Qué pasa si mi nick está tomado?',
  'faq.2.a': 'Los nicks se asignan por orden de llegada. Si el tuyo está tomado, prueba una variante — guiones bajos y números están permitidos.',
  'faq.3.q': '¿Cuándo se lanzará la app?',
  'faq.3.a': 'Final Table está en beta cerrada. Los miembros de la lista de espera tendrán acceso anticipado antes del lanzamiento público.',

  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Registra una mano en </span><span className="mf-hl-italic">tres gestos.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">No en tres minutos.</span></p>
    </>
  ),
  'footer.support': () => <>¿Preguntas? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Recursos',
  'footer.company': 'Empresa',
  'footer.privacy': 'Política de Privacidad',
  'footer.terms': 'Términos de Servicio',
  'footer.copy': (p) => `© Final Table. Todos los derechos reservados ${p.year}`,

  // About
  'about.nav': 'Acerca de',
  'about.missionEyebrow': 'Nuestra Misión',
  'about.missionTitle': () => <>Hacer el poker en vivo<br /><em>más inteligente para todos.</em></>,
  'about.missionP1': 'Final Table empezó con una frustración que no podíamos quitarnos de encima.',
  'about.missionP2': 'Al sumergirnos en eventos en vivo, siempre chocábamos con el mismo muro: no hay una buena forma de capturar lo que realmente pasa en la mesa. Amamos el juego en vivo, pero depender de la memoria para recordar unas pocas manos días después no es estudio — es nostalgia. Y sin datos reales de sesión, las fugas en nuestro juego seguían invisibles.',
  'about.missionP3': 'Las herramientas disponibles eran peores que nada. Anticuadas, torpes, pesadas — el tipo de cosa que nunca sacarías en medio de una sesión porque te sacaría del juego por completo. Es 2026. Eso nos parecía mal.',
  'about.missionP4': 'Así que construimos la que queríamos — y la construimos de la única forma honesta: viviéndola. Ocho meses de prototipos, llevándola a sesiones reales, estudiando qué funcionaba, destrozando lo que no, y volviendo a jugar. Una y otra vez. Cada interacción ha sido probada bajo las luces del casino, en manos reales, con dinero real en juego.',
  'about.missionP5': 'Final Table es para cada jugador en vivo que alguna vez terminó una sesión sabiendo que jugó algo mal, pero sin poder recordar qué. Cada mano cuenta una historia. Solo nos aseguramos de que no la pierdas.',
  'about.value1Title': 'Velocidad ante todo',
  'about.value1Desc': 'Si te ralentiza en la mesa, no vale la pena construirlo. Cada función está diseñada para funcionar en segundos, no en minutos.',
  'about.value2Title': 'Datos sobre intuición',
  'about.value2Desc': 'Los sentimientos mienten, los datos no. Te ayudamos a reemplazar las suposiciones con números reales — tasas de victoria, tendencias, patrones.',
  'about.value3Title': 'Hecho para el juego en vivo',
  'about.value3Desc': 'No es un puerto del online. Cada interacción, cada pantalla está diseñada para el caos y la velocidad de una mesa de poker en vivo.',
  'about.teamEyebrow': 'El Equipo',
  'about.teamTitle': () => <>Las personas detrás de <em>Final Table</em></>,
  'about.member1Bio': 'Ingeniero de software apasionado por crear productos que resuelven problemas reales. Lidera la visión técnica de Final Table.',
  'about.member2Bio': 'Pensador de producto orientado al diseño, enfocado en crear experiencias intuitivas. Da forma a la apariencia y experiencia de usuario de Final Table.',
  'about.ctaTitle': () => <>¿Quieres ser parte de <em>el viaje?</em></>,
  'about.ctaBody': 'Final Table está en beta cerrada. Reserva tu lugar y sé el primero en saber cuándo lanzamos.',
  'about.ctaBtn': 'Reservar mi lugar →',

  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  GERMAN                                         */
/* ─────────────────────────────────────────────── */
const de = {
  'nav.features': 'Funktionen',
  'nav.howItWorks': 'So funktioniert\'s?',
  'nav.compare': 'Vergleich',
  'nav.faq': 'FAQ',
  'nav.cta': 'Auf iOS laden',

  'howSection.sans': 'So ',
  'howSection.italic': 'funktioniert\'s?',

  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Erfasse eine Hand in</span>
      <span className="tp-hero-hl-italic">drei Gesten</span>
      <span className="tp-hero-hl-sans">Nicht in drei Minuten.</span>
    </>
  ),
  'hero.sub': 'Final Table ist der Live-Poker-Tracker für den Tisch. Schnell genug, um eine Hand einhändig zwischen den Deals zu loggen. Genau genug, um jede Session später auszuwerten.',
  'hero.emailPlaceholder': 'E-Mail eingeben',
  'hero.errorGeneric': 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
  'hero.btnLoading': 'Reserviere…',
  'hero.btnSubmit': 'Platz reservieren',
  'hero.proof': (p) => `Kostenlos · 10 Sekunden · ${p.count}+ Spieler bereits registriert`,
  'hero.successText': 'Du bist auf der Liste! Wir melden uns, wenn Final Table startet.',
  'hero.already': 'Du bist bereits auf der Liste! Wir benachrichtigen dich zum Start.',
  'hero.resetBtn': 'Weiteren reservieren',

  'compare.eyebrow': 'WAS UNS UNTERSCHEIDET',
  'compare.title': () => <>Für das Live-Spiel gebaut.<br />Für den Spieler am Tisch gemacht.</>,
  'compare.subtitle': 'Live-Poker-Tracker gibt es. Keiner fühlt sich an, als gehöre er an den Tisch. Final Table ist Teil des Spiels.',
  'compare.card1.title': 'Erfassung in drei Gesten',
  'compare.card1.desc': 'Erfasse jede Aktion — Raise, Call, Fold — in drei Taps. Kein Tippen, keine Menüs. Schnell genug, um den Rhythmus nicht zu verlieren.',
  'compare.card2.title': 'Gegner-Reads in Echtzeit',
  'compare.card2.desc': 'Erstelle statistische Profile jedes Spielers. Kenne VPIP, Aggression und Tendenzen, bevor du agierst.',
  'compare.card3.title': 'Session- & Hand-Daten',
  'compare.card3.desc': 'Verfolge alles — vom schnellen Buy-in/Cash-out bis zur vollständigen Hand-für-Hand-Erfassung. Nutze, was zu deinem Spiel passt.',
  'compare.card4.title': 'Dealer-Modus',
  'compare.card4.desc': 'Dealer leiten den Tisch per Sprachbefehl. Spieler verfolgen das Spiel in Echtzeit auf ihren Handys.',
  'compare.comingSoon': 'DEMNÄCHST · PARTNERSCHAFTEN MIT SPIELSTÄTTEN',

  'tabs.0.label': 'Vor der Session',
  'tabs.1.label': 'Am Tisch',
  'tabs.2.label': 'Nach der Session',
  'tabs.3.label': 'Im Laufe der Zeit',
  'tabs.0.eyebrow': 'VOR DER SESSION',
  'tabs.0.title': 'Komm an den Tisch\nund wisse, gegen wen du spielst.',
  'tabs.0.body': 'Sieh dir Gegnerprofile und Handverläufe an, bevor du dich setzt. Wisse, wer tight spielt, wer loose, und wo das Geld liegt.',
  'tabs.1.eyebrow': 'AM TISCH',
  'tabs.1.title': 'Drei Gesten.\nNull Rhythmusverlust.',
  'tabs.1.body': 'Erfasse jede Aktion — Raise, Call, Fold — einfach durch Wischen und Tippen. Verfolge deinen Sitzungsfortschritt. Schnell genug für einhändige Bedienung.',
  'tabs.2.eyebrow': 'NACH DER SESSION',
  'tabs.2.title': 'Sieh die Fehler,\ndie du nicht gespürt hast.',
  'tabs.2.body': 'Geh jede Hand durch, finde Muster in deinem Spiel, teile Hände mit Freunden, exportiere Solver-kompatible Handdaten und vergleiche Entscheidungen mit GTO-Referenzen. Die Daten lügen nicht.',

  'notHud.title': () => <><span className="nh-hl-sans">Was Final Table </span><span className="nh-hl-italic">nicht ist?</span></>,
  'notHud.item1Title': 'Kein HUD',
  'notHud.item1Desc': 'Final Table zeigt keine Statistiken oder Spielerdaten während des Live-Spiels an. Es ist ein Logger, kein Heads-up Display.',
  'notHud.item2Title': 'Gesperrt während der Sitzung',
  'notHud.item2Desc': 'Während eine Sitzung aktiv ist, sperrt sich die App im Logging-Modus. Du kannst keine Hände durchsehen, Daten teilen, KI-Analyse nutzen oder auf Analysen zugreifen, bis die Sitzung endet.',
  'notHud.item3Title': 'Für faires Spiel gebaut',
  'notHud.item3Desc': 'Alles passiert nach der Sitzung. Analysiere, teile und studiere — aber niemals am Tisch mit einem unfairen Vorteil.',

  'tabs.3.eyebrow': 'IM LAUFE DER ZEIT',
  'tabs.3.title': 'Kenne deine echte\nWin Rate. Endlich.',
  'tabs.3.body': 'Verfolge deine wahre $/h nach Einsätzen, Casino und Spieltyp. Triff Entscheidungen auf Basis von Daten, nicht Bauchgefühl.',

  'problems.0.stat': () => <>Live-Spieler spielen<br /><strong>~25–30 Hände/Stunde</strong> im Durchschnitt.</>,
  'problems.0.question': 'An wie viele dieser Hände erinnerst du dich wirklich?',
  'problems.0.body': 'Final Table verfolgt jede Hand, damit du jede Aktion überprüfen und Fehler finden kannst, von denen du nichts wusstest.',
  'problems.1.stat': 'Frag einen Live-Spieler nach seiner Win Rate. Die meisten raten.',
  'problems.1.question': 'Kennst du wirklich deine $/h nach Einsätzen, Casino oder Spieltyp?',
  'problems.1.body': 'Final Table verfolgt jede Session präzise — Win Rate, Dauer, Einsätze — damit du immer weißt, wo du stehst.',
  'problems.2.stat': 'Position ist der größte Vorteil im Poker.',
  'problems.2.question': 'Kennst du deine echten Stats vom BTN vs BB vs UTG?',
  'problems.2.body': 'Final Table schlüsselt deine Leistung nach Position auf — sieh, wo du Geld druckst und wo du Chips verlierst.',
  'problems.3.stat': () => <>"Er 3-bettet immer light." "Sie foldet nie am River."</>,
  'problems.3.question': 'Sind das echte Reads oder Gefühle von einer denkwürdigen Hand?',
  'problems.3.body': 'Final Table erstellt Gegnerprofile aus erfassten Händen — echte Stats, echte Tendenzen — deine Reads basieren auf Daten, nicht Erinnerung.',

  'features.title': () => <>Anschnallen —<br /><em>da kommt noch mehr</em>.</>,
  'features.subtitle': 'Hand-Logging ist nur die Spitze des Eisbergs. Final Table bietet viele weitere intelligente Funktionen.',
  'features.opponentProfiles.title': 'Statistiken',
  'features.opponentProfiles.desc': 'Sieh dir deine über die Zeit generierten Statistiken an, um deinen Spielstil zu erkennen. Verfolge VPIP, Aggression, Gewinnraten und mehr — die Zahlen lügen nicht.',
  'features.bankroll.title': 'Bankroll-Tracking',
  'features.bankroll.desc': 'Setze ein Bankroll-Ziel und verfolge deinen Fortschritt. Sieh Stundensatz, Nettogewinn, ROI und viele weitere Bankroll-Kennzahlen.',
  'features.sessionLogger.title': 'KI-Analyse',
  'features.sessionLogger.desc': 'Erhalte KI-gestützte Einblicke in dein Spiel. Analysiere Handverläufe, erkenne Muster und erhalte personalisierte Empfehlungen zur Verbesserung deines Spiels.',
  'features.handReview.title': 'Hand-Review',
  'features.handReview.desc': 'Spiele jede erfasste Hand nach. Geh Street für Street durch, vergleiche Entscheidungen mit GTO und finde Fehler, die du am Tisch nicht gespürt hast.',
  'features.mtt.title': 'Multi-Tisch-Turniere',
  'features.mtt.desc': 'Veranstalte Live-Turniere mit mehreren Tischen, Echtzeit-Rankings und Preisverteilung. Erstelle Clubs, verwalte Mitglieder — alles aus der App.',
  'features.dealerMode.title': 'Dealer-Modus',
  'features.dealerMode.comingSoon': 'DEMNÄCHST',
  'features.dealerMode.desc': 'Dealer leiten den Tisch per Sprachbefehl. Spieler verfolgen das Spiel in Echtzeit auf ihren Handys.',

  'cta.eyebrow': 'Früher Zugang',
  'cta.title': () => <>Reserviere deinen Nick<br />bevor es jemand anderes tut.</>,
  'cta.titleLine1': 'Reserviere deinen Nick',
  'cta.titleLine2': 'bevor es jemand anderes tut.',
  'cta.body': 'Sichere dir deinen permanenten Nick vor dem Launch. Nicks werden nach dem Prinzip „Wer zuerst kommt" vergeben — einmal weg, ist er weg.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> Spieler bereits auf der Warteliste</>,
  'cta.support': () => <>Fragen? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Sichere deinen Nick',
  'cta.cardSub': 'Kostenlos · 10 Sekunden',
  'cta.labelEmail': 'Email',
  'cta.emailPlaceholder': 'du@example.com',
  'cta.hintEmail': 'Deine zukünftige Login-Email — kann nicht geändert werden.',
  'cta.labelUsername': 'Nick',
  'cta.usernamePlaceholder': 'deinnick',
  'cta.hintUsername': 'Nur Buchstaben, Zahlen und Unterstriche. 3–20 Zeichen.',
  'cta.errorTaken': 'Dieser Nick ist bereits vergeben. Versuch einen anderen.',
  'cta.errorGeneric': 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
  'cta.btnLoading': 'Reserviere…',
  'cta.btnSubmit': 'Platz reservieren →',
  'cta.successChip': '✓ Reserviert',
  'cta.successTitle': 'Du bist auf der Liste.',
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> ist reserviert. Wir melden uns, wenn Final Table startet.</>
  ),
  'cta.resetBtn': 'Weiteren reservieren',

  'faq.0.q': 'Kann ich meinen Nick später ändern?',
  'faq.0.a': 'Einmal reserviert, ist dein Nick fest. Wähle sorgfältig — das wird dein permanenter Nick in Final Table.',
  'faq.1.q': 'Ist die Reservierung kostenlos?',
  'faq.1.a': 'Ja, solange dieser Benutzername nicht bereits vergeben ist.',
  'faq.2.q': 'Was, wenn mein Nick vergeben ist?',
  'faq.2.a': 'Nicks werden nach dem Prinzip „Wer zuerst kommt" vergeben. Falls deiner weg ist, versuch eine Variante — Unterstriche und Zahlen sind erlaubt.',
  'faq.3.q': 'Wann wird die App gelauncht?',
  'faq.3.a': 'Final Table ist in der geschlossenen Beta. Wartelisten-Mitglieder erhalten frühen Zugang vor dem öffentlichen Launch.',

  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Erfasse eine Hand in </span><span className="mf-hl-italic">drei Gesten.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">Nicht in drei Minuten.</span></p>
    </>
  ),
  'footer.support': () => <>Fragen? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Ressourcen',
  'footer.company': 'Unternehmen',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'Nutzungsbedingungen',
  'footer.copy': (p) => `© Final Table. Alle Rechte vorbehalten ${p.year}`,

  // About
  'about.nav': 'Über uns',
  'about.missionEyebrow': 'Unsere Mission',
  'about.missionTitle': () => <>Live-Poker<br /><em>intelligenter für alle machen.</em></>,
  'about.missionP1': 'Final Table begann mit einer Frustration, die wir nicht loswerden konnten.',
  'about.missionP2': 'Als wir in Live-Events eintauchten, stießen wir immer wieder auf dieselbe Wand: Es gibt keine gute Möglichkeit festzuhalten, was wirklich am Tisch passiert. Wir lieben das Live-Spiel, aber sich auf das Gedächtnis zu verlassen, um sich Tage später an ein paar Hände zu erinnern, ist kein Lernen — das ist Nostalgie. Und ohne echte Session-Daten blieben die Schwächen in unserem Spiel unsichtbar.',
  'about.missionP3': 'Die vorhandenen Tools waren schlimmer als nichts. Veraltet, klobig, schwerfällig — die Art von Sache, die man nie mitten in einer Session herausholen würde, weil sie einen komplett aus dem Spiel reißt. Es ist 2026. Das fühlte sich falsch an.',
  'about.missionP4': 'Also bauten wir das, was wir wollten — und zwar auf die einzig ehrliche Art: indem wir damit lebten. Acht Monate Prototyping, echte Sessions, untersuchen was funktioniert, auseinandernehmen was nicht funktioniert, und wieder spielen. Immer und immer wieder. Jede Interaktion wurde unter Casino-Licht getestet, an echten Händen, mit echtem Geld auf dem Spiel.',
  'about.missionP5': 'Final Table ist für jeden Live-Spieler, der jemals eine Session beendet hat und wusste, dass er etwas falsch gespielt hat, sich aber nicht erinnern konnte, was. Jede Hand erzählt eine Geschichte. Wir sorgen nur dafür, dass du sie nicht verlierst.',
  'about.value1Title': 'Geschwindigkeit zuerst',
  'about.value1Desc': 'Wenn es dich am Tisch verlangsamt, lohnt es sich nicht. Jede Funktion ist so konzipiert, dass sie in Sekunden funktioniert, nicht in Minuten.',
  'about.value2Title': 'Daten statt Bauchgefühl',
  'about.value2Desc': 'Gefühle lügen, Daten nicht. Wir helfen dir, Vermutungen durch echte Zahlen zu ersetzen — Gewinnraten, Tendenzen, Muster.',
  'about.value3Title': 'Für Live-Spiel gebaut',
  'about.value3Desc': 'Kein Port aus dem Online-Bereich. Jede Interaktion, jeder Bildschirm ist für das Chaos und die Geschwindigkeit eines Live-Pokertisches konzipiert.',
  'about.teamEyebrow': 'Das Team',
  'about.teamTitle': () => <>Die Menschen hinter <em>Final Table</em></>,
  'about.member1Bio': 'Software-Ingenieur mit Leidenschaft für Produkte, die echte Probleme lösen. Leitet die technische Vision von Final Table.',
  'about.member2Bio': 'Designorientierter Produktdenker, der sich auf intuitive Erlebnisse konzentriert. Gestaltet das Erscheinungsbild und die Benutzererfahrung von Final Table.',
  'about.ctaTitle': () => <>Willst du Teil <em>der Reise sein?</em></>,
  'about.ctaBody': 'Final Table befindet sich in der geschlossenen Beta. Reserviere deinen Platz und erfahre als Erster vom Launch.',
  'about.ctaBtn': 'Platz reservieren →',

  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  PORTUGUESE                                     */
/* ─────────────────────────────────────────────── */
const pt = {
  'nav.features': 'Funcionalidades',
  'nav.howItWorks': 'Como funciona?',
  'nav.compare': 'Comparar',
  'nav.faq': 'FAQ',
  'nav.cta': 'Baixar no iOS',

  'howSection.sans': 'Como ',
  'howSection.italic': 'funciona?',

  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Registre uma mão em</span>
      <span className="tp-hero-hl-italic">três gestos</span>
      <span className="tp-hero-hl-sans">Não em três minutos.</span>
    </>
  ),
  'hero.sub': 'Final Table é o tracker de poker ao vivo feito para a mesa. Rápido o bastante para registrar uma mão com uma só mão entre as rodadas. Preciso o bastante para analisar cada sessão depois.',
  'hero.emailPlaceholder': 'Digite seu email',
  'hero.errorGeneric': 'Algo deu errado. Tente novamente.',
  'hero.btnLoading': 'Reservando…',
  'hero.btnSubmit': 'Reservar meu lugar',
  'hero.proof': (p) => `Grátis · 10 segundos · ${p.count}+ jogadores já registrados`,
  'hero.successText': 'Você está na lista! Entraremos em contato quando o Final Table for lançado.',
  'hero.already': 'Você já está na lista! Avisaremos quando lançarmos.',
  'hero.resetBtn': 'Reservar outro',

  'compare.eyebrow': 'O QUE NOS DIFERENCIA',
  'compare.title': () => <>Feito para o jogo ao vivo.<br />Projetado para o jogador na mesa.</>,
  'compare.subtitle': 'Trackers de poker ao vivo existem. Nenhum parece pertencer à mesa. Final Table faz parte do jogo.',
  'compare.card1.title': 'Registro em três gestos',
  'compare.card1.desc': 'Registre qualquer ação — raise, call, fold — em três toques. Sem digitar, sem menus. Rápido o bastante para não perder o ritmo.',
  'compare.card2.title': 'Leitura de oponentes em tempo real',
  'compare.card2.desc': 'Crie perfis estatísticos de cada jogador. Conheça VPIP, agressividade e tendências antes de agir.',
  'compare.card3.title': 'Dados de sessão e mãos',
  'compare.card3.desc': 'Acompanhe tudo — de um simples buy-in/cash-out ao registro completo mão a mão. Use o que se adapta ao seu jogo.',
  'compare.card4.title': 'Modo Dealer',
  'compare.card4.desc': 'Dealers comandam a mesa por voz. Jogadores acompanham em tempo real nos seus celulares.',
  'compare.comingSoon': 'EM BREVE · PARCERIAS COM CASAS DE JOGO',

  'tabs.0.label': 'Antes da sessão',
  'tabs.1.label': 'Na mesa',
  'tabs.2.label': 'Depois da sessão',
  'tabs.3.label': 'Com o tempo',
  'tabs.0.eyebrow': 'ANTES DA SESSÃO',
  'tabs.0.title': 'Chegue sabendo\ncontra quem você joga.',
  'tabs.0.body': 'Revise perfis de oponentes e histórico de mãos antes de sentar. Saiba quem é tight, quem é loose e onde está o dinheiro.',
  'tabs.1.eyebrow': 'NA MESA',
  'tabs.1.title': 'Três gestos.\nZero perda de ritmo.',
  'tabs.1.body': 'Registre qualquer ação — raise, call, fold — apenas deslizando e tocando. Acompanhe o progresso da sua sessão. Rápido o bastante para jogar com uma mão.',
  'tabs.2.eyebrow': 'DEPOIS DA SESSÃO',
  'tabs.2.title': 'Veja os erros\nque você não sentia.',
  'tabs.2.body': 'Revise cada mão, encontre padrões no seu jogo, compartilhe mãos com amigos, exporte dados compatíveis com solvers e compare decisões com referências GTO. Os dados dizem a verdade.',

  'notHud.title': () => <><span className="nh-hl-sans">O que o Final Table </span><span className="nh-hl-italic">não é?</span></>,
  'notHud.item1Title': 'Não é um HUD',
  'notHud.item1Desc': 'O Final Table não exibe estatísticas ou dados de jogadores durante o jogo ao vivo. É um registrador, não um heads-up display.',
  'notHud.item2Title': 'Bloqueado durante as sessões',
  'notHud.item2Desc': 'Enquanto uma sessão está ativa, o app trava no modo de registro. Você não pode consultar mãos, compartilhar dados, usar a análise IA ou acessar análises até o fim da sessão.',
  'notHud.item3Title': 'Feito para o jogo justo',
  'notHud.item3Desc': 'Tudo acontece após a sessão. Revise, compartilhe e analise — mas nunca na mesa com uma vantagem injusta.',

  'tabs.3.eyebrow': 'COM O TEMPO',
  'tabs.3.title': 'Conheça seu verdadeiro\nwin rate. Finalmente.',
  'tabs.3.body': 'Acompanhe seu verdadeiro $/h por stakes, cassino e tipo de jogo. Tome decisões baseadas em dados, não em intuição.',

  'problems.0.stat': () => <>Jogadores ao vivo jogam<br /><strong>~25–30 mãos/hora</strong> em média.</>,
  'problems.0.question': 'Quantas dessas mãos você realmente lembra?',
  'problems.0.body': 'Final Table rastreia cada mão que você joga para revisar cada ação e encontrar erros que você nem sabia que tinha.',
  'problems.1.stat': 'Pergunte a qualquer jogador ao vivo seu win rate. A maioria chuta.',
  'problems.1.question': 'Você realmente sabe seu $/h por stakes, cassino ou tipo de jogo?',
  'problems.1.body': 'Final Table rastreia cada sessão com precisão — win rate, duração, stakes — para você sempre saber onde está.',
  'problems.2.stat': 'Posição é a maior vantagem no poker.',
  'problems.2.question': 'Você conhece suas stats reais do BTN vs BB vs UTG?',
  'problems.2.body': 'Final Table detalha seu desempenho por posição — veja onde você lucra e onde perde fichas.',
  'problems.3.stat': () => <>"Ele sempre dá 3-bet light." "Ela nunca folda no river."</>,
  'problems.3.question': 'São leituras reais ou sensações de uma mão memorável?',
  'problems.3.body': 'Final Table constrói perfis de oponentes a partir de mãos registradas — stats reais, tendências reais — suas leituras baseadas em dados, não em memória.',

  'features.title': () => <>Prepare-se —<br /><em>tem mais por vir</em>.</>,
  'features.subtitle': 'O registro de mãos é apenas a ponta do iceberg. Final Table tem muitas outras funcionalidades inteligentes.',
  'features.opponentProfiles.title': 'Estatísticas',
  'features.opponentProfiles.desc': 'Veja suas estatísticas geradas ao longo do tempo para identificar seu estilo de jogo. Acompanhe VPIP, agressão, taxas de vitória e mais — os números não mentem.',
  'features.bankroll.title': 'Controle de Bankroll',
  'features.bankroll.desc': 'Defina uma meta de bankroll e acompanhe o progresso. Veja sua taxa horária, lucro líquido, ROI e muitas outras métricas de bankroll.',
  'features.sessionLogger.title': 'Análise IA',
  'features.sessionLogger.desc': 'Obtenha análises alimentadas por IA. Analise o histórico de mãos, identifique padrões e receba recomendações personalizadas para melhorar seu jogo.',
  'features.handReview.title': 'Revisão de Mãos',
  'features.handReview.desc': 'Reproduza cada mão registrada. Percorra cada street, compare decisões com referências GTO e encontre erros invisíveis na mesa.',
  'features.mtt.title': 'Torneios Multi-Mesa',
  'features.mtt.desc': 'Organize torneios ao vivo com múltiplas mesas, rankings em tempo real e distribuição de prêmios. Crie clubes, gerencie membros — tudo pelo app.',
  'features.dealerMode.title': 'Modo Dealer',
  'features.dealerMode.comingSoon': 'EM BREVE',
  'features.dealerMode.desc': 'Dealers comandam a mesa por voz. Jogadores acompanham em tempo real nos seus celulares.',

  'cta.eyebrow': 'Acesso antecipado',
  'cta.title': () => <>Reserve seu nick<br />antes de qualquer um.</>,
  'cta.titleLine1': 'Reserve seu nick',
  'cta.titleLine2': 'antes de qualquer um.',
  'cta.body': 'Garanta seu nick permanente antes do lançamento. Nicks são por ordem de chegada — uma vez tomado, já era.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> jogadores já na lista de espera</>,
  'cta.support': () => <>Dúvidas? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Garanta seu nick',
  'cta.cardSub': 'Grátis · 10 segundos',
  'cta.labelEmail': 'Email',
  'cta.emailPlaceholder': 'voce@example.com',
  'cta.hintEmail': 'Seu futuro email de login — não pode ser alterado.',
  'cta.labelUsername': 'Nick',
  'cta.usernamePlaceholder': 'seunick',
  'cta.hintUsername': 'Apenas letras, números e underscores. 3–20 caracteres.',
  'cta.errorTaken': 'Esse nick já está em uso. Tente outro.',
  'cta.errorGeneric': 'Algo deu errado. Tente novamente.',
  'cta.btnLoading': 'Reservando…',
  'cta.btnSubmit': 'Reservar meu lugar →',
  'cta.successChip': '✓ Reservado',
  'cta.successTitle': 'Você está na lista.',
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> está reservado. Entraremos em contato quando o Final Table for lançado.</>
  ),
  'cta.resetBtn': 'Reservar outro',

  'faq.0.q': 'Posso mudar meu nick depois?',
  'faq.0.a': 'Uma vez reservado, seu nick é fixo. Escolha com cuidado — esse será seu nick permanente no Final Table.',
  'faq.1.q': 'A reserva é grátis?',
  'faq.1.a': 'Sim, desde que esse nome de usuário não esteja ocupado.',
  'faq.2.q': 'E se meu nick estiver tomado?',
  'faq.2.a': 'Nicks são por ordem de chegada. Se o seu estiver tomado, tente uma variação — underscores e números são permitidos.',
  'faq.3.q': 'Quando o app será lançado?',
  'faq.3.a': 'Final Table está em beta fechado. Membros da lista de espera terão acesso antecipado antes do lançamento público.',

  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Registre uma mão em </span><span className="mf-hl-italic">três gestos.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">Não em três minutos.</span></p>
    </>
  ),
  'footer.support': () => <>Dúvidas? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Recursos',
  'footer.company': 'Empresa',
  'footer.privacy': 'Política de Privacidade',
  'footer.terms': 'Termos de Uso',
  'footer.copy': (p) => `© Final Table. Todos os direitos reservados ${p.year}`,

  // About
  'about.nav': 'Sobre',
  'about.missionEyebrow': 'Nossa Missão',
  'about.missionTitle': () => <>Tornar o poker ao vivo<br /><em>mais inteligente para todos.</em></>,
  'about.missionP1': 'O Final Table começou com uma frustração da qual não conseguíamos nos livrar.',
  'about.missionP2': 'Ao mergulhar em eventos ao vivo, sempre esbarrávamos no mesmo muro: não existe uma boa forma de capturar o que realmente acontece na mesa. Amamos o jogo ao vivo, mas depender da memória para lembrar de algumas mãos dias depois não é estudo — é nostalgia. E sem dados reais de sessão, os vazamentos no nosso jogo ficavam invisíveis.',
  'about.missionP3': 'As ferramentas disponíveis eram piores do que nada. Ultrapassadas, desajeitadas, pesadas — o tipo de coisa que você nunca tiraria do bolso no meio de uma sessão porque te tiraria completamente do jogo. Estamos em 2026. Isso parecia errado.',
  'about.missionP4': 'Então construímos a que queríamos — e da única forma honesta: vivendo com ela. Oito meses de prototipagem, levando para sessões reais, estudando o que funcionava, desmontando o que não funcionava, e jogando de novo. Várias e várias vezes. Cada interação foi testada sob as luzes do cassino, em mãos reais, com dinheiro real em jogo.',
  'about.missionP5': 'O Final Table é para todo jogador ao vivo que já terminou uma sessão sabendo que jogou algo errado, mas sem conseguir lembrar o quê. Cada mão conta uma história. Nós só garantimos que você não a perca.',
  'about.value1Title': 'Velocidade em primeiro',
  'about.value1Desc': 'Se te atrasa na mesa, não vale a pena construir. Cada funcionalidade é projetada para funcionar em segundos, não minutos.',
  'about.value2Title': 'Dados acima do instinto',
  'about.value2Desc': 'Sentimentos mentem, dados não. Ajudamos você a substituir suposições por números reais — taxas de vitória, tendências, padrões.',
  'about.value3Title': 'Feito para o jogo ao vivo',
  'about.value3Desc': 'Não é um porte do online. Cada interação, cada tela é projetada para o caos e a velocidade de uma mesa de poker ao vivo.',
  'about.teamEyebrow': 'A Equipe',
  'about.teamTitle': () => <>As pessoas por trás de <em>Final Table</em></>,
  'about.member1Bio': 'Engenheiro de software apaixonado por criar produtos que resolvem problemas reais. Lidera a visão técnica do Final Table.',
  'about.member2Bio': 'Pensador de produto orientado ao design, focado em criar experiências intuitivas. Molda a aparência e a experiência do usuário do Final Table.',
  'about.ctaTitle': () => <>Quer fazer parte <em>dessa jornada?</em></>,
  'about.ctaBody': 'O Final Table está em beta fechado. Reserve seu lugar e seja o primeiro a saber quando lançarmos.',
  'about.ctaBtn': 'Reservar meu lugar →',

  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  TURKISH                                        */
/* ─────────────────────────────────────────────── */
const tr = {
  'nav.features': 'Özellikler',
  'nav.howItWorks': 'Nasıl çalışır?',
  'nav.compare': 'Karşılaştır',
  'nav.faq': 'SSS',
  'nav.cta': "iOS'ta İndir",

  'howSection.sans': 'Nasıl ',
  'howSection.italic': 'çalışır?',

  'hero.h1': () => (
    <>
      <span className="tp-hero-hl-sans">Bir eli üç hareketle</span>
      <span className="tp-hero-hl-italic">kaydet</span>
      <span className="tp-hero-hl-sans">Üç dakikada değil.</span>
    </>
  ),
  'hero.sub': 'Final Table, masa başı için tasarlanmış canlı poker takipçisidir. Eller arasında tek elle kayıt yapacak kadar hızlı. Her seansı sonra analiz edecek kadar hassas.',
  'hero.emailPlaceholder': 'E-postanızı girin',
  'hero.errorGeneric': 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
  'hero.btnLoading': 'Rezerve ediliyor…',
  'hero.btnSubmit': 'Yerimi Ayırt',
  'hero.proof': (p) => `Ücretsiz · 10 saniye · ${p.count}+ oyuncu zaten kayıt yaptı`,
  'hero.successText': 'Listedesiniz! Final Table açıldığında sizinle iletişime geçeceğiz.',
  'hero.already': 'Zaten listedesiniz! Lansmanı size bildireceğiz.',
  'hero.resetBtn': 'Başka biri için kayıt yap',

  'compare.eyebrow': 'BİZİ FARKLI KILAN NE?',
  'compare.title': () => <>Canlı oyun için yapıldı.<br />Masadaki oyuncu için tasarlandı.</>,
  'compare.subtitle': 'Canlı poker takipçileri var. Hiçbiri masaya ait hissettirmiyor. Final Table oyunun bir parçası.',
  'compare.card1.title': 'Üç hareketle kayıt',
  'compare.card1.desc': 'Herhangi bir aksiyonu — raise, call, fold — üç dokunuşla kaydedin. Yazma yok, menü yok. Ritmi bozmayacak kadar hızlı.',
  'compare.card2.title': 'Gerçek zamanlı rakip okuma',
  'compare.card2.desc': 'Karşılaştığınız her oyuncunun istatistik profilini oluşturun. Hamle yapmadan önce VPIP, agresyon ve eğilimlerini bilin.',
  'compare.card3.title': 'Seans ve el düzeyinde veri',
  'compare.card3.desc': "Hızlı bir buy-in/cash-out'tan tam el bazında aksiyon kaydına kadar her şeyi takip edin. Oyununuza uygun olanı kullanın.",
  'compare.card4.title': 'Krupiye Modu',
  'compare.card4.desc': 'Krupiyeler masayı sesli komutlarla yönetir. Oyuncular kendi telefonlarından gerçek zamanlı takip eder.',
  'compare.comingSoon': 'YAKINDA · MEKAN ORTAKLIKLARI',

  'tabs.0.label': 'Seanstan önce',
  'tabs.1.label': 'Masada',
  'tabs.2.label': 'Seanstan sonra',
  'tabs.3.label': 'Zamanla',
  'tabs.0.eyebrow': 'SEANSTAN ÖNCE',
  'tabs.0.title': 'Kiminle oynadığını\nbilerek masaya otur.',
  'tabs.0.body': 'Oturmadan önce rakip profillerini ve geçmiş el geçmişini inceleyin. Kimin sıkı, kimin gevşek oynadığını ve paranın nerede olduğunu bilin.',
  'tabs.1.eyebrow': 'MASADA',
  'tabs.1.title': 'Üç hareket.\nSıfır akış kaybı.',
  'tabs.1.body': 'Herhangi bir aksiyonu — raise, call, fold — kaydırarak ve dokunarak kaydedin. Seans ilerlemenizi takip edin. Tek elle kullanacak kadar hızlı.',
  'tabs.2.eyebrow': 'SEANSTAN SONRA',
  'tabs.2.title': 'Hissedemediğin\nhataları gör.',
  'tabs.2.body': 'Her eli inceleyin, oyununuzdaki kalıpları bulun, elleri arkadaşlarınızla paylaşın, solver uyumlu el verisi dışa aktarın ve kararlarınızı GTO referanslarıyla karşılaştırın. Veriler gerçeği söyler.',

  'notHud.title': () => <><span className="nh-hl-sans">Final Table ne </span><span className="nh-hl-italic">değildir?</span></>,
  'notHud.item1Title': 'HUD değil',
  'notHud.item1Desc': 'Final Table, canlı oyun sırasında istatistik veya oyuncu verisi göstermez. Bir kayıt aracıdır, heads-up display değil.',
  'notHud.item2Title': 'Seans sırasında kilitli',
  'notHud.item2Desc': 'Seans aktifken uygulama kayıt moduna kilitlenir. Seans bitene kadar elleri inceleyemez, veri paylaşamaz, AI analizi veya analitiğe erişemezsiniz.',
  'notHud.item3Title': 'Adil oyun için tasarlandı',
  'notHud.item3Desc': 'Her şey seans sonrasında olur. İnceleyin, paylaşın ve analiz edin — ama asla masada haksız bir avantajla değil.',

  'tabs.3.eyebrow': 'ZAMANLA',
  'tabs.3.title': 'Gerçek kazanma\noranını öğren. Sonunda.',
  'tabs.3.body': 'Bahis, kumarhane ve oyun türüne göre gerçek $/saat oranınızı takip edin. Sezgiye değil, verilere dayalı kararlar verin.',

  'problems.0.stat': () => <>Canlı poker oyuncuları ortalama<br /><strong>saatte ~25–30 el</strong> oynar.</>,
  'problems.0.question': 'Bu ellerden kaçını gerçekten hatırlıyorsun?',
  'problems.0.body': 'Final Table oynadığınız her eli takip eder, böylece her aksiyonu inceleyebilir ve bilmediğiniz hataları bulabilirsiniz.',
  'problems.1.stat': 'Herhangi bir canlı oyuncuya kazanma oranını sorun. Çoğu tahmin eder.',
  'problems.1.question': 'Bahis, kumarhane veya oyun türüne göre gerçek $/saat oranını biliyor musun?',
  'problems.1.body': 'Final Table her seansı hassasiyetle takip eder — kazanma oranı, süre, bahisler — böylece her zaman nerede olduğunuzu bilirsiniz.',
  'problems.2.stat': 'Pozisyon, pokerdeki en büyük avantajdır.',
  'problems.2.question': 'BTN vs BB vs UTG pozisyonlarındaki gerçek istatistiklerini biliyor musun?',
  'problems.2.body': 'Final Table performansınızı pozisyona göre ayrıştırır — nerede para kazandığınızı ve nerede çip kaybettiğinizi görün.',
  'problems.3.stat': () => <>"Hep hafif 3-bet yapar." "River'da asla fold yapmaz."</>,
  'problems.3.question': 'Bunlar gerçek okumalar mı yoksa akılda kalan bir elden gelen hisler mi?',
  'problems.3.body': 'Final Table, kaydedilen ellerden rakip profilleri oluşturur — gerçek istatistikler, gerçek eğilimler — okumalarınız hafızaya değil, verilere dayanır.',

  'features.title': () => <>Kemerlerinizi bağlayın —<br /><em>daha fazlası geliyor</em>.</>,
  'features.subtitle': 'El kaydı buzdağının sadece görünen kısmı. Final Table birçok akıllı özelliğe sahip.',
  'features.opponentProfiles.title': 'İstatistikler',
  'features.opponentProfiles.desc': 'Oyun tarzınızı belirlemek için zamanla oluşan istatistiklerinizi görün. VPIP, agresyon, kazanma oranları ve daha fazlasını takip edin — rakamlar yalan söylemez.',
  'features.bankroll.title': 'Bankroll Takibi',
  'features.bankroll.desc': 'Bir bankroll hedefi belirleyin ve ilerlemenizi izleyin. Saatlik oranınızı, net kârınızı, ROI ve daha birçok bankroll metriğini görün.',
  'features.sessionLogger.title': 'AI Analizi',
  'features.sessionLogger.desc': 'AI destekli analizler alın. El geçmişlerini analiz edin, kalıpları belirleyin ve oyununuzu geliştirmek için kişiselleştirilmiş öneriler alın.',
  'features.handReview.title': 'El İnceleme',
  'features.handReview.desc': 'Kaydedilen her eli yeniden oynatın. Her sokağı adım adım geçin, kararlarınızı GTO referanslarıyla karşılaştırın ve masada hissedemediğiniz hataları bulun.',
  'features.mtt.title': 'Çok Masalı Turnuvalar',
  'features.mtt.desc': 'Birden fazla masada canlı turnuvalar düzenleyin, gerçek zamanlı sıralamalar ve ödül dağıtımı yapın. Kulüpler oluşturun, üyeleri yönetin — hepsi uygulamadan.',
  'features.dealerMode.title': 'Krupiye Modu',
  'features.dealerMode.comingSoon': 'YAKINDA',
  'features.dealerMode.desc': 'Krupiyeler masayı sesli komutlarla yönetir. Oyuncular kendi telefonlarından gerçek zamanlı takip eder.',

  'cta.eyebrow': 'Erken erişim',
  'cta.title': () => <>Kullanıcı adını<br />başkası almadan önce al.</>,
  'cta.titleLine1': 'Kullanıcı adını',
  'cta.titleLine2': 'başkası almadan önce al.',
  'cta.body': 'Lansmandan önce kalıcı kullanıcı adınızı alın. Kullanıcı adları ilk gelen alır — gitti mi gitti.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> oyuncu zaten bekleme listesinde</>,
  'cta.support': () => <>Sorularınız mı var? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'cta.cardTitle': 'Kullanıcı adını al',
  'cta.cardSub': 'Ücretsiz · 10 saniye',
  'cta.labelEmail': 'E-posta',
  'cta.emailPlaceholder': 'siz@example.com',
  'cta.hintEmail': 'Gelecekteki giriş e-postanız — sonradan değiştirilemez.',
  'cta.labelUsername': 'Kullanıcı Adı',
  'cta.usernamePlaceholder': 'kullaniciadiniz',
  'cta.hintUsername': 'Yalnızca harfler, rakamlar ve alt çizgiler. 3–20 karakter.',
  'cta.errorTaken': 'Bu kullanıcı adı zaten alınmış. Başka bir tane deneyin.',
  'cta.errorGeneric': 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
  'cta.btnLoading': 'Rezerve ediliyor…',
  'cta.btnSubmit': 'Yerimi ayırt →',
  'cta.successChip': '✓ Rezerve edildi',
  'cta.successTitle': 'Listedesiniz.',
  'cta.successBody': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> sizin için ayrıldı. Final Table açıldığında sizinle iletişime geçeceğiz.</>
  ),
  'cta.resetBtn': 'Başka biri için kayıt yap',

  'faq.0.q': 'Kullanıcı adımı sonradan değiştirebilir miyim?',
  'faq.0.a': 'Rezerve edildikten sonra kullanıcı adınız sabitlenir. Dikkatli seçin — bu Final Table\'daki kalıcı kullanıcı adınız olacak.',
  'faq.1.q': 'Rezervasyon ücretsiz mi?',
  'faq.1.a': 'Evet, o kullanıcı adı alınmamış olduğu sürece.',
  'faq.2.q': 'Kullanıcı adım alınmışsa ne olur?',
  'faq.2.a': 'Kullanıcı adları ilk gelen alır prensibine göre çalışır. Sizinki alınmışsa bir varyasyon deneyin — alt çizgi ve rakamlar kullanılabilir.',
  'faq.3.q': 'Uygulama ne zaman çıkacak?',
  'faq.3.a': 'Final Table kapalı betadadır. Bekleme listesi üyeleri halka açık lansmandan önce erken erişim alacak.',

  'footer.tagline': () => (
    <>
      <p className="mf-hl-p"><span className="mf-hl-sans">Bir eli </span><span className="mf-hl-italic">üç hareketle kaydet.</span></p>
      <p className="mf-hl-p"><span className="mf-hl-sans">Üç dakikada değil.</span></p>
    </>
  ),
  'footer.support': () => <>Sorularınız mı var? <a href="mailto:contact@finaltable.io">contact@finaltable.io</a></>,
  'footer.resources': 'Kaynaklar',
  'footer.company': 'Şirket',
  'footer.privacy': 'Gizlilik Politikası',
  'footer.terms': 'Kullanım Koşulları',
  'footer.copy': (p) => `© Final Table. Tüm hakları saklıdır ${p.year}`,

  // About
  'about.nav': 'Hakkımızda',
  'about.missionEyebrow': 'Misyonumuz',
  'about.missionTitle': () => <>Canlı pokeri<br /><em>herkes için daha akıllı hale getirmek.</em></>,
  'about.missionP1': 'Final Table, bir türlü kurtulamadığımız bir hayal kırıklığıyla başladı.',
  'about.missionP2': 'Canlı etkinliklere daldığımızda, hep aynı duvara çarptık: masada gerçekte ne olduğunu kaydetmenin iyi bir yolu yok. Canlı oyunu seviyoruz, ama günler sonra birkaç eli hatırlamak için hafızaya güvenmek çalışma değil — nostalji. Ve gerçek seans verileri olmadan, oyunumuzdaki sızıntılar görünmez kaldı.',
  'about.missionP3': 'Piyasadaki araçlar hiç yoktan daha kötüydü. Eski, hantal, ağır — seans ortasında asla çıkarmayacağınız türden şeyler çünkü sizi tamamen oyundan çıkarırdı. 2026 yılındayız. Bu yanlış geldi.',
  'about.missionP4': 'Bu yüzden istediğimiz şeyi biz yaptık — ve böyle bir uygulamanın dürüstçe yapılabileceği tek yoldan: onunla yaşayarak. Sekiz ay prototipleme, gerçek seanslara götürme, neyin işe yaradığını inceleme, neyin işe yaramadığını parçalama ve tekrar oynama. Tekrar tekrar. Her etkileşim kumarhane ışıkları altında, gerçek ellerde, gerçek para söz konusuyken test edildi.',
  'about.missionP5': 'Final Table, bir seansı bir şeyi yanlış oynadığını bilerek bitirmiş ama neyi olduğunu hatırlayamamış her canlı oyuncu içindir. Her el bir hikaye anlatır. Biz sadece onu kaybetmemenizi sağlıyoruz.',
  'about.value1Title': 'Önce hız',
  'about.value1Desc': 'Masada sizi yavaşlatıyorsa, yapılmaya değmez. Her özellik dakikalarda değil, saniyelerde çalışmak için tasarlandı.',
  'about.value2Title': 'Sezgi değil veri',
  'about.value2Desc': 'Duygular yalan söyler, veriler söylemez. Tahminleri gerçek rakamlarla değiştirmenize yardımcı oluyoruz — kazanma oranları, eğilimler, kalıplar.',
  'about.value3Title': 'Canlı oyun için yapıldı',
  'about.value3Desc': 'Online oyunun bir portu değil. Her etkileşim, her ekran canlı poker masasının kaos ve hızı için tasarlandı.',
  'about.teamEyebrow': 'Ekip',
  'about.teamTitle': () => <><em>Final Table</em>'ın arkasındaki insanlar</>,
  'about.member1Bio': 'Gerçek sorunları çözen ürünler yaratma tutkusuna sahip yazılım mühendisi. Final Table\'ın teknik vizyonuna liderlik ediyor.',
  'about.member2Bio': 'Sezgisel deneyimler oluşturmaya odaklı, tasarım odaklı ürün düşünürü. Final Table\'ın görünümünü ve kullanıcı deneyimini şekillendiriyor.',
  'about.ctaTitle': () => <>Bu yolculuğun <em>bir parçası olmak ister misiniz?</em></>,
  'about.ctaBody': 'Final Table kapalı betadadır. Yerinizi ayırtın ve çıkış yaptığımızda ilk siz öğrenin.',
  'about.ctaBtn': 'Yerimi ayırt →',

  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.es': 'Español',
  'lang.fr': 'Français',
  'lang.pl': 'Polski',
  'lang.pt': 'Português',
  'lang.ru': 'Русский',
  'lang.tr': 'Türkçe',
}

/* ─────────────────────────────────────────────── */
/*  PROVIDER                                       */
/* ─────────────────────────────────────────────── */
const translations = { en, pl, ru, fr, es, de, pt, tr }

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale)

  const setLocale = (l) => {
    localStorage.setItem(STORAGE_KEY, l)
    setLocaleState(l)
  }

  const t = (key, params) => {
    const entry = translations[locale]?.[key] ?? translations.en[key] ?? key
    return typeof entry === 'function' ? entry(params) : entry
  }

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useT = () => useContext(I18nContext)
export { SUPPORTED }
