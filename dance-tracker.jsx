import { useState, useEffect, useCallback } from "react";

// ── DATOS DEL PLAN ─────────────────────────────────────────────────────────────

const TOTAL_WEEKS = 26;
const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const PHASES = [
  {
    id: 1, range: [1, 6],
    label: "Fase 1", sub: "Activación",
    desc: "20–25 min · 4 días/semana",
    bg: "#E6F4EF", accent: "#0E8A6A", text: "#08402F",
    mpd: 22, cpm: 6,
  },
  {
    id: 2, range: [7, 16],
    label: "Fase 2", sub: "Progresión",
    desc: "30–40 min · 4–5 días/semana",
    bg: "#ECEEFE", accent: "#4040D8", text: "#1A1A6E",
    mpd: 35, cpm: 7,
  },
  {
    id: 3, range: [17, 26],
    label: "Fase 3", sub: "Consolidación",
    desc: "40–50 min · 5 días/semana",
    bg: "#FEF3E8", accent: "#D0700A", text: "#6B2F00",
    mpd: 45, cpm: 8,
  },
];

function getPhase(week) {
  if (week <= 6) return PHASES[0];
  if (week <= 16) return PHASES[1];
  return PHASES[2];
}

// null = día de descanso
const SCHEDULES = [
  ["Pop cardio", "Hip hop", null, "Dancehall", null, "K-pop", null],
  ["Pop + hip hop", "Dancehall intenso", "Hip hop + core", null, "K-pop / coreog.", "Sesión larga", null],
  ["Pop intenso", "Hip hop + core", null, "Dancehall intenso", "K-pop / coreog.", "Cardio mixto", null],
];

const SESSION_COLOR = {
  "Pop cardio":        "#B5152E",
  "Hip hop":           "#1A4DC8",
  "Pop + hip hop":     "#B5152E",
  "Pop intenso":       "#B5152E",
  "K-pop":             "#7A14B5",
  "K-pop / coreog.":   "#7A14B5",
  "Dancehall":         "#0E8A6A",
  "Dancehall intenso": "#0E8A6A",
  "Hip hop + core":    "#1A4DC8",
  "Sesión larga":      "#B5152E",
  "Cardio mixto":      "#0E8A6A",
};

// Videos: gratuitos en YouTube, duración real 15–40 min
const VIDEOS = [
  // ── FASE 1 · Principiante ─────────────────────────────────────────────
  [
    {
      session: "Pop cardio",
      title: "MadFit – Taylor Swift «Life of a Showgirl» · 15 min",
      url: "https://www.youtube.com/watch?v=8zfm1HlwJvQ",
      year: "Oct 2025",
    },
    {
      session: "Hip hop",
      title: "growwithjo – 2000s R&B Dance Workout · 15 min",
      url: "https://www.youtube.com/watch?v=D-LubT53KKU",
      year: "Abr 2025",
    },
    {
      session: "Dancehall",
      title: "MixxedFit Full Home Workout con Nanave · 30 min",
      url: "https://www.youtube.com/watch?v=-wbmqT8tND0",
      year: "Feb 2021",
    },
    {
      session: "K-pop",
      title: "growwithjo – K-pop Fat Burn (BLACKPINK, BTS, MAMAMOO) · 20 min",
      url: "https://www.youtube.com/watch?v=dsANewaxcM8",
      year: "Sep 2021",
    },
  ],
  // ── FASE 2 · Intermedio ───────────────────────────────────────────────
  [
    {
      session: "Pop + hip hop",
      title: "MadFit – Taylor Swift «Shake It Off» Full Body · 15 min",
      url: "https://www.youtube.com/watch?v=bNXdJULGcbg",
      year: "Nov 2024",
    },
    {
      session: "Dancehall intenso",
      title: "MixxedFit clase completa con Sekoya · 35 min",
      url: "https://www.youtube.com/watch?v=7QO7BRKbW0I",
      year: "Feb 2023",
    },
    {
      session: "Hip hop + core",
      title: "growwithjo – 20 min Dance Cardio (playlist 20 min)",
      url: "https://www.youtube.com/playlist?list=PLG9XM5PzrT1eILSKu-fH_DvhhygKoKgst",
      year: "Dic 2023",
    },
    {
      session: "K-pop / coreog.",
      title: "growwithjo – K-pop Fat Burn (BLACKPINK, BTS, MAMAMOO) · 20 min",
      url: "https://www.youtube.com/watch?v=dsANewaxcM8",
      year: "Sep 2021",
    },
    {
      session: "Sesión larga",
      title: "MixxedFit Master Class con Lori, Angie & Cheyenne · 40 min",
      url: "https://www.youtube.com/watch?v=ZvKyOArxOH8",
      year: "Feb 2024",
    },
  ],
  // ── FASE 3 · Avanzado ─────────────────────────────────────────────────
  [
    {
      session: "Pop intenso",
      title: "MadFit – Taylor Swift «Life of a Showgirl» · 15 min",
      url: "https://www.youtube.com/watch?v=8zfm1HlwJvQ",
      year: "Oct 2025",
    },
    {
      session: "Hip hop + core",
      title: "MixxedFit – clase Cardi B alta intensidad · 40 min",
      url: "https://www.youtube.com/watch?v=KWsNGy5c0Y4",
      year: "May 2024",
    },
    {
      session: "Dancehall intenso",
      title: "MixxedFit clase completa con Sekoya · 35 min",
      url: "https://www.youtube.com/watch?v=7QO7BRKbW0I",
      year: "Feb 2023",
    },
    {
      session: "K-pop / coreog.",
      title: "growwithjo – K-pop Fat Burn (BLACKPINK, BTS, MAMAMOO) · 20 min",
      url: "https://www.youtube.com/watch?v=dsANewaxcM8",
      year: "Sep 2021",
    },
    {
      session: "Cardio mixto",
      title: "MadFit – Taylor Swift «Shake It Off» Full Body · 15 min",
      url: "https://www.youtube.com/watch?v=bNXdJULGcbg",
      year: "Nov 2024",
    },
  ],
];

const TIPS = [
  "No busques la perfección. El objetivo esta semana es simplemente aparecer.",
  "Aprende un paso nuevo por sesión. El ritmo llega solo.",
  "Asma: 3 min de marcha suave antes de cada video, siempre.",
  "Un mes completo. ¿Ya subes escaleras sin pensar? Eso es progreso.",
  "Si terminas con energía, añade 5 min o repite tu parte favorita.",
  "¡Fin de Fase 1! Regresa al primer video y nota cuánto cambió.",
  "Fase 2: videos más largos. Pausa cuando necesites, sin culpa.",
  "Agrega el 5° día si el cuerpo te lo pide.",
  "Agua antes, durante y después. Tu asma también lo agradece.",
  "Mitad del plan. ¿Sientes más resistencia? No es imaginación.",
  "Prueba un video nuevo. La variedad acelera el cambio.",
  "Descanso activo = caminata de 20 min. Es parte del plan.",
  "Tu capacidad pulmonar mejora con la constancia. Los números lo probarán.",
  "Vuelve a un video de Fase 1 y nota cuánto más fácil se siente.",
  "No saltes la sesión larga del sábado. Es la que más quema.",
  "¡Fin de Fase 2! Ya eres completamente distinta a la semana 1.",
  "5 días/semana. El cuerpo ya sabe lo que viene. Ese momentum es tuyo.",
  "Elige tus videos favoritos para el sábado. Te los ganaste.",
  "7 semanas para diciembre. El cuerpo está en modo quema. No frenes.",
  "Duerme bien. La grasa también se pierde mientras descansas.",
  "Prueba el video más intenso que hayas evitado. Ya estás lista.",
  "4 semanas para la meta. Constancia es más importante que intensidad.",
  "No abandones en la recta final. Cada sesión suma más de lo que crees.",
  "Tramo final: reduce azúcares y verás la diferencia.",
  "¡Penúltima semana! Date crédito por todo lo que recorriste.",
  "Lo lograste. Define tu siguiente meta antes de que termine la semana.",
];

// ── STORAGE HOOK ──────────────────────────────────────────────────────────────

function useStorage() {
  const [store, setStore] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const r = await window.storage.get("dance_v5");
        if (r && r.value) {
          setStore(JSON.parse(r.value));
        }
      } catch (e) {
        // sin datos previos
      }
      setReady(true);
    }
    load();
  }, []);

  const save = useCallback(async function(next) {
    setStore(next);
    try {
      await window.storage.set("dance_v5", JSON.stringify(next));
    } catch (e) {}
  }, []);

  return [store, save, ready];
}

// ── ÍCONOS ────────────────────────────────────────────────────────────────────

function YTIcon() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <rect width="16" height="11" rx="2.5" fill="#FF0000" />
      <path d="M6.5 3L11 5.5L6.5 8V3Z" fill="white" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
      <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── COMPONENTES ───────────────────────────────────────────────────────────────

function CheckButton({ done, color, onClick }) {
  return (
    <button
      onClick={onClick}
      title={done ? "Marcar pendiente" : "Marcar completo"}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        flexShrink: 0,
        border: done ? "none" : "1.5px solid #CCCCCA",
        background: done ? color : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {done && <CheckIcon />}
    </button>
  );
}

function StatCard({ value, label }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "0.5px solid #E4E4E0",
      borderRadius: 11,
      padding: "10px 8px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A18" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888884", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function DanceTracker() {
  const [week, setWeek] = useState(1);
  const [store, save, ready] = useStorage();

  const phase = getPhase(week);
  const phaseIndex = phase.id - 1;
  const schedule = SCHEDULES[phaseIndex];
  const phaseVideos = VIDEOS[phaseIndex];

  // Días activos (no descanso) en esta semana
  const activeDays = schedule.filter(function(s) { return s !== null; }).length;

  // Días completados esta semana
  const completedDays = schedule.reduce(function(acc, type, i) {
    if (type === null) return acc;
    return acc + (store["w" + week + "d" + i] ? 1 : 0);
  }, 0);

  // BUGFIX: solo calcular min/cal si hay días completados
  const totalMin = completedDays * phase.mpd;
  const totalCal = completedDays * phase.mpd * phase.cpm;

  // Asignar un video por día activo de forma rotatoria
  var videoIndex = 0;
  var dayVideos = schedule.map(function(type) {
    if (type === null) return null;
    var v = phaseVideos[videoIndex % phaseVideos.length];
    videoIndex++;
    return v;
  });

  function toggleDay(i) {
    var key = "w" + week + "d" + i;
    var next = Object.assign({}, store);
    next[key] = !store[key];
    save(next);
  }

  function updateNote(val) {
    var next = Object.assign({}, store);
    next["note_w" + week] = val;
    save(next);
  }

  var note = store["note_w" + week] || "";
  var tip = TIPS[Math.min(week - 1, TIPS.length - 1)];
  var pct = Math.round((week / TOTAL_WEEKS) * 100);

  if (!ready) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#888", fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
        Cargando tu progreso...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#F8F8F6", minHeight: "100vh", padding: "20px 16px" }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>

        {/* Encabezado */}
        <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: phase.accent }}>
          PLAN DE BAILE · META 6 KG · DIC 2026
        </p>
        <h1 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 800, color: "#1A1A18", letterSpacing: "-0.4px" }}>
          Seguimiento semanal
        </h1>

        {/* Barra de progreso */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#888884" }}>Progreso total</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: phase.accent }}>
            {pct}% · semana {week}/{TOTAL_WEEKS}
          </span>
        </div>
        <div style={{ background: "#E4E4E0", borderRadius: 99, height: 5, marginBottom: 18 }}>
          <div style={{ height: 5, borderRadius: 99, background: phase.accent, width: pct + "%", transition: "width 0.4s" }} />
        </div>

        {/* Navegador de semana */}
        <div style={{
          background: phase.bg,
          border: "0.5px solid " + phase.accent + "40",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <button
            onClick={function() { setWeek(function(w) { return Math.max(1, w - 1); }); }}
            disabled={week === 1}
            style={{
              background: "none", border: "none", fontSize: 24,
              cursor: week === 1 ? "not-allowed" : "pointer",
              opacity: week === 1 ? 0.25 : 0.7,
              color: phase.text, padding: "0 8px", lineHeight: 1,
            }}
          >
            ‹
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: phase.text, letterSpacing: "-0.3px" }}>
              Semana {week}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: phase.accent, marginTop: 2 }}>
              {phase.label} · {phase.sub} · {phase.desc}
            </div>
          </div>

          <button
            onClick={function() { setWeek(function(w) { return Math.min(TOTAL_WEEKS, w + 1); }); }}
            disabled={week === TOTAL_WEEKS}
            style={{
              background: "none", border: "none", fontSize: 24,
              cursor: week === TOTAL_WEEKS ? "not-allowed" : "pointer",
              opacity: week === TOTAL_WEEKS ? 0.25 : 0.7,
              color: phase.text, padding: "0 8px", lineHeight: 1,
            }}
          >
            ›
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
          <StatCard value={completedDays + "/" + activeDays} label="sesiones" />
          <StatCard value={totalMin} label="min estimados" />
          <StatCard value={"~" + totalCal} label="kcal aprox." />
        </div>

        {/* Días de la semana */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
          {schedule.map(function(type, i) {
            var isRest = type === null;
            var done = !isRest && !!store["w" + week + "d" + i];
            var video = dayVideos[i];
            var color = SESSION_COLOR[type] || "#0E8A6A";

            return (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "0.5px solid " + (isRest ? "#F0F0EC" : done ? color + "44" : "#E4E4E0"),
                  borderRadius: 12,
                  padding: "10px 13px",
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto",
                  alignItems: "center",
                  gap: 12,
                  opacity: isRest ? 0.45 : 1,
                  transition: "border-color 0.2s",
                }}
              >
                {/* Nombre del día + acento */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#AEAEA8", letterSpacing: "0.04em" }}>
                    {DAY_NAMES[i]}
                  </div>
                  {!isRest && (
                    <div style={{
                      width: 20, height: 3, borderRadius: 99, marginTop: 5,
                      background: done ? color : "#E4E4E0",
                      transition: "background 0.2s",
                    }} />
                  )}
                </div>

                {/* Tipo de sesión + link */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isRest ? "#AEAEA8" : "#1A1A18", marginBottom: isRest ? 0 : 5 }}>
                    {isRest ? "Descanso" : type}
                  </div>
                  {!isRest && video && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "flex-start", gap: 5, fontSize: 12, color: "#185FA5", textDecoration: "none", lineHeight: 1.35 }}
                    >
                      <YTIcon />
                      <span>
                        {video.title}
                        <span style={{ color: "#AEAEA8", fontSize: 10, marginLeft: 5 }}>{video.year}</span>
                      </span>
                    </a>
                  )}
                </div>

                {/* Botón check */}
                {!isRest
                  ? <CheckButton done={done} color={color} onClick={function() { toggleDay(i); }} />
                  : <div style={{ width: 28 }} />
                }
              </div>
            );
          })}
        </div>

        {/* Tip de la semana */}
        <div style={{
          background: "#EFF6FF",
          border: "0.5px solid #BFDBFE",
          borderRadius: 11,
          padding: "10px 13px",
          marginBottom: 10,
          display: "flex",
          gap: 9,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <span style={{ fontSize: 12.5, color: "#1E40AF", lineHeight: 1.5 }}>
            <strong>Semana {week}:</strong> {tip}
          </span>
        </div>

        {/* Recordatorio asma */}
        <div style={{
          background: "#FFFBEB",
          border: "0.5px solid #FCD34D",
          borderRadius: 11,
          padding: "9px 13px",
          marginBottom: 14,
          display: "flex",
          gap: 9,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>🫁</span>
          <span style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
            Inhalador cerca siempre. Calienta 3–5 min antes. Si hay opresión en el pecho, baja el ritmo.
          </span>
        </div>

        {/* Notas */}
        <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#AEAEA8", marginBottom: 6 }}>
          NOTAS · SEMANA {week}
        </label>
        <textarea
          value={note}
          onChange={function(e) { updateNote(e.target.value); }}
          rows={3}
          placeholder="¿Cómo estuvo la respiración? ¿Un video que te encantó? ¿Algo que ajustar?"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "0.5px solid #E4E4E0",
            borderRadius: 11,
            padding: "10px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            color: "#1A1A18",
            background: "#FFFFFF",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        />

        {/* Leyenda de estilos */}
        <div style={{
          background: "#FFFFFF",
          border: "0.5px solid #E4E4E0",
          borderRadius: 11,
          padding: "10px 13px",
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#AEAEA8", marginBottom: 8 }}>
            ESTILOS DEL PLAN
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            {[
              { label: "Pop", color: "#B5152E", creator: "MadFit" },
              { label: "Hip hop", color: "#1A4DC8", creator: "growwithjo" },
              { label: "K-pop", color: "#7A14B5", creator: "growwithjo" },
              { label: "Dancehall", color: "#0E8A6A", creator: "MixxedFit" },
            ].map(function(item) {
              return (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888884" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                  <span><strong style={{ color: "#1A1A18" }}>{item.label}</strong> · {item.creator}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navegación inferior */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#AEAEA8" }}>26 semanas · meta 6 kg dic 2026</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={function() { setWeek(function(w) { return Math.max(1, w - 1); }); }}
              disabled={week === 1}
              style={{
                fontSize: 12, padding: "6px 13px", borderRadius: 8,
                border: "0.5px solid #E4E4E0", background: "#FFFFFF",
                cursor: week === 1 ? "not-allowed" : "pointer",
                opacity: week === 1 ? 0.4 : 1, color: "#1A1A18",
              }}
            >
              ← Anterior
            </button>
            <button
              onClick={function() { setWeek(function(w) { return Math.min(TOTAL_WEEKS, w + 1); }); }}
              disabled={week === TOTAL_WEEKS}
              style={{
                fontSize: 12, padding: "6px 13px", borderRadius: 8,
                border: "0.5px solid #E4E4E0", background: "#FFFFFF",
                cursor: week === TOTAL_WEEKS ? "not-allowed" : "pointer",
                opacity: week === TOTAL_WEEKS ? 0.4 : 1, color: "#1A1A18",
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
