import { useState, useMemo } from "react";

const POWERS = [0, 6, 12, 18, 24, 36];
const VOLUMES = [10, 30, 60, 120];

function OptionGrid({ label, options, value, onChange, unit }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <strong style={{ fontSize: 14 }}>{label}</strong>
      <div
        style={{
          display: "flex",
          gap: 6,          // mniejszy odstęp
          marginTop: 6,
          flexWrap: "nowrap", // wszystkie w jednym rzędzie
          overflowX: "auto",  // jeśli się nie mieści, można przewinąć poziomo
        }}
      >
        {options.map((opt) => {
          const active = value === opt;

          return (
            <div
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                cursor: "pointer",
                minWidth: 50,
                height: 38,
                borderRadius: 6,
                border: active ? "2px solid #16a34a" : "2px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 13,
                position: "relative",
                background: active ? "#dcfce7" : "#fff",
                flexShrink: 0, // nie kurczy się
              }}
            >
              {opt} {unit}

              {active && (
                <span
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    background: "#16a34a",
                    color: "white",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Mixer() {
  const [baseA, setBaseA] = useState(null);
  const [baseB, setBaseB] = useState(null);
  const [target, setTarget] = useState(null);
  const [volume, setVolume] = useState(null);

  const AROMA_PERCENT = 10;

  const validationError = useMemo(() => {
    if (
      baseA === null ||
      baseB === null ||
      target === null ||
      volume === null
    )
      return "";

    if (baseA === baseB) return "Bazy muszą mieć różne moce.";

    if (
      target < Math.min(baseA, baseB) ||
      target > Math.max(baseA, baseB)
    ) {
      return "Docelowa moc musi być pomiędzy bazami.";
    }

    return "";
  }, [baseA, baseB, target, volume]);

  const result = useMemo(() => {
    if (
      baseA === null ||
      baseB === null ||
      target === null ||
      volume === null ||
      validationError
    )
      return null;

    const aromaMl = volume * (AROMA_PERCENT / 100);
    const baseVolume = volume - aromaMl;

    const mlA = (baseVolume * (target - baseB)) / (baseA - baseB);
    const mlB = baseVolume - mlA;

    return {
      aroma: aromaMl.toFixed(2),
      mlA: mlA.toFixed(2),
      mlB: mlB.toFixed(2),
    };
  }, [baseA, baseB, target, volume, validationError]);

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "20px auto",
        fontFamily: "Arial",
        padding: "0 10px",
      }}
    >
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>
        Kalkulator mieszania baz (10% aromatu)
      </h2>

      <OptionGrid
        label="Moc bazy A"
        options={POWERS}
        value={baseA}
        onChange={setBaseA}
        unit="mg"
      />

      <OptionGrid
        label="Moc bazy B"
        options={POWERS}
        value={baseB}
        onChange={setBaseB}
        unit="mg"
      />

      <OptionGrid
        label="Docelowa moc"
        options={POWERS}
        value={target}
        onChange={setTarget}
        unit="mg"
      />

      <OptionGrid
        label="Ilość końcowa"
        options={VOLUMES}
        value={volume}
        onChange={setVolume}
        unit="ml"
      />

      {validationError && (
        <p style={{ color: "red", fontSize: 13 }}>⚠️ {validationError}</p>
      )}

      {result && (
        <>
          <hr style={{ margin: "16px 0" }} />
          <h3 style={{ fontSize: 16 }}>Wynik:</h3>

          <p style={{ fontSize: 14 }}>
            Aromat (10%): <strong>{result.aroma} ml</strong>
          </p>

          <p style={{ fontSize: 14 }}>
            Baza A: <strong>{result.mlA} ml</strong>
          </p>

          <p style={{ fontSize: 14 }}>
            Baza B: <strong>{result.mlB} ml</strong>
          </p>
        </>
      )}
    </div>
  );
}
