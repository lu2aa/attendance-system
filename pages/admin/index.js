import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">لوحة التحكم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/upload?tab=attendance">
          <button className="w-full py-6 text-xl font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition duration-200">
            رفع الحركات
          </button>
        </Link>
        <Link href="/admin/upload?tab=employees">
          <button className="w-full py-6 text-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-200">
            رفع بيانات الموظفين
          </button>
        </Link>
        <Link href="/admin/upload?tab=schedule">
          <button className="w-full py-6 text-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition duration-200">
            رفع الجداول
          </button>
        </Link>
        <Link href="/admin/upload?tab=requests">
          <button className="w-full py-6 text-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-md transition duration-200">
            رفع الطلبات
          </button>
        </Link>
        <Link href="/admin/upload?tab=evaluation">
          <button className="w-full py-6 text-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-md transition duration-200">
            رفع التقييمات
          </button>
        </Link>
        <Link href="/reports/monthly">
          <button className="w-full py-6 text-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition duration-200">
            تقرير شهري
          </button>
        </Link>
        <Link href="/reports/employee">
          <button className="w-full py-6 text-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md transition duration-200">
            تقرير موظف
          </button>
        </Link>
        <Link href="/reports/send-email">
          <button className="w-full py-6 text-xl font-semibold text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg shadow-md transition duration-200">
            إرسال تقرير عبر الإيميل
          </button>
        </Link>
      </div>
    </div>
  );
}