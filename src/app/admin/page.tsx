import { Metadata } from 'next'
import CenterManagement from '@/components/CenterManagement'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Admin Dashboard - SRF Convocation',
  description: 'Manage centers and view analytics'
}

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="centers">
          <CenterManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 