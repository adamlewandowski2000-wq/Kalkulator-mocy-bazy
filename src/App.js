import { useState, useMemo } from "react";

const POWERS = [0, 6, 12, 18, 24, 36];
const POWERS_B = [0, 6, 12, 18, 200]; // zmieniona baza B
const VOLUMES = [10, 30, 60, 120];

function OptionGrid({ label, options, value, onChange, unit }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <strong style={{ fontSize: 14 }}>{label}</strong>
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 6,
          flexWrap: "nowrap",
          overflowX: "auto",
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
                flexShrink: 0,
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
  const [customVolume, setCustomVolume] = useState("");
  const [withAroma, setWithAroma] = useState(true);

  const AROMA_PERCENT = 10;

  const finalVolume = customVolume
    ? parseFloat(customVolume)
    : volume;

  const validationError = useMemo(() => {
    if (
      baseA === null ||
      baseB === null ||
      target === null ||
      !finalVolume
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
  }, [baseA, baseB, target, finalVolume]);

  const result = useMemo(() => {
    if (
      baseA === null ||
      baseB === null ||
      target === null ||
      !finalVolume ||
      validationError
    )
      return null;

    const aromaMl = withAroma
      ? finalVolume * (AROMA_PERCENT / 100)
      : 0;

    const baseVolume = finalVolume - aromaMl;

    const mlA =
      (baseVolume * (target - baseB)) /
      (baseA - baseB);

    const mlB = baseVolume - mlA;

    return {
      aroma: aromaMl.toFixed(2),
      mlA: mlA.toFixed(2),
      mlB: mlB.toFixed(2),
    };
  }, [baseA, baseB, target, finalVolume, validationError, withAroma]);

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
        Kalkulator mieszania baz
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
        options={POWERS_B}
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
        onChange={(v) => {
          setVolume(v);
          setCustomVolume("");
        }}
        unit="ml"
      />

      {/* Nowe pole wpisywania ilości */}
      <div style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: 14 }}>
          Lub wpisz własną ilość (ml)
        </strong>
        <input
          type="number"
          value={customVolume}
          onChange={(e) => setCustomVolume(e.target.value)}
          placeholder="np. 75"
          style={{
            width: "100%",
            marginTop: 6,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Wybór aromatu */}
      <div style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: 14 }}>Opcja aromatu</strong>
        <div style={{ marginTop: 6 }}>
          <label>
            <input
              type="radio"
              checked={withAroma}
              onChange={() => setWithAroma(true)}
            />{" "}
            Z 10% aromatu
          </label>
          <br />
          <label>
            <input
              type="radio"
              checked={!withAroma}
              onChange={() => setWithAroma(false)}
            />{" "}
            Bez aromatu
          </label>
        </div>
      </div>

      {validationError && (
        <p style={{ color: "red", fontSize: 13 }}>
          ⚠️ {validationError}
        </p>
      )}

      {result && (
        <>
          <hr style={{ margin: "16px 0" }} />
          <h3 style={{ fontSize: 16 }}>Wynik:</h3>

          {withAroma && (
            <p style={{ fontSize: 14 }}>
              Aromat (10%): <strong>{result.aroma} ml</strong>
            </p>
          )}

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
