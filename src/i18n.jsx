import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'ft_lang'
const SUPPORTED = ['en', 'pl', 'ru']

function detectLocale() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED.includes(stored)) return stored
  const lang = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase()
  if (lang.startsWith('pl')) return 'pl'
  if (lang.startsWith('ru')) return 'ru'
  return 'en'
}

/* ─────────────────────────────────────────────── */
/*  ENGLISH                                        */
/* ─────────────────────────────────────────────── */
const en = {
  // Navbar
  'nav.features': 'Features',
  'nav.howItWorks': 'How it works',
  'nav.compare': 'Compare',
  'nav.faq': 'FAQ',
  'nav.cta': 'Reserve your handle',

  // Hero
  'hero.h1': (p) => (
    <>
      Log a hand in{' '}
      <span className="tp-hero-mark"><span>three gestures</span><span className="tp-hero-mark-bg" /></span>
      .<br />Not{' '}
      <span className="tp-hero-mark tp-hero-mark-red"><span>three minutes</span><span className="tp-hero-mark-bg" /></span>.
    </>
  ),
  'hero.sub': 'Final Table is the live poker tracker built for the table itself — fast enough to use one-handed between hands, accurate enough to study after.',
  'hero.emailPlaceholder': 'you@example.com',
  'hero.usernamePlaceholder': 'yourhandle',
  'hero.errorTaken': 'That username is already taken. Try a different one.',
  'hero.errorGeneric': 'Something went wrong. Please try again.',
  'hero.btnLoading': 'Reserving…',
  'hero.btnSubmit': 'Reserve my handle →',
  'hero.proof': (p) => `Free · Takes 10 seconds · ${p.count}+ players already reserved`,
  'hero.successText': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> is reserved. We'll reach out when Final Table opens.</>
  ),
  'hero.resetBtn': 'Reserve another',

  // Comparison
  'compare.eyebrow': 'WHAT MAKES IT DIFFERENT',
  'compare.title': () => <>Built for the live game.<br />Designed for the player at the rail.</>,
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
  'tabs.1.body': 'Log any action — raise, call, fold — in three taps. No typing, no menus. Fast enough to use one-handed between hands.',
  'tabs.2.eyebrow': 'AFTER THE SESSION',
  'tabs.2.title': "See the leaks\nyou couldn't feel.",
  'tabs.2.body': 'Review every hand, spot patterns in your play, and compare your decisions to GTO baselines. The data tells the truth.',
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
  'features.title': () => <>For the hands you'll<br />want to remember.</>,
  'features.subtitle': 'Every tool you need to log, review, and improve — without leaving the table.',
  'features.opponentProfiles.title': 'Opponent Profiles',
  'features.opponentProfiles.desc': "Automatically build profiles on the players you face. Track their stats, classify their style, and review every hand you've played against them.",
  'features.bankroll.title': 'Bankroll Tracking',
  'features.bankroll.desc': 'Set a bankroll goal and watch your progress. Pinch-to-zoom earnings chart shows cumulative results over time.',
  'features.sessionLogger.title': 'Quick Session Logger',
  'features.sessionLogger.desc': "Don't want full hand tracking? Just log your buy-in, cash-out, and session duration for a quick profit/loss record.",
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
  'cta.body': "Claim your permanent handle ahead of launch. Usernames are first-come, first-served — once it's gone, it's gone.",
  'cta.proof': (p) => <><strong>{p.count}+</strong> players already on the waitlist</>,
  'cta.support': () => <>Questions? <a href="mailto:support@finaltable.app">support@finaltable.app</a></>,
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
  'faq.1.a': 'Yes. Reserving your username is completely free. Just enter your email and desired handle.',
  'faq.2.q': 'What if my username is taken?',
  'faq.2.a': "Usernames are first-come, first-served. If your preferred handle is gone, try a variation — underscores and numbers are fair game.",
  'faq.3.q': 'When will the app launch?',
  'faq.3.a': 'Final Table is in closed beta. Waitlist members get early access before the public launch.',

  // Footer
  'footer.tagline': 'Log a hand in three gestures. Not three minutes.',
  'footer.support': () => <>Questions? <a href="mailto:support@finaltable.app">support@finaltable.app</a></>,
  'footer.resources': 'Resources',
  'footer.company': 'Company',
  'footer.privacy': 'Privacy Policy',
  'footer.terms': 'Terms of Service',
  'footer.copy': (p) => `© Final Table. All rights reserved ${p.year}`,

  // Language
  'lang.en': 'English',
  'lang.pl': 'Polski',
  'lang.ru': 'Русский',
}

/* ─────────────────────────────────────────────── */
/*  POLISH                                         */
/* ─────────────────────────────────────────────── */
const pl = {
  'nav.features': 'Funkcje',
  'nav.howItWorks': 'Jak to działa',
  'nav.compare': 'Porównaj',
  'nav.faq': 'FAQ',
  'nav.cta': 'Zarezerwuj nick',

  'hero.h1': () => (
    <>
      Zapisz rozdanie w{' '}
      <span className="tp-hero-mark"><span>trzech gestach</span><span className="tp-hero-mark-bg" /></span>
      .<br />Nie w{' '}
      <span className="tp-hero-mark tp-hero-mark-red"><span>trzy minuty</span><span className="tp-hero-mark-bg" /></span>.
    </>
  ),
  'hero.sub': 'Final Table to tracker pokerowy stworzony dla żywego stołu — wystarczająco szybki, by używać go jedną ręką między rozdaniami, wystarczająco dokładny, by analizować po sesji.',
  'hero.emailPlaceholder': 'ty@example.com',
  'hero.usernamePlaceholder': 'twojnick',
  'hero.errorTaken': 'Ten nick jest już zajęty. Spróbuj innego.',
  'hero.errorGeneric': 'Coś poszło nie tak. Spróbuj ponownie.',
  'hero.btnLoading': 'Rezerwuję…',
  'hero.btnSubmit': 'Zarezerwuj nick →',
  'hero.proof': (p) => `Darmowe · 10 sekund · ${p.count}+ graczy już zarezerwowało`,
  'hero.successText': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> jest zarezerwowany. Odezwiemy się, gdy Final Table wystartuje.</>
  ),
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
  'tabs.1.body': 'Zapisz dowolną akcję — raise, call, fold — trzema tapnięciami. Bez pisania, bez menu. Wystarczająco szybko, by grać jedną ręką.',
  'tabs.2.eyebrow': 'PO SESJI',
  'tabs.2.title': 'Zobacz błędy,\nktórych nie czułeś.',
  'tabs.2.body': 'Przejrzyj każde rozdanie, znajdź wzorce w swojej grze i porównaj decyzje z GTO. Dane mówią prawdę.',
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

  'features.title': () => <>Dla rozdań, które<br />chcesz zapamiętać.</>,
  'features.subtitle': 'Każde narzędzie do logowania, przeglądu i doskonalenia — bez opuszczania stołu.',
  'features.opponentProfiles.title': 'Profile Przeciwników',
  'features.opponentProfiles.desc': 'Automatycznie buduj profile graczy, z którymi grasz. Śledź ich statystyki, klasyfikuj styl i przeglądaj każde wspólne rozdanie.',
  'features.bankroll.title': 'Śledzenie Bankrolla',
  'features.bankroll.desc': 'Ustaw cel bankrollowy i obserwuj postępy. Wykres zarobków z zoomem pokazuje skumulowane wyniki.',
  'features.sessionLogger.title': 'Szybki Log Sesji',
  'features.sessionLogger.desc': 'Nie chcesz pełnego logowania? Po prostu zapisz buy-in, cash-out i czas sesji.',
  'features.handReview.title': 'Przegląd Rozdań',
  'features.handReview.desc': 'Odtwórz każde zalogowane rozdanie. Przejdź ulicę po ulicy, porównaj decyzje z GTO i znajdź błędy, których nie czułeś przy stole.',
  'features.mtt.title': 'Turnieje Multi-Table',
  'features.mtt.desc': 'Prowadź turnieje na wielu stołach z rankingiem na żywo i dystrybucją nagród. Twórz kluby, zarządzaj członkami — wszystko z aplikacji.',
  'features.dealerMode.title': 'Tryb Dealera',
  'features.dealerMode.comingSoon': 'WKRÓTCE',
  'features.dealerMode.desc': 'Dealerzy prowadzą stół głosem. Gracze śledzą grę na swoich telefonach w czasie rzeczywistym.',

  'cta.eyebrow': 'Wczesny dostęp',
  'cta.title': () => <>Zarezerwuj swój nick<br />zanim ktoś inny to zrobi.</>,
  'cta.body': 'Zabezpiecz swój nick przed startem. Nicki są na zasadzie kto pierwszy, ten lepszy — jak zniknie, to zniknie.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> graczy już na liście oczekujących</>,
  'cta.support': () => <>Pytania? <a href="mailto:support@finaltable.app">support@finaltable.app</a></>,
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
  'faq.1.a': 'Tak. Rezerwacja nicku jest całkowicie darmowa. Wystarczy podać email i wybrany nick.',
  'faq.2.q': 'Co jeśli mój nick jest zajęty?',
  'faq.2.a': 'Nicki działają na zasadzie kto pierwszy, ten lepszy. Jeśli Twój jest zajęty, spróbuj wariacji — podkreślenia i cyfry są dozwolone.',
  'faq.3.q': 'Kiedy aplikacja ruszy?',
  'faq.3.a': 'Final Table jest w zamkniętej becie. Osoby z listy oczekujących dostaną wczesny dostęp przed publicznym startem.',

  'footer.tagline': 'Zapisz rozdanie w trzech gestach. Nie w trzy minuty.',
  'footer.support': () => <>Pytania? <a href="mailto:support@finaltable.app">support@finaltable.app</a></>,
  'footer.resources': 'Zasoby',
  'footer.company': 'Firma',
  'footer.privacy': 'Polityka Prywatności',
  'footer.terms': 'Regulamin',
  'footer.copy': (p) => `© Final Table. Wszelkie prawa zastrzeżone ${p.year}`,

  'lang.en': 'English',
  'lang.pl': 'Polski',
  'lang.ru': 'Русский',
}

/* ─────────────────────────────────────────────── */
/*  RUSSIAN                                        */
/* ─────────────────────────────────────────────── */
const ru = {
  'nav.features': 'Функции',
  'nav.howItWorks': 'Как это работает',
  'nav.compare': 'Сравнить',
  'nav.faq': 'FAQ',
  'nav.cta': 'Забронировать ник',

  'hero.h1': () => (
    <>
      Запиши раздачу за{' '}
      <span className="tp-hero-mark"><span>три жеста</span><span className="tp-hero-mark-bg" /></span>
      .<br />Не за{' '}
      <span className="tp-hero-mark tp-hero-mark-red"><span>три минуты</span><span className="tp-hero-mark-bg" /></span>.
    </>
  ),
  'hero.sub': 'Final Table — покерный трекер, созданный для живого стола. Достаточно быстрый, чтобы пользоваться одной рукой между раздачами, достаточно точный для анализа после.',
  'hero.emailPlaceholder': 'you@example.com',
  'hero.usernamePlaceholder': 'вашник',
  'hero.errorTaken': 'Этот ник уже занят. Попробуйте другой.',
  'hero.errorGeneric': 'Что-то пошло не так. Попробуйте снова.',
  'hero.btnLoading': 'Бронирую…',
  'hero.btnSubmit': 'Забронировать ник →',
  'hero.proof': (p) => `Бесплатно · 10 секунд · ${p.count}+ игроков уже забронировали`,
  'hero.successText': (p) => (
    <><span className="ru-username-preview">@{p.username}</span> забронирован. Мы свяжемся, когда Final Table запустится.</>
  ),
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
  'tabs.1.body': 'Запиши любое действие — рейз, колл, фолд — тремя нажатиями. Без набора текста, без меню. Достаточно быстро для одной руки.',
  'tabs.2.eyebrow': 'ПОСЛЕ СЕССИИ',
  'tabs.2.title': 'Увидь ошибки,\nкоторых не чувствовал.',
  'tabs.2.body': 'Просмотри каждую раздачу, найди паттерны в своей игре и сравни решения с GTO. Данные говорят правду.',
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

  'features.title': () => <>Для раздач, которые<br />хочешь запомнить.</>,
  'features.subtitle': 'Все инструменты для записи, анализа и улучшения — не покидая стола.',
  'features.opponentProfiles.title': 'Профили Оппонентов',
  'features.opponentProfiles.desc': 'Автоматически создавай профили игроков. Отслеживай их статистику, классифицируй стиль и просматривай каждую общую раздачу.',
  'features.bankroll.title': 'Отслеживание Банкролла',
  'features.bankroll.desc': 'Установи цель банкролла и следи за прогрессом. График заработков с зумом показывает накопительные результаты.',
  'features.sessionLogger.title': 'Быстрый Лог Сессии',
  'features.sessionLogger.desc': 'Не хочешь полное логирование? Просто запиши buy-in, cash-out и длительность сессии.',
  'features.handReview.title': 'Обзор Раздач',
  'features.handReview.desc': 'Воспроизведи каждую записанную раздачу. Пройди улицу за улицей, сравни решения с GTO и найди ошибки, которых не чувствовал за столом.',
  'features.mtt.title': 'Мультистоловые Турниры',
  'features.mtt.desc': 'Проводи турниры на нескольких столах с рейтингами и призами. Создавай клубы, управляй участниками — всё из приложения.',
  'features.dealerMode.title': 'Режим Дилера',
  'features.dealerMode.comingSoon': 'СКОРО',
  'features.dealerMode.desc': 'Дилеры ведут стол голосовыми командами. Игроки следят на своих телефонах в реальном времени.',

  'cta.eyebrow': 'Ранний доступ',
  'cta.title': () => <>Забронируй свой ник<br />пока кто-то другой не сделал это.</>,
  'cta.body': 'Закрепи свой постоянный ник до запуска. Ники — кто первый, тот и забрал. Как уйдёт — уйдёт.',
  'cta.proof': (p) => <><strong>{p.count}+</strong> игроков уже в списке ожидания</>,
  'cta.support': () => <>Вопросы? <a href="mailto:support@finaltable.app">support@finaltable.app</a></>,
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
  'faq.1.a': 'Да. Бронирование ника полностью бесплатно. Просто укажите email и желаемый ник.',
  'faq.2.q': 'Что если мой ник занят?',
  'faq.2.a': 'Ники работают по принципу «кто первый». Если ваш занят, попробуйте вариацию — подчёркивания и цифры допустимы.',
  'faq.3.q': 'Когда запустится приложение?',
  'faq.3.a': 'Final Table в закрытой бете. Участники списка ожидания получат ранний доступ до публичного запуска.',

  'footer.tagline': 'Запиши раздачу за три жеста. Не за три минуты.',
  'footer.support': () => <>Вопросы? <a href="mailto:support@finaltable.app">support@finaltable.app</a></>,
  'footer.resources': 'Ресурсы',
  'footer.company': 'Компания',
  'footer.privacy': 'Политика Конфиденциальности',
  'footer.terms': 'Условия Использования',
  'footer.copy': (p) => `© Final Table. Все права защищены ${p.year}`,

  'lang.en': 'English',
  'lang.pl': 'Polski',
  'lang.ru': 'Русский',
}

/* ─────────────────────────────────────────────── */
/*  PROVIDER                                       */
/* ─────────────────────────────────────────────── */
const translations = { en, pl, ru }

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
