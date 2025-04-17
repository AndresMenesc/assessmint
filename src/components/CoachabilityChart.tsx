
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DimensionScore } from "@/types/assessment";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  ReferenceDot,
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

// Helper function to get color for each score type
const getColorForKey = (key: string): string => {
  switch (key) {
    case "selfScore":
      return "#4169E1"; // Blue for self
    case "rater1Score":
      return "#3CB371"; // Green for rater 1
    case "rater2Score":
      return "#FF7F50"; // Coral for rater 2
    case "avgScore":
    default:
      return "#9370DB"; // Purple for average
  }
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
      min: 10,
      max: 50,
      lowLabel: "resistant",
      highLabel: "receptive",
    });
  } else {
    // aggregate view with reference dots
    const c = coachabilityScore as any;
    
    // Raw scores
    const avgRawScore = Math.round(c.score || 0);
    const selfRawScore = Math.round(c.selfScore || 0); 
    const rater1RawScore = Math.round(c.rater1Score || 0);
    const rater2RawScore = Math.round(c.rater2Score || 0);

    // Log the actual scores for debugging
    console.log("Coachability Aggregate Scores:", { 
      avg: avgRawScore,
      self: selfRawScore,
      rater1: rater1RawScore,
      rater2: rater2RawScore
    });
    
    chartData.push({
      dimension: "Coachability",
      avgScore: avgRawScore,
      selfScore: selfRawScore,
      rater1Score: rater1RawScore > 0 ? rater1RawScore : null,
      rater2Score: rater2RawScore > 0 ? rater2RawScore : null,
      // Data for chart display
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
          x={isMobile ? 250 : 350}
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

  // Custom dot with label
  const CustomizedDot = (props: any) => {
    const { cx, cy, value, key, fill } = props;

    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#fff" strokeWidth={1.5} />
        <text 
          x={cx} 
          y={cy - 12} 
          textAnchor="middle" 
          fill="#333" 
          fontSize={11}
          fontWeight="500"
        >
          {value}
        </text>
        <text 
          x={cx} 
          y={cy + 16} 
          textAnchor="middle" 
          fill="#666" 
          fontSize={9}
        >
          {key === "avgScore" ? "Avg" : 
            key === "selfScore" ? "Self" : 
            key === "rater1Score" ? "R1" : "R2"}
        </text>
      </g>
    );
  };

  // Legend items
  const legendItems = [
    { value: 'Average', color: getColorForKey("avgScore"), type: 'circle' },
    { value: 'Self', color: getColorForKey("selfScore"), type: 'circle' },
    { value: 'Rater 1', color: getColorForKey("rater1Score"), type: 'circle' },
    { value: 'Rater 2', color: getColorForKey("rater2Score"), type: 'circle' },
  ];

  // Custom legend for reference dots
  const CustomLegend = () => {
    return (
      <div className="flex justify-center gap-4 pt-4 text-xs">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: item.color }}
            />
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Chart margins & sizes
  const chartMargins = isMobile
    ? { top: 30, right: 30, left: 100, bottom: 20 }
    : { top: 30, right: 50, left: 150, bottom: 20 };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Coachability Score</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAggregateView ? (
          // Individual view - traditional bar chart
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={chartMargins}>
              <XAxis
                type="number"
                domain={[10, 50]}
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
              <ReferenceLine x={30} stroke="#ef4444" strokeWidth={2} />
              <ReferenceLine x={40} stroke="#eab308" strokeWidth={2} />
              <Bar dataKey="score" barSize={20}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Aggregate view - background bar with reference dots
          <div className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 40, right: 50, left: 100, bottom: 40 }}
              >
                <XAxis 
                  type="number" 
                  domain={[10, 50]} 
                  ticks={[10, 20, 30, 40, 50]}
                  fontSize={12}
                />
                <YAxis 
                  dataKey="dimension" 
                  type="category" 
                  tick={renderYAxisTick}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 100 : 150}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Reference lines for score thresholds */}
                <ReferenceLine x={30} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" />
                <ReferenceLine x={40} stroke="#eab308" strokeWidth={2} strokeDasharray="3 3" />

                {/* Full range background bar */}
                <Bar
                  dataKey={() => 40} // Width of background bar (50-10=40)
                  fill="#f3f4f6" // Light gray
                  background={{ fill: "#e5e7eb" }}
                  barSize={40}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />

                {/* Individual score reference dots */}
                {chartData[0] && chartData[0].avgScore !== undefined && (
                  <ReferenceDot
                    key="avgScore"
                    x={chartData[0].avgScore}
                    y={chartData[0].dimension}
                    r={0} // No visible dot, using CustomizedDot
                    shape={<CustomizedDot key="avgScore" fill={getColorForKey("avgScore")} />}
                    ifOverflow="visible"
                  />
                )}

                {chartData[0] && chartData[0].selfScore !== undefined && (
                  <ReferenceDot
                    key="selfScore"
                    x={chartData[0].selfScore}
                    y={chartData[0].dimension}
                    r={0}
                    shape={<CustomizedDot key="selfScore" fill={getColorForKey("selfScore")} />}
                    ifOverflow="visible"
                  />
                )}

                {chartData[0] && chartData[0].rater1Score !== null && chartData[0].rater1Score !== undefined && (
                  <ReferenceDot
                    key="rater1Score"
                    x={chartData[0].rater1Score}
                    y={chartData[0].dimension}
                    r={0}
                    shape={<CustomizedDot key="rater1Score" fill={getColorForKey("rater1Score")} />}
                    ifOverflow="visible"
                  />
                )}

                {chartData[0] && chartData[0].rater2Score !== null && chartData[0].rater2Score !== undefined && (
                  <ReferenceDot
                    key="rater2Score"
                    x={chartData[0].rater2Score}
                    y={chartData[0].dimension}
                    r={0}
                    shape={<CustomizedDot key="rater2Score" fill={getColorForKey("rater2Score")} />}
                    ifOverflow="visible"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
            
            {/* Custom legend */}
            <CustomLegend />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
