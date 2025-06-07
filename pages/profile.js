import { useState, useEffect } from 'react'
   import { useRouter } from 'next/router'

   export default function Profile({ supabaseClient }) {
     const [userInfo, setUserInfo] = useState(null)
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
         const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
         if (sessionError) throw sessionError
         if (!session) {
           router.push('/signin')
           return
         }
         console.log('Session user email:', session.user.email) // Debug
         const { data: employee, error: employeeError } = await supabaseClient
           .from('employees')
           .select('employeenumber, employeename, email, jobtitle, grade, workstatus, workdays, parttime, shift, ischristian, nursinghour, disability, regularleavebalance, casualleavebalance, absencedayscount, notes')
           .eq('email', session.user.email)
           .single()
         if (employeeError) {
           if (employeeError.code === 'PGRST116') {
             setError('لا يوجد سجل موظف مرتبط بهذا الحساب. الرجاء التواصل مع الإدارة.')
           } else {
             throw employeeError
           }
         } else {
           console.log('Fetched employee:', employee) // Debug
           setUserInfo(employee)
         }
       } catch (err) {
         console.error('Error fetching user data:', err.message || err)
         setError('فشل في جلب بيانات المستخدم: ' + (err.message || 'خطأ غير معروف'))
       } finally {
         setLoading(false)
       }
     }

     async function fetchMonthlyData() {
       try {
         const [requestsRes, evaluationRes] = await Promise.all([
           supabaseClient
             .from('requests')
             .select('*')
             .eq('employeenumber', userInfo.employeenumber)
             .like('requeststartdate', `${selectedMonth}%`),
           supabaseClient
             .from('evaluation')
             .select('*')
             .eq('employeenumber', userInfo.employeenumber)
             .like('timestamp', `${selectedMonth}%`)
         ])

         if (requestsRes.error) throw requestsRes.error
         if (evaluationRes.error) throw evaluationRes.error

         console.log('Requests:', requestsRes.data) // Debug
         console.log('Evaluations:', evaluationRes.data) // Debug
         setRequests(requestsRes.data || [])
         setEvaluations(evaluationRes.data || [])
       } catch (err) {
         console.error('Error fetching monthly data:', err.message || err)
         setError('فشل في جلب البيانات الشهرية: ' + (err.message || 'خطأ غير معروف'))
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
           <p className="text-gray-700 mb-2">رقم الموظف: {userInfo.employeenumber}</p>
           <p className="text-gray-700 mb-2">الاسم: {userInfo.employeename}</p>
           <p className="text-gray-700 mb-2">البريد الإلكتروني: {userInfo.email}</p>
           <p className="text-gray-700 mb-2">المسمى الوظيفي: {userInfo.jobtitle || 'غير محدد'}</p>
           <p className="text-gray-700 mb-2">الدرجة: {userInfo.grade || 'غير محدد'}</p>
           <p className="text-gray-700 mb-2">حالة العمل: {userInfo.workstatus || 'غير محدد'}</p>
           <p className="text-gray-700 mb-2">أيام العمل: {userInfo.workdays || 'غير محدد'}</p>
           <p className="text-gray-700 mb-2">دوام جزئي: {userInfo.parttime ? 'نعم' : 'لا'}</p>
           <p className="text-gray-700 mb-2">الوردية: {userInfo.shift || 'غير محدد'}</p>
           <p className="text-gray-700 mb-2">مسيحي: {userInfo.ischristian ? 'نعم' : 'لا'}</p>
           <p className="text-gray-700 mb-2">ساعة رضاعة: {userInfo.nursinghour ? 'نعم' : 'لا'}</p>
           <p className="text-gray-700 mb-2">إعاقة: {userInfo.disability ? 'نعم' : 'لا'}</p>
           <p className="text-gray-700 mb-2">رصيد الإجازة العادية: {userInfo.regularleavebalance || 0}</p>
           <p className="text-gray-700 mb-2">رصيد الإجازة العارضة: {userInfo.casualleavebalance || 0}</p>
           <p className="text-gray-700 mb-2">عدد أيام الغياب: {userInfo.absencedayscount || 0}</p>
           <p className="text-gray-700 mb-6">ملاحظات: {userInfo.notes || 'لا يوجد'}</p>

           <div className="mb-6">
             <label className="block text-sm font-semibold text-gray-700 mb-2">اختر الشهر</label>
             <input
               type="month"
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="border p-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                       <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">الرد</th>
                     </tr>
                   </thead>
                   <tbody>
                     {requests.map((request) => (
                       <tr key={request.id} className="hover:bg-gray-50">
                         <td className="border-b p-4 text-right text-sm text-gray-800">{request.requeststartdate}</td>
                         <td className="border-b p-4 text-right text-sm text-gray-800">{request.requesttype}</td>
                         <td className="border-b p-4 text-right text-sm text-gray-800">{request.approval}</td>
                         <td className="border-b p-4 text-right text-sm text-gray-800">{request.reply || 'لا يوجد'}</td>
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
                       <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">أيام الحضور</th>
                       <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">ساعات العمل</th>
                       <th className="border-b p-4 text-right text-sm font-semibold text-gray-700">التقييم الشهري</th>
                     </tr>
                   </thead>
                   <tbody>
                     {evaluations.map((evaluation) => (
                       <tr key={evaluation.id} className="hover:bg-gray-50">
                         <td className="border-b p-4 text-right text-sm text-gray-800">{evaluation.presentdays || 'غير متوفر'}</td>
                         <td className="border-b p-4 text-right text-sm text-gray-800">{evaluation.workhours || 'غير متوفر'}</td>
                         <td className="border-b p-4 text-right text-sm text-gray-800">{evaluation.monthlyevaluation || 'غير متوفر'}</td>
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