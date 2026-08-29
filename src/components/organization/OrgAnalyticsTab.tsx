import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

const departmentData = [
  { department: "Engineering", wellbeing: 72, engagement: 68, sessions: 28 },
  { department: "Marketing", wellbeing: 65, engagement: 74, sessions: 14 },
  { department: "HR", wellbeing: 80, engagement: 82, sessions: 22 },
  { department: "Sales", wellbeing: 55, engagement: 60, sessions: 10 },
  { department: "Finance", wellbeing: 70, engagement: 66, sessions: 16 },
  { department: "Operations", wellbeing: 62, engagement: 58, sessions: 8 },
];

const radarData = [
  { metric: "Stress Mgmt", value: 72 },
  { metric: "Work-Life", value: 65 },
  { metric: "Team Cohesion", value: 78 },
  { metric: "Leadership Trust", value: 70 },
  { metric: "Resilience", value: 68 },
  { metric: "Motivation", value: 74 },
];

const riskFactors = [
  { factor: "Workload Pressure", level: "high", score: 78, trend: "up" },
  { factor: "Interpersonal Conflict", level: "medium", score: 45, trend: "down" },
  { factor: "Career Uncertainty", level: "medium", score: 52, trend: "stable" },
  { factor: "Work-Life Imbalance", level: "high", score: 71, trend: "up" },
  { factor: "Lack of Recognition", level: "low", score: 28, trend: "down" },
];

const levelColors: Record<string, string> = {
  high: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

const OrgAnalyticsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Population Analytics</h3>
        <p className="text-sm text-muted-foreground">Aggregated, anonymized insights across your organization</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Wellbeing & Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis dataKey="department" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Bar dataKey="wellbeing" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Wellbeing" />
                <Bar dataKey="engagement" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} name="Engagement" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Organizational Health Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organizational Health Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-border/30" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Risk Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskFactors.map((risk) => (
              <div key={risk.factor} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={levelColors[risk.level]}>
                    {risk.level}
                  </Badge>
                  <span className="font-medium text-sm">{risk.factor}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${risk.level === "high" ? "bg-chart-1" : risk.level === "medium" ? "bg-chart-4" : "bg-chart-2"}`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{risk.score}%</span>
                  <span className="text-xs">
                    {risk.trend === "up" ? "↑" : risk.trend === "down" ? "↓" : "→"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sessions by Department */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Utilization by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="department" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="sessions" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgAnalyticsTab;
