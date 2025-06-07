import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Schedule() {
  const [schedules, setSchedules] = useState([])

  useEffect(() => {
    fetchSchedules()
  }, [])

  async function fetchSchedules() {
    const { data } = await supabase.from('schedule').select('*')
    setSchedules(data || [])
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Schedules</h1>
      <Link
        href="/schedule/add"
        className="mb-4 inline-block p-2 bg-blue-500 text-white rounded"
      >
        Add Schedule
      </Link>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Shift Date</th>
            <th className="border p-2">Start Time</th>
            <th className="border p-2">End Time</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="border p-2">{schedule.employee_name}</td>
              <td className="border p-2">{schedule.shift_date}</td>
              <td className="border p-2">{schedule.shift_start_time}</td>
              <td className="border p-2">{schedule.shift_end_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}