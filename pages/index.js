import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (!error && profile?.is_admin) {
          setIsAdmin(true);
        }
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="bg-blue-600 text-white p-4 text-center">Test Tailwind Colors</div>
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          مرحبًا بك في نظام الحضور
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          إدارة الحضور، التقارير، والبيانات بسهولة وكفاءة
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Link href="/admin/upload" className="block">
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
                      <h2 className="text-xl font-semibold mb-2">رفع البيانات</h2>
                      <p className="text-sm">رفع بيانات الموظفين، الحضور، والتقييمات</p>
                    </div>
                  </Link>
                  <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">التقارير</h2>
                    <div className="space-y-2">
                      <Link href="/reports/employee" className="block text-sm hover:underline">
                        تقرير الموظف
                      </Link>
                      <Link href="/reports/send-email" className="block text-sm hover:underline">
                        إرسال تقرير عبر الإيميل
                      </Link>
                    </div>
                  </div>
                </>
              )}
              <Link href="/profile" className="block">
                <div className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition duration-200">
                  <h2 className="text-xl font-semibold mb-2">الملف الشخصي</h2>
                  <p className="text-sm">عرض وتعديل بياناتك الشخصية</p>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signin" className="block">
                <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
                  <h2 className="text-xl font-semibold mb-2">تسجيل الدخول</h2>
                  <p className="text-sm">قم بتسجيل الدخول إلى حسابك</p>
                </div>
              </Link>
              <Link href="/signup" className="block">
                <div className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition duration-200">
                  <h2 className="text-xl font-semibold mb-2">إنشاء حساب</h2>
                  <p className="text-sm">إنشاء حساب جديد في النظام</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}