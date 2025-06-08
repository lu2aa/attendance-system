import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        if (!user) {
          router.push('/signin');
          return;
        }
        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email, is_admin')
          .eq('id', user.id)
          .single();
        if (profileError) {
          throw profileError;
        }
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('فشل في جلب بيانات المستخدم: ' + (err.message || 'خطأ غير معروف'));
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  if (error) {
    return <div className="bg-red-600 text-white p-4 text-center">{error}</div>;
  }

  if (loading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (!user || !profile) {
    return <div className="text-center p-8">لا توجد بيانات مستخدم</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">الملف الشخصي</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <p className="text-lg mb-4">
            <span className="font-semibold">البريد الإلكتروني:</span> {profile.email}
          </p>
          <p className="text-lg mb-4">
            <span className="font-semibold">الدور:</span> {profile.is_admin ? 'مدير' : 'مستخدم'}
          </p>
        </div>
      </div>
    </div>
  );
}