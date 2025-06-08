import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Added import
import { supabase } from '../lib/supabaseClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        throw signInError;
      }
      if (data.user) {
        router.push('/');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message || 'فشل تسجيل الدخول، تحقق من البريد وكلمة السر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">تسجيل الدخول</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-lg mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-300 p-3 rounded-lg text-lg focus:border-blue-600"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-300 p-3 rounded-lg text-lg focus:border-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xl text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'جارٍ التحميل...' : 'تسجيل الدخول'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          ليس لديك حساب؟{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
}