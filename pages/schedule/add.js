import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function AddSchedule() {
  const [schedule, setSchedule] = useState({
    employee_name: '',
    shift_date: '',
    shift_start_time: '',
    shift_end_time: ''
  })
  const router = useRouter()

  const handleChange = (e) => {
    setSchedule({ ...schedule, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('schedule')
        .insert([schedule])
      if (error) throw error
      router.push('/schedule')
    } catch (error) {
      console.error('Error adding schedule:', error.message)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Schedule</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Employee Name</label>
          <input
            type="text"
            name="employee_name"
            value={schedule.employee_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Shift Date</label>
          <input
            type="date"
            name="shift_date"
            value={schedule.shift_date}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Time</label>
          <input
            type="time"
            name="shift_start_time"
            value={schedule.shift_start_time}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Time</label>
          <input
            type="time"
            name="shift_end_time"
            value={schedule.shift_end_time}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded w-full">
          Add Schedule
        </button>
      </form>
    </div>
  )
}