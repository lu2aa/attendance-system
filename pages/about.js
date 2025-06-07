import Link from 'next/link'

     export default function About() {
       return (
         <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
           <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">أهلاً وسهلاً بكم</h1>
           <div className="max-w-2xl text-center text-gray-700 text-lg leading-relaxed">
             <p className="mb-4">هذا التطبيق غير رسمي</p>
             <p className="mb-4">من تصميم د. وائل عبد اللطيف ربيع</p>
             <p className="mb-4">استشاري طب الأسرة ومدير مركز غرب المطار</p>
             <p className="mb-4">لتنظيم وإدارة حركات الحضور والانصراف للعاملين بالمركز</p>
           </div>
           <Link
             href="/"
             className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
           >
             العودة إلى الرئيسية
           </Link>
         </div>
       )}