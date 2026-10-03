import { useEffect, useState } from "react";
import { BookOpen, Download, Sparkles } from "lucide-react";

const API_URL = "https://api.alquran.cloud/v1/ayah/random/quran-uthmani";
const SAVED_AYAH_KEY = "quran-reflections:last-ayah";

function getSavedAyah() {
  try {
    const savedAyah = window.localStorage.getItem(SAVED_AYAH_KEY);
    if (!savedAyah) return null;

    const parsedAyah = JSON.parse(savedAyah);
    if (
      typeof parsedAyah?.arabic !== "string" ||
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
      const arabic = result.data;
      if (!arabic?.text || !arabic?.surah) {
        throw new Error("The response was incomplete.");
      }
      const nextAyah = {
        arabic: arabic.text,
        surahName: arabic.surah.name,
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
      setError("تعذّر تحميل الآية، حاول مرة أخرى.");
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
    <main className="page-shell" dir="rtl" lang="ar">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#home" aria-label="الصفحة الرئيسية">
          <span className="brand-mark">
            <BookOpen size={17} strokeWidth={1.7} />
          </span>
          <span>القُرآن</span>
        </a>
        <div className="topbar-actions">
          <span className="top-note">نُورٌ يرافق يومك</span>
          {installPrompt && (
            <button className="install-button" onClick={installApp}>
              <Download size={15} strokeWidth={1.8} />
              <span>ثبّت التطبيق</span>
            </button>
          )}
        </div>
      </header>

      <section className="main-content" id="home">
        <div className="intro">
          <span className="eyebrow">
            <span /> وَرْدُ اليَوْم <span />
          </span>
          <h1>
            آيات تنير
            <br />
            <em>القلب</em>
          </h1>
          <p>
            خُذ لحظةً من السكينة، وتأمّل
            <br className="desktop-break" /> في هداية القرآن الكريم.
          </p>
        </div>

        <QuranCard
          ayah={ayah}
          loading={loading}
          error={error}
          onRetry={getAyah}
        />

        <div className="actions">
          <GetAyahButton onClick={getAyah} loading={loading} />
          <ReadingCounter count={count} />
        </div>
        <div className="gentle-reminder">
          <Sparkles size={13} strokeWidth={1.6} />
          <span>اجعل لهذه اللحظة نصيبًا من السكينة</span>
        </div>
      </section>

      <footer className="footer">
        <span>بِسْمِ اللَّهِ</span>
        <span className="footer-line" />
        <span>هُدًى وَسَكِينَة</span>
      </footer>
    </main>
  );
}

function QuranCard({ ayah, loading, error, onRetry }) {
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
          <span className="mini-star">✳</span> آيةٌ لِلتَّدَبُّر
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
          <p>جارٍ تحميل الآية...</p>
        </div>
      ) : error && !ayah ? (
        <div className="card-state error-state">
          <p>{error}</p>
          <button className="inline-retry" onClick={onRetry}>
            أعِد المحاولة
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
            <div className="verse-reference">
              <span className="surah-name">{ayah.surahName}</span>
              <span className="reference-dot">•</span>
              <span dir="ltr">
                {ayah.surahNumber.toLocaleString("ar")}:
                {ayah.ayahNumber.toLocaleString("ar")}
              </span>
            </div>
            {error && (
              <div className="offline-note">
                <p>تعذّر الاتصال، تعرض آخر آية محفوظة.</p>
                <button className="inline-retry" onClick={onRetry}>
                  أعِد المحاولة
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

function GetAyahButton({ onClick, loading }) {
  return (
    <button className="get-ayah-button" onClick={onClick} disabled={loading}>
      <span className="button-icon">
        <BookOpen size={17} strokeWidth={1.8} />
      </span>
      <span>{loading ? "جارٍ البحث عن آية" : "آية جديدة"}</span>
      <span className="button-arrow">↗</span>
    </button>
  );
}

function ReadingCounter({ count }) {
  let ayahWord = "آيات";
  if (count === 1) ayahWord = "آية";
  if (count === 2) ayahWord = "آيتين";
  if (count > 10) ayahWord = "آية";

  return (
    <p className="reading-counter">
      قرأت <strong>{count.toLocaleString("ar")}</strong> {ayahWord}
    </p>
  );
}
