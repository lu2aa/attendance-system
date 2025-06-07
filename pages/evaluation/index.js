import { useState, useEffect } from 'react'
       import { supabase } from '../../lib/supabase'
       import Link from 'next/link'

       export default function Evaluation() {
         const [evaluations, setEvaluations] = useState([])
         const [error, setError] = useState(null)
         const [loading, setLoading] = useState(true)

         useEffect(() => {
           fetchEvaluations()
         }, [])

         async function fetchEvaluations() {
           try {
             const { data, error } = await supabase.from('evaluation').select('*')
             if (error) {
               console.error('Supabase fetch error:', error)
               setError(error.message)
               return
             }
             console.log('Fetched evaluations:', data)
             setEvaluations(data || [])
           } catch (err) {
             console.error('Unexpected error:', err)
             setError('Failed to fetch evaluations')
           } finally {
             setLoading(false)
           }
         }

         if (error) {
           return <div className="container mx-auto p-6 text-center text-red-600 font-semibold">Error: {error}</div>
         }

         if (loading) {
           return <div className="container mx-auto p-6 text-center text-gray-600 animate-pulse">Loading evaluations...</div>
         }

         return (
           <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
             <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Evaluations</h1>
             <Link
               href="/evaluation/add"
               className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 mb-8 mx-auto"
             >
               Add New Evaluation
             </Link>
             {evaluations.length === 0 ? (
               <p className="text-lg text-gray-600 italic text-center">No evaluations found. Start by adding one!</p>
             ) : (
               <div className="max-w-4xl mx-auto overflow-x-auto bg-white shadow-2xl rounded-xl">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-gray-200">
                       <th className="border-b border-gray-300 p-4 text-left text-sm font-semibold text-gray-700">Employee Name</th>
                       <th className="border-b border-gray-300 p-4 text-left text-sm font-semibold text-gray-700">Month</th>
                       <th className="border-b border-gray-300 p-4 text-left text-sm font-semibold text-gray-700">Score</th>
                       <th className="border-b border-gray-300 p-4 text-left text-sm font-semibold text-gray-700">Comments</th>
                     </tr>
                   </thead>
                   <tbody>
                     {evaluations.map((evaluation) => (
                       <tr key={evaluation.id} className="hover:bg-gray-50 transition duration-200">
                         <td className="border-b border-gray-300 p-4 text-sm text-gray-800">{evaluation.employee_name}</td>
                         <td className="border-b border-gray-300 p-4 text-sm text-gray-800">{evaluation.evaluation_month}</td>
                         <td className="border-b border-gray-300 p-4 text-sm text-gray-800">{evaluation.evaluation_score || 'N/A'}</td>
                         <td className="border-b border-gray-300 p-4 text-sm text-gray-600">{evaluation.comments || 'N/A'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         )
       }