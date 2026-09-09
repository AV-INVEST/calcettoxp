"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Trophy, Minus } from "lucide-react";

export interface CareerIndexDataPoint {
  date: string | Date;
  value: number;
  result?: "WIN" | "DRAW" | "LOSS";
  matchId?: string;
  before?: number;
  after?: number;
  delta?: number;
}

export interface CareerIndexChartProps {
  data: CareerIndexDataPoint[];
  height?: number;
  showTooltip?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CareerIndexDataPoint & { displayDate: string };
  }>;
  label?: string;
}

const resultStyles: Record<
  NonNullable<CareerIndexDataPoint["result"]>,
  { bg: string; border: string; text: string; icon: LucideIcon }
> = {
  WIN: {
    bg: "rgba(34, 197, 94, 0.15)",
    border: "rgba(34, 197, 94, 0.4)",
    text: "#4ADE80",
    icon: Trophy,
  },
  DRAW: {
    bg: "rgba(148, 163, 184, 0.15)",
    border: "rgba(148, 163, 184, 0.4)",
    text: "#94A3B8",
    icon: Minus,
  },
  LOSS: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.4)",
    text: "#F87171",
    icon: Trophy,
  },
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;
  const isPositive = (point.delta ?? 0) >= 0;

  return (
    <div
      className="rounded-xl p-3 min-w-[200px]"
      style={{
        background:
          "linear-gradient(145deg, rgba(17, 23, 19, 0.98), rgba(10, 14, 11, 0.98))",
        border: "1px solid rgba(124, 255, 107, 0.2)",
        backdropFilter: "blur(8px)",
        boxShadow:
          "0 12px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
      }}
    >
      {/* Date */}
      <div className="mb-2.5 pb-2" style={{
        borderBottom: "1px solid rgba(124, 255, 107, 0.1)",
      }}>
        <div className="text-[10px] font-semibold text-textMuted uppercase tracking-widest mb-0.5">
          Data
        </div>
        <div className="text-sm font-bold text-textPrimary">
          {point.displayDate}
        </div>
      </div>

      {/* Result badge if present */}
      {point.result && (
        <div className="mb-2.5">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider"
            style={{
              background: resultStyles[point.result].bg,
              border: `1px solid ${resultStyles[point.result].border}`,
              color: resultStyles[point.result].text,
            }}
          >
            {(() => {
              const Icon = resultStyles[point.result].icon;
              return point.result === "LOSS" ? (
                <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                  <Icon size={12} />
                </span>
              ) : (
                <Icon size={12} />
              );
            })()}
            {point.result}
          </div>
        </div>
      )}

      {/* CI Value */}
      <div className="mb-2">
        <div className="text-[10px] font-semibold text-textMuted uppercase tracking-widest mb-0.5">
          Career Index
        </div>
        <div
          className="text-xl font-black tabular-nums"
          style={{ color: "#7CFF6B" }}
        >
          {point.value.toFixed(1)}
        </div>
      </div>

      {/* Before / After / Delta */}
      {(point.before !== undefined || point.after !== undefined || point.delta !== undefined) && (
        <div className="space-y-1.5 pt-2" style={{
          borderTop: "1px solid rgba(124, 255, 107, 0.1)",
        }}>
          {point.before !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
                Prima
              </span>
              <span className="text-xs font-bold text-textMuted tabular-nums">
                {point.before.toFixed(1)}
              </span>
            </div>
          )}
          {point.after !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
                Dopo
              </span>
              <span className="text-xs font-bold text-textPrimary tabular-nums">
                {point.after.toFixed(1)}
              </span>
            </div>
          )}
          {point.delta !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
                Variazione
              </span>
              <div
                className="flex items-center gap-1 text-xs font-bold tabular-nums"
                style={{
                  color: isPositive ? "#4ADE80" : "#F87171",
                }}
              >
                {isPositive ? (
                  <TrendingUp size={11} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={11} strokeWidth={2.5} />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {point.delta.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CareerIndexChart({
  data,
  height = 280,
  showTooltip = true,
}: CareerIndexChartProps) {
  const normalizedData = data.map((d) => {
    const dateObj = d.date instanceof Date ? d.date : new Date(d.date);
    return {
      ...d,
      displayDate: format(dateObj, "dd/MM/yyyy"),
      displayMonth: format(dateObj, "dd/MM"),
    };
  });

  const isTrendPositive =
    normalizedData.length >= 2
      ? normalizedData[normalizedData.length - 1].value >=
        normalizedData[0].value
      : true;

  const lineColor = isTrendPositive ? "#22C55E" : "#EF4444";
  const lineGradientId = "ciLineGradient";

  return (
    <div
      className="w-full rounded-2xl p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(17, 23, 19, 0.6), rgba(10, 14, 11, 0.8))",
        border: "1px solid rgba(124, 255, 107, 0.1)",
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={normalizedData}
          margin={{ top: 16, right: 16, left: -8, bottom: 8 }}
        >
          <defs>
            <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="0%"
                stopColor={lineColor}
                stopOpacity={isTrendPositive ? 0.9 : 0.9}
              />
              <stop
                offset="100%"
                stopColor={isTrendPositive ? "#7CFF6B" : "#FCA5A5"}
                stopOpacity={1}
              />
            </linearGradient>
            <filter id="ciGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(139, 150, 141, 0.12)"
            vertical={false}
          />

          <XAxis
            dataKey="displayMonth"
            tick={{
              fill: "#8B968D",
              fontSize: 11,
              fontWeight: 500,
            }}
            axisLine={{
              stroke: "rgba(139, 150, 141, 0.2)",
            }}
            tickLine={false}
            interval="preserveStartEnd"
            dy={6}
          />

          <YAxis
            tick={{
              fill: "#8B968D",
              fontSize: 11,
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={["auto", "auto"]}
            tickFormatter={(v) => v.toFixed(0)}
          />

          {showTooltip && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(124, 255, 107, 0.2)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
          )}

          <Legend
            verticalAlign="top"
            height={0}
            wrapperStyle={{ display: "none" }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={`url(#${lineGradientId})`}
            strokeWidth={2.5}
            dot={{
              fill: "#111713",
              stroke: lineColor,
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              fill: lineColor,
              stroke: "#111713",
              strokeWidth: 2,
              r: 6,
              filter: "url(#ciGlow)",
            }}
            filter="url(#ciGlow)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
