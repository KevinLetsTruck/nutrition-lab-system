// Example: How to integrate call recording into your client detail page
// Add this to your existing client detail page (src/app/client/[id]/page.tsx)

import { CallRecordingIntegration } from '@/components/calls/CallRecordingIntegration'

// In your client detail page component:
export default function ClientDetailPage({ params }: { params: { id: string } }) {
  // ... existing client data fetching logic ...
  
  return (
    <div>
      {/* ... existing client details ... */}
      
      {/* Add this section for call recording */}
      <section className="mt-8">
        <CallRecordingIntegration 
          clientId={params.id}
          clientName={`${client.first_name} ${client.last_name}`} // Use actual client data
        />
      </section>
      
      {/* ... rest of your page ... */}
    </div>
  )
}

// Alternative: Add as a tab in your existing tabs structure
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="assessments">Assessments</TabsTrigger>
    <TabsTrigger value="calls">Call Recordings</TabsTrigger> {/* New tab */}
    {/* ... other tabs ... */}
  </TabsList>
  
  <TabsContent value="calls">
    <CallRecordingIntegration 
      clientId={clientId}
      clientName={clientName}
    />
  </TabsContent>
  {/* ... other tab contents ... */}
</Tabs>