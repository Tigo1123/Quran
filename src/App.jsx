import { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

const API_URL = "https://api.alquran.cloud/v1/ayah/random/quran-uthmani";

export default function App() {
  const [ayah, setAyah] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setAyah({
        arabic: arabic.text,
        surahName: arabic.surah.name,
        surahNumber: arabic.surah.number,
        ayahNumber: arabic.numberInSurah,
      });
      setCount((currentCount) => currentCount + 1);
    } catch {
      setError("تعذّر تحميل الآية، حاول مرة أخرى.");
    } finally {
      setLoading(false);
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
        <span className="top-note">نُورٌ يرافق يومك</span>
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
      {loading ? (
        <div className="card-state">
          <span className="loader" />
          <p>جارٍ تحميل الآية...</p>
        </div>
      ) : error ? (
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
