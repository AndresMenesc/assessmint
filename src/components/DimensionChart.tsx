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

function EndTickShape(props: any) {
  const { x, y, width, height, fill } = props;
  const endX = x + width;

  return (
    <g>
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

const DIMENSION_DESCRIPTIONS = {
  Esteem: { low: "low", high: "prideful" },
  Trust: { low: "low", high: "high" },
  "Business Drive": { low: "low", high: "high" },
  Adaptability: { low: "flexibility", high: "precision" },
  "Problem Resolution": { low: "avoid", high: "engage" },
  Coachability: { low: "resistant", high: "receptive" }
};

const DIMENSION_COLORS = {
  Esteem: "#4169E1",
  Trust: "#20B2AA",
  "Business Drive": "#9370DB",
  Adaptability: "#3CB371",
  "Problem Resolution": "#FF7F50",
  Coachability: "#22c55e"
};

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dimensionName = data.dimension || data.name;

    if (data.score !== undefined) {
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

const MIN_DIM = -28;
const MAX_DIM = 28;
const RANGE_DIM = MAX_DIM - MIN_DIM;

export default function DimensionChart({ scores }: { scores: DimensionScore[] }) {
  const isMobile = useIsMobile();

  const filteredScores = scores.filter(score => {
    const scoreName =
      "dimension" in score ? score.dimension : (score as any).name;
    return scoreName !== "Coachability";
  });

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

  const isAggregateView = true;

  const chartData = filteredScores.map(original => {
    const dimensionName = (original as any).dimension || (original as any).name;
    const descriptions =
      DIMENSION_DESCRIPTIONS[dimensionName] || { low: "low", high: "high" };

    const avgScore = (original as any).score || 0;
    const selfScore = (original as any).selfScore || 0;
    const rater1Score = (original as any).rater1Score || 0;
    const rater2Score = (original as any).rater2Score || 0;
    
    const normalizedAvgScore = ((avgScore - MIN_DIM) / RANGE_DIM) * 100 || 0;
    const normalizedSelfScore = ((selfScore - MIN_DIM) / RANGE_DIM) * 100 || 0;
    const normalizedRater1Score = ((rater1Score - MIN_DIM) / RANGE_DIM) * 100 || 0;
    const normalizedRater2Score = ((rater2Score - MIN_DIM) / RANGE_DIM) * 100 || 0;

    const avgCategoryLabel = getCategoryLabel(dimensionName, avgScore);
    const selfCategoryLabel = getCategoryLabel(dimensionName, selfScore);
    const rater1CategoryLabel = getCategoryLabel(dimensionName, rater1Score);
    const rater2CategoryLabel = getCategoryLabel(dimensionName, rater2Score);

    return {
      dimension: dimensionName,
      avgScore: avgScore,
      selfScore: selfScore,
      rater1Score: rater1Score,
      rater2Score: rater2Score,
      normalizedAvgScore: normalizedAvgScore,
      normalizedSelfScore: normalizedSelfScore,
      normalizedRater1Score: normalizedRater1Score,
      normalizedRater2Score: normalizedRater2Score,
      min: MIN_DIM,
      max: MAX_DIM,
      color: (original as any).color || DIMENSION_COLORS[dimensionName] || "#4169E1",
      selfColor: "#4169E1",
      rater1Color: "#3CB371",
      rater2Color: "#FF7F50",
      avgColor: "#9370DB",
      lowLabel: descriptions.low,
      highLabel: descriptions.high,
      avgCategory: avgCategoryLabel,
      selfCategory: selfCategoryLabel,
      rater1Category: rater1CategoryLabel,
      rater2Category: rater2CategoryLabel
    };
  });

  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const item = chartData.find(i => i.dimension === payload.value);
    if (!item) return null;

    return (
      <g transform={`translate(${x}, ${y})`}>
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

  const formatLabel = (value: any, entry: any) => {
    if (!entry || !entry.payload) {
      return `${value ? Math.round(value) : 0}`;
    }
    
    const score = entry.payload.score;
    const category = entry.payload.category;
    
    return `${Math.round(score)} (${category})`;
  };

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
        <div className="mx-auto" style={{ width: 600, height: isAggregateView ? 600 : 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 30, right: 120, left: 80, bottom: isAggregateView ? 50 : 30 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine
                tickLine
                ticks={[0, 25, 50, 75, 100]}
                fontSize={isMobile ? 9 : 12}
                tick={{ fill: "#666" }}
                tickFormatter={(value: number) => {
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

              <ReferenceLine x={25} stroke="#ddd" strokeDasharray="3 3" />
              <ReferenceLine x={50} stroke="#aaa" />
              <ReferenceLine x={75} stroke="#ddd" strokeDasharray="3 3" />

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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
