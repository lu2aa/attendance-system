import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Employees() {
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('*')
    setEmployees(data || [])
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>
      <Link
        href="/employees/add"
        className="mb-4 inline-block p-2 bg-blue-500 text-white rounded"
      >
        Add Employee
      </Link>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Employee Number</th>
            <th className="border p-2">Job Title</th>
            <th className="border p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="border p-2">{employee.employee_name}</td>
              <td className="border p-2">{employee.employee_number}</td>
              <td className="border p-2">{employee.job_title}</td>
              <td className="border p-2">{employee.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}