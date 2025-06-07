import { useState, useEffect } from 'react'
     import { useRouter } from 'next/router'

     export default function Profile({ supabaseClient }) {
       const [userInfo, setUserInfo] = useState(null)
       const [attendance, setAttendance] = useState([])
       const [requests, setRequests] = useState([])
       const [evaluations, setEvaluations] = useState([])
       const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
       const [error, setError] = useState(null)
       const [loading, setLoading] = useState(true)
       const router = useRouter()

       useEffect(() => {
         fetchUserData()
       }, [supabaseClient])

       useEffect(() => {
         if (userInfo?.email) {
           fetchMonthlyData()
         }
       }, [selectedMonth, userInfo])

       async function fetchUserData() {
         try {
           const { data: { session } } = await supabaseClient.auth.getSession()
           if (!session) {
             router.push('/signin')
             return
           }
           const { data: employee, error } = await supabaseClient
             .from('employees')
             .select('name, email, department, role')
             .eq('email', session.user.email)
             .single()
           if (error) throw error
           setUserInfo(employee)
         } catch (err) {
           console.error('Error fetching user data:', err)
           setError('فشل في جلب بيانات المستخدم')
         } finally {
           setLoading(false)
         }
       }

       async function fetchMonthlyData() {
         try {
           const [attendanceRes, requestsRes, evaluationRes] = await Promise.all([
             supabaseClient
               .from('attendance')
               .select('*')
               .eq('employee_email', userInfo.email)
               .like('date', `${selectedMonth}%`),
             supabaseClient
               .from('requests')
               .select('*')
               .eq('employee_email', userInfo.email)
               .like('request_date', `${selectedMonth}%`),
             supabaseClient
               .from('evaluation')
               .select('*')
               .eq('employee_name', userInfo.name)
               .like('evaluation_month', `${selectedMonth}%`),
           ])

           if (attendanceRes.error) throw attendanceRes.error
           if (requestsRes.error) throw requestsRes.error
           if (evaluationRes.error) throw evaluationRes.error

           setAttendance(attendanceRes.data || [])
           setRequests(requestsRes.data || [])
           setEvaluations(evaluationRes.data || [])
         } catch (err) {
           console.error('Error fetching monthly data:', err)
           setError('فشل في جلب البيانات الشهرية')
         }
       }

       if (loading) {
         return <div className="container mx-auto p-6 text-center text-gray-600 animate-pulse">جارٍ التحميل...</div>
       }

       if (error) {
         return <div className="container mx-auto p-6 text-center text-red-600 font-semibold">خطأ: {error}</div>
       }

       if (!userInfo) {
         return <div className="container mx-auto p-6 text-center text-gray-600">لا توجد بيانات للمستخدم</div>
       }

       return (
         <div className="container mx-auto p-6 bg-gray-100 min-h-screen" dir="rtl">
           <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">الملف الشخصي</h1>
           <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
             <h2 className="text-2xl font-semibold text-gray-800 mb-4">معلومات شخصية</h2>
             <p className="text-gray-700 mb-2">الاسم: {userInfo.name}</p>
             <p className="text-gray-700 mb-2">البريد الإلكتروني: {userInfo.email}</p>
             <p className="text-gray-700 mb-2">القسم: {userInfo.department || 'غير محدد'}</p>
             <p className="text-gray-700 mb-6">الدور: {userInfo.role || 'غير محدد'}</p>

             <div className="mb-6">
               <label className="block text-sm font-semibold text-gray-700 mb-2">اختر الشهر</label>
               <input
                 type="month"
                 value={selectedMonth}
                 onChange={(e) => setSelectedMonth(e.target.value)}
                 className="border p-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <button
                 onClick={() => document.getElementById('attendance').scrollIntoView({ behavior: 'smooth' })}
                 className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
               >
                 حضوري
               </button>
               <button
                 onClick={() => document.getElementById('requests').scrollIntoView({ behavior: 'smooth' })}
                 className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition duration-300"
               >
                 طلباتي
               </button>
               <button
                 onClick={() => document.getElementById('evaluations').scrollIntoView({ behavior: 'smooth' })}
                 className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transition duration-300"
               >
                 تقييماتي
               </button>
             </div>

             <div id="attendance" className="mt-12">
               <h2 className="text-2xl font-semibold text-gray-800 mb-4">حضوري ({selectedMonth})</h2>
               {attendance.length === 0 ? (
                 <p className="text-gray-600 italic">لا توجد سجلات حضور لهذا الشهر</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full border-collapse bg-white shadow-md rounded-xl">
                     <thead>
                       <tr className="bg-gray-200">
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">وقت الحضور</th>
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">وقت الانصراف</th>
                       </tr>
                     </thead>
                     <tbody>
                       {attendance.map((record) => (
                         <tr key={record.id} className="hover:bg-gray-50">
                           <td className="border-b p-4 text-right text-sm text-gray-800">{record.date}</td>
                           <td className="border-b p-4 text-right text-sm text-gray-800">{record.check_in || 'غير مسجل'}</td>
                           <td className="border-b p-4 text-right text-sm text-gray-800">{record.check_out || 'غير مسجل'}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>

             <div id="requests" className="mt-12">
               <h2 className="text-2xl font-semibold text-gray-800 mb-4">طلباتي ({selectedMonth})</h2>
               {requests.length === 0 ? (
                 <p className="text-gray-600 italic">لا توجد طلبات لهذا الشهر</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full border-collapse bg-white shadow-md rounded-xl">
                     <thead>
                       <tr className="bg-gray-200">
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">تاريخ الطلب</th>
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">نوع الطلب</th>
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                       </tr>
                     </thead>
                     <tbody>
                       {requests.map((request) => (
                         <tr key={request.id} className="hover:bg-gray-50">
                           <td className="border-b p-4 text-right text-sm text-gray-800">{request.request_date}</td>
                           <td className="border-b p-4 text-right text-sm text-gray-800">{request.request_type}</td>
                           <td className="border-b p-4 text-right text-sm text-gray-800">{request.status}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>

             <div id="evaluations" className="mt-12">
               <h2 className="text-2xl font-semibold text-gray-800 mb-4">تقييماتي ({selectedMonth})</h2>
               {evaluations.length === 0 ? (
                 <p className="text-gray-600 italic">لا توجد تقييمات لهذا الشهر</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full border-collapse bg-white shadow-md rounded-xl">
                     <thead>
                       <tr className="bg-gray-200">
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">الشهر</th>
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">الدرجة</th>
                         <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">التعليقات</th>
                       </tr>
                     </thead>
                     <tbody>
                       {evaluations.map((evaluation) => (
                         <tr key={evaluation.id} className="hover:bg-gray-50">
                           <td className="border-b p-4 text-right text-sm text-gray-800">{evaluation.evaluation_month}</td>
                           <td className="border-b p-4 text-right text-sm text-gray-800">{evaluation.evaluation_score || 'غير متوفر'}</td>
                           <td className="border-b p-4 text-right text-sm text-gray-800">{evaluation.comments || 'غير متوفر'}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
           </div>
         </div>
       )
     }