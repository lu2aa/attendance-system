import Link from 'next/link'
     import { useRouter } from 'next/router'
     import { useState } from 'react'

     export default function Navbar({ supabaseClient }) {
       const router = useRouter()
       const [isMenuOpen, setIsMenuOpen] = useState(false)

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
         <nav className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg" dir="rtl">
           <div className="container mx-auto px-4 py-4">
             <div className="flex justify-between items-center">
               <div className="text-2xl font-bold">
                 <Link href="/" className="hover:text-blue-200 transition duration-300">
                   مركز غرب المطار
                 </Link>
               </div>
               {/* Desktop Menu */}
               <ul className="hidden md:flex space-x-6 space-x-reverse items-center">
                 <li>
                   <Link
                     href="/"
                     className={`px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/' ? 'bg-blue-600 font-bold' : ''
                     }`}
                   >
                     الرئيسية
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/dashboard"
                     className={`px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/dashboard' ? 'bg-blue-600 font-bold' : ''
                     }`}
                   >
                     لوحة التحكم
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/about"
                     className={`px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/about' ? 'bg-blue-600 font-bold' : ''
                     }`}
                   >
                     حول
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/employees"
                     className={`px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname.startsWith('/employees') ? 'bg-blue-600 font-bold' : ''
                     }`}
                   >
                     الموظفون
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/evaluation"
                     className={`px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname.startsWith('/evaluation') ? 'bg-blue-600 font-bold' : ''
                     }`}
                   >
                     التقييمات
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/profile"
                     className={`px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/profile' ? 'bg-blue-600 font-bold' : ''
                     }`}
                   >
                     الملف الشخصي
                   </Link>
                 </li>
                 <li>
                   <button
                     onClick={handleLogout}
                     className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-300"
                   >
                     تسجيل الخروج
                   </button>
                 </li>
               </ul>
               {/* Mobile Menu Button */}
               <button
                 className="md:hidden text-white focus:outline-none"
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                   />
                 </svg>
               </button>
             </div>
             {/* Mobile Menu */}
             {isMenuOpen && (
               <ul className="md:hidden flex flex-col mt-4 space-y-2">
                 <li>
                   <Link
                     href="/"
                     className={`block px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/' ? 'bg-blue-600 font-bold' : ''
                     }`}
                     onClick={() => setIsMenuOpen(false)}
                   >
                     الرئيسية
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/dashboard"
                     className={`block px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/dashboard' ? 'bg-blue-600 font-bold' : ''
                     }`}
                     onClick={() => setIsMenuOpen(false)}
                   >
                     لوحة التحكم
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/about"
                     className={`block px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/about' ? 'bg-blue-600 font-bold' : ''
                     }`}
                     onClick={() => setIsMenuOpen(false)}
                   >
                     حول
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/employees"
                     className={`block px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname.startsWith('/employees') ? 'bg-blue-600 font-bold' : ''
                     }`}
                     onClick={() => setIsMenuOpen(false)}
                   >
                     الموظفون
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/evaluation"
                     className={`block px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname.startsWith('/evaluation') ? 'bg-blue-600 font-bold' : ''
                     }`}
                     onClick={() => setIsMenuOpen(false)}
                   >
                     التقييمات
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/profile"
                     className={`block px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition duration-300 ${
                       router.pathname === '/profile' ? 'bg-blue-600 font-bold' : ''
                     }`}
                     onClick={() => setIsMenuOpen(false)}
                   >
                     الملف الشخصي
                   </Link>
                 </li>
                 <li>
                   <button
                     onClick={() => {
                       handleLogout()
                       setIsMenuOpen(false)
                     }}
                     className="w-full text-right px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-300"
                   >
                     تسجيل الخروج
                   </button>
                 </li>
               </ul>
             )}
           </div>
         </nav>
       )
     }