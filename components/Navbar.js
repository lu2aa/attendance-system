import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isAdmin } from '../lib/auth';

export default function Navbar({ supabaseClient }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !session) {
          setIsAdminUser(false);
          router.push('/signin');
          return;
        }
        const adminStatus = await isAdmin(supabaseClient, session.user.email);
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error('Error checking admin:', error);
        setIsAdminUser(false);
      }
    }
    checkAdmin();
  }, [supabaseClient, router]);

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-blue-800 shadow-xl" dir="rtl">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-white text-3xl font-bold">
            نظام الحضور
          </Link>
          <button
            className="text-white md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div
            className={`md:flex md:items-center ${isOpen ? 'block' : 'hidden'} w-full md:w-auto mt-4 md:mt-0`}
          >
            <Link href="/" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
              الرئيسية
            </Link>
            <Link href="/about" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
              حول
            </Link>
            <Link href="/profile" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
              الملف الشخصي
            </Link>
            {isAdminUser && (
              <>
                <Link href="/admin" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  لوحة التحكم
                </Link>
                <Link href="/admin/upload?tab=attendance" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  رفع الحركات
                </Link>
                <Link href="/admin/upload?tab=employees" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  رفع بيانات الموظفين
                </Link>
                <Link href="/admin/upload?tab=schedule" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  رفع الجداول
                </Link>
                <Link href="/admin/upload?tab=requests" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  رفع الطلبات
                </Link>
                <Link href="/admin/upload?tab=evaluation" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  رفع التقييمات
                </Link>
                <Link href="/reports/monthly" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  تقرير شهري
                </Link>
                <Link href="/reports/employee" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  تقرير موظف
                </Link>
                <Link href="/reports/send-email" className="block md:inline-block text-white px-4 py-3 text-xl hover:bg-blue-900 rounded-lg">
                  إرسال تقرير عبر الإيميل
                </Link>
              </>
            )}
            <button
              onClick={handleSignOut}
              className="block md:inline-block text-white px-4 py-3 text-xl bg-red-600 hover:bg-red-700 rounded-lg"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}