import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          if (profileError) {
            throw profileError;
          }
          if (profile?.is_admin) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Supabase error:', err);
        setError('فشل تحميل بيانات المستخدم');
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUser();
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/signin');
    } catch (err) {
      console.error('Sign out error:', err);
      setError('فشل تسجيل الخروج');
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (error) {
    return <div className="bg-red-600 text-white p-4 text-center">{error}</div>;
  }

  return (
    <nav className="bg-blue-800 text-white shadow-lg" dir="rtl">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          نظام الحضور
        </Link>
        <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:flex items-center space-x-4 space-x-reverse">
          {user ? (
            <>
              {isAdmin && (
                <>
                  <div className="relative group">
                    <button className="px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                      التقارير
                    </button>
                    <div className="absolute hidden group-hover:block bg-blue-800 rounded-lg shadow-lg mt-2">

                      <Link href="/reports/send-email" className="block px-4 py-2 text-lg hover:bg-blue-700">
  إرسال تقرير عبر الإيميل
</Link>
<Link href="/reports/employees" className="block px-4 py-2 text-lg hover:bg-blue-700">
تقرير الموظفين</Link>
                    </div>
                  </div>
                  <Link href="/admin/upload" className="px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                    رفع البيانات
                  </Link>
                </>
              )}
              <Link href="/profile" className="px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                الملف الشخصي
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-lg bg-red-600 hover:bg-red-700 rounded-lg"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                تسجيل الدخول
              </Link>
              <Link href="/signup" className="px-4 py-2 text-lg bg-green-600 hover:bg-green-700 rounded-lg">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-blue-800">
          <div className="flex flex-col space-y-2 px-4 py-4">
            {user ? (
              <>
                {isAdmin && (
                  <>
                    <div>
                      <button className="w-full text-right px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                        التقارير
                      </button>
                      <div className="pr-8">
<Link href="/reports/send-email" className="block px-4 py-2 text-lg hover:bg-blue-700">
  إرسال تقرير عبر الإيميل
</Link>
-<Link href="/reports/employee" className="block px-4 py-2 text-lg hover:bg-blue-700">
-  تقرير الموظف
-</Link>
+<Link href="/reports/employees" className="block px-4 py-2 text-lg hover:bg-blue-700">
+  تقرير الموظفين
+</Link>
                      </div>
                    </div>
                    <Link href="/admin/upload" className="px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                      رفع البيانات
                    </Link>
                  </>
                )}
                <Link href="/profile" className="px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                  الملف الشخصي
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-lg bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="px-4 py-2 text-lg hover:bg-blue-700 rounded-lg">
                  تسجيل الدخول
                </Link>
                <Link href="/signup" className="px-4 py-2 text-lg bg-green-600 hover:bg-green-700 rounded-lg">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}