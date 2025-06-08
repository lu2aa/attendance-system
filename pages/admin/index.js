import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (!profile?.is_admin) {
        router.push('/');
      }
    };
    checkAdmin();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">لوحة التحكم</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/upload" className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 text-center">
            رفع بيانات
          </Link>
          <Link href="/admin/send-reports" className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 text-center">
            ارسال تقارير
          </Link>
          <Link href="/admin/employees" className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 text-center">
            الموظفين
          </Link>
          <Link href="/admin/reports" className="bg-teal-600 text-white p-6 rounded-lg shadow-md hover:bg-teal-700 text-center">
            التقارير
          </Link>
          <Link href="/admin/attendance" className="bg-orange-600 text-white p-6 rounded-lg shadow-md hover:bg-orange-700 text-center">
            الحركات
          </Link>
        </div>
      </div>
    </div>
  );
}