import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          setIsAdmin(profile?.is_admin || false);
        }
      } catch (err) {
        console.error('Error checking user:', err);
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center" dir="rtl">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">أهلاً وسهلاً بكم</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-2">مركز غرب المطار</h2>
        <p className="text-xl text-gray-600 mb-8">نظام تجريبي للحضور والانصراف</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {user ? (
          <>
            <Link
              href="/employee/profile"
              className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 text-center text-lg"
            >
              الملف الشخصي
            </Link>
            <Link
              href="/employee/attendance"
              className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 text-center text-lg"
            >
              عرض التقرير الخاص بي
            </Link>
            <Link
              href="/employee/submit-request"
              className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 text-center text-lg"
            >
              تقديم طلب
            </Link>
            <Link
              href="/about"
              className="bg-teal-600 text-white p-6 rounded-lg shadow-md hover:bg-teal-700 text-center text-lg"
            >
              عن البرنامج
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-red-600 text-white p-6 rounded-lg shadow-md hover:bg-red-700 text-center text-lg"
              >
                لوحة تحكم المدير
              </Link>
            )}
          </>
        ) : (
          <Link
            href="/signin"
            className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 text-center text-lg"
          >
            تسجيل الدخول
          </Link>
        )}
      </div>
    </div>
  );
}