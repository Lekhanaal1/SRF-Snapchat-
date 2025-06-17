import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { MapPin, Phone, Mail } from 'lucide-react'

type Center = Database['public']['Tables']['centers']['Row']

export default function CenterManagement() {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCenter, setEditingCenter] = useState<Center | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    region: '',
    location: { lat: 0, lng: 0 },
    contact_email: '',
    contact_phone: ''
  })

  useEffect(() => {
    fetchCenters()
  }, [])

  const fetchCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .order('name')

      if (error) throw error

      setCenters(data)
    } catch (err) {
      setError('Failed to load centers')
      console.error('Error fetching centers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCenter) {
        const { error } = await supabase
          .from('centers')
          .update(formData)
          .eq('id', editingCenter.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('centers')
          .insert(formData)

        if (error) throw error
      }

      setEditingCenter(null)
      setFormData({
        name: '',
        city: '',
        country: '',
        region: '',
        location: { lat: 0, lng: 0 },
        contact_email: '',
        contact_phone: ''
      })
      fetchCenters()
    } catch (err) {
      setError('Failed to save center')
      console.error('Error saving center:', err)
    }
  }

  const handleEdit = (center: Center) => {
    setEditingCenter(center)
    setFormData({
      name: center.name,
      city: center.city,
      country: center.country,
      region: center.region,
      location: center.location,
      contact_email: center.contact_email || '',
      contact_phone: center.contact_phone || ''
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this center?')) return

    try {
      const { error } = await supabase
        .from('centers')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchCenters()
    } catch (err) {
      setError('Failed to delete center')
      console.error('Error deleting center:', err)
    }
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
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingCenter ? 'Edit Center' : 'Add New Center'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) =>
                setFormData({ ...formData, contact_email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, contact_phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          {editingCenter && (
            <button
              type="button"
              onClick={() => {
                setEditingCenter(null)
                setFormData({
                  name: '',
                  city: '',
                  country: '',
                  region: '',
                  location: { lat: 0, lng: 0 },
                  contact_email: '',
                  contact_phone: ''
                })
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
          >
            {editingCenter ? 'Update Center' : 'Add Center'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centers.map((center) => (
          <div
            key={center.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{center.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    {center.city}, {center.country}
                  </span>
                </div>
                {center.contact_email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{center.contact_email}</span>
                  </div>
                )}
                {center.contact_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{center.contact_phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(center)}
                  className="px-3 py-1 text-sm text-primary hover:text-primary-dark"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(center.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 