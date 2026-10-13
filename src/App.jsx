import { useEffect, useState } from "react";
import { BookOpen, Download, Sparkles } from "lucide-react";

const API_URL =
  "https://api.alquran.cloud/v1/ayah/random/editions/quran-uthmani,en.sahih";
const SAVED_AYAH_KEY = "quran-reflections:last-ayah";
const SAVED_LANG_KEY = "quran-reflections:lang";

const TRANSLATIONS = {
  ar: {
    brand: "القُرآن",
    homeLabel: "الصفحة الرئيسية",
    topNote: "نُورٌ يرافق يومك",
    install: "ثبّت التطبيق",
    eyebrow: "وَرْدُ اليَوْم",
    title1: "آيات تنير",
    title2: "القلب",
    subtitle1: "خُذ لحظةً من السكينة، وتأمّل",
    subtitle2: "في هداية القرآن الكريم.",
    cardLabel: "آيةٌ لِلتَّدَبُّر",
    loadingAyah: "جارٍ تحميل الآية...",
    retry: "أعِد المحاولة",
    offlineNote: "تعذّر الاتصال، تعرض آخر آية محفوظة.",
    fetchError: "تعذّر تحميل الآية، حاول مرة أخرى.",
    loadError: "جارٍ البحث عن آية",
    newAyah: "آية جديدة",
    readAyahs: "آيات",
    readAyah1: "آية",
    readAyah2: "آيتين",
    reminder: "اجعل لهذه اللحظة نصيبًا من السكينة",
    footer1: "بِسْمِ اللَّهِ",
    footer2: "هُدًى وَسَكِينَة",
    counterPrefix: "قرأت",
    switchTo: "English",
  },
  en: {
    brand: "Qur'an",
    homeLabel: "Home page",
    topNote: "A light that accompanies your day",
    install: "Install the app",
    eyebrow: "Today's Verse",
    title1: "Verses that illuminate",
    title2: "the heart",
    subtitle1: "Take a moment of serenity, and reflect",
    subtitle2: "on the guidance of the Holy Qur'an.",
    cardLabel: "A verse for reflection",
    loadingAyah: "Loading the verse...",
    retry: "Try again",
    offlineNote: "Connection failed — showing the last saved verse.",
    fetchError: "Couldn't load the verse, please try again.",
    loadError: "Finding a verse",
    newAyah: "New verse",
    readAyahs: "verses",
    readAyah1: "verse",
    readAyah2: "verses",
    reminder: "Give this moment a share of serenity",
    footer1: "Bismillah",
    footer2: "Guidance and serenity",
    counterPrefix: "You've read",
    switchTo: "العربية",
  },
};

function getSavedLang() {
  try {
    return window.localStorage.getItem(SAVED_LANG_KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

function getSavedAyah() {
  try {
    const savedAyah = window.localStorage.getItem(SAVED_AYAH_KEY);
    if (!savedAyah) return null;

    const parsedAyah = JSON.parse(savedAyah);
    if (
      typeof parsedAyah?.arabic !== "string" ||
      typeof parsedAyah?.translation !== "string" ||
      typeof parsedAyah?.surahName !== "string" ||
      typeof parsedAyah?.surahNumber !== "number" ||
      typeof parsedAyah?.ayahNumber !== "number"
    ) {
      return null;
    }
    return parsedAyah;
  } catch (error) {
    console.error("Unable to read the saved ayah.", error);
    return null;
  }
}

export default function App() {
  const [ayah, setAyah] = useState(getSavedAyah);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [lang, setLang] = useState(getSavedLang);
  const t = TRANSLATIONS[lang];

  function toggleLang() {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    try {
      window.localStorage.setItem(SAVED_LANG_KEY, nextLang);
    } catch (error) {
      console.error("Unable to save the language preference.", error);
    }
  }

  useEffect(() => {
    function handleInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function getAyah() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("The Quran service did not respond.");
      const result = await response.json();
      const [arabicEdition, englishEdition] = result.data || [];
      const arabic = arabicEdition;
      if (!arabic?.text || !arabic?.surah || !englishEdition?.text) {
        throw new Error("The response was incomplete.");
      }
      const nextAyah = {
        arabic: arabic.text,
        translation: englishEdition.text,
        surahName: arabic.surah.name,
        surahNameEn: englishEdition.surah.englishName,
        surahNumber: arabic.surah.number,
        ayahNumber: arabic.numberInSurah,
      };
      setAyah(nextAyah);
      try {
        window.localStorage.setItem(SAVED_AYAH_KEY, JSON.stringify(nextAyah));
      } catch (storageError) {
        console.error("Unable to save the ayah for offline reading.", storageError);
      }
      setCount((currentCount) => currentCount + 1);
    } catch {
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  }

  async function installApp() {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch (error) {
      console.error("Unable to complete the app installation prompt.", error);
    }
  }

  useEffect(() => {
    getAyah();
  }, []);

  return (
    <main className="page-shell" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#home" aria-label={t.homeLabel}>
          <span className="brand-mark">
            <BookOpen size={17} strokeWidth={1.7} />
          </span>
          <span>{t.brand}</span>
        </a>
        <div className="topbar-actions">
          <span className="top-note">{t.topNote}</span>
          <button className="lang-button" onClick={toggleLang} type="button">
            {t.switchTo}
          </button>
          {installPrompt && (
            <button className="install-button" onClick={installApp}>
              <Download size={15} strokeWidth={1.8} />
              <span>{t.install}</span>
            </button>
          )}
        </div>
      </header>

      <section className="main-content" id="home">
        <div className="intro">
          <span className="eyebrow">
            <span /> {t.eyebrow} <span />
          </span>
          <h1>
            {t.title1}
            <br />
            <em>{t.title2}</em>
          </h1>
          <p>
            {t.subtitle1}
            <br className="desktop-break" /> {t.subtitle2}
          </p>
        </div>

        <QuranCard
          ayah={ayah}
          loading={loading}
          error={error}
          onRetry={getAyah}
          lang={lang}
        />

        <div className="actions">
          <GetAyahButton onClick={getAyah} loading={loading} lang={lang} />
          <ReadingCounter count={count} lang={lang} />
        </div>
        <div className="gentle-reminder">
          <Sparkles size={13} strokeWidth={1.6} />
          <span>{t.reminder}</span>
        </div>
      </section>

      <footer className="footer">
        <span>{t.footer1}</span>
        <span className="footer-line" />
        <span>{t.footer2}</span>
      </footer>
    </main>
  );
}

function QuranCard({ ayah, loading, error, onRetry, lang }) {
  const t = TRANSLATIONS[lang];
  return (
    <article
      className={`quran-card ${ayah && !loading ? "card-arrive" : ""}`}
      aria-live="polite"
    >
      <span className="card-corner corner-tl" />
      <span className="card-corner corner-tr" />
      <span className="card-corner corner-bl" />
      <span className="card-corner corner-br" />
      <div className="card-topline">
        <span className="card-label">
          <span className="mini-star">✳</span> {t.cardLabel}
        </span>
        <span className="ornament">۞</span>
      </div>
      <div className="card-divider">
        <span />
        <i>✧</i>
        <span />
      </div>
      {loading && !ayah ? (
        <div className="card-state">
          <span className="loader" />
          <p>{t.loadingAyah}</p>
        </div>
      ) : error && !ayah ? (
        <div className="card-state error-state">
          <p>{error}</p>
          <button className="inline-retry" onClick={onRetry}>
            {t.retry}
          </button>
        </div>
      ) : (
        ayah && (
          <div
            className="verse-content"
            key={`${ayah.surahNumber}:${ayah.ayahNumber}`}
          >
            <p className="arabic" dir="rtl" lang="ar">
              {ayah.arabic}
            </p>
            <p className="translation" dir="ltr" lang="en">
              {ayah.translation}
            </p>
            <div className="verse-reference">
              <span className="surah-name">
                {lang === "ar" ? ayah.surahName : ayah.surahNameEn}
              </span>
              <span className="reference-dot">•</span>
              <span dir="ltr">
                {ayah.surahNumber.toLocaleString(lang)}:
                {ayah.ayahNumber.toLocaleString(lang)}
              </span>
            </div>
            {error && (
              <div className="offline-note">
                <p>{t.offlineNote}</p>
                <button className="inline-retry" onClick={onRetry}>
                  {t.retry}
                </button>
              </div>
            )}
          </div>
        )
      )}
      <div className="card-bottom">
        <span />
        <span className="bottom-diamond">◇</span>
        <span />
      </div>
    </article>
  );
}

function GetAyahButton({ onClick, loading, lang }) {
  const t = TRANSLATIONS[lang];
  return (
    <button className="get-ayah-button" onClick={onClick} disabled={loading}>
      <span className="button-icon">
        <BookOpen size={17} strokeWidth={1.8} />
      </span>
      <span>{loading ? t.loadError : t.newAyah}</span>
      <span className="button-arrow">↗</span>
    </button>
  );
}

function ReadingCounter({ count, lang }) {
  const t = TRANSLATIONS[lang];
  let ayahWord = t.readAyahs;
  if (lang === "ar") {
    if (count === 1) ayahWord = t.readAyah1;
    if (count === 2) ayahWord = t.readAyah2;
    if (count > 10) ayahWord = t.readAyah1;
  }

  return (
    <p className="reading-counter">
      {t.counterPrefix} <strong>{count.toLocaleString(lang)}</strong> {ayahWord}
    </p>
  );
}
