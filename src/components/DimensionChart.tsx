
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
  LabelList,
  Legend
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
    
    return (
      <div className="bg-white p-2 border shadow-sm rounded-md">
        <p className="font-semibold">{data.dimension || data.name}</p>
        {data.score !== undefined ? (
          <p>Score: {data.score}</p>
        ) : (
          <>
            {data.selfScore !== undefined && <p>Self Score: {data.selfScore}</p>}
            {data.rater1Score !== undefined && <p>Rater 1 Score: {data.rater1Score}</p>}
            {data.rater2Score !== undefined && <p>Rater 2 Score: {data.rater2Score}</p>}
            {data.averageScore !== undefined && <p>Average Score: {data.averageScore}</p>}
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

  // Check if it's single "score" or aggregator with "selfScore"/"rater1Score"/"rater2Score"
  const isIndividualScores =
    "score" in filteredScores[0] || !("selfScore" in filteredScores[0]);

  // Transform the raw data into chart data
  const chartData = filteredScores.map(original => {
    const dimensionName = (original as any).dimension || (original as any).name;
    const descriptions =
      DIMENSION_DESCRIPTIONS[dimensionName] || { low: "low", high: "high" };

    if (isIndividualScores) {
      // Single dimension score - Use raw score directly
      const s = original as any;
      
      // Calculate normalized score for positioning the bar (0-100)
      const normalizedScore =
        ((s.score - MIN_DIM) / RANGE_DIM) * 100 || 0; // map -28..+28 => 0..100 for display purposes only

      return {
        dimension: dimensionName,
        score: s.score, // Keep raw score unchanged for display
        min: MIN_DIM,
        max: MAX_DIM,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        normalizedScore, // Used for positioning the bar only
        lowLabel: descriptions.low,
        highLabel: descriptions.high
      };
    } else {
      // aggregator scenario: selfScore + rater1Score + rater2Score - Use raw scores directly
      const s = original as any;
      
      // Get individual scores
      const selfScore = s.selfScore || 0;
      const rater1Score = s.rater1Score || 0;
      const rater2Score = s.rater2Score || 0;
      
      // Calculate average of all three scores
      const validScores = [selfScore, rater1Score, rater2Score].filter(score => score !== 0);
      const averageScore = validScores.length > 0 
        ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
        : 0;
      
      // Calculate normalized average score
      const normalizedAverageScore = 
        ((averageScore - MIN_DIM) / RANGE_DIM) * 100 || 0;
      
      return {
        dimension: dimensionName,
        selfScore: selfScore, // Keep raw score unchanged for tooltip display
        rater1Score: rater1Score, // Keep raw score unchanged for tooltip display
        rater2Score: rater2Score, // Keep raw score unchanged for tooltip display
        averageScore: Number(averageScore.toFixed(1)), // Round to 1 decimal place
        min: MIN_DIM,
        max: MAX_DIM,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        normalizedAverageScore, // The only score we'll display in the bar
        averageColor: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1", // Keep using the dimension color for average
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
          x={-35}
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
              {/* X-axis using normalized values for positioning (0-100), 
                  but showing the actual -28 to 28 scale on ticks */}
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine
                tickLine
                ticks={[0, 25, 50, 75, 100]}
                fontSize={isMobile ? 9 : 12}
                tick={{ fill: "#666" }}
                tickFormatter={(value: number) => {
                  // Convert 0..100 back to -28..+28 for display
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

              {/* Reference lines at x=25 => -14, x=50 => 0, x=75 => +14 */}
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
                    formatter={(v: number) => Math.round(v)}
                    style={{
                      fontSize: isMobile ? "9px" : "11px",
                      fill: "#000"
                    }}
                    offset={5}
                  />
                </Bar>
              ) : (
                // Just show the average score bar
                <Bar
                  name="Average Score"
                  dataKey="normalizedAverageScore"
                  barSize={20}
                  shape={<EndTickShape />}
                  background={{ fill: "#f1f1f1" }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-average-${index}`} 
                      fill={entry.averageColor} 
                    />
                  ))}
                  <LabelList
                    dataKey="averageScore"
                    position="right"
                    formatter={(v: number) => v}
                    style={{
                      fontSize: isMobile ? "9px" : "11px",
                      fill: "#000"
                    }}
                    offset={5}
                  />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
