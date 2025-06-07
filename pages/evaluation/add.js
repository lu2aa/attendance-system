import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function AddEvaluation() {
  const [evaluation, setEvaluation] = useState({
    employee_name: '',
    evaluation_month: '',
    evaluation_score: '',
    comments: ''
  })
  const router = useRouter()

  const handleChange = (e) => {
    setEvaluation({ ...evaluation, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('evaluation')
        .insert([evaluation])
      if (error) throw error
      router.push('/evaluation')
    } catch (error) {
      console.error('Error adding evaluation:', error.message)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Evaluation</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Employee Name</label>
          <input
            type="text"
            name="employee_name"
            value={evaluation.employee_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Month</label>
          <input
            type="text"
            name="evaluation_month"
            value={evaluation.evaluation_month}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="e.g., January 2025"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Score</label>
          <input
            type="number"
            name="evaluation_score"
            value={evaluation.evaluation_score}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Comments</label>
          <textarea
            name="comments"
            value={evaluation.comments}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          ></textarea>
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded w-full">
          Add Evaluation
        </button>
      </form>
    </div>
  )
}