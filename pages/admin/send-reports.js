import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function SendReports() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
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
        return;
      }
      const { data } = await supabase.from('employees').select('employeenumber, employeename, email');
      setEmployees(data);
      setLoading(false);
    };
    fetchEmployees();
  }, [router]);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sendEmails = async () => {
    setStatus('');
    try {
      const selectedEmployees = employees.filter((emp) =>
        selected.includes(emp.employeenumber)
      );
      for (const emp of selectedEmployees) {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('employeenumber', emp.employeenumber);
        const content = `
          <h1>تقرير الموظف: ${emp.employeename}</h1>
          <p>الحضور:</p>
          <ul>${attendance.map((rec) => `<li>${rec.check_date}: ${rec.status}</li>`).join('')}</ul>
        `;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emp.email,
            subject: `تقرير الحضور لـ ${emp.employeename}`,
            content,
          }),
        });
      }
      setStatus('تم إرسال التقارير بنجاح!');
    } catch (err) {
      setStatus('فشل إرسال التقارير: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">ارسال تقارير</h1>
        {loading ? (
          <p className="text-center">جاري التحميل...</p>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">اختر الموظفين</h2>
              {employees.map((emp) => (
                <div key={emp.employeenumber} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(emp.employeenumber)}
                    onChange={() => handleSelect(emp.employeenumber)}
                    className="mr-2"
                  />
                  <span>{emp.employeename} ({emp.email})</span>
                </div>
              ))}
            </div>
            <button
              onClick={sendEmails}
              className="px-6 py-3 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              disabled={!selected.length}
            >
              إرسال التقارير
            </button>
            {status && (
              <p className={`mt-4 ${status.includes('فشل') ? 'text-red-600' : 'text-green-600'}`}>
                {status}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}