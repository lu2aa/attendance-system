import { useState } from 'react'
     import Link from 'next/link'

     export default function SignUp({ supabaseClient }) {
       const [email, setEmail] = useState('')
       const [password, setPassword] = useState('')
       const [error, setError] = useState(null)
       const [loading, setLoading] = useState(false)

       const handleSignUp = async (e) => {
         e.preventDefault()
         setLoading(true)
         try {
           const { error } = await supabaseClient.auth.signUp({ email, password })
           if (error) throw error
           alert('تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب.')
           setEmail('')
           setPassword('')
         } catch (err) {
           setError(err.message)
         } finally {
           setLoading(false)
         }
       }

       return (
         <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
           <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
             <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">إنشاء حساب</h1>
             {error && <p className="text-red-600 text-center mb-4">{error}</p>}
             <form onSubmit={handleSignUp}>
               <div className="mb-4">
                 <label className="block text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="أدخل بريدك الإلكتروني"
                   className="mt-2 border p-3 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-sm font-semibold text-gray-700">كلمة المرور</label>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="أدخل كلمة المرور"
                   className="mt-2 border p-3 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
               </div>
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full px-8 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
               >
                 {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
               </button>
             </form>
             <p className="mt-4 text-center text-gray-600">
               لديك حساب؟{' '}
               <Link href="/signin" className="text-blue-600 hover:underline">
                 تسجيل الدخول
               </Link>
             </p>
           </div>
         </div>
       )
     }