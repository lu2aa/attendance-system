import Link from 'next/link'

     export default function Home() {
       return (
         <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
           <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
             أهلاً وسهلاً بكم في مركز غرب المطار
           </h1>
           <p className="text-xl text-gray-700 mb-8 text-center">
             برنامج تنظيم الحضور والانصراف للعاملين بالمركز
           </p>
           <div className="flex flex-col sm:flex-row gap-4">
             <Link
               href="/signin"
               className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 text-center"
             >
               تسجيل الدخول
             </Link>
             <Link
               href="/signup"
               className="px-8 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition duration-300 text-center"
             >
               إنشاء حساب
             </Link>
             <Link
               href="/about"
               className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 transition duration-300 text-center"
             >
               حول البرنامج
             </Link>
           </div>
         </div>
       )
     }