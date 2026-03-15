"use client";

import { KeyboardEvent, useState } from "react";
import { Facility } from "@/lib/types";

interface FacilityDashboardProps {
  facility: Facility;
  onBackToFacilities?: () => void;
}

/* ── Seed data for charts ────────────────────────── */

const MONTH_SHORT = new Date().toLocaleDateString("en-US", { month: "short" }).toUpperCase();
const TODAY_MONTH_YEAR = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

const DAILY_VOLUME = [
  { day: `01 ${MONTH_SHORT}`, value: 62 },
  { day: `04 ${MONTH_SHORT}`, value: 45 },
  { day: `08 ${MONTH_SHORT}`, value: 78 },
  { day: `11 ${MONTH_SHORT}`, value: 55 },
  { day: `15 ${MONTH_SHORT}`, value: 90 },
  { day: `18 ${MONTH_SHORT}`, value: 70 },
  { day: `22 ${MONTH_SHORT}`, value: 95 },
  { day: `25 ${MONTH_SHORT}`, value: 85 },
  { day: `29 ${MONTH_SHORT}`, value: 88 },
];

const HEATMAP_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/* Most escalated role: role that receives the highest number of escalations */
const ESCALATED_ROLE_DATA = [
  { role: "Emergency Doctor On Call", escalations: 142, acknowledgment: 98 },
  { role: "Charge Nurse", escalations: 118, acknowledgment: 105 },
  { role: "Resident Physician", escalations: 76, acknowledgment: 72 },
  { role: "Attending Physician", escalations: 62, acknowledgment: 58 },
];

const ESCALATION_DATA = [
  { day: "MON", critical: 32, standard: 58 },
  { day: "TUE", critical: 45, standard: 72 },
  { day: "WED", critical: 28, standard: 65 },
  { day: "THU", critical: 52, standard: 80 },
  { day: "FRI", critical: 68, standard: 90 },
  { day: "SAT", critical: 75, standard: 85 },
  { day: "SUN", critical: 40, standard: 60 },
];

function getHeatColor(intensity: number): string {
  if (intensity <= 2) return "var(--heat-1)";
  if (intensity <= 4) return "var(--heat-2)";
  if (intensity <= 6) return "var(--heat-3)";
  if (intensity <= 8) return "var(--heat-4)";
  return "var(--heat-5)";
}

function createSeed(source: string): number {
  let seed = 0;
  for (let i = 0; i < source.length; i += 1) {
    seed = (seed * 31 + source.charCodeAt(i)) >>> 0;
  }
  return seed;
}

function seededNoise(seed: number, index: number): number {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function buildFacilityHeatmap(facility: Facility): Array<{ label: string; hours: number[] }> {
  const seed = createSeed(
    `${facility.id}|${facility.name}|${facility.city}|${facility.region}|${facility.code ?? ""}`
  );

  return HEATMAP_DAYS.map((label, dayIndex) => {
    const hours = Array.from({ length: 24 }, (_, hour) => {
      const officeHoursBoost = hour >= 8 && hour <= 18 ? 2.4 : 0;
      const middayBoost = hour >= 11 && hour <= 14 ? 1.3 : 0;
      const weekendDip = dayIndex >= 5 ? -1 : 0;
      const wave = (Math.sin(((hour + dayIndex * 1.7) / 24) * Math.PI * 2) + 1) * 1.7;
      const noise = seededNoise(seed, dayIndex * 24 + hour) * 2.2;
      const intensity = Math.round(1 + officeHoursBoost + middayBoost + weekendDip + wave + noise);
      return Math.max(1, Math.min(10, intensity));
    });

    return { label, hours };
  });
}

export function FacilityDashboard({ facility, onBackToFacilities }: FacilityDashboardProps) {
  const [activeDonutSegment, setActiveDonutSegment] = useState<"critical" | "standard">(
    "critical"
  );
  const maxVolume = Math.max(...DAILY_VOLUME.map((d) => d.value));
  const maxEscalation = Math.max(
    ...ESCALATION_DATA.flatMap((d) => [d.critical, d.standard])
  );
  const totalCritical = ESCALATION_DATA.reduce((sum, item) => sum + item.critical, 0);
  const totalStandard = ESCALATION_DATA.reduce((sum, item) => sum + item.standard, 0);
  const totalEscalations = totalCritical + totalStandard;
  const criticalPct = totalEscalations === 0
    ? 0
    : Math.round((totalCritical / totalEscalations) * 100);
  const standardPct = 100 - criticalPct;
  const donutCircumference = 251.3;
  const activeDonutPct =
    activeDonutSegment === "critical" ? criticalPct : standardPct;
  const activeDonutLabel =
    activeDonutSegment === "critical" ? "CRITICAL" : "STANDARD";
  const maxRoleTotal = Math.max(
    ...ESCALATED_ROLE_DATA.map((d) => d.escalations + d.acknowledgment)
  );
  const roleAxisMax = Math.ceil(maxRoleTotal / 50) * 50;
  const topEscalatedRole = ESCALATED_ROLE_DATA[0]?.role ?? "—";
  const roleAxisTicks = Array.from(
    { length: roleAxisMax / 50 + 1 },
    (_, index) => index * 50
  );
  const facilityHeatmap = buildFacilityHeatmap(facility);

  const handleDonutKey = (
    event: KeyboardEvent<SVGCircleElement>,
    segment: "critical" | "standard"
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveDonutSegment(segment);
    }
  };

  return (
    <div className="facility-dashboard">
      {onBackToFacilities && (
        <div className="fd-back-bar">
          <button type="button" className="fd-back-link" onClick={onBackToFacilities}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to facilities
          </button>
        </div>
      )}
      {/* ── Stat Cards ─────────────────────────────── */}
      <div className="fd-stats-row">
        {/* Card 1 */}
        <div className="fd-stat-card">
          <div className="fd-card-header">
            <div className="fd-card-title-group">
              <span className="fd-card-icon" style={{ background: "#735cff" }}>TM</span>
              <div className="fd-card-title-text">
                <h3>Total Messages</h3>
                <p>System Volume</p>
              </div>
            </div>
            <span className="fd-trend-badge positive">↗︎ 12.4%</span>
          </div>
          <div className="fd-stat-value">128,542</div>
          <div className="fd-card-footer">
            <span>Last 30 Days</span>
            <span className="fd-footer-highlight">{TODAY_MONTH_YEAR}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="fd-stat-card">
          <div className="fd-card-header">
            <div className="fd-card-title-group">
              <span className="fd-card-icon" style={{ background: "#058863" }}>OH</span>
              <div className="fd-card-title-text">
                <h3>Total Calls Made</h3>
                <p>Cumulative</p>
              </div>
            </div>
            <span className="fd-trend-badge positive">↗︎ 5.2%</span>
          </div>
          <div className="fd-stat-value">84</div>
          <div className="fd-card-footer">
            <span>Audit Score</span>
            <span className="fd-footer-highlight">Top 15%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="fd-stat-card">
          <div className="fd-card-header">
            <div className="fd-card-title-group">
              <span className="fd-card-icon" style={{ background: "#d93f3f" }}>AR</span>
              <div className="fd-card-title-text">
                <h3>Avg Response</h3>
                <p>Critical Alerts</p>
              </div>
            </div>
            <span className="fd-trend-badge negative">↘︎ 0.8%</span>
          </div>
          <div className="fd-stat-value">4.2 min</div>
          <div className="fd-card-footer">
            <span>SLA Target: &lt;5m</span>
            <span className="fd-footer-highlight">On Track</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="fd-stat-card">
          <div className="fd-card-header">
            <div className="fd-card-title-group">
              <span className="fd-card-icon" style={{ background: "#d97a26" }}>ER</span>
              <div className="fd-card-title-text">
                <h3>Escalation Rate</h3>
                <p>% Escalated</p>
              </div>
            </div>
            <span className="fd-trend-badge positive">↗︎ 1.5%</span>
          </div>
          <div className="fd-stat-value">15%</div>
          <div className="fd-card-footer">
            <span>Active Users</span>
            <span className="fd-footer-highlight">High</span>
          </div>
        </div>
      </div>

      {/* ── Messaging Activity: Volume Trend + Type Distribution ── */}
      <div className="fd-section">
        <div className="fd-charts-row">
          {/* Daily Volume Trend */}
          <div className="fd-chart-card fd-chart-wide">
            <div className="fd-section-header fd-section-header-in-card">
              <div className="fd-section-indicator" />
              <h2>MESSAGING ACTIVITY</h2>
              <span className="fd-time-badge">LAST 30 DAYS</span>
            </div>
            <h3 className="fd-chart-title">DAILY VOLUME TREND</h3>
            <div className="fd-area-chart">
              <div className="fd-area-chart-bars">
                {DAILY_VOLUME.map((d, i) => (
                  <div
                    key={i}
                    className="fd-area-bar-col"
                    title={`${d.day}: ${d.value} calls`}
                    role="img"
                    aria-label={`${d.day} ${d.value} calls`}
                  >
                    <div
                      className="fd-area-bar"
                      style={{ height: `${(d.value / maxVolume) * 100}%` }}
                    >
                      <div className="fd-area-bar-fill" />
                    </div>
                    <span className="fd-area-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Critical vs Standard Donut */}
          <div className="fd-chart-card fd-chart-narrow">
            <h3 className="fd-chart-title">TYPE DISTRIBUTION</h3>
            <div className="fd-donut-container">
              <div className="fd-donut">
                <svg viewBox="0 0 100 100" className="fd-donut-svg">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="16" />
                  {/* Critical */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#fb544d"
                    strokeWidth="16"
                    strokeDasharray={`${donutCircumference * (criticalPct / 100)} ${donutCircumference * (1 - criticalPct / 100)}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                    className={`fd-donut-segment ${
                      activeDonutSegment === "critical"
                        ? "fd-donut-segment-active"
                        : "fd-donut-segment-dim"
                    }`}
                    tabIndex={0}
                    role="button"
                    aria-label={`Critical ${criticalPct}%`}
                    onMouseEnter={() => setActiveDonutSegment("critical")}
                    onClick={() => setActiveDonutSegment("critical")}
                    onKeyDown={(event) => handleDonutKey(event, "critical")}
                  />
                  {/* Standard */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="16"
                    strokeDasharray={`${donutCircumference * (standardPct / 100)} ${donutCircumference * (1 - standardPct / 100)}`}
                    strokeDashoffset={`${-donutCircumference * (criticalPct / 100)}`}
                    transform="rotate(-90 50 50)"
                    className={`fd-donut-segment ${
                      activeDonutSegment === "standard"
                        ? "fd-donut-segment-active"
                        : "fd-donut-segment-dim"
                    }`}
                    tabIndex={0}
                    role="button"
                    aria-label={`Standard ${standardPct}%`}
                    onMouseEnter={() => setActiveDonutSegment("standard")}
                    onClick={() => setActiveDonutSegment("standard")}
                    onKeyDown={(event) => handleDonutKey(event, "standard")}
                  />
                </svg>
                <div className="fd-donut-center">
                  <span className="fd-donut-pct">{activeDonutPct}%</span>
                  <span
                    className="fd-donut-label"
                    style={{
                      color:
                        activeDonutSegment === "critical" ? "#fb544d" : "var(--primary)"
                    }}
                  >
                    {activeDonutLabel}
                  </span>
                </div>
              </div>
              <div className="fd-donut-legend">
                <button
                  type="button"
                  className={`fd-legend-item fd-donut-legend-btn ${
                    activeDonutSegment === "critical" ? "fd-donut-legend-btn-active" : ""
                  }`}
                  onMouseEnter={() => setActiveDonutSegment("critical")}
                  onClick={() => setActiveDonutSegment("critical")}
                >
                  <span className="fd-legend-dot" style={{ background: "#fb544d" }} />
                  <span>{criticalPct}% Critical</span>
                </button>
                <button
                  type="button"
                  className={`fd-legend-item fd-donut-legend-btn ${
                    activeDonutSegment === "standard" ? "fd-donut-legend-btn-active" : ""
                  }`}
                  onMouseEnter={() => setActiveDonutSegment("standard")}
                  onClick={() => setActiveDonutSegment("standard")}
                >
                  <span className="fd-legend-dot" style={{ background: "var(--primary)" }} />
                  <span>{standardPct}% Standard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Peak Hours Heatmap ─────────────────────── */}
      <div className="fd-section">
        <div className="fd-chart-card fd-heatmap-card">
          <div className="fd-heatmap-card-head">
            <div className="fd-section-header fd-section-header-tight">
              <div className="fd-section-indicator" />
              <h2>PEAK HOURS HEATMAP</h2>
            </div>
            <div className="fd-heat-legend">
              <span className="fd-heat-legend-label">Low</span>
              <span className="fd-heat-swatch" style={{ background: "var(--heat-1)" }} />
              <span className="fd-heat-swatch" style={{ background: "var(--heat-2)" }} />
              <span className="fd-heat-swatch" style={{ background: "var(--heat-3)" }} />
              <span className="fd-heat-swatch" style={{ background: "var(--heat-4)" }} />
              <span className="fd-heat-swatch" style={{ background: "var(--heat-5)" }} />
              <span className="fd-heat-legend-label">Peak</span>
            </div>
          </div>

          <div className="fd-heatmap">
            {/* Hour headers */}
            <div className="fd-heatmap-header">
              <div className="fd-heatmap-label-cell">DAY</div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="fd-heatmap-hour">
                  {i.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
            {/* Rows */}
            {facilityHeatmap.map((row, ri) => (
              <div key={ri} className="fd-heatmap-row">
                <div className="fd-heatmap-label-cell">{row.label}</div>
                {row.hours.map((val, ci) => (
                  <div
                    key={ci}
                    className="fd-heatmap-cell"
                    style={{ background: getHeatColor(val) }}
                    title={`${facility.name} · ${row.label} @ ${ci
                      .toString()
                      .padStart(2, "0")}:00 — intensity: ${val}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Volume by Department + Critical vs Standard ── */}
      <div className="fd-section">
        <div className="fd-charts-row">
          {/* Most Escalated Role */}
          <div className="fd-chart-card fd-chart-half fd-reimbursement-card fd-escalated-role-card">
            <div className="fd-reimburse-header">
              <div>
                <h3 className="fd-reimburse-title">Most Escalated Role</h3>
                <p className="fd-reimburse-subtitle">Roles receiving highest escalations</p>
              </div>
              <div className="fd-reimburse-total">Top: {topEscalatedRole}</div>
            </div>

            <div className="fd-reimburse-bars">
              {ESCALATED_ROLE_DATA.map((item) => (
                <div
                  key={item.role}
                  className="fd-reimburse-row"
                  title={`${item.role}: ${item.escalations} escalations, ${item.acknowledgment} acknowledged`}
                >
                  <span className="fd-reimburse-label">{item.role}</span>
                  <div className="fd-reimburse-track">
                    <div
                      className="fd-reimburse-segment fd-reimburse-segment-outstanding"
                      style={{ width: `${(item.escalations / roleAxisMax) * 100}%` }}
                      title={`Escalations: ${item.escalations}`}
                    />
                    <div
                      className="fd-reimburse-segment fd-reimburse-segment-paid"
                      style={{ width: `${(item.acknowledgment / roleAxisMax) * 100}%` }}
                      title={`Acknowledged: ${item.acknowledgment}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="fd-reimburse-axis">
              {roleAxisTicks.map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>

            <div className="fd-reimburse-legend">
              <div className="fd-reimburse-legend-item">
                <span className="fd-reimburse-legend-dot fd-reimburse-legend-dot-outstanding" />
                <span>Escalations</span>
              </div>
              <div className="fd-reimburse-legend-item">
                <span className="fd-reimburse-legend-dot fd-reimburse-legend-dot-paid" />
                <span>Acknowledgment</span>
              </div>
            </div>
          </div>

          {/* Calls Made vs Calls Missed */}
          <div className="fd-chart-card fd-chart-half">
            <div className="fd-section-header">
              <div className="fd-section-indicator" />
              <h2>Calls Made vs Calls Missed</h2>
            </div>
            <div className="fd-escalation-legend">
              <div className="fd-legend-item">
                <span className="fd-legend-dot" style={{ background: "var(--primary)" }} />
                <span>Calls Made</span>
              </div>
              <div className="fd-legend-item">
                <span className="fd-legend-dot" style={{ background: "var(--escalation-standard)" }} />
                <span>Calls Missed</span>
              </div>
            </div>
            <div className="fd-grouped-bar-chart">
              {ESCALATION_DATA.map((d, i) => (
                <div key={i} className="fd-grouped-col">
                  <div className="fd-grouped-bars">
                    <div
                      className="fd-grouped-bar fd-bar-critical"
                      style={{ height: `${(d.critical / maxEscalation) * 100}%` }}
                      title={`Calls Made: ${d.critical}`}
                    />
                    <div
                      className="fd-grouped-bar fd-bar-standard"
                      style={{ height: `${(d.standard / maxEscalation) * 100}%` }}
                      title={`Calls Missed: ${d.standard}`}
                    />
                  </div>
                  <span className="fd-grouped-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Engagement & Health Benchmarks ──────── */}
      <div className="fd-section">
        <div className="fd-section-header">
          <div className="fd-section-indicator" />
          <h2>ENGAGEMENT &amp; HEALTH BENCHMARKS</h2>
        </div>
        <div className="fd-charts-row">
          <div className="fd-chart-card fd-chart-half fd-active-users-chart">
            <h3 className="fd-chart-title">Active Users Rate</h3>
            <p className="fd-chart-subtitle">
              % of registered staff active on the app within the selected period
            </p>
            <div className="fd-bar-legend fd-active-users-legend">
              <span className="fd-bar-legend-item">
                <span className="fd-bar-legend-swatch fd-bar-swatch-rounded" />
                <span>Previous period</span>
              </span>
              <span className="fd-bar-legend-item">
                <span className="fd-bar-legend-swatch fd-bar-swatch-radius" />
                <span>Current period</span>
              </span>
            </div>
            <div className="fd-active-users-vertical">
              {(() => {
                const activeUsersData = [
                  { name: "This Week", current: 92, previous: 88 },
                  { name: "Last 2 Wk", current: 85, previous: 82 },
                  { name: "Last Month", current: 78, previous: 76 },
                  { name: "Nursing", current: 91, previous: 87 },
                  { name: "Physicians", current: 84, previous: 80 },
                ];
                const maxVal = Math.max(
                  ...activeUsersData.flatMap((d) => [d.current, d.previous])
                );
                return activeUsersData.map((d, i) => (
                  <div
                    key={i}
                    className="fd-active-users-col"
                    title={`${d.name} — Current: ${d.current}%, Previous: ${d.previous}%`}
                  >
                    <div className="fd-active-users-bars">
                      <div
                        className="fd-active-users-bar fd-active-users-bar-rounded"
                        style={{ height: `${(d.previous / maxVal) * 100}%` }}
                        title={`Previous: ${d.previous}%`}
                      />
                      <div
                        className="fd-active-users-bar fd-active-users-bar-radius"
                        style={{ height: `${(d.current / maxVal) * 100}%` }}
                        title={`Current: ${d.current}%`}
                      />
                    </div>
                    <span className="fd-active-users-label">{d.name}</span>
                    <span className="fd-active-users-values">
                      <strong>{d.current}%</strong>
                      <em>{d.previous}%</em>
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="fd-chart-card fd-chart-half fd-benchmark-stacked">
            <h3 className="fd-chart-title fd-chart-title-bold">Message Mix</h3>
            <p className="fd-chart-subtitle">
              Direct Messages vs Broadcast Messages vs Inter-Role Messages
            </p>
            <div className="fd-benchmark-legend">
              <span className="fd-benchmark-legend-item">
                <span className="fd-benchmark-legend-swatch" style={{ background: "#e54d47" }} />
                <span>Direct Messages</span>
              </span>
              <span className="fd-benchmark-legend-item">
                <span className="fd-benchmark-legend-swatch" style={{ background: "#5b9bd5" }} />
                <span>Broadcast Messages</span>
              </span>
              <span className="fd-benchmark-legend-item">
                <span className="fd-benchmark-legend-swatch" style={{ background: "var(--primary)" }} />
                <span>Inter-Role Messages</span>
              </span>
            </div>
            <div className="fd-benchmark-stacked-chart">
              {(() => {
                const benchmarkData = [
                  { month: "Jan", values: [45, 55, 70] },
                  { month: "Feb", values: [80, 40, 90] },
                  { month: "Mar", values: [30, 90, 60] },
                  { month: "Apr", values: [60, 50, 50] },
                  { month: "May", values: [70, 80, 80] },
                  { month: "Jun", values: [50, 65, 100] },
                  { month: "Jul", values: [65, 70, 75] },
                ];
                const maxSum = Math.max(...benchmarkData.map((d) => d.values[0] + d.values[1] + d.values[2]));
                return benchmarkData.map((d, i) => {
                  const sum = d.values[0] + d.values[1] + d.values[2];
                  const barHeight = (sum / maxSum) * 100;
                  return (
                    <div key={i} className="fd-benchmark-col" title={`${d.month}: Direct ${d.values[0]}, Broadcast ${d.values[1]}, Inter-Role ${d.values[2]}`}>
                      <div
                        className="fd-benchmark-stacked-bar"
                        style={{
                          bottom: "0",
                          height: `${barHeight}%`,
                        }}
                      >
                        <div className="fd-benchmark-segment fd-benchmark-seg-1" style={{ height: `${(d.values[0] / sum) * 100}%` }} />
                        <div className="fd-benchmark-segment fd-benchmark-seg-2" style={{ height: `${(d.values[1] / sum) * 100}%` }} />
                        <div className="fd-benchmark-segment fd-benchmark-seg-3" style={{ height: `${(d.values[2] / sum) * 100}%` }} />
                      </div>
                      <span className="fd-benchmark-month">{d.month}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
