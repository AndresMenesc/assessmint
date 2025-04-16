
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
  const isAggregateView = "selfScore" in coachabilityScore && 
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
    // aggregate view with average, self, rater1, and rater2 scores
    const c = coachabilityScore as any;
    const selfRawScore = Math.round(c.selfScore || 0);
    const rater1RawScore = Math.round(c.rater1Score || 0);
    const rater2RawScore = Math.round(c.rater2Score || 0);
    const avgRawScore = Math.round(c.score || 0); // This should be the average
    
    chartData.push({
      dimension: "Coachability",
      avgScore: avgRawScore,
      selfScore: selfRawScore,
      rater1Score: rater1RawScore,
      rater2Score: rater2RawScore,
      // colors for each score
      avgColor: "#9370DB", // Purple for average
      selfColor: selfRawScore <= 30 ? "#ef4444" : selfRawScore <= 40 ? "#eab308" : "#22c55e",
      rater1Color: rater1RawScore <= 30 ? "#ef4444" : rater1RawScore <= 40 ? "#eab308" : "#22c55e",
      rater2Color: rater2RawScore <= 30 ? "#ef4444" : rater2RawScore <= 40 ? "#eab308" : "#22c55e",
      // normalized scores for positioning
      normalizedAvgScore: ((avgRawScore - 10) / 40) * 100,
      normalizedSelfScore: ((selfRawScore - 10) / 40) * 100,
      normalizedRater1Score: ((rater1RawScore - 10) / 40) * 100,
      normalizedRater2Score: ((rater2RawScore - 10) / 40) * 100,
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

  // Formatters for score labels
  const formatAvgLabel = (val: number) => `Avg: ${Math.round(val)}`;
  const formatSelfLabel = (val: number) => `Self: ${Math.round(val)}`;
  const formatRater1Label = (val: number) => `R1: ${Math.round(val)}`;
  const formatRater2Label = (val: number) => `R2: ${Math.round(val)}`;
  
  // Generic formatter with error handling
  const formatLabel = (val: number) => `${Math.round(val)}`;

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
              domain={[0, 100]}
              axisLine={true}
              tickFormatter={(val) => Math.round((val / 100 * 40) + 10).toString()}
              ticks={[0, 25, 50, 75, 100]}
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
            <ReferenceLine x={(30 - 10) / 40 * 100} stroke="#ef4444" strokeWidth={2} />
            <ReferenceLine x={(40 - 10) / 40 * 100} stroke="#eab308" strokeWidth={2} />

            {/* Main bar(s) on top */}
            {!isAggregateView ? (
              // Single bar
              <Bar dataKey="normalizedScore" barSize={20}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  formatter={formatLabel}
                  style={labelStyle}
                  offset={5}
                />
              </Bar>
            ) : (
              // Multiple bars for aggregate view
              <>
                <Bar
                  name="Average"
                  dataKey="normalizedAvgScore"
                  barSize={20}
                  fill="#9370DB"
                >
                  <LabelList
                    dataKey="avgScore"
                    position="right"
                    formatter={formatAvgLabel}
                    style={labelStyle}
                    offset={5}
                  />
                </Bar>
                <Bar
                  name="Self"
                  dataKey="normalizedSelfScore"
                  barSize={20}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.selfColor} />
                  ))}
                  <LabelList
                    dataKey="selfScore"
                    position="right"
                    formatter={formatSelfLabel}
                    style={labelStyle}
                    offset={25}
                  />
                </Bar>
                {chartData[0].rater1Score > 0 && (
                  <Bar
                    name="Rater 1"
                    dataKey="normalizedRater1Score"
                    barSize={20}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.rater1Color} />
                    ))}
                    <LabelList
                      dataKey="rater1Score"
                      position="right"
                      formatter={formatRater1Label}
                      style={labelStyle}
                      offset={45}
                    />
                  </Bar>
                )}
                {chartData[0].rater2Score > 0 && (
                  <Bar
                    name="Rater 2"
                    dataKey="normalizedRater2Score"
                    barSize={20}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.rater2Color} />
                    ))}
                    <LabelList
                      dataKey="rater2Score"
                      position="right"
                      formatter={formatRater2Label}
                      style={labelStyle}
                      offset={65}
                    />
                  </Bar>
                )}
                <Legend verticalAlign="bottom" height={36} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
