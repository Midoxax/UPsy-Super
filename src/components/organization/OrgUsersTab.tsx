import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock employee data — in production this would come from an org_members table
const mockEmployees = [
  { id: "1", name: "Sara El Amrani", email: "sara@company.ma", department: "Engineering", status: "active", sessionsCompleted: 4, wellbeingScore: 78 },
  { id: "2", name: "Youssef Benali", email: "youssef@company.ma", department: "Marketing", status: "active", sessionsCompleted: 2, wellbeingScore: 65 },
  { id: "3", name: "Leila Chakir", email: "leila@company.ma", department: "HR", status: "active", sessionsCompleted: 6, wellbeingScore: 82 },
  { id: "4", name: "Karim Tazi", email: "karim@company.ma", department: "Sales", status: "inactive", sessionsCompleted: 0, wellbeingScore: 45 },
  { id: "5", name: "Amina Fassi", email: "amina@company.ma", department: "Finance", status: "active", sessionsCompleted: 3, wellbeingScore: 71 },
  { id: "6", name: "Rachid Alaoui", email: "rachid@company.ma", department: "Engineering", status: "at_risk", sessionsCompleted: 1, wellbeingScore: 38 },
];

const statusColors: Record<string, string> = {
  active: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  inactive: "bg-muted text-muted-foreground border-border",
  at_risk: "bg-chart-1/10 text-chart-1 border-chart-1/20",
};

const OrgUsersTab = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const departments = [...new Set(mockEmployees.map(e => e.department))];

  const filtered = mockEmployees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Employee
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{mockEmployees.length}</p>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-chart-2">{mockEmployees.filter(e => e.status === "active").length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-chart-1">{mockEmployees.filter(e => e.status === "at_risk").length}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{Math.round(mockEmployees.reduce((a, e) => a + e.wellbeingScore, 0) / mockEmployees.length)}%</p>
            <p className="text-xs text-muted-foreground">Avg Wellbeing</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Directory
          </CardTitle>
          <CardDescription>{filtered.length} employees found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 font-medium text-muted-foreground">Department</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground text-center">Sessions</th>
                  <th className="pb-3 font-medium text-muted-foreground text-center">Wellbeing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </td>
                    <td className="py-3">{emp.department}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={statusColors[emp.status]}>
                        {emp.status === "at_risk" ? "At Risk" : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">{emp.sessionsCompleted}</td>
                    <td className="py-3 text-center">
                      <span className={`font-semibold ${emp.wellbeingScore >= 70 ? "text-chart-2" : emp.wellbeingScore >= 50 ? "text-chart-4" : "text-chart-1"}`}>
                        {emp.wellbeingScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgUsersTab;
