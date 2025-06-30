import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientAuditInterface } from '@/components/admin/ClientAuditInterface';

const ClientAudit = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 py-4 space-y-6 max-w-7xl">
        <ClientAuditInterface />
      </main>
    </div>
  );
};

export default ClientAudit; 