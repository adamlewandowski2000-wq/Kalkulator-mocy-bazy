
import { useState, useMemo, useRef } from "react";

const POWERS = [0, 6, 12, 18, 24, 36];
const POWERS_B = [0, 6, 12, 18, 200];
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


function NicotineCalculator() {
  const [baseMg, setBaseMg] = useState("");
  const [basePg, setBasePg] = useState("100");
  const [baseVg, setBaseVg] = useState("0");

  const [targetMg, setTargetMg] = useState("");
  const [volume, setVolume] = useState("");

  const [targetPg, setTargetPg] = useState("40");
  const [targetVg, setTargetVg] = useState("60");


  const result = useMemo(() => {
    const b = Number(baseMg);
    const t = Number(targetMg);
    const v = Number(volume);

    if (!b || !t || !v) return null;

    // ilość bazy nikotynowej
    const nicotineBase = (t * v) / b;


    // wymagany całkowity PG/VG
    const pgTotal = v * (Number(targetPg) / 100);
    const vgTotal = v * (Number(targetVg) / 100);


    // PG/VG wniesione przez bazę nikotynową
    const pgFromBase =
      nicotineBase * (Number(basePg) / 100);

    const vgFromBase =
      nicotineBase * (Number(baseVg) / 100);


    // brakujące ilości
    const pg = pgTotal - pgFromBase;
    const vg = vgTotal - vgFromBase;


    return {
      nicotineBase,

      pg,
      vg,

      // ml -> g
      pgG: pg * 1.04,
      vgG: vg * 1.26,
    };

  }, [
    baseMg,
    basePg,
    baseVg,
    targetMg,
    volume,
    targetPg,
    targetVg
  ]);


  return (
    <div
      style={{
        marginTop:30,
        borderTop:"1px solid #ccc",
        paddingTop:20
      }}
    >

      <h2 style={{fontSize:18}}>
        Kalkulator bazy nikotynowej
      </h2>


      {[
        ["Moc bazy np. 500 mg", baseMg, setBaseMg],
        ["PG bazy %", basePg, setBasePg],
        ["VG bazy %", baseVg, setBaseVg],
        ["Docelowa moc np. 36 mg", targetMg, setTargetMg],
        ["Ilość końcowa ml np. 1000", volume, setVolume],
        ["Docelowe PG %", targetPg, setTargetPg],
        ["Docelowe VG %", targetVg, setTargetVg],
      ].map(([name, value, setter]) => (
        <input
          key={name}
          placeholder={name}
          value={value}
          onChange={(e)=>setter(e.target.value)}
          style={{
            width:"100%",
            height:38,
            marginBottom:8,
            fontSize:16,
            padding:"0 8px",
            boxSizing:"border-box"
          }}
        />
      ))}


      {result && (
        <>
          <hr />

          <h3 style={{fontSize:16}}>
            Wynik:
          </h3>


          <p>
            Baza nikotynowa:
            <strong>
              {" "}
              {result.nicotineBase.toFixed(2)} ml
            </strong>
          </p>


          <p>
            PG:
            <strong>
              {" "}
              {result.pg.toFixed(2)} ml
              {" "}
              ({result.pgG.toFixed(2)} g)
            </strong>
          </p>


          <p>
            VG:
            <strong>
              {" "}
              {result.vg.toFixed(2)} ml
              {" "}
              ({result.vgG.toFixed(2)} g)
            </strong>
          </p>

        </>
      )}

    </div>
  );
}
export default function Mixer() {
  const [baseA, setBaseA] = useState(null);
  const [baseB, setBaseB] = useState(null);
  const [target, setTarget] = useState(null);

  const [volume, setVolume] = useState(null);
  const [customVolume, setCustomVolume] = useState("");
  const [isCustomVolume, setIsCustomVolume] = useState(false);

  const [withAroma, setWithAroma] = useState("10%");
  const inputRef = useRef(null);

  const AROMA_PERCENT = 10;

  const finalVolume = isCustomVolume
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

    const aromaMl =
      withAroma === "10%"
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

      {/* Ilość końcowa */}
      <div style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: 14 }}>Ilość końcowa</strong>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 6,
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
        >
          {VOLUMES.map((opt) => {
            const active = volume === opt && !isCustomVolume;

            return (
              <div
                key={opt}
                onClick={() => {
                  setVolume(opt);
                  setIsCustomVolume(false);
                  setCustomVolume("");
                }}
                style={{
                  cursor: "pointer",
                  minWidth: 50,
                  height: 38,
                  borderRadius: 6,
                  border: active
                    ? "2px solid #16a34a"
                    : "2px solid #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 13,
                  background: active ? "#dcfce7" : "#fff",
                  flexShrink: 0,
                }}
              >
                {opt} ml
              </div>
            );
          })}

          {/* Własna ilość */}
          <div
            onClick={() => {
              setIsCustomVolume(true);
              setVolume(null);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            style={{
              cursor: "pointer",
              minWidth: 70,
              height: 38,
              borderRadius: 6,
              border: isCustomVolume
                ? "2px solid #16a34a"
                : "2px solid #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              background: isCustomVolume
                ? "#dcfce7"
                : "#fff",
              flexShrink: 0,
              padding: "0 6px",
            }}
          >
            {isCustomVolume ? (
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                value={customVolume}
                onChange={(e) =>
                  setCustomVolume(e.target.value)
                }
                placeholder="ml"
                style={{
                  width: 50,
                  border: "none",
                  outline: "none",
                  fontWeight: "bold",
                  fontSize: 16, // 🔥 brak zoom na iOS
                  background: "transparent",
                  textAlign: "center",
                }}
              />
            ) : (
              "Własna"
            )}
          </div>
        </div>
      </div>

      <OptionGrid
        label="Aromat"
        options={["10%", "Bez"]}
        value={withAroma}
        onChange={setWithAroma}
        unit=""
      />

      {validationError && (
        <p style={{ color: "red", fontSize: 13 }}>
          ⚠️ {validationError}
        </p>
      )}

      {result && (
        <>
          <hr style={{ margin: "16px 0" }} />
          <h3 style={{ fontSize: 16 }}>Wynik:</h3>

          {withAroma === "10%" && (
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

      <NicotineCalculator />

    </div>
  );
}
