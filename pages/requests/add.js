import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function AddRequest() {
  const [request, setRequest] = useState({
    employee_name: '',
    request_type: '',
    request_start_date: '',
    request_end_date: ''
  })
  const router = useRouter()

  const handleChange = (e) => {
    setRequest({ ...request, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('requests')
        .insert([{ ...request, approval: 'pending' }])
      if (error) throw error
      router.push('/requests')
    } catch (error) {
      console.error('Error adding request:', error.message)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Employee Name</label>
          <input
            type="text"
            name="employee_name"
            value={request.employee_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Request Type</label>
          <input
            type="text"
            name="request_type"
            value={request.request_type}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            name="request_start_date"
            value={request.request_start_date}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            name="request_end_date"
            value={request.request_end_date}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded w-full">
          Submit Request
        </button>
      </form>
    </div>
  )
}