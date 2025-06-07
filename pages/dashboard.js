import { useEffect } from 'react'
     import { useSupabaseClient, useSession } from '@supabase/ssr'
     import Link from 'next/link'
     import { useRouter } from 'next/router'

     export default function Dashboard() {
       const supabase = useSupabaseClient()
       const session = useSession()
       const router = useRouter()

       useEffect(() => {
         if (!session) {
           router.push('/signin')
         }
       }, [session, router])

       const handleLogout = async () => {
         try {
           const { error } = await supabase.auth.signOut()
           if (error) throw error
           router.push('/')
         } catch (error) {
           console.error('Logout error:', error.message)
           alert('فشل تسجيل الخروج: ' + error.message)
         }
       }

       if (!session) {
         return <div className="container mx-auto p-6 text-center text-gray-600 animate-pulse">جارٍ التحقق...</div>
       }

       return (
         <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
           <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">لوحة التحكم</h1>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
             <Link
               href="/employees"
               className="p-6 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition duration-300 text-center text-gray-700 font-semibold"
             >
               الموظفون
             </Link>
             <Link
               href="/employees/upload"
               className="p-6 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition duration-300 text-center text-gray-700 font-semibold"
             >
               رفع بيانات الموظفين
             </Link>
             <Link
               href="/evaluation"
               className="p-6 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition duration-300 text-center text-gray-700 font-semibold"
             >
               التقييمات
             </Link>
             <Link
               href="/requests"
               className="p-6 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition duration-300 text-center text-gray-700 font-semibold"
             >
               الطلبات
             </Link>
             <Link
               href="/schedule"
               className="p-6 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition duration-300 text-center text-gray-700 font-semibold"
             >
               الجداول
             </Link>
           </div>
           <button
             onClick={handleLogout}
             className="mt-8 px-8 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition duration-300 block mx-auto"
           >
             تسجيل الخروج
           </button>
         </div>
       )
     }