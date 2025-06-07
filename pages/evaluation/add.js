import { useState } from 'react'
     import { supabase } from '../../lib/supabase'
     import Link from 'next/link'

     export default function AddEvaluation() {
       const [employeeName, setEmployeeName] = useState('')
       const [month, setMonth] = useState('')
       const [score, setScore] = useState('')
       const [comments, setComments] = useState('')
       const [error, setError] = useState(null)
       const [loading, setLoading] = useState(false)

       const handleSubmit = async (e) => {
         e.preventDefault()
         setLoading(true)
         try {
           const { error } = await supabase
             .from('evaluation')
             .insert([{ employee_name: employeeName, evaluation_month: month, evaluation_score: score, comments }])
           if (error) throw error
           setEmployeeName('')
           setMonth('')
           setScore('')
           setComments('')
           alert('تم إضافة التقييم بنجاح!')
         } catch (err) {
           console.error('Error:', err)
           setError(err.message || 'فشل في إضافة التقييم')
         } finally {
           setLoading(false)
         }
       }

       return (
         <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
           <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">إضافة تقييم جديد</h1>
           <Link href="/evaluation" className="inline-block mb-6 text-blue-600 hover:underline">
             العودة إلى التقييمات
           </Link>
           {error && <p className="text-red-600 text-center mb-4">{error}</p>}
           <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl">
             <div className="mb-4">
               <label className="block text-sm font-semibold text-gray-700">اسم الموظف</label>
               <input
                 type="text"
                 value={employeeName}
                 onChange={(e) => setEmployeeName(e.target.value)}
                 placeholder="أدخل اسم الموظف"
                 className="mt-2 border p-3 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                 required
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-semibold text-gray-700">الشهر</label>
               <input
                 type="text"
                 value={month}
                 onChange={(e) => setMonth(e.target.value)}
                 placeholder="مثال: يناير 2025"
                 className="mt-2 border p-3 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                 required
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-semibold text-gray-700">الدرجة</label>
               <input
                 type="number"
                 value={score}
                 onChange={(e) => setScore(e.target.value)}
                 placeholder="أدخل الدرجة"
                 className="mt-2 border p-3 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-semibold text-gray-700">التعليقات</label>
               <textarea
                 value={comments}
                 onChange={(e) => setComments(e.target.value)}
                 placeholder="أدخل التعليقات"
                 className="mt-2 border p-3 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
               />
             </div>
             <button
               type="submit"
               disabled={loading}
               className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
             >
               {loading ? 'جارٍ الإضافة...' : 'إضافة التقييم'}
             </button>
           </form>
         </div>
       )
     }