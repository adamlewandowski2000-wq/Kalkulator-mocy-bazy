
import { useState, useMemo, useRef } from "react";

// Definicje tablic, których brakowało w Twoim szablonie
const POWERS =;
const VOLUMES =;
const VG_OPTIONS =;

// Stałe gęstości zdefiniowane przez Ciebie (w g/ml)
const DENSITY_VG = 1.26;
const DENSITY_PG = 1.04;

function OptionGrid({ label, options, value, onChange, unit }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <strong style={{ fontSize: 13, color: "#475569" }}>{label}</strong>
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 6,
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: 4,
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
                minWidth: 52,
                height: 36,
                borderRadius: 6,
                border: active ? "2px solid #16a34a" : "2px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 12,
                position: "relative",
                background: active ? "#dcfce7" : "#fff",
                flexShrink: 0,
                color: active ? "#16a34a" : "#334155",
              }}
            >
              {opt}{unit}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#16a34a",
                    color: "white",
                    borderRadius: "50%",
                    width: 14,
                    height: 14,
                    fontSize: 10,
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
  const [baseA, setBaseA] = useState(500); // Domyślnie Twój koncentrat 500mg
  const [vgA, setVgA] = useState(0);       // Domyślnie 100% PG (0% VG)
  
  const [baseB, setBaseB] = useState(0);   // Domyślnie druga baza to zero
  const [vgB, setVgB] = useState(60);      // Domyślnie Twoja baza 60/40

  const [target, setTarget] = useState(36);
  const [volume, setVolume] = useState(100);
  const [customVolume, setCustomVolume] = useState("");
  const [isCustomVolume, setIsCustomVolume] = useState(false);

  const [withAroma, setWithAroma] = useState("10%");
  const inputRef = useRef(null);

  const AROMA_PERCENT = 10;

  const finalVolume = isCustomVolume ? parseFloat(customVolume) : volume;

  const validationError = useMemo(() => {
    if (baseA === null || baseB === null || target === null || !finalVolume) return "";
    if (baseA === baseB) return "Bazy muszą mieć różne moce nikotyny.";
    if (target < Math.min(baseA, baseB) || target > Math.max(baseA, baseB)) {
      return "Docelowa moc musi leżeć pomiędzy mocą bazy A i bazy B.";
    }
    return "";
  }, [baseA, baseB, target, finalVolume]);

  const result = useMemo(() => {
    if (baseA === null || baseB === null || target === null || !finalVolume || validationError) return null;

    // Obliczanie objętości aromatu (aromat traktujemy jako 100% PG)
    const aromaMl = withAroma === "10%" ? finalVolume * (AROMA_PERCENT / 100) : 0;
    const baseVolume = finalVolume - aromaMl;

    // Proporcje mieszania mililitrów baz (Wzór krzyża)
    const mlA = (baseVolume * (target - baseB)) / (baseA - baseB);
    const mlB = baseVolume - mlA;

    // Gęstości poszczególnych baz na podstawie ich parametrów VG
    const pctPgA = 100 - vgA;
    const pctPgB = 100 - vgB;
    const densityA = (vgA / 100) * DENSITY_VG + (pctPgA / 100) * DENSITY_PG;
    const densityB = (vgB / 100) * DENSITY_VG + (pctPgB / 100) * DENSITY_PG;

    // Waga w gramach
    const gA = mlA * densityA;
    const gB = mlB * densityB;
    const gAroma = aromaMl * DENSITY_PG;

    // Obliczanie ostatecznych proporcji VG i PG w gotowym liquidzie
    const totalVgMl = (mlA * (vgA / 100)) + (mlB * (vgB / 100));
    const finalVgPct = (totalVgMl / finalVolume) * 100;
    const finalPgPct = 100 - finalVgPct;

    return {
      aromaMl: aromaMl.toFixed(2),
      aromaG: gAroma.toFixed(2),
      mlA: mlA.toFixed(2),
      gA: gA.toFixed(2),
      mlB: mlB.toFixed(2),
      gB: gB.toFixed(2),
      totalG: (gA + gB + gAroma).toFixed(2),
      finalVg: finalVgPct.toFixed(1),
      finalPg: finalPgPct.toFixed(1)
    };
  }, [baseA, vgA, baseB, vgB, target, finalVolume, validationError, withAroma]);

  return (
    <div style={{ maxWidth: 380, margin: "10px auto", fontFamily: "Arial, sans-serif", padding: "15px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <h2 style={{ fontSize: 18, marginBottom: 16, textAlign: "center", color: "#0f172a" }}>Kalkulator E-Liquid DIY</h2>

      {/* SEKCJA BAZY A */}
      <div style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <OptionGrid label="Moc bazy A" options={POWERS} value={baseA} onChange={setBaseA} unit=" mg" />
        <OptionGrid label="Gęstość bazy A (VG %)" options={VG_OPTIONS} value={vgA} onChange={setVgA} unit="%" />
      </div>

      {/* SEKCJA BAZY B */}
      <div style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <OptionGrid label="Moc bazy B" options={POWERS} value={baseB} onChange={setBaseB} unit=" mg" />
        <OptionGrid label="Gęstość bazy B (VG %)" options={VG_OPTIONS} value={vgB} onChange={setVgB} unit="%" />
      </div>

      {/* PARAMETRY DOCELOWE */}
      <div style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <OptionGrid label="Docelowa moc nikotyny" options={POWERS.filter(p => p <= 36)} value={target} onChange={setTarget} unit=" mg" />
        
        {/* Ilość końcowa */}
        <div style={{ marginBottom: 12 }}>
          <strong style={{ fontSize: 13, color: "#475569" }}>Ilość końcowa</strong>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
            {VOLUMES.map((opt) => {
              const active = volume === opt && !isCustomVolume;
              return (
                <div
                  key={opt}
                  onClick={() => { setVolume(opt); setIsCustomVolume(false); setCustomVolume(""); }}
                  style={{
                    cursor: "pointer",
                    minWidth: 52,
                    height: 36,
                    borderRadius: 6,
                    border: active ? "2px solid #16a34a" : "2px solid #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: 12,
                    background: active ? "#dcfce7" : "#fff",
                    flexShrink: 0,
                    color: active ? "#16a34a" : "#334155"
                  }}
                >
                  {opt} ml
                </div>
              );
            })}

            <div
              onClick={() => { setIsCustomVolume(true); setVolume(null); setTimeout(() => inputRef.current?.focus(), 100); }}
              style={{
                cursor: "pointer",
                minWidth: 70,
                height: 36,
                borderRadius: 6,
                border: isCustomVolume ? "2px solid #16a34a" : "2px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 12,
                background: isCustomVolume ? "#dcfce7" : "#fff",
                flexShrink: 0,
                padding: "0 6px",
                color: isCustomVolume ? "#16a34a" : "#334155"
              }}
            >
              {isCustomVolume ? (
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  value={customVolume}
                  onChange={(e) => setCustomVolume(e.target.value)}
                  placeholder="ml"
                  style={{ width: 50, border: "none", outline: "none", fontWeight: "bold", fontSize: 14, background: "transparent", textAlign: "center" }}
                />
              ) : ( "Własna" )}
            </div>
          </div>
        </div>

        <OptionGrid label="Aromat (100% PG)" options={["10%", "Bez"]} value={withAroma} onChange={setWithAroma} unit="" />
      </div>

      {validationError && (
        <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fca5a5", padding: "10px", borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
          ⚠️ {validationError}
        </div>
      )}

      {/* WYNIKI POD SPODEM */}
      {result && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: 8, marginTop: 16 }}>
          <h3 style={{ fontSize: 15, color: "#166534", marginTop: 0, marginBottom: 12, borderBottom: "1px solid #bbf7d0", paddingBottom: 6 }}>Przepis wagowy (Ustaw wagę na 'g'):</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Baza A ({baseA} mg, {vgA}/{100-vgA}):</span>

{result.mlA} ml / {result.gA} g
<div style={{ display: "flex", justifyContent: "space-between" }}>
Baza B ({baseB} mg, {vgB}/{100-vgB}):
{result.mlB} ml / {result.gB} g
{withAroma === "10%" && (
<div style={{ display: "flex", justifyContent: "space-between", color: "#2563eb" }}>
Aromat (10% PG):
{result.aromaMl} ml / {result.aromaG} g

)}
<div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #bbf7d0", paddingTop: 6, fontWeight: "bold", color: "#166534", fontSize: 14 }}>
ŁĄCZNA WAGA PŁYNU:
{result.totalG} g
<div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #bbf7d0", paddingTop: 6, fontSize: 12, color: "#475569", fontStyle: "italic" }}>
Końcowe VG / PG:
{result.finalVg}% VG / {result.finalPg}% PG



)}

);
}
