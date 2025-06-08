import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
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
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push('/signin');
  };

  return (
    <nav className="bg-blue-600 text-white p-4" dir="rtl">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/" className="hover:underline"> الرئيسية </Link>
          <Link href="/about" className="hover:underline"> عن النظام </Link>
          
          {user && (
            <>
              {isAdmin ? (
                <Link href="/admin" className="hover:underline"> لوحة التحكم </Link>
              ) : (
                <>
                  <Link href="/employee/attendance" className="hover:underline">تقرير الحضور</Link>
                  <Link href="/employee/submit-request" className="hover:underline">تقديم طلب</Link>
                  <Link href="/employee/profile" className="hover:underline">ملفي الشخصي</Link>
                </>
              )}
            </>
          )}
        </div>
        <div>
          {user ? (
            <button onClick={handleSignOut} className="hover:underline">تسجيل الخروج</button>
          ) : (
            <Link href="/signin" className="hover:underline">تسجيل الدخول</Link>
          )}
        </div>
      </div>
    </nav>
  );
}