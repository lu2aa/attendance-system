import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Requests() {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    const { data } = await supabase.from('requests').select('*')
    setRequests(data || [])
  }

  async function handleApproval(id, approval, reply) {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ approval, reply, updated_at: new Date() })
        .eq('id', id)
      if (error) throw error
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error.message)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Requests</h1>
      <Link
        href="/requests/add"
        className="mb-4 inline-block p-2 bg-blue-500 text-white rounded"
      >
        Add Request
      </Link>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Start Date</th>
            <th className="border p-2">End Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="border p-2">{request.employee_name}</td>
              <td className="border p-2">{request.request_type}</td>
              <td className="border p-2">{request.request_start_date}</td>
              <td className="border p-2">{request.request_end_date}</td>
              <td className="border p-2">{request.approval}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleApproval(request.id, 'approved', 'Approved')}
                  className="mr-2 p-1 bg-green-500 text-white rounded"
                  disabled={request.approval !== 'pending'}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(request.id, 'rejected', 'Rejected')}
                  className="p-1 bg-red-500 text-white rounded"
                  disabled={request.approval !== 'pending'}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}