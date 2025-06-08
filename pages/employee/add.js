import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function AddEmployee() {
  const [employee, setEmployee] = useState({
    employee_number: '',
    employee_name: '',
    email: '',
    job_title: ''
  })
  const router = useRouter()

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('employees')
        .insert([employee])
      if (error) throw error
      router.push('/employees')
    } catch (error) {
      console.error('Error adding employee:', error.message)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Employee</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Employee Number</label>
          <input
            type="text"
            name="employee_number"
            value={employee.employee_number}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="employee_name"
            value={employee.employee_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={employee.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Job Title</label>
          <input
            type="text"
            name="job_title"
            value={employee.job_title}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded w-full">
          Add Employee
        </button>
      </form>
    </div>
  )
}