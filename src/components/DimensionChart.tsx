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

// A custom bar shape that draws a vertical line at the end of each bar instead of a typical rectangle
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

// Dimension descriptions for the Y-axis: "low" label on the left, "high" on the right
const DIMENSION_DESCRIPTIONS = {
  Esteem: { low: "low", high: "prideful" },
  Trust: { low: "low", high: "high" },
  "Business Drive": { low: "low", high: "high" },
  Adaptability: { low: "low", high: "high" },
  "Problem Resolution": { low: "avoid", high: "engage" },
  Coachability: { low: "resistant", high: "receptive" }
};

// Example color map, by dimension name
const DIMENSION_COLORS = {
  Esteem: "#4169E1",
  Trust: "#20B2AA",
  "Business Drive": "#9370DB",
  Adaptability: "#3CB371",
  "Problem Resolution": "#FF7F50",
  Coachability: "#22c55e"
};

// Tooltip for bar hover
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Distinguish between single "score" vs. aggregator "selfScore" / "othersScore"
    const isIndividual = data.score !== undefined;

    return (
      <div className="bg-white p-2 border shadow-sm rounded-md">
        <p className="font-semibold">{data.dimension || data.name}</p>
        {isIndividual ? (
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

// Here is your -28..+28 range
const MIN_DIM = -28;
const MAX_DIM = 28;
const RANGE_DIM = MAX_DIM - MIN_DIM; // 56

export default function DimensionChart({ scores }: { scores: DimensionScore[] }) {
  const isMobile = useIsMobile();

  // Filter out Coachability if you only want the 5 main dimensions
  const filteredScores = scores.filter(score => {
    const scoreName =
      "dimension" in score ? score.dimension : (score as any).name;
    return scoreName !== "Coachability"; // or remove this if you want to show it
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

  // Check if it's single "score" or aggregator with "selfScore"/"othersScore"
  const isIndividualScores =
    "score" in filteredScores[0] || !("selfScore" in filteredScores[0]);

  // Transform the raw data into normalized chart data
  const chartData = filteredScores.map(original => {
    const dimensionName = (original as any).dimension || (original as any).name;
    const descriptions =
      DIMENSION_DESCRIPTIONS[dimensionName] || { low: "low", high: "high" };

    if (isIndividualScores) {
      // Single dimension score
      const s = original as any;
      const normalizedScore =
        ((s.score - MIN_DIM) / RANGE_DIM) * 100 || 0; // map -28..+28 => 0..100

      return {
        dimension: dimensionName,
        score: s.score,
        min: MIN_DIM,
        max: MAX_DIM,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        normalizedScore,
        lowLabel: descriptions.low,
        highLabel: descriptions.high
      };
    } else {
      // aggregator scenario: selfScore + othersScore
      const s = original as any;
      const normalizedSelfScore =
        ((s.selfScore - MIN_DIM) / RANGE_DIM) * 100 || 0;
      const normalizedOthersScore =
        ((s.othersScore - MIN_DIM) / RANGE_DIM) * 100 || 0;

      return {
        dimension: dimensionName,
        selfScore: s.selfScore,
        othersScore: s.othersScore,
        min: MIN_DIM,
        max: MAX_DIM,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        normalizedSelfScore,
        normalizedOthersScore,
        lowLabel: descriptions.low,
        highLabel: descriptions.high
      };
    }
  });

  // Custom Y-axis tick that displays the dimension name plus "low"/"high" text
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
              {/* 
                X-axis from 0..100 because we're normalizing dimension scores. 
                We want displayed ticks at -28..+28, so we do a "tickFormatter".
              */}
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine
                tickLine
                ticks={[0, 25, 50, 75, 100]}
                fontSize={isMobile ? 9 : 12}
                tick={{ fill: "#666" }}
                tickFormatter={(value: number) => {
                  // Convert 0..100 back to -28..+28
                  const realVal = (value / 100) * RANGE_DIM + MIN_DIM;
                  return realVal.toFixed(0);
                }}
              />
              <YAxis
                type="category"
                dataKey="dimension"
                tick={renderYAxisTick}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* 
                Reference lines at x=25 => -14, x=50 => 0, x=75 => +14 
                (based on the same normalization: (realVal+28)/56*100 )
              */}
              <ReferenceLine x={25} stroke="#ddd" strokeDasharray="3 3" />
              <ReferenceLine x={50} stroke="#aaa" />
              <ReferenceLine x={75} stroke="#ddd" strokeDasharray="3 3" />

              {isIndividualScores ? (
                // Single dimension score bar
                <Bar
                  dataKey="normalizedScore"
                  barSize={20}
                  shape={<EndTickShape />}
                  background={{ fill: "#f1f1f1" }}
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
                  {/* Self Score */}
                  <Bar
                    name="Self Score"
                    dataKey="normalizedSelfScore"
                    barSize={20}
                    shape={<EndTickShape />}
                    background={{ fill: "#f1f1f1" }}
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

                  {/* Others Score */}
                  <Bar
                    name="Others Score"
                    dataKey="normalizedOthersScore"
                    barSize={20}
                    shape={<EndTickShape />}
                    background={{ fill: "#f1f1f1" }}
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
