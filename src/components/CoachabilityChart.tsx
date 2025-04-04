
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DimensionScore } from "@/types/assessment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Tooltip,
  LabelList
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoachabilityChartProps {
  scores: DimensionScore[];
}

// Simple tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border shadow-sm rounded-md">
        <p className="font-semibold">Coachability</p>
        {data.score !== undefined ? (
          <p>Score: {data.score.toFixed(2)}</p>
        ) : (
          <>
            <p>Self Score: {data.selfScore.toFixed(2)}</p>
            <p>Others Score: {data.othersScore.toFixed(2)}</p>
          </>
        )}
        <p className="text-xs text-gray-500">
          Range: {data.min} to {data.max}
        </p>
      </div>
    );
  }
  return null;
};

export default function CoachabilityChart({ scores }: CoachabilityChartProps) {
  const isMobile = useIsMobile();

  // Identify the "Coachability" dimension
  const coachabilityScore = scores.find(
    (score) => (score.dimension ?? (score as any).name) === "Coachability"
  );
  if (!coachabilityScore) return null;

  // Determine if it's single or aggregated scenario
  const isIndividualScores =
    "score" in coachabilityScore || !("selfScore" in coachabilityScore);

  // Build data for exactly one row
  const chartData: any[] = [];
  if (isIndividualScores) {
    // single user
    const c = coachabilityScore as any;
    chartData.push({
      dimension: "Coachability",
      score: c.score,
      // color logic: red if ≤30, yellow if ≤40, else green
      color: c.score <= 30 ? "#ef4444" : c.score <= 40 ? "#eab308" : "#22c55e",
      normalizedScore: c.score, // Use the actual score (10-50 scale)
      min: 10,
      max: 50,
      lowLabel: "resistant",
      highLabel: "receptive",
    });
  } else {
    // aggregator with self + others
    const c = coachabilityScore as any;
    chartData.push({
      dimension: "Coachability",
      selfScore: c.selfScore,
      othersScore: c.othersScore,
      // color logic for each
      selfColor:
        c.selfScore <= 30 ? "#ef4444" : c.selfScore <= 40 ? "#eab308" : "#22c55e",
      othersColor:
        c.othersScore <= 30
          ? "#ef4444"
          : c.othersScore <= 40
            ? "#eab308"
            : "#22c55e",
      normalizedSelfScore: c.selfScore,
      normalizedOthersScore: c.othersScore,
      min: 10,
      max: 50,
      lowLabel: "resistant",
      highLabel: "receptive",
    });
  }

  // Render custom Y-axis to show "Coachability", "resistant", "receptive"
  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const item = chartData.find((d) => d.dimension === payload.value);
    if (!item) return null;

    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* "Coachability" label near the axis */}
        <text
          x={-50}
          y={0}
          dy={3}
          textAnchor="end"
          fontSize={10}
          fill="#333"
          className="font-semibold"
        >
          {payload.value}
        </text>
        {/* Low label on far left */}
        <text
          x={-30}
          y={0}
          dy={3}
          textAnchor="start"
          fontSize={8}
          fill="#666"
          className="font-medium"
        >
          {item.lowLabel}
        </text>
        {/* High label on far right */}
        <text
          x={550}
          y={0}
          dy={3}
          textAnchor="end"
          fontSize={8}
          fill="#666"
          className="font-medium"
        >
          {item.highLabel}
        </text>
      </g>
    );
  };

  // Chart margins & label style
  const chartMargins = isMobile
    ? { top: 30, right: 70, left: 100, bottom: 20 }
    : { top: 30, right: 80, left: 150, bottom: 20 };

  const labelStyle = {
    fontSize: isMobile ? "9px" : "11px",
    fill: "#000",
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Coachability Score</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} layout="vertical" margin={chartMargins}>
            <XAxis
              type="number"
              domain={[10, 50]}
              axisLine={true}
              tickFormatter={(val) => val.toString()}
              ticks={[10, 20, 30, 40, 50]}
              fontSize={isMobile ? 9 : 12}
              tick={{ fill: "#666" }}
            />
            <YAxis
              type="category"
              dataKey="dimension"
              width={isMobile ? 100 : 150}
              tick={renderYAxisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference lines (draw them first) */}
            <ReferenceLine x={30} stroke="#ef4444" strokeWidth={2} />
            <ReferenceLine x={40} stroke="#eab308" strokeWidth={2} />

            {/* Main bar(s) on top */}
            {isIndividualScores ? (
              // Single bar
              <Bar dataKey="normalizedScore" barSize={20}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  formatter={(val: number) => val.toFixed(1)}
                  style={labelStyle}
                  offset={5}
                />
              </Bar>
            ) : (
              // Aggregated (self + others) stacked
              <>
                <Bar
                  dataKey="normalizedSelfScore"
                  barSize={20}
                  stackId="coachStack"
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.selfColor} />
                  ))}
                  <LabelList
                    dataKey="selfScore"
                    position="right"
                    formatter={(val: number) => val.toFixed(1)}
                    style={labelStyle}
                    offset={5}
                  />
                </Bar>
                <Bar
                  dataKey="normalizedOthersScore"
                  barSize={20}
                  stackId="coachStack"
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.othersColor} opacity={0.7} />
                  ))}
                  <LabelList
                    dataKey="othersScore"
                    position="right"
                    formatter={(val: number) => val.toFixed(1)}
                    style={labelStyle}
                    offset={25}
                  />
                </Bar>
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
