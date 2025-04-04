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

// A custom bar shape that draws a line at the end of each bar instead of a rectangle
function EndTickShape(props: any) {
  const { x, y, width, height, fill } = props;
  // For a horizontal bar, x is the left edge, x+width is the right edge
  const endX = x + width;
  return (
    <g>
      {/* A vertical line to mark the bar's end */}
      <line
        x1={endX}
        y1={y}
        x2={endX}
        y2={y + height}
        stroke={fill}
        strokeWidth={3}
      />
    </g>
  );
}

// Dimension descriptions for "low"/"high" text
const DIMENSION_DESCRIPTIONS = {
  Esteem: { low: "low", high: "prideful" },
  Trust: { low: "low", high: "high" },
  "Business Drive": { low: "low", high: "high" },
  Adaptability: { low: "low", high: "high" },
  "Problem Resolution": { low: "avoid", high: "engage" },
  Coachability: { low: "resistant", high: "receptive" }
};

// Example dimension color map
const DIMENSION_COLORS = {
  Esteem: "#4169E1",
  Trust: "#20B2AA",
  "Business Drive": "#9370DB",
  Adaptability: "#3CB371",
  "Problem Resolution": "#FF7F50",
  Coachability: "#22c55e"
};

// Standard Recharts tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border shadow-sm rounded-md">
        <p className="font-semibold">{data.dimension || data.name}</p>
        {data.score !== undefined ? (
          <p>Score: {data.score.toFixed(2)}</p>
        ) : (
          <>
            <p>Self Score: {data.selfScore?.toFixed(2)}</p>
            <p>Others Score: {data.othersScore?.toFixed(2)}</p>
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

// The main chart component
export default function DimensionChart({ scores }: { scores: DimensionScore[] }) {
  const isMobile = useIsMobile();

  // Filter out Coachability if you only want "main" dimensions
  const filteredScores = scores.filter(score => {
    const scoreName =
      "dimension" in score ? score.dimension : (score as any).name;
    return scoreName !== "Coachability";
  });

  // Early return if no data
  if (!filteredScores || filteredScores.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Check if single "score" or "selfScore"/"othersScore"
  const isIndividualScores =
    "score" in filteredScores[0] || !("selfScore" in filteredScores[0]);

  // Build chart data
  const chartData = filteredScores.map(original => {
    const dimensionName = (original as any).dimension || (original as any).name;
    const descriptions =
      DIMENSION_DESCRIPTIONS[dimensionName] || { low: "low", high: "high" };

    if (isIndividualScores) {
      const s = original as any;
      const normalizedScore =
        ((s.score - s.min) / (s.max - s.min)) * 100 || 0;

      return {
        dimension: dimensionName,
        score: s.score,
        min: s.min,
        max: s.max,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        normalizedScore,
        lowLabel: descriptions.low,
        highLabel: descriptions.high
      };
    } else {
      // aggregator scenario
      const s = original as any;
      const normalizedSelfScore =
        ((s.selfScore - s.min) / (s.max - s.min)) * 100 || 0;
      const normalizedOthersScore =
        ((s.othersScore - s.min) / (s.max - s.min)) * 100 || 0;

      return {
        dimension: dimensionName,
        selfScore: s.selfScore,
        othersScore: s.othersScore,
        min: s.min,
        max: s.max,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        normalizedSelfScore,
        normalizedOthersScore,
        lowLabel: descriptions.low,
        highLabel: descriptions.high
      };
    }
  });

  // A single custom Y-axis tick that also displays "low" and "high" text
  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const item = chartData.find(i => i.dimension === payload.value);
    if (!item) return null;

    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* "low" label on the left */}
        <text
          x={0}
          y={0}
          dy={3}
          textAnchor="end"
          fontSize={8}
          fill="#666"
        >
          {item.lowLabel}
        </text>

        {/* Dimension name (shifted further left) */}
        <text
          x={-40}
          y={0}
          dy={3}
          textAnchor="end"
          fontSize={10}
          fill="#333"
          className="font-semibold"
        >
          {payload.value}
        </text>

        {/* "high" label on the right side */}
        <text
          x={430}
          y={0}
          dy={3}
          textAnchor="start"
          fontSize={8}
          fill="#333"
        >
          {item.highLabel}
        </text>
      </g>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dimension Scores</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Center the chart with a fixed 600x400 container */}
        <div className="mx-auto" style={{ width: 600, height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 30, right: 50, left: 80, bottom: 30 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine={true}
                tickFormatter={(value) => {
                  if (value === 0) return "0";
                  if (value === 50) return "2.5";
                  if (value === 100) return "5.0";
                  return "";
                }}
                ticks={[0, 25, 50, 75, 100]}
                fontSize={isMobile ? 9 : 12}
                tick={{ fill: "#666" }}
              />
              <YAxis
                type="category"
                dataKey="dimension"
                tick={renderYAxisTick}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference lines */}
              <ReferenceLine x={25} stroke="#ddd" strokeDasharray="3 3" />
              <ReferenceLine x={50} stroke="#aaa" />
              <ReferenceLine x={75} stroke="#ddd" strokeDasharray="3 3" />

              {isIndividualScores ? (
                // Single bar with a gray background + a line at the end
                <Bar
                  dataKey="normalizedScore"
                  barSize={20}
                  shape={<EndTickShape />}
                  background={{ fill: "#f1f1f1" }}  // <-- Gray background
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="score"
                    position="right"
                    formatter={(v: number) => v.toFixed(1)}
                    style={{
                      fontSize: isMobile ? "9px" : "11px",
                      fill: "#000"
                    }}
                    offset={5}
                  />
                </Bar>
              ) : (
                <>
                  {/* Self Score bar (line) with background */}
                  <Bar
                    name="Self Score"
                    dataKey="normalizedSelfScore"
                    barSize={20}
                    shape={<EndTickShape />}
                    background={{ fill: "#f1f1f1" }}  // <-- Gray background
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-self-${index}`} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="selfScore"
                      position="right"
                      formatter={(v: number) => v.toFixed(1)}
                      style={{
                        fontSize: isMobile ? "9px" : "11px",
                        fill: "#000"
                      }}
                      offset={5}
                    />
                  </Bar>

                  {/* Others Score bar (line) with background */}
                  <Bar
                    name="Others Score"
                    dataKey="normalizedOthersScore"
                    barSize={20}
                    shape={<EndTickShape />}
                    background={{ fill: "#f1f1f1" }}  // <-- Gray background
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-others-${index}`}
                        fill={entry.color}
                        opacity={0.7}
                      />
                    ))}
                    <LabelList
                      dataKey="othersScore"
                      position="right"
                      formatter={(v: number) => v.toFixed(1)}
                      style={{
                        fontSize: isMobile ? "9px" : "11px",
                        fill: "#000"
                      }}
                      offset={25}
                    />
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
