// Compliance surface: the append-only audit trail and data-subject requests.

import SEOHead from "@/components/SEOHead";
import AuditTrail from "@/components/admin/AuditTrail";

const AdminAudit = () => (
  <main className="flex-1">
    <SEOHead
      path="/admin/audit"
      title="Audit trail — U.Psy internal"
      description="Who accessed what, when, and under which data class."
    />
    <div className="container-custom py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Compliance</p>
        <h1 className="text-3xl md:text-4xl font-heading mt-1">Audit trail</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Every write to clinical and identity data, every logged clinical read, and every
          data-subject request — retained six years and impossible to edit or erase.
        </p>
      </header>
      <AuditTrail />
    </div>
  </main>
);

export default AdminAudit;
