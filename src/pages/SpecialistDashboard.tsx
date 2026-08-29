import { Link } from "@/lib/router-compat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Video,
  Award,
  FileText,
  BarChart3,
  Wallet,
  BookOpen,
  Sparkles,
  LifeBuoy,
  Rocket,
  Brain,
} from "lucide-react";
import {
  ClipboardList,
  ListChecks,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { AvailabilityTab } from "@/components/dashboard/AvailabilityTab";
import { PricingTab } from "@/components/dashboard/PricingTab";
import { LeadsTab } from "@/components/dashboard/LeadsTab";
import { SpecialistPlansTab } from "@/components/dashboard/SpecialistPlansTab";
import { SupportTab } from "@/components/dashboard/SupportTab";
import { SessionsTab } from "@/components/dashboard/SessionsTab";
import CertificatesTab from "@/components/dashboard/CertificatesTab";
import SessionNotesTab from "@/components/dashboard/SessionNotesTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import DocumentsTab from "@/components/dashboard/DocumentsTab";
import EarningsTab from "@/components/dashboard/EarningsTab";
import JournalTab from "@/components/dashboard/JournalTab";
import { BoostsTab } from "@/components/dashboard/BoostsTab";
import TreatmentPlansTab from "@/components/dashboard/TreatmentPlansTab";
import HomeworkTab from "@/components/dashboard/HomeworkTab";
import ClientProgressTab from "@/components/dashboard/ClientProgressTab";
import DischargeTab from "@/components/dashboard/DischargeTab";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";
import ClinicalBriefsTab from "@/components/dashboard/ClinicalBriefsTab";
import SpecialistBurnoutCard from "@/components/dashboard/SpecialistBurnoutCard";
import SmartSchedulingCard from "@/components/dashboard/SmartSchedulingCard";
import ContinueLearningCard from "@/components/dashboard/ContinueLearningCard";

const SpecialistDashboard = () => {
  return (
    <section className="section-spacing">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main */}
          <div className="space-y-6 min-w-0">
            <UpcomingSessionsCard />

            <div id="specialist-tabs-top" className="scroll-mt-20" />
            <Tabs
              defaultValue="profile"
              className="space-y-6"
              onValueChange={() => {
                requestAnimationFrame(() => {
                  document.getElementById("specialist-tabs-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
            >
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="profile" className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="gap-1.5">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Sessions</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="briefs" className="gap-1.5">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Briefs</span>
                </TabsTrigger>
                <TabsTrigger value="treatment-plans" className="gap-1.5">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Plans</span>
                </TabsTrigger>
                <TabsTrigger value="homework" className="gap-1.5">
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">Homework</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Progress</span>
                </TabsTrigger>
                <TabsTrigger value="discharge" className="gap-1.5">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Discharge</span>
                </TabsTrigger>
                <TabsTrigger value="availability" className="gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Availability</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Pricing</span>
                </TabsTrigger>
                <TabsTrigger value="leads" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Leads</span>
                </TabsTrigger>
                <TabsTrigger value="earnings" className="gap-1.5">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Earnings</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Plan</span>
                </TabsTrigger>
                <TabsTrigger value="boosts" className="gap-1.5">
                  <Rocket className="h-4 w-4" />
                  <span className="hidden sm:inline">Boosts</span>
                </TabsTrigger>
                <TabsTrigger value="journal" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Journal</span>
                </TabsTrigger>
                <TabsTrigger value="certificates" className="gap-1.5">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Certificates</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Docs</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="gap-1.5">
                  <LifeBuoy className="h-4 w-4" />
                  <span className="hidden sm:inline">Support</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile"><ProfileTab /></TabsContent>
              <TabsContent value="sessions"><SessionsTab /></TabsContent>
              <TabsContent value="notes"><SessionNotesTab /></TabsContent>
              <TabsContent value="briefs"><ClinicalBriefsTab /></TabsContent>
              <TabsContent value="treatment-plans"><TreatmentPlansTab /></TabsContent>
              <TabsContent value="homework"><HomeworkTab role="psychologist" /></TabsContent>
              <TabsContent value="progress"><ClientProgressTab role="psychologist" /></TabsContent>
              <TabsContent value="discharge"><DischargeTab role="psychologist" /></TabsContent>
              <TabsContent value="availability"><AvailabilityTab /></TabsContent>
              <TabsContent value="pricing"><PricingTab /></TabsContent>
              <TabsContent value="leads"><LeadsTab /></TabsContent>
              <TabsContent value="earnings"><EarningsTab /></TabsContent>
              <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
              <TabsContent value="billing"><SpecialistPlansTab /></TabsContent>
              <TabsContent value="boosts"><BoostsTab /></TabsContent>
              <TabsContent value="journal"><JournalTab /></TabsContent>
              <TabsContent value="certificates"><CertificatesTab /></TabsContent>
              <TabsContent value="documents"><DocumentsTab /></TabsContent>
              <TabsContent value="support"><SupportTab /></TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Nour — AI assistant</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Draft session summaries, get clinical reflections, and brainstorm interventions.
              </p>
              <Button asChild className="w-full" size="sm">
                <Link to="/ai-assistant">Open Nour</Link>
              </Button>
            </Card>

            <SpecialistBurnoutCard />
            <SmartSchedulingCard />
            <ContinueLearningCard path="clinical-cpd" />

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Quick links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/psychologists" className="text-primary hover:underline">View public profile</Link></li>
                <li><Link to="/resources" className="text-primary hover:underline">Clinician resources</Link></li>
                <li><Link to="/moroccan-umbrella" className="text-primary hover:underline">Moroccan Umbrella</Link></li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default SpecialistDashboard;
