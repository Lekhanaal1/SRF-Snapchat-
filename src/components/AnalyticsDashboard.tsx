import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

type Analytics = Database['public']['Tables']['devotee_analytics']['Row'] & {
  centers: {
    name: string
    city: string
    country: string
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedCenter, setSelectedCenter] = useState<string>('')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedRegion, selectedCenter])

  const fetchAnalytics = async () => {
    try {
      let query = supabase
        .from('devotee_analytics')
        .select(`
          *,
          centers (
            name,
            city,
            country
          )
        `)
        .order('date', { ascending: true })

      if (selectedRegion) {
        query = query.eq('region', selectedRegion)
      }
      if (selectedCenter) {
        query = query.eq('center_id', selectedCenter)
      }

      const { data, error } = await query

      if (error) throw error

      setAnalytics(data)
    } catch (err) {
      setError('Failed to load analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const regions = Array.from(new Set(analytics.map((a) => a.region)))
  const centers = Array.from(
    new Set(analytics.map((a) => ({ id: a.center_id, name: a.centers.name })))
  )

  const prepareChartData = () => {
    return analytics.map((a) => ({
      date: new Date(a.date).toLocaleDateString(),
      total: a.total_devotees,
      active: a.active_devotees,
      new: a.new_devotees
    }))
  }

  const prepareDistributionData = (field: string) => {
    const latest = analytics[analytics.length - 1]
    if (!latest) return []

    const distribution = latest[field as keyof typeof latest] as Record<string, number>
    return Object.entries(distribution).map(([key, value]) => ({
      name: key,
      value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <select
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Centers</option>
          {centers.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Devotee Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  name="Total Devotees"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#82ca9d"
                  name="Active Devotees"
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#ffc658"
                  name="New Devotees"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Years on Path Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareDistributionData('years_on_path_distribution')}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {prepareDistributionData('years_on_path_distribution').map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
} 