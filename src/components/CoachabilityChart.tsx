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

  // 1) Find the coachability dimension from the scores
  const coachabilityScore = scores.find((score) => {
    const scoreName =
      "dimension" in score ? score.dimension : (score as any).name;
    return scoreName === "Coachability";
  });

  if (!coachabilityScore) {
    return null;
  }

  // Check if single "score" vs. selfScore/othersScore
  const isIndividualScores =
    "score" in coachabilityScore || !("selfScore" in coachabilityScore);

  // We'll only have one item in chartData (the "Coachability" row)
  const chartData: any[] = [];

  if (isIndividualScores) {
    const c = coachabilityScore as any;
    chartData.push({
      dimension: "Coachability",
      score: c.score,
      min: c.min,
      max: c.max,
      color:
        c.score <= 30 ? "#ef4444" : c.score <= 40 ? "#eab308" : "#22c55e",
      normalizedScore: c.score, // 0..100
      lowLabel: "resistant",
      highLabel: "receptive",
    });
  } else {
    const c = coachabilityScore as any;
    chartData.push({
      dimension: "Coachability",
      selfScore: c.selfScore,
      othersScore: c.othersScore,
      min: c.min,
      max: c.max,
      selfColor:
        c.selfScore <= 30 ? "#ef4444" : c.selfScore <= 40 ? "#eab308" : "#22c55e",
      othersColor:
        c.othersScore <= 30
          ? "#ef4444"
          : c.othersScore <= 40
            ? "#eab308"
            : "#22c55e",
      normalizedSelfScore: c.selfScore, // 0..100
      normalizedOthersScore: c.othersScore,
      lowLabel: "resistant",
      highLabel: "receptive",
    });
  }

  // Adjust margins
  const chartMargins = isMobile
    ? { top: 30, right: 70, left: 100, bottom: 20 }
    : { top: 30, right: 80, left: 150, bottom: 20 };

  const labelStyle = {
    fontSize: isMobile ? "9px" : "11px",
    fill: "#000",
  };

  // 2) Custom Y-axis tick so we can place "resistant" (lowLabel) on left,
  // "Coachability" in center, "receptive" on right
  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const item = chartData.find((d) => d.dimension === payload.value);
    if (!item) return null;

    return (
      <g transform={`translate(${x},${y})`}>
        {/* "Coachability" label near axis */}
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

        {/* Low label on the far left */}
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
          x={550} // tweak as needed
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

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Coachability Score</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={chartMargins}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              axisLine={true}
              tickFormatter={(value) => {
                if (value === 0) return "0%";
                if (value === 25) return "25%";
                if (value === 50) return "50%";
                if (value === 75) return "75%";
                if (value === 100) return "100%";
                return "";
              }}
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

            {/* BACKGROUND BARS FIRST - so main bar draws on top */}
            <Bar
              dataKey={() => 30}
              stackId="bg"
              fill="#ffecec"
              barSize={20}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey={() => 10}
              stackId="bg"
              fill="#fff9e5"
              barSize={20}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey={() => 60}
              stackId="bg"
              fill="#ecfdf5"
              barSize={20}
              radius={[0, 0, 0, 0]}
            />

            <ReferenceLine x={30} stroke="#ef4444" strokeWidth={2} />
            <ReferenceLine x={40} stroke="#eab308" strokeWidth={2} />

            {/* MAIN BAR(S) LAST - ensures they're on top of the background */}
            {isIndividualScores ? (
              // Single bar approach
              <Bar
                dataKey="normalizedScore"
                // No stackId, or a different stackId than "bg"
                // If you want it to fully appear on top
                barSize={20}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  style={labelStyle}
                  offset={5}
                />
              </Bar>
            ) : (
              <>
                {/* Self Score */}
                <Bar
                  dataKey="normalizedSelfScore"
                  barSize={20}
                  // a different stackId from "bg" => e.g. "coachStack"
                  stackId="coachStack"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-self-${index}`} fill={entry.selfColor} />
                  ))}
                  <LabelList
                    dataKey="selfScore"
                    position="right"
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    style={labelStyle}
                    offset={5}
                  />
                </Bar>

                {/* Others Score */}
                <Bar
                  dataKey="normalizedOthersScore"
                  barSize={20}
                  stackId="coachStack"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-others-${index}`}
                      fill={entry.othersColor}
                      opacity={0.7}
                    />
                  ))}
                  <LabelList
                    dataKey="othersScore"
                    position="right"
                    formatter={(value: number) => `${value.toFixed(1)}%`}
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
