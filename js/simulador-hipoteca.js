/* Simulador de hipoteca / Mortgage simulator
 * Lógica portada de simulador-hipoteca.jsx (React) a JS vanilla.
 * Expone window.SimuladorHipoteca.init(config).
 */
(function () {
  'use strict';

  // ----- Cálculo financiero (paridad textual con el JSX) -----
  function cuotaFrancesa(capital, iMensual, nCuotas) {
    if (nCuotas <= 0) return 0;
    if (iMensual === 0) return capital / nCuotas;
    return (capital * iMensual) / (1 - Math.pow(1 + iMensual, -nCuotas));
  }

  function simular(params) {
    var capital = params.capital;
    var tinAnual = params.tinAnual;
    var anios = params.anios;
    var amortizaciones = params.amortizaciones || [];

    var n = Math.round(anios * 12);
    var i = tinAnual / 100 / 12;

    var amorts = amortizaciones
      .map(function (a) {
        return { mes: Math.round(Number(a.mes)), importe: Number(a.importe), modo: a.modo };
      })
      .filter(function (a) { return a.importe > 0 && a.mes >= 1; })
      .sort(function (a, b) { return a.mes - b.mes; });

    function generar(conAmort) {
      var saldo = capital;
      var cuota = cuotaFrancesa(capital, i, n);
      var mesFin = n;
      var filas = [];
      var totalIntereses = 0;
      var totalExtra = 0;
      var mes = 1;
      var tope = n + 1200;

      while (saldo > 0.01 && mes <= tope) {
        var interes = saldo * i;
        var amort = cuota - interes;
        if (amort > saldo) amort = saldo;
        if (amort < 0) amort = 0;
        var cuotaPagada = interes + amort;
        saldo -= amort;
        totalIntereses += interes;

        var extra = 0;
        if (conAmort) {
          var aplicables = amorts.filter(function (x) { return x.mes === mes; });
          for (var k = 0; k < aplicables.length; k++) {
            var a = aplicables[k];
            var imp = Math.min(a.importe, saldo);
            if (imp <= 0) continue;
            saldo -= imp;
            extra += imp;
            totalExtra += imp;
            if (saldo > 0.01) {
              if (a.modo === 'cuota') {
                var restantes = mesFin - mes;
                if (restantes > 0) cuota = cuotaFrancesa(saldo, i, restantes);
              } else {
                if (i === 0) {
                  mesFin = mes + Math.ceil(saldo / cuota);
                } else if (cuota > saldo * i) {
                  var kk = -Math.log(1 - (saldo * i) / cuota) / Math.log(1 + i);
                  mesFin = mes + Math.ceil(kk);
                }
              }
            } else {
              mesFin = mes;
            }
          }
        }

        filas.push({
          mes: mes,
          cuota: cuotaPagada,
          interes: interes,
          amortizacion: amort,
          extra: extra,
          saldo: Math.max(saldo, 0),
        });
        mes++;
      }
      return { filas: filas, totalIntereses: totalIntereses, totalExtra: totalExtra, plazoMeses: filas.length };
    }

    var con = generar(true);
    var sin = generar(false);

    return {
      n: n,
      cuotaInicial: cuotaFrancesa(capital, i, n),
      con: con,
      sin: sin,
      ahorroIntereses: sin.totalIntereses - con.totalIntereses,
      mesesAhorrados: sin.plazoMeses - con.plazoMeses,
    };
  }

  function agruparPorAnio(filas) {
    var anios = [];
    for (var idx = 0; idx < filas.length; idx += 12) {
      var trozo = filas.slice(idx, idx + 12);
      var anio = idx / 12 + 1;
      var sumC = 0, sumI = 0, sumCap = 0, sumE = 0;
      for (var j = 0; j < trozo.length; j++) {
        sumC += trozo[j].cuota;
        sumI += trozo[j].interes;
        sumCap += trozo[j].amortizacion + trozo[j].extra;
        sumE += trozo[j].extra;
      }
      anios.push({
        anio: anio,
        cuota: sumC,
        interes: sumI,
        capital: sumCap,
        extra: sumE,
        saldo: trozo[trozo.length - 1].saldo,
      });
    }
    return anios;
  }

  // ----- Inicialización UI -----
  function init(config) {
    var locale = config.locale || 'es-ES';
    var currency = config.currency || 'EUR';
    var t = config.i18n || {};

    var fmtEur = new Intl.NumberFormat(locale, { style: 'currency', currency: currency, maximumFractionDigits: 2 });
    var fmtEur0 = new Intl.NumberFormat(locale, { style: 'currency', currency: currency, maximumFractionDigits: 0 });
    var fmtNum = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    function eur(n) { return fmtEur.format(isFinite(n) ? n : 0); }
    function eur0(n) { return fmtEur0.format(isFinite(n) ? n : 0); }
    function num2(n) { return fmtNum.format(isFinite(n) ? n : 0); }

    // Estado
    var state = {
      capital: '200000',
      tin: '2.8',
      anios: '30',
      amorts: [],
      vista: 'anual',
      ultimoModo: 'plazo',
    };

    // Nodos
    var $ = function (id) { return document.getElementById(id); };
    var inCapital = $('sim-capital');
    var inTin = $('sim-tin');
    var inAnios = $('sim-anios');

    var kCuota = $('sim-k-cuota');
    var kCuotaSub = $('sim-k-cuota-sub');
    var kInteres = $('sim-k-interes');
    var kInteresSub = $('sim-k-interes-sub');
    var kCoste = $('sim-k-coste');
    var kPlazo = $('sim-k-plazo');
    var kPlazoSub = $('sim-k-plazo-sub');
    var kExtra = $('sim-k-extra');
    var kAhorro = $('sim-k-ahorro');
    var kpiExtraRow = $('sim-kpi-extra-row');

    var amortList = $('sim-amort-list');
    var amortEmpty = $('sim-amort-empty');
    var addBtn = $('sim-amort-add');

    var canvas = $('sim-chart');
    var table = $('sim-table');
    var tabAnual = $('sim-tab-anual');
    var tabMensual = $('sim-tab-mensual');
    var csvBtn = $('sim-csv');

    var chartInstance = null;

    // Sincronizar inputs <-> estado
    function bindInput(el, key) {
      if (!el) return;
      el.value = state[key];
      el.addEventListener('input', function () {
        state[key] = el.value;
        render();
      });
    }
    bindInput(inCapital, 'capital');
    bindInput(inTin, 'tin');
    bindInput(inAnios, 'anios');

    // Tabs vista
    function setVista(v) {
      state.vista = v;
      if (tabAnual) tabAnual.setAttribute('aria-pressed', String(v === 'anual'));
      if (tabMensual) tabMensual.setAttribute('aria-pressed', String(v === 'mensual'));
      renderTable();
    }
    if (tabAnual) tabAnual.addEventListener('click', function () { setVista('anual'); });
    if (tabMensual) tabMensual.addEventListener('click', function () { setVista('mensual'); });

    // Amortizaciones
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        state.amorts.push({ mes: 13, importe: 10000, modo: state.ultimoModo });
        render();
      });
    }
    if (csvBtn) csvBtn.addEventListener('click', exportarCSV);

    function mesAEtiqueta(mes) {
      var anio = Math.ceil(mes / 12);
      var m = ((mes - 1) % 12) + 1;
      return (t.mesEtiqueta || 'año {y}, mes {m}').replace('{y}', anio).replace('{m}', m);
    }

    function renderAmorts() {
      if (!amortList) return;
      amortList.innerHTML = '';
      if (state.amorts.length === 0) {
        if (amortEmpty) amortEmpty.hidden = false;
        return;
      }
      if (amortEmpty) amortEmpty.hidden = true;

      state.amorts.forEach(function (a, idx) {
        var row = document.createElement('div');
        row.className = 'sim-amort-row';

        // Mes
        var colMes = document.createElement('div');
        colMes.innerHTML =
          '<div class="sim-amort-lbl">' + (t.mesNum || 'Mes nº') + '</div>' +
          '<input type="number" min="1" class="sim-amort-input" data-field="mes" value="' + Number(a.mes) + '">' +
          '<div class="sim-amort-hint" data-hint="mes"></div>';
        row.appendChild(colMes);

        // Importe
        var colImp = document.createElement('div');
        colImp.innerHTML =
          '<div class="sim-amort-lbl">' + (t.importe || 'Importe') + '</div>' +
          '<input type="number" min="0" step="500" class="sim-amort-input" data-field="importe" value="' + Number(a.importe) + '">';
        row.appendChild(colImp);

        // Destino
        var colDest = document.createElement('div');
        colDest.innerHTML =
          '<div class="sim-amort-lbl">' + (t.destino || 'Destino') + '</div>' +
          '<div class="sim-amort-modes">' +
          '<button type="button" class="sim-amort-mode-btn" data-mode="plazo" aria-pressed="' + (a.modo === 'plazo') + '">' +
          (t.reducirPlazo || 'Reducir plazo') + '</button>' +
          '<button type="button" class="sim-amort-mode-btn" data-mode="cuota" aria-pressed="' + (a.modo === 'cuota') + '">' +
          (t.reducirCuota || 'Reducir cuota') + '</button>' +
          '</div>';
        row.appendChild(colDest);

        // Eliminar
        var colDel = document.createElement('button');
        colDel.type = 'button';
        colDel.className = 'sim-amort-del';
        colDel.title = t.eliminar || 'Eliminar';
        colDel.setAttribute('aria-label', t.eliminar || 'Eliminar');
        colDel.textContent = '×';
        colDel.addEventListener('click', function () {
          state.amorts.splice(idx, 1);
          render();
        });
        row.appendChild(colDel);

        amortList.appendChild(row);

        // Bind eventos
        var inputs = row.querySelectorAll('.sim-amort-input');
        inputs.forEach(function (inp) {
          inp.addEventListener('input', function () {
            var field = inp.getAttribute('data-field');
            var val = field === 'mes' ? Math.max(1, Math.round(Number(inp.value) || 1)) : Number(inp.value) || 0;
            state.amorts[idx][field] = val;
            if (field === 'mes') {
              var hint = row.querySelector('[data-hint="mes"]');
              if (hint) hint.textContent = mesAEtiqueta(val);
            }
            render();
          });
        });
        var hintEl = row.querySelector('[data-hint="mes"]');
        if (hintEl) hintEl.textContent = mesAEtiqueta(Number(a.mes) || 1);

        var modeBtns = row.querySelectorAll('.sim-amort-mode-btn');
        modeBtns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var mode = btn.getAttribute('data-mode');
            state.amorts[idx].modo = mode;
            state.ultimoModo = mode;
            render();
          });
        });
      });
    }

    function renderKpis(d) {
      var capitalNum = Number(state.capital) || 0;
      var filas = d.con.filas;
      var cuotaUltima = filas.length ? filas[filas.length - 1].cuota : 0;
      var cuotaCambio = Math.abs(cuotaUltima - d.cuotaInicial) > 0.5;

      if (kCuota) kCuota.textContent = eur(d.cuotaInicial);
      if (kCuotaSub) kCuotaSub.textContent = cuotaCambio
        ? (t.ultimaCuota || 'Última: {v}').replace('{v}', eur(cuotaUltima))
        : (t.constante || 'Constante');

      if (kInteres) kInteres.textContent = eur0(d.con.totalIntereses);
      if (kInteresSub) kInteresSub.textContent = (t.sobreCapital || 'sobre {v} de capital').replace('{v}', eur0(capitalNum));

      if (kCoste) kCoste.textContent = eur0(capitalNum + d.con.totalIntereses);

      var aniosEnt = Math.floor(d.con.plazoMeses / 12);
      var mesesRest = d.con.plazoMeses % 12;
      var plazoTxt = (t.plazoFmt || '{a} a {m} m').replace('{a}', aniosEnt).replace('{m}', mesesRest);
      if (kPlazo) kPlazo.textContent = plazoTxt;
      if (kPlazoSub) kPlazoSub.textContent = d.mesesAhorrados > 0
        ? (t.mesesMenos || '{n} meses menos').replace('{n}', d.mesesAhorrados)
        : (t.sinCambios || 'sin cambios');

      var hayAmorts = state.amorts.length > 0;
      if (kpiExtraRow) kpiExtraRow.hidden = !hayAmorts;
      if (kExtra) kExtra.textContent = eur0(d.con.totalExtra);
      if (kAhorro) kAhorro.textContent = eur0(d.ahorroIntereses);
    }

    function renderChart(grupos) {
      if (!canvas || typeof Chart === 'undefined') return;
      var labels = grupos.map(function (g) {
        return (t.anioLbl || 'Año') + ' ' + g.anio;
      });
      var capData = grupos.map(function (g) { return Math.round(g.capital); });
      var intData = grupos.map(function (g) { return Math.round(g.interes); });

      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: t.capital || 'Capital',
              data: capData,
              backgroundColor: '#22c55e',
              borderWidth: 0,
            },
            {
              label: t.intereses || 'Intereses',
              data: intData,
              backgroundColor: '#ef4444',
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: "'Segoe UI', system-ui, sans-serif", size: 13, weight: '500' },
                color: '#1e293b',
                usePointStyle: true,
                pointStyle: 'rectRounded',
                padding: 16,
              },
            },
            tooltip: {
              backgroundColor: '#1e293b',
              titleFont: { family: "'Segoe UI', system-ui, sans-serif", size: 13, weight: '600' },
              bodyFont: { family: "'Segoe UI', system-ui, sans-serif", size: 13 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (ctx) {
                  return ctx.dataset.label + ': ' + eur0(ctx.parsed.y);
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { family: "'Segoe UI', system-ui, sans-serif", size: 11 }, color: '#64748b' },
            },
            y: {
              stacked: true,
              grid: { color: 'rgba(100, 116, 139, 0.1)' },
              ticks: {
                font: { family: "'Segoe UI', system-ui, sans-serif", size: 11 },
                color: '#64748b',
                callback: function (v) { return Math.round(v / 1000) + 'k'; },
              },
            },
          },
        },
      });
    }

    function renderTable() {
      if (!table) return;
      var grupos = agruparPorAnio(state.lastFilas || []);
      var filas = state.lastFilas || [];
      var esAnual = state.vista === 'anual';
      var rows = esAnual ? grupos : filas;

      var thead =
        '<tr>' +
        (esAnual
          ? '<th class="sim-th-text">' + (t.anio || 'Año') + '</th>'
          : '<th class="sim-th-text">' + (t.anio || 'Año') + '</th>' +
            '<th class="sim-th-text">' + (t.mes || 'Mes') + '</th>' +
            '<th class="sim-th-text">' + (t.mesNum || 'Nº mes') + '</th>') +
        '<th>' + (t.cuota || 'Cuota') + '</th>' +
        '<th>' + (t.intereses || 'Intereses') + '</th>' +
        '<th>' + (t.capital || 'Capital') + '</th>' +
        '<th class="sim-th-extra">' + (t.anticipado || 'Anticipado') + '</th>' +
        '<th>' + (t.pendiente || 'Pendiente') + '</th>' +
        '</tr>';

      var tbody = rows.map(function (r) {
        var cuota = r.cuota;
        var interes = r.interes;
        var cap = esAnual ? r.capital : (r.amortizacion + r.extra);
        var extra = r.extra;
        var anioFila = esAnual ? r.anio : Math.ceil(r.mes / 12);
        var mesDelAnio = esAnual ? null : ((r.mes - 1) % 12) + 1;
        var rowClass = extra > 0 ? ' class="has-prepay"' : '';
        var firstCols = esAnual
          ? '<td class="sim-td-text">' + anioFila + '</td>'
          : '<td class="sim-td-text">' + anioFila + '</td>' +
            '<td class="sim-td-text sim-td-soft">' + mesDelAnio + '</td>' +
            '<td class="sim-td-text sim-td-soft">' + r.mes + '</td>';
        return (
          '<tr' + rowClass + '>' +
          firstCols +
          '<td>' + eur(cuota) + '</td>' +
          '<td class="sim-td-int">' + eur(interes) + '</td>' +
          '<td class="sim-td-cap">' + eur(cap) + '</td>' +
          '<td class="sim-td-extra">' + (extra > 0 ? eur(extra) : '—') + '</td>' +
          '<td class="sim-td-soft">' + eur(r.saldo) + '</td>' +
          '</tr>'
        );
      }).join('');

      table.innerHTML = '<thead>' + thead + '</thead><tbody>' + tbody + '</tbody>';
    }

    function exportarCSV() {
      var filas = state.lastFilas || [];
      var cab = [
        t.csvAnio || 'Año',
        t.csvMesAnio || 'Mes del año',
        t.csvMesNum || 'Nº mes',
        t.cuota || 'Cuota',
        t.intereses || 'Intereses',
        t.csvAmortCap || 'Amortización capital',
        t.csvAmortAnt || 'Amortización anticipada',
        t.csvPendiente || 'Capital pendiente',
      ];
      var lineas = filas.map(function (f) {
        var anio = Math.ceil(f.mes / 12);
        var mesAnio = ((f.mes - 1) % 12) + 1;
        return [
          anio,
          mesAnio,
          f.mes,
          num2(f.cuota),
          num2(f.interes),
          num2(f.amortizacion),
          num2(f.extra),
          num2(f.saldo),
        ].join(';');
      });
      var csv = '﻿' + [cab.join(';')].concat(lineas).join('\n');
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = t.csvFichero || 'cuadro_amortizacion.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function render() {
      var c = Math.max(Number(state.capital) || 0, 0);
      var ti = Math.max(Number(state.tin) || 0, 0);
      var an = Math.min(Math.max(Math.round(Number(state.anios) || 0), 1), 50);
      var d = simular({ capital: c, tinAnual: ti, anios: an, amortizaciones: state.amorts });
      state.lastFilas = d.con.filas;

      renderKpis(d);
      renderAmorts();
      renderTable();
      renderChart(agruparPorAnio(d.con.filas));
    }

    // Estado inicial de tabs
    setVista('anual');
    render();
  }

  window.SimuladorHipoteca = { init: init, _internals: { cuotaFrancesa: cuotaFrancesa, simular: simular, agruparPorAnio: agruparPorAnio } };
})();
