import Link from 'next/link'
     import { useRouter } from 'next/router'

     export default function Navbar({ supabaseClient }) {
       const router = useRouter()

       const handleLogout = async () => {
         try {
           const { error } = await supabaseClient.auth.signOut()
           if (error) throw error
           router.push('/')
         } catch (error) {
           console.error('Logout error:', error.message)
           alert('فشل تسجيل الخروج: ' + error.message)
         }
       }

       return (
         <nav className="bg-blue-800 text-white p-4 shadow-lg" dir="rtl">
           <div className="container mx-auto flex justify-between items-center">
             <div className="text-xl font-bold">
               <Link href="/">مركز غرب المطار</Link>
             </div>
             <ul className="flex space-x-6 space-x-reverse">
               <li>
                 <Link
                   href="/"
                   className={`hover:text-blue-300 transition duration-300 ${
                     router.pathname === '/' ? 'font-bold text-blue-300' : ''
                   }`}
                 >
                   الرئيسية
                 </Link>
               </li>
               <li>
                 <Link
                   href="/dashboard"
                   className={`hover:text-blue-300 transition duration-300 ${
                     router.pathname === '/dashboard' ? 'font-bold text-blue-300' : ''
                   }`}
                 >
                   لوحة التحكم
                 </Link>
               </li>
               <li>
                 <Link
                   href="/about"
                   className={`hover:text-blue-300 transition duration-300 ${
                     router.pathname === '/about' ? 'font-bold text-blue-300' : ''
                   }`}
                 >
                   حول
                 </Link>
               </li>
               <li>
                 <Link
                   href="/employees"
                   className={`hover:text-blue-300 transition duration-300 ${
                     router.pathname.startsWith('/employees') ? 'font-bold text-blue-300' : ''
                   }`}
                 >
                   الموظفون
                 </Link>
               </li>
               <li>
                 <Link
                   href="/evaluation"
                   className={`hover:text-blue-300 transition duration-300 ${
                     router.pathname.startsWith('/evaluation') ? 'font-bold text-blue-300' : ''
                   }`}
                 >
                   التقييمات
                 </Link>
               </li>
               <li>
                 <Link
                   href="/profile"
                   className={`hover:text-blue-300 transition duration-300 ${
                     router.pathname === '/profile' ? 'font-bold text-blue-300' : ''
                   }`}
                 >
                   الملف الشخصي
                 </Link>
               </li>
               <li>
                 <button
                   onClick={handleLogout}
                   className="text-red-300 hover:text-red-400 transition duration-300"
                 >
                   تسجيل الخروج
                 </button>
               </li>
             </ul>
           </div>
         </nav>
       )
     }