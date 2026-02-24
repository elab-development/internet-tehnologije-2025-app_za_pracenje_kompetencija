import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // change if your key differs
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Load Google Charts ONCE (shared promise)
let googleChartsPromise = null;

const ensureGoogleCharts = () => {
  if (googleChartsPromise) return googleChartsPromise;

  googleChartsPromise = new Promise((resolve, reject) => {
    const finishLoad = () => {
      if (!window.google?.charts) {
        reject(new Error("Google Charts is not available after script load."));
        return;
      }

      // corechart = Pie + Column, treemap = TreeMap
      window.google.charts.load("current", { packages: ["corechart", "treemap"] });
      window.google.charts.setOnLoadCallback(() => resolve());
    };

    if (window.google?.charts) {
      finishLoad();
      return;
    }

    const existing = document.querySelector('script[data-google-charts="true"]');
    if (existing) {
      existing.addEventListener("load", finishLoad);
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Charts script."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-charts", "true");
    script.onload = finishLoad;
    script.onerror = () => reject(new Error("Failed to load Google Charts script."));
    document.body.appendChild(script);
  });

  return googleChartsPromise;
};

const drawPie = (el, pendingPct, approvedPct, rejectedPct) => {
  if (!el || !window.google?.visualization) return;

  const data = window.google.visualization.arrayToDataTable([
    ["Status", "Percentage"],
    ["Pending", pendingPct],   // ID 1
    ["Approved", approvedPct], // ID 2
    ["Rejected", rejectedPct], // ID 3
  ]);

  const options = {
    title: "Verification Status Distribution (Percentages)",
    pieHole: 0.4,
    legend: { position: "right" },
    chartArea: { width: "90%", height: "80%" },
  };

  new window.google.visualization.PieChart(el).draw(data, options);
};

const drawColumns = (el, items) => {
  if (!el || !window.google?.visualization) return;

  const rows = (items ?? []).map((x) => [x.type_name, Number(x.total) || 0]);

  const data = window.google.visualization.arrayToDataTable([
    ["Competency Type", "Total"],
    ...rows,
  ]);

  const options = {
    title: "Top Competency Types (by total verifications)",
    legend: { position: "none" },
    chartArea: { width: "85%", height: "70%" },
    hAxis: { title: "Competency Type" },
    vAxis: { title: "Total" },
  };

  new window.google.visualization.ColumnChart(el).draw(data, options);
};

// const drawTreemap = (el, items) => {
//   if (!el || !window.google?.visualization) return;

//   const rows = (items ?? []).map((x) => [
//     x.source_name,
//     "Sources",
//     Number(x.total) || 0,
//     Number(x.total) || 0,
//   ]);

//   const data = window.google.visualization.arrayToDataTable([
//     ["Source", "Parent", "Total", "Total (color)"],
//     ["Sources", null, 0, 0],
//     ...rows,
//   ]);

//   const options = {
//     title: "Competency Sources (Treemap)",
//     headerHeight: 22,
//     fontColor: "black",
//     showScale: true,
//     chartArea: { width: "95%", height: "85%" },
//   };

//   new window.google.visualization.TreeMap(el).draw(data, options);
// };

// const drawTreemap = (el, items) => {
//   if (!el || !window.google?.visualization) return;

//   const rows = (items ?? []).map((x) => [
//     x.source_name,
//     "Sources",
//     Number(x.total) || 0,
//     Number(x.total) || 0,
//     `Source: ${x.source_name}\nTotal competencies: ${x.total}`
//   ]);

//   const data = new window.google.visualization.DataTable();

//   data.addColumn("string", "Source");
//   data.addColumn("string", "Parent");
//   data.addColumn("number", "Total");
//   data.addColumn("number", "Color");
//   data.addColumn({ type: "string", role: "tooltip" });

//   data.addRow(["Sources", null, 0, 0, ""]);

//   rows.forEach((row) => data.addRow(row));

//   const options = {
//     title: "Competency Sources (Treemap)",
//     headerHeight: 22,
//     fontColor: "black",
//     showScale: true,
//     chartArea: { width: "95%", height: "85%" },
//     tooltip: { isHtml: false }
//   };

//   new window.google.visualization.TreeMap(el).draw(data, options);
// };

const drawTreemap = (el, items) => {
  if (!el || !window.google?.visualization) return;

  const rows = (items ?? []).map((x) => [
    x.source_name,
    "Sources",
    Number(x.total) || 0,
    Number(x.total) || 0,
  ]);

  const data = window.google.visualization.arrayToDataTable([
    ["Source", "Parent", "Total", "Color"],
    ["Sources", null, 0, 0],
    ...rows,
  ]);

  const options = {
    title: "Competency Sources (Treemap)",
    headerHeight: 22,
    fontColor: "black",
    showScale: true,
    chartArea: { width: "95%", height: "85%" },

    // ✅ This forces tooltip to include the numbers
    generateTooltip: (row, size, value) => {
      // row 0 is the root ("Sources")
      if (row === 0) return "";

      const name = data.getValue(row, 0);
      const total = data.getValue(row, 2);

      return `
        <div style="padding:10px 12px;">
          <div style="font-weight:700; margin-bottom:6px;">${name}</div>
          <div>Total competencies: <b>${total}</b></div>
        </div>
      `;
    },
  };

  const chart = new window.google.visualization.TreeMap(el);
  chart.draw(data, options);
};

const AdminStatistics = () => {
  const statusChartRef = useRef(null);
  const typesChartRef = useRef(null);
  const sourceChartRef = useRef(null);

  const [statusStats, setStatusStats] = useState(null); // { total, countsById, percentagesById }
  const [typeStats, setTypeStats] = useState(null);     // { topType, items, totalAllVerifications }
  const [sourceStats, setSourceStats] = useState(null); // { items: [{source_id, source_name, total}] }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getNum = (obj, key) => {
    const v = obj?.[key];
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : 0;
  };

  const renderCharts = async () => {
    await ensureGoogleCharts();

    const pById = statusStats?.percentagesById ?? {};
    const pendingPct = getNum(pById, "1");
    const approvedPct = getNum(pById, "2");
    const rejectedPct = getNum(pById, "3");

    drawPie(statusChartRef.current, pendingPct, approvedPct, rejectedPct);
    drawColumns(typesChartRef.current, typeStats?.items ?? []);
    drawTreemap(sourceChartRef.current, sourceStats?.items ?? []);
  };

  // 1) Fetch data only
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const statusRes = await api.get("/admin/statistics");
        const typesRes = await api.get("/admin/statistics/top-competency-types");
        const sourcesRes = await api.get("/admin/statistics/competency-sources");

        if (!isMounted) return;

        setStatusStats(statusRes.data);
        setTypeStats(typesRes.data);
        setSourceStats(sourcesRes.data);
      } catch (e) {
        console.log("STAT ERROR STATUS:", e?.response?.status);
        console.log("STAT ERROR DATA:", e?.response?.data);
        console.log("STAT ERROR MESSAGE:", e?.message);
        if (isMounted) setError("Failed to load statistics.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2) Draw charts when DOM + data are ready
  useEffect(() => {
    if (loading || error) return;
    if (!statusStats || !typeStats || !sourceStats) return;
    if (!statusChartRef.current || !typesChartRef.current || !sourceChartRef.current) return;

    requestAnimationFrame(() => {
      renderCharts();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, statusStats, typeStats, sourceStats]);

  // 3) Redraw on resize
  useEffect(() => {
    const onResize = () => {
      if (loading || error) return;
      if (!statusStats || !typeStats || !sourceStats) return;
      renderCharts();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, statusStats, typeStats, sourceStats]);

  // KPI values
  const totalVerifications = Number.isFinite(statusStats?.total) ? statusStats.total : 0;

  const cById = statusStats?.countsById ?? {};
  const pById = statusStats?.percentagesById ?? {};

  const pendingCount = getNum(cById, "1");
  const approvedCount = getNum(cById, "2");
  const rejectedCount = getNum(cById, "3");

  const pendingPct = getNum(pById, "1");
  const approvedPct = getNum(pById, "2");
  const rejectedPct = getNum(pById, "3");

  const mostCommon = typeStats?.topType;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-indigo-900 mb-6">Statistics</h1>

      {loading && <div className="text-gray-600">Loading...</div>}

      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded shadow">
              <div className="text-gray-500">Total Verifications</div>
              <div className="text-2xl font-bold">{totalVerifications}</div>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <div className="text-gray-500">Pending</div>
              <div className="text-2xl font-bold">
                {pendingCount} ({pendingPct}%)
              </div>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <div className="text-gray-500">Approved</div>
              <div className="text-2xl font-bold">
                {approvedCount} ({approvedPct}%)
              </div>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <div className="text-gray-500">Rejected</div>
              <div className="text-2xl font-bold">
                {rejectedCount} ({rejectedPct}%)
              </div>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <div className="text-gray-500">Most Common Type</div>
              <div className="text-xl font-bold">{mostCommon ? mostCommon.type_name : "N/A"}</div>
              <div className="text-gray-600">
                {mostCommon ? `${mostCommon.total} (${mostCommon.percentage}%)` : ""}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <div
              ref={statusChartRef}
              style={{ width: "100%", height: 380 }}
              aria-label="Verification Status Pie Chart"
            />
          </div>

          {/* Column Chart */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <div
              ref={typesChartRef}
              style={{ width: "100%", height: 380 }}
              aria-label="Top Competency Types Column Chart"
            />
          </div>

          {/* Treemap (WOW) */}
          <div className="bg-white p-6 rounded shadow">
            <div
              ref={sourceChartRef}
              style={{ width: "100%", height: 420 }}
              aria-label="Competency Sources Treemap"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminStatistics;