import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function SubmitRequest() {
  const [form, setForm] = useState({
    requesttype: '',
    requeststartdate: '',
    requestenddate: '',
    notes: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const requestTypes = [
    'إجازة اعتيادية',
    'إجازة عارضة',
    'إذن صباحي',
    'إذن مسائي',
    'تأمين صحي',
    'بدل راحة',
    'خط سير',
    'مأمورية',
    'دورة تدريبية',
  ];

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          router.push('/signin');
          return;
        }
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setStatus('فشل التحقق من المستخدم: ' + err.message);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('employeenumber, employeename, email')
        .eq('email', user.email)
        .single();
      if (empError || !employee) {
        throw new Error('لم يتم العثور على بيانات الموظف');
      }
      const { error: insertError } = await supabase.from('requests').insert({
        id: uuidv4(),
        employeenumber: employee.employeenumber,
        employeename: employee.employeename,
        email: employee.email,
        requesttype: form.requesttype,
        requeststartdate: form.requeststartdate,
        requestenddate: form.requestenddate || null,
        notes: form.notes || '',
        approval: 'معلق',
      });
      if (insertError) throw insertError;
      setStatus('تم إرسال الطلب بنجاح!');
      setForm({ requesttype: '', requeststartdate: '', requestenddate: '', notes: '' });
    } catch (err) {
      console.error('Error:', err);
      setStatus('فشل إرسال الطلب: ' + (err.message || 'خطأ غير معروف'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">تقديم طلب</h1>
        {loading ? (
          <p className="text-center text-lg">جاري التحميل...</p>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <div className="mb-4">
              <label className="block text-lg mb-2">نوع الطلب</label>
              <select
                value={form.requesttype}
                onChange={(e) => setForm({ ...form, requesttype: e.target.value })}
                className="w-full border-2 p-2 rounded-lg"
                required
              >
                <option value="">اختر النوع</option>
                {requestTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">تاريخ البدء</label>
              <input
                type="date"
                value={form.requeststartdate}
                onChange={(e) => setForm({ ...form, requeststartdate: e.target.value })}
                className="w-full border-2 p-2 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">تاريخ الانتهاء (اختياري)</label>
              <input
                type="date"
                value={form.requestenddate}
                onChange={(e) => setForm({ ...form, requestenddate: e.target.value })}
                className="w-full border-2 p-2 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">ملاحظات</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border-2 p-2 rounded-lg"
                rows="4"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              إرسال الطلب
            </button>
            {status && (
              <p className={`mt-4 text-lg ${status.includes('فشل') ? 'text-red-600' : 'text-green-600'}`}>
                {status}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}