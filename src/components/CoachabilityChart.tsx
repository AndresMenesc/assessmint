
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
        {data.score !== undefined && (
          <p>Score: {Math.round(data.score * 10) / 10}</p>
        )}
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
  return null;
};

export default function CoachabilityChart({ scores }: CoachabilityChartProps) {
  const isMobile = useIsMobile();

  // Identify the "Coachability" dimension
  const coachabilityScore = scores.find(
    (score) => (score.dimension ?? (score as any).name) === "Coachability"
  );
  if (!coachabilityScore) return null;

  // Determine if it's aggregate or individual view
  const isAggregateView = "selfScore" in coachabilityScore || 
    (coachabilityScore as any).rater1Score !== undefined;

  // Build data for exactly one row
  const chartData: any[] = [];
  if (!isAggregateView) {
    // single user
    const c = coachabilityScore as any;
    const rawScore = Math.round(c.score);
    
    chartData.push({
      dimension: "Coachability",
      score: rawScore,
      // color logic: red if ≤30, yellow if ≤40, else green
      color: rawScore <= 30 ? "#ef4444" : rawScore <= 40 ? "#eab308" : "#22c55e",
      normalizedScore: ((rawScore - 10) / 40) * 100, // Normalize 10-50 to 0-100% for visualization
      min: 10,
      max: 50,
      lowLabel: "resistant",
      highLabel: "receptive",
    });
  } else {
    // aggregate view - use side-by-side bars
    const c = coachabilityScore as any;
    
    // Raw scores
    const avgRawScore = Math.round(c.score || 0);
    const selfRawScore = Math.round(c.selfScore || 0); 
    const rater1RawScore = Math.round(c.rater1Score || 0);
    const rater2RawScore = Math.round(c.rater2Score || 0);
    
    // Colors based on score values
    const avgColor = "#9370DB"; // Purple for average
    const selfColor = selfRawScore <= 30 ? "#ef4444" : selfRawScore <= 40 ? "#eab308" : "#22c55e";
    const rater1Color = rater1RawScore <= 30 ? "#ef4444" : rater1RawScore <= 40 ? "#eab308" : "#22c55e";
    const rater2Color = rater2RawScore <= 30 ? "#ef4444" : rater2RawScore <= 40 ? "#eab308" : "#22c55e";
    
    // For side-by-side view, we use actual score values (10-50 range)
    chartData.push({
      dimension: "Coachability",
      avgScore: avgRawScore,
      selfScore: selfRawScore,
      rater1Score: rater1RawScore > 0 ? rater1RawScore : 0,
      rater2Score: rater2RawScore > 0 ? rater2RawScore : 0,
      // Store colors for the bars
      avgColor,
      selfColor,
      rater1Color,
      rater2Color,
      // Range data
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
    : { top: 30, right: 120, left: 150, bottom: 20 };

  const labelStyle = {
    fontSize: isMobile ? "9px" : "11px",
    fill: "#000",
  };

  // Helper for determining domain
  const getBarDomain = () => {
    return [0, 50]; // Raw score range 0-50 for all views
  };

  // Formatter for score labels
  const formatScoreLabel = (value: number) => `${Math.round(value)}`;

  // Calculate bar size based on view type
  const getBarSize = () => {
    if (!isAggregateView) return 20;
    return isMobile ? 12 : 14; // Smaller bars when showing multiple in aggregate view
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Coachability Score</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={isAggregateView ? 240 : 180}>
          <BarChart data={chartData} layout="vertical" margin={chartMargins}>
            <XAxis
              type="number"
              domain={getBarDomain()}
              axisLine={true}
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

            {/* Reference lines for score thresholds */}
            <ReferenceLine x={30} stroke="#ef4444" strokeWidth={2} />
            <ReferenceLine x={40} stroke="#eab308" strokeWidth={2} />
            
            {!isAggregateView ? (
              // Individual view - single bar
              <Bar dataKey="score" barSize={getBarSize()}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  formatter={formatScoreLabel}
                  style={labelStyle}
                  offset={5}
                />
              </Bar>
            ) : (
              // Aggregate view - side by side bars
              <>
                <Bar 
                  name="Average" 
                  dataKey="avgScore" 
                  barSize={getBarSize()}
                  fill="#9370DB" // Purple
                >
                  <LabelList
                    dataKey="avgScore"
                    position="top"
                    formatter={formatScoreLabel}
                    style={labelStyle}
                  />
                </Bar>
                <Bar 
                  name="Self" 
                  dataKey="selfScore" 
                  barSize={getBarSize()}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.selfColor} />
                  ))}
                  <LabelList
                    dataKey="selfScore"
                    position="top"
                    formatter={formatScoreLabel}
                    style={labelStyle}
                  />
                </Bar>
                <Bar 
                  name="Rater 1" 
                  dataKey="rater1Score" 
                  barSize={getBarSize()}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.rater1Color} />
                  ))}
                  <LabelList
                    dataKey="rater1Score"
                    position="top"
                    formatter={(val) => val > 0 ? formatScoreLabel(val) : ""}
                    style={labelStyle}
                  />
                </Bar>
                <Bar 
                  name="Rater 2" 
                  dataKey="rater2Score" 
                  barSize={getBarSize()}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.rater2Color} />
                  ))}
                  <LabelList
                    dataKey="rater2Score"
                    position="top"
                    formatter={(val) => val > 0 ? formatScoreLabel(val) : ""}
                    style={labelStyle}
                  />
                </Bar>
                <Legend verticalAlign="bottom" height={36} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
