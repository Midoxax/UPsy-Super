import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, BookOpen, BarChart3, UserCheck, CreditCard, FileText, Activity, Palette } from "lucide-react";
import OrgOverviewTab from "@/components/organization/OrgOverviewTab";
import OrgUsersTab from "@/components/organization/OrgUsersTab";
import OrgProgramsTab from "@/components/organization/OrgProgramsTab";
import OrgReportsTab from "@/components/organization/OrgReportsTab";
import OrgPsychologistsTab from "@/components/organization/OrgPsychologistsTab";
import OrgAnalyticsTab from "@/components/organization/OrgAnalyticsTab";
import OrgBillingTab from "@/components/organization/OrgBillingTab";
import OrgPulseTab from "@/components/organization/OrgPulseTab";
import OrgBrandingTab from "@/components/organization/OrgBrandingTab";

const OrganizationDashboard = () => {
  const { user } = useAuth();

  return (
    <section className="section-spacing">
      <div className="container-custom">
        <div id="org-tabs-top" className="scroll-mt-20" />
        <Tabs
          defaultValue="overview"
          className="space-y-6"
          onValueChange={() => {
            requestAnimationFrame(() => {
              document.getElementById("org-tabs-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        >
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="pulse" className="gap-1.5">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Pulse</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="psychologists" className="gap-1.5">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Psychologists</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-1.5">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OrgOverviewTab /></TabsContent>
          <TabsContent value="pulse"><OrgPulseTab /></TabsContent>
          <TabsContent value="users"><OrgUsersTab /></TabsContent>
          <TabsContent value="programs"><OrgProgramsTab /></TabsContent>
          <TabsContent value="psychologists"><OrgPsychologistsTab /></TabsContent>
          <TabsContent value="reports"><OrgReportsTab /></TabsContent>
          <TabsContent value="analytics"><OrgAnalyticsTab /></TabsContent>
          <TabsContent value="billing"><OrgBillingTab /></TabsContent>
          <TabsContent value="branding"><OrgBrandingTab /></TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default OrganizationDashboard;
