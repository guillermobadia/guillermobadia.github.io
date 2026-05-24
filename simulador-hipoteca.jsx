import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ----- Tema -----
const T = {
  paper: "#f3efe6",
  paperAlt: "#ece6d8",
  ink: "#1b2a24",
  inkSoft: "#4a5a52",
  green: "#1f4d3a",
  greenDeep: "#173b2d",
  terra: "#b5491f",
  amber: "#a86317",
  line: "#d8d0bf",
  white: "#fbf9f4",
};

const display = "'Fraunces', Georgia, serif";
const sans = "'IBM Plex Sans', system-ui, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, monospace";

// ----- Formato es-ES -----
const eur = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(
    isFinite(n) ? n : 0
  );
const eur0 = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0
  );
const num = (n, d = 2) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d }).format(
    isFinite(n) ? n : 0
  );

// ----- Cálculo financiero -----
function cuotaFrancesa(capital, iMensual, nCuotas) {
  if (nCuotas <= 0) return 0;
  if (iMensual === 0) return capital / nCuotas;
  return (capital * iMensual) / (1 - Math.pow(1 + iMensual, -nCuotas));
}

function simular({ capital, tinAnual, anios, amortizaciones }) {
  const n = Math.round(anios * 12);
  const i = tinAnual / 100 / 12;

  const amorts = amortizaciones
    .map((a) => ({ mes: Math.round(Number(a.mes)), importe: Number(a.importe), modo: a.modo }))
    .filter((a) => a.importe > 0 && a.mes >= 1)
    .sort((a, b) => a.mes - b.mes);

  const generar = (conAmort) => {
    let saldo = capital;
    let cuota = cuotaFrancesa(capital, i, n);
    let mesFin = n;
    const filas = [];
    let totalIntereses = 0;
    let totalExtra = 0;
    let mes = 1;
    const tope = n + 1200;

    while (saldo > 0.01 && mes <= tope) {
      const interes = saldo * i;
      let amort = cuota - interes;
      if (amort > saldo) amort = saldo;
      if (amort < 0) amort = 0;
      const cuotaPagada = interes + amort;
      saldo -= amort;
      totalIntereses += interes;

      let extra = 0;
      if (conAmort) {
        for (const a of amorts.filter((x) => x.mes === mes)) {
          let imp = Math.min(a.importe, saldo);
          if (imp <= 0) continue;
          saldo -= imp;
          extra += imp;
          totalExtra += imp;
          if (saldo > 0.01) {
            if (a.modo === "cuota") {
              const restantes = mesFin - mes;
              if (restantes > 0) cuota = cuotaFrancesa(saldo, i, restantes);
            } else {
              if (i === 0) {
                mesFin = mes + Math.ceil(saldo / cuota);
              } else if (cuota > saldo * i) {
                const k = -Math.log(1 - (saldo * i) / cuota) / Math.log(1 + i);
                mesFin = mes + Math.ceil(k);
              }
            }
          } else {
            mesFin = mes;
          }
        }
      }

      filas.push({
        mes,
        cuota: cuotaPagada,
        interes,
        amortizacion: amort,
        extra,
        saldo: Math.max(saldo, 0),
      });
      mes++;
    }
    return { filas, totalIntereses, totalExtra, plazoMeses: filas.length };
  };

  const con = generar(true);
  const sin = generar(false);

  return {
    n,
    cuotaInicial: cuotaFrancesa(capital, i, n),
    con,
    sin,
    ahorroIntereses: sin.totalIntereses - con.totalIntereses,
    mesesAhorrados: sin.plazoMeses - con.plazoMeses,
  };
}

function agruparPorAnio(filas) {
  const anios = [];
  for (let idx = 0; idx < filas.length; idx += 12) {
    const trozo = filas.slice(idx, idx + 12);
    const anio = idx / 12 + 1;
    anios.push({
      anio,
      cuota: trozo.reduce((s, f) => s + f.cuota, 0),
      interes: trozo.reduce((s, f) => s + f.interes, 0),
      capital: trozo.reduce((s, f) => s + f.amortizacion + f.extra, 0),
      extra: trozo.reduce((s, f) => s + f.extra, 0),
      saldo: trozo[trozo.length - 1].saldo,
    });
  }
  return anios;
}

// ----- Componentes UI -----
function Campo({ etiqueta, valor, onChange, sufijo, paso = "1", min = "0" }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: T.inkSoft }}>
        {etiqueta}
      </span>
      <div style={{ position: "relative", marginTop: 6 }}>
        <input
          type="number"
          inputMode="decimal"
          step={paso}
          min={min}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "12px 44px 12px 14px", fontFamily: mono, fontSize: 18,
            color: T.ink, background: T.white, border: `1px solid ${T.line}`, borderRadius: 10, outline: "none",
          }}
        />
        {sufijo && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontFamily: mono, fontSize: 14, color: T.inkSoft }}>
            {sufijo}
          </span>
        )}
      </div>
    </label>
  );
}

function Kpi({ titulo, valor, sub, color }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: T.inkSoft }}>
        {titulo}
      </div>
      <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 600, color: color || T.ink, marginTop: 6, lineHeight: 1.1 }}>
        {valor}
      </div>
      {sub && <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function SimuladorHipoteca() {
  const [capital, setCapital] = useState("200000");
  const [tin, setTin] = useState("2,8".replace(",", "."));
  const [anios, setAnios] = useState("30");
  const [amorts, setAmorts] = useState([]);
  const [vista, setVista] = useState("anual");
  const [ultimoModo, setUltimoModo] = useState("plazo");

  const datos = useMemo(() => {
    const c = Math.max(Number(capital) || 0, 0);
    const t = Math.max(Number(tin) || 0, 0);
    const a = Math.min(Math.max(Math.round(Number(anios) || 0), 1), 50);
    return simular({ capital: c, tinAnual: t, anios: a, amortizaciones: amorts });
  }, [capital, tin, anios, amorts]);

  const filas = datos.con.filas;
  const grupos = useMemo(() => agruparPorAnio(filas), [filas]);
  const grafico = useMemo(
    () => grupos.map((g) => ({ anio: `Año ${g.anio}`, Capital: Math.round(g.capital), Intereses: Math.round(g.interes) })),
    [grupos]
  );

  const plazoTxt = `${Math.floor(datos.con.plazoMeses / 12)} a ${datos.con.plazoMeses % 12} m`;
  const cuotaUltima = filas.length ? filas[filas.length - 1].cuota : 0;
  const cuotaCambio = Math.abs(cuotaUltima - datos.cuotaInicial) > 0.5;

  const addAmort = () => {
    setAmorts((prev) => [...prev, { mes: 13, importe: 10000, modo: ultimoModo }]);
  };
  const updAmort = (idx, campo, valor) => {
    setAmorts((prev) => prev.map((a, i) => (i === idx ? { ...a, [campo]: valor } : a)));
    if (campo === "modo") setUltimoModo(valor);
  };
  const delAmort = (idx) => setAmorts((prev) => prev.filter((_, i) => i !== idx));

  const exportarCSV = () => {
    const cab = ["Año", "Mes del año", "Nº mes", "Cuota", "Intereses", "Amortización capital", "Amortización anticipada", "Capital pendiente"];
    const lineas = filas.map((f) => {
      const anio = Math.ceil(f.mes / 12);
      const mesAnio = ((f.mes - 1) % 12) + 1;
      return [
        anio,
        mesAnio,
        f.mes,
        num(f.cuota),
        num(f.interes),
        num(f.amortizacion),
        num(f.extra),
        num(f.saldo),
      ].join(";");
    });
    const csv = "\uFEFF" + [cab.join(";"), ...lineas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cuadro_amortizacion.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const mesAEtiqueta = (mes) => {
    const anio = Math.ceil(mes / 12);
    const m = ((mes - 1) % 12) + 1;
    return `año ${anio}, mes ${m}`;
  };

  return (
    <div style={{ fontFamily: sans, color: T.ink, background: T.paper, minHeight: "100vh", padding: "0 0 48px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: .3; }
        table { border-collapse: collapse; }`}</style>

      {/* Cabecera */}
      <header style={{ background: T.greenDeep, color: T.paper, padding: "28px 20px 26px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.7 }}>
            Tipo fijo · Sistema francés
          </div>
          <h1 style={{ fontFamily: display, fontWeight: 900, fontSize: 38, margin: "6px 0 0", lineHeight: 1.02 }}>
            Simulador de hipoteca
          </h1>
          <p style={{ margin: "8px 0 0", maxWidth: 560, opacity: 0.85, fontSize: 15 }}>
            Cuadro de amortización con cuota constante y amortizaciones anticipadas, reduciendo cuota o reduciendo plazo.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px" }}>
        {/* Entradas */}
        <section
          style={{
            background: T.paperAlt, border: `1px solid ${T.line}`, borderRadius: 16,
            padding: 20, marginTop: -16, position: "relative", zIndex: 2,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16,
          }}
        >
          <Campo etiqueta="Capital del préstamo" valor={capital} onChange={setCapital} sufijo="€" paso="1000" />
          <Campo etiqueta="Tipo fijo (TIN)" valor={tin} onChange={setTin} sufijo="%" paso="0.05" />
          <Campo etiqueta="Plazo" valor={anios} onChange={setAnios} sufijo="años" paso="1" min="1" />
        </section>

        {/* KPIs */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 16 }}>
          <Kpi titulo="Cuota mensual" valor={eur(datos.cuotaInicial)} sub={cuotaCambio ? `Última: ${eur(cuotaUltima)}` : "Constante"} color={T.green} />
          <Kpi titulo="Total intereses" valor={eur0(datos.con.totalIntereses)} sub={`sobre ${eur0(Number(capital) || 0)} de capital`} color={T.terra} />
          <Kpi titulo="Coste total" valor={eur0((Number(capital) || 0) + datos.con.totalIntereses)} sub="capital + intereses" />
          <Kpi titulo="Plazo real" valor={plazoTxt} sub={datos.mesesAhorrados > 0 ? `${datos.mesesAhorrados} meses menos` : "sin cambios"} color={T.green} />
        </section>

        {amorts.length > 0 && (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 12 }}>
            <Kpi titulo="Amortizado de más" valor={eur0(datos.con.totalExtra)} sub="aportaciones anticipadas" color={T.amber} />
            <Kpi titulo="Ahorro en intereses" valor={eur0(datos.ahorroIntereses)} sub="frente a no amortizar" color={T.green} />
          </section>
        )}

        {/* Amortizaciones anticipadas */}
        <section style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontFamily: display, fontWeight: 600, fontSize: 22, margin: 0 }}>Amortizaciones anticipadas</h2>
            <button
              onClick={addAmort}
              style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: T.white, background: T.green, border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer" }}
            >
              + Añadir
            </button>
          </div>

          {amorts.length === 0 ? (
            <p style={{ color: T.inkSoft, fontSize: 14, margin: "12px 0 0" }}>
              Sin amortizaciones. Añade una aportación puntual e indica si quieres reducir la cuota o acortar el plazo.
            </p>
          ) : (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              {amorts.map((a, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr auto", gap: 10, alignItems: "end",
                    background: T.paper, border: `1px solid ${T.line}`, borderRadius: 12, padding: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: T.inkSoft, letterSpacing: ".04em" }}>Mes nº</div>
                    <input
                      type="number" min="1" value={a.mes}
                      onChange={(e) => updAmort(idx, "mes", e.target.value)}
                      style={{ width: "100%", marginTop: 5, padding: "9px 10px", fontFamily: mono, fontSize: 15, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, color: T.ink }}
                    />
                    <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 4 }}>{mesAEtiqueta(Number(a.mes) || 1)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: T.inkSoft, letterSpacing: ".04em" }}>Importe</div>
                    <input
                      type="number" min="0" step="500" value={a.importe}
                      onChange={(e) => updAmort(idx, "importe", e.target.value)}
                      style={{ width: "100%", marginTop: 5, padding: "9px 10px", fontFamily: mono, fontSize: 15, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, color: T.ink }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: T.inkSoft, letterSpacing: ".04em" }}>Destino</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                      {[
                        { k: "plazo", t: "Reducir plazo" },
                        { k: "cuota", t: "Reducir cuota" },
                      ].map((op) => (
                        <button
                          key={op.k}
                          onClick={() => updAmort(idx, "modo", op.k)}
                          style={{
                            flex: 1, fontFamily: sans, fontSize: 13, fontWeight: 600, padding: "9px 6px", borderRadius: 8, cursor: "pointer",
                            border: `1px solid ${a.modo === op.k ? T.green : T.line}`,
                            background: a.modo === op.k ? T.green : T.white,
                            color: a.modo === op.k ? T.white : T.inkSoft,
                          }}
                        >
                          {op.t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => delAmort(idx)}
                    title="Eliminar"
                    style={{ alignSelf: "center", background: "transparent", border: `1px solid ${T.line}`, color: T.terra, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontWeight: 700 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Gráfico */}
        <section style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20, marginTop: 20 }}>
          <h2 style={{ fontFamily: display, fontWeight: 600, fontSize: 22, margin: "0 0 4px" }}>Capital frente a intereses</h2>
          <p style={{ color: T.inkSoft, fontSize: 13, margin: "0 0 12px" }}>Reparto anual de cada pago entre amortización de capital e intereses.</p>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={grafico} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
                <XAxis dataKey="anio" tick={{ fontSize: 11, fontFamily: mono, fill: T.inkSoft }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fontFamily: mono, fill: T.inkSoft }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={(v, n) => [eur0(v), n]}
                  contentStyle={{ fontFamily: sans, fontSize: 13, borderRadius: 10, border: `1px solid ${T.line}` }}
                />
                <Legend wrapperStyle={{ fontFamily: sans, fontSize: 13 }} />
                <Bar dataKey="Capital" stackId="a" fill={T.green} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Intereses" stackId="a" fill={T.terra} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Cuadro de amortización */}
        <section style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontFamily: display, fontWeight: 600, fontSize: 22, margin: 0 }}>Cuadro de amortización</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", border: `1px solid ${T.line}`, borderRadius: 9, overflow: "hidden" }}>
                {[
                  { k: "anual", t: "Anual" },
                  { k: "mensual", t: "Mensual" },
                ].map((op) => (
                  <button
                    key={op.k}
                    onClick={() => setVista(op.k)}
                    style={{
                      fontFamily: sans, fontSize: 13, fontWeight: 600, padding: "8px 14px", cursor: "pointer", border: "none",
                      background: vista === op.k ? T.green : T.white, color: vista === op.k ? T.white : T.inkSoft,
                    }}
                  >
                    {op.t}
                  </button>
                ))}
              </div>
              <button
                onClick={exportarCSV}
                style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, padding: "8px 14px", cursor: "pointer", borderRadius: 9, border: `1px solid ${T.green}`, background: T.white, color: T.green }}
              >
                Descargar CSV
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto", marginTop: 14 }}>
            <table style={{ width: "100%", fontFamily: mono, fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "right", color: T.inkSoft, borderBottom: `2px solid ${T.line}` }}>
                  {vista === "anual" ? (
                    <th style={{ textAlign: "left", padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Año</th>
                  ) : (
                    <>
                      <th style={{ textAlign: "left", padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Año</th>
                      <th style={{ textAlign: "left", padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Mes</th>
                      <th style={{ textAlign: "left", padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Nº mes</th>
                    </>
                  )}
                  <th style={{ padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Cuota</th>
                  <th style={{ padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Intereses</th>
                  <th style={{ padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Capital</th>
                  <th style={{ padding: "8px 8px", fontFamily: sans, fontWeight: 600, color: T.amber }}>Anticipado</th>
                  <th style={{ padding: "8px 8px", fontFamily: sans, fontWeight: 600 }}>Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {(vista === "anual" ? grupos : filas).map((r, idx) => {
                  const esAnual = vista === "anual";
                  const cuota = r.cuota;
                  const interes = r.interes;
                  const cap = esAnual ? r.capital : r.amortizacion + r.extra;
                  const extra = r.extra;
                  const anioFila = esAnual ? r.anio : Math.ceil(r.mes / 12);
                  const mesDelAnio = esAnual ? null : ((r.mes - 1) % 12) + 1;
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${T.line}`, background: extra > 0 ? "#fbf4e8" : "transparent" }}>
                      {esAnual ? (
                        <td style={{ textAlign: "left", padding: "7px 8px", color: T.ink }}>{anioFila}</td>
                      ) : (
                        <>
                          <td style={{ textAlign: "left", padding: "7px 8px", color: T.ink }}>{anioFila}</td>
                          <td style={{ textAlign: "left", padding: "7px 8px", color: T.inkSoft }}>{mesDelAnio}</td>
                          <td style={{ textAlign: "left", padding: "7px 8px", color: T.inkSoft }}>{r.mes}</td>
                        </>
                      )}
                      <td style={{ textAlign: "right", padding: "7px 8px" }}>{eur(cuota)}</td>
                      <td style={{ textAlign: "right", padding: "7px 8px", color: T.terra }}>{eur(interes)}</td>
                      <td style={{ textAlign: "right", padding: "7px 8px", color: T.green }}>{eur(cap)}</td>
                      <td style={{ textAlign: "right", padding: "7px 8px", color: extra > 0 ? T.amber : T.line }}>
                        {extra > 0 ? eur(extra) : "—"}
                      </td>
                      <td style={{ textAlign: "right", padding: "7px 8px", color: T.inkSoft }}>{eur(r.saldo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 18, lineHeight: 1.5 }}>
          Simulación orientativa. No incluye comisiones de apertura, amortización o subrogación, seguros vinculados,
          ni gastos de notaría o gestoría. El reparto real entre cuotas puede variar según el redondeo y la fecha de
          cargo de tu entidad. No constituye asesoramiento financiero.
        </p>
      </main>
    </div>
  );
}
