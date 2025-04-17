
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
import { categorizeAdaptability, categorizeScore, categorizeProblemResolution } from "@/utils/scoreCalculations";

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
  Adaptability: { low: "flexibility", high: "precision" },
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

// Helper to get category label
const getCategoryLabel = (dimension: string, score: number): string => {
  if (dimension === "Adaptability") {
    return categorizeAdaptability(score);
  } else if (dimension === "Problem Resolution") {
    return categorizeProblemResolution(score);
  } else if (dimension === "Coachability") {
    if (score <= 30) return "Low";
    if (score <= 40) return "Medium";
    return "High";
  } else {
    return categorizeScore(score);
  }
};

// Tooltip for bar hover
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dimensionName = data.dimension || data.name;

    // Check if we have individual rater scores or just one score
    if (data.selfScore === undefined && data.avgScore === undefined) {
      const category = getCategoryLabel(dimensionName, data.score);
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-semibold">{dimensionName}</p>
          <p>Score: {Math.round(data.score * 10) / 10}</p>
          <p>Category: {category}</p>
          <p className="text-xs text-gray-500">
            Range: {data.min} to {data.max}
          </p>
        </div>
      );
    } else {
      // For aggregate view with multiple scores
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-semibold">{dimensionName}</p>
          {data.avgScore !== undefined && (
            <p>Average: {Math.round(data.avgScore * 10) / 10}</p>
          )}
          {data.selfScore !== undefined && (
            <p>Self: {Math.round(data.selfScore * 10) / 10}</p>
          )}
          {data.rater1Score !== undefined && data.rater1Score > 0 && (
            <p>Rater 1: {Math.round(data.rater1Score * 10) / 10}</p>
          )}
          {data.rater2Score !== undefined && data.rater2Score > 0 && (
            <p>Rater 2: {Math.round(data.rater2Score * 10) / 10}</p>
          )}
          <p className="text-xs text-gray-500">
            Range: {data.min} to {data.max}
          </p>
        </div>
      );
    }
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

  // Log the scores to verify what we're getting
  console.log("Dimension Chart Scores:", filteredScores);

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

  // Check if it's an aggregate view with self, rater1, rater2
  // By checking if any score has selfScore, rater1Score etc.
  const isAggregateView = 
    typeof (filteredScores[0] as any).selfScore !== 'undefined' || 
    typeof (filteredScores[0] as any).rater1Score !== 'undefined' ||
    scores.some(score => 
      typeof (score as any).selfScore !== 'undefined' || 
      typeof (score as any).rater1Score !== 'undefined'
    );
  
  console.log("Is Aggregate View:", isAggregateView);
  
  if (isAggregateView) {
    console.log("First dimension score object:", filteredScores[0]);
  }

  // Transform the raw data into chart data
  const chartData = filteredScores.map(original => {
    const dimensionName = (original as any).dimension || (original as any).name;
    const descriptions =
      DIMENSION_DESCRIPTIONS[dimensionName] || { low: "low", high: "high" };

    if (!isAggregateView) {
      // Single dimension score - Use raw score directly
      const s = original as any;
      
      // Calculate normalized score for positioning the bar (0-100)
      const normalizedScore =
        ((s.score - MIN_DIM) / RANGE_DIM) * 100 || 0; // map -28..+28 => 0..100 for display purposes only

      // Get category label
      const categoryLabel = getCategoryLabel(dimensionName, s.score);

      return {
        dimension: dimensionName,
        score: s.score, // Keep raw score unchanged for display
        min: MIN_DIM,
        max: MAX_DIM,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        normalizedScore, // Used for positioning the bar only
        lowLabel: descriptions.low,
        highLabel: descriptions.high,
        category: categoryLabel
      };
    } else {
      // Aggregate view with self, rater1, and rater2 scores
      const s = original as any;
      
      console.log(`Processing aggregate dimension ${dimensionName}:`, s);
      
      // Extract all scores
      const selfScore = s.selfScore || 0;
      const rater1Score = s.rater1Score || 0;
      const rater2Score = s.rater2Score || 0;
      const avgScore = s.score || 0; // This is the average score
      
      // Calculate normalized scores for positioning the bars (0-100)
      const normalizedSelfScore = ((selfScore - MIN_DIM) / RANGE_DIM) * 100 || 0;
      const normalizedRater1Score = ((rater1Score - MIN_DIM) / RANGE_DIM) * 100 || 0;
      const normalizedRater2Score = ((rater2Score - MIN_DIM) / RANGE_DIM) * 100 || 0;
      const normalizedAvgScore = ((avgScore - MIN_DIM) / RANGE_DIM) * 100 || 0;

      // Get category labels
      const selfCategoryLabel = getCategoryLabel(dimensionName, selfScore);
      const rater1CategoryLabel = getCategoryLabel(dimensionName, rater1Score);
      const rater2CategoryLabel = getCategoryLabel(dimensionName, rater2Score);
      const avgCategoryLabel = getCategoryLabel(dimensionName, avgScore);

      return {
        dimension: dimensionName,
        avgScore: avgScore,
        selfScore: selfScore,
        rater1Score: rater1Score > 0 ? rater1Score : null,
        rater2Score: rater2Score > 0 ? rater2Score : null,
        normalizedAvgScore: normalizedAvgScore,
        normalizedSelfScore: normalizedSelfScore,
        normalizedRater1Score: normalizedRater1Score > 0 ? normalizedRater1Score : null,
        normalizedRater2Score: normalizedRater2Score > 0 ? normalizedRater2Score : null,
        min: MIN_DIM,
        max: MAX_DIM,
        color: s.color || DIMENSION_COLORS[dimensionName] || "#4169E1",
        selfColor: "#4169E1", // Blue for self
        rater1Color: "#3CB371", // Green for rater 1
        rater2Color: "#FF7F50", // Coral for rater 2
        avgColor: "#9370DB", // Purple for average
        lowLabel: descriptions.low,
        highLabel: descriptions.high,
        avgCategory: avgCategoryLabel,
        selfCategory: selfCategoryLabel,
        rater1Category: rater1CategoryLabel,
        rater2Category: rater2CategoryLabel
      };
    }
  });

  // Log the transformed chart data
  console.log("Chart Data:", chartData);

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

  // Custom formatter for the label to include category
  // Fixed function to safely handle entry that might not have payload property
  const formatLabel = (value: any, entry: any) => {
    // Check if entry exists and has a payload property
    if (!entry || !entry.payload) {
      return `${value ? Math.round(value) : 0}`; // Provide a safe fallback
    }
    
    const score = entry.payload.score;
    const category = entry.payload.category;
    
    // Return formatted score with category
    return `${Math.round(score)} (${category})`;
  };

  // Formatters for aggregate scores
  const formatAvgLabel = (value: any, entry: any) => {
    if (!entry || !entry.payload) {
      return `Avg: ${value ? Math.round(value) : 0}`;
    }
    return `Avg: ${Math.round(entry.payload.avgScore)}`;
  };

  const formatSelfLabel = (value: any, entry: any) => {
    if (!entry || !entry.payload) {
      return `Self: ${value ? Math.round(value) : 0}`;
    }
    return `Self: ${Math.round(entry.payload.selfScore)}`;
  };

  const formatRater1Label = (value: any, entry: any) => {
    if (!entry || !entry.payload) {
      return `R1: ${value ? Math.round(value) : 0}`;
    }
    return `R1: ${Math.round(entry.payload.rater1Score)}`;
  };

  const formatRater2Label = (value: any, entry: any) => {
    if (!entry || !entry.payload) {
      return `R2: ${value ? Math.round(value) : 0}`;
    }
    return `R2: ${Math.round(entry.payload.rater2Score)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dimension Scores</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Center the chart with a fixed 600x400 container */}
        <div className="mx-auto" style={{ width: 600, height: isAggregateView ? 600 : 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 30, right: 120, left: 80, bottom: isAggregateView ? 50 : 30 }}
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

              {isAggregateView ? (
                // Multiple bars for aggregate view
                <>
                  <Bar
                    name="Average"
                    dataKey="normalizedAvgScore"
                    barSize={20}
                    fill="#9370DB"
                    shape={<EndTickShape />}
                  >
                    <LabelList
                      dataKey="avgScore"
                      position="right"
                      formatter={formatAvgLabel}
                      style={{ fontSize: isMobile ? "9px" : "11px", fill: "#666" }}
                      offset={5}
                    />
                  </Bar>
                  <Bar
                    name="Self"
                    dataKey="normalizedSelfScore"
                    barSize={20}
                    fill="#4169E1"
                    shape={<EndTickShape />}
                    minPointSize={2}
                  >
                    <LabelList
                      dataKey="selfScore"
                      position="right"
                      formatter={formatSelfLabel}
                      style={{ fontSize: isMobile ? "9px" : "11px", fill: "#666" }}
                      offset={25}
                    />
                  </Bar>
                  <Bar
                    name="Rater 1"
                    dataKey="normalizedRater1Score"
                    barSize={20}
                    fill="#3CB371"
                    shape={<EndTickShape />}
                    minPointSize={2}
                  >
                    <LabelList
                      dataKey="rater1Score"
                      position="right"
                      formatter={formatRater1Label}
                      style={{ fontSize: isMobile ? "9px" : "11px", fill: "#666" }}
                      offset={45}
                    />
                  </Bar>
                  <Bar
                    name="Rater 2"
                    dataKey="normalizedRater2Score"
                    barSize={20}
                    fill="#FF7F50"
                    shape={<EndTickShape />}
                    minPointSize={2}
                  >
                    <LabelList
                      dataKey="rater2Score"
                      position="right"
                      formatter={formatRater2Label}
                      style={{ fontSize: isMobile ? "9px" : "11px", fill: "#666" }}
                      offset={65}
                    />
                  </Bar>
                  <Legend verticalAlign="bottom" height={36} />
                </>
              ) : (
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
                    formatter={formatLabel}
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
