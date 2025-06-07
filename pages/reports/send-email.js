import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SendEmailReport({ supabaseClient }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [month, setMonth] = useState('2025-06');
  const [subject, setSubject] = useState(`تقرير التقييم الشهري لشهر ${month}`);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const { data: empData, error: empError } = await supabaseClient
          .from('employees')
          .select('employeenumber, employeename, email');
        if (empError) {
          throw new Error(`فشل في جلب الموظفين: ${empError.message}`);
        }
        setEmployees(empData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employees:', err);
      }
    }
    fetchEmployees();
  }, [supabaseClient]);

  useEffect(() => {
    setSubject(`تقرير التقييم الشهري لشهر ${month}`);
  }, [month]);

  const handleEmailSelect = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === employees.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(employees.map((emp) => emp.email));
    }
  };

  const handleSendEmails = async () => {
    if (!selectedEmails.length) {
      setError('يرجى اختيار مستلم واحد على الأقل');
      return;
    }
    if (!subject || !message) {
      setError('يرجى إدخال موضوع والرسالة');
      return;
    }
    setLoading(true);
    try {
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(year, parseInt(monthNum), 0).toISOString().split('T')[0];

      for (const email of selectedEmails) {
        const { data: empData, error: empError } = await supabaseClient
          .from('employees')
          .select('employeenumber')
          .eq('email', email)
          .single();
        if (empError || !empData) {
          throw new Error(`البريد ${email} غير موجود في جدول الموظفين`);
        }

        const { data: evalData, error: evalError } = await supabaseClient
          .from('evaluation')
          .select('employeenumber, employeename, presentdays, lateminutes, monthlyevaluation')
          .eq('employeenumber', empData.employeenumber)
          .gte('timestamp', startDate)
          .lte('timestamp', endDate);

        if (evalError || !evalData?.length) {
          throw new Error(`لا توجد بيانات تقييم لـ ${email} لهذا الشهر`);
        }

        const report = evalData.map((row) => `
          رقم الموظف: ${row.employeenumber}
          الاسم: ${row.employeename}
          أيام الحضور: ${row.presentdays || 0}
          دقائق التأخير: ${row.lateminutes || 0}
          التقييم الشهري: ${row.monthlyevaluation || 0}
        `).join('\n\n');

        const emailBody = `${message}\n\nتقرير التقييم الشهري لشهر ${month}:\n${report}`;

        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject,
            text: emailBody,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`فشل في إرسال البريد إلى ${email}: ${errorData.message}`);
        }
      }

      setSuccess('تم إرسال التقارير بنجاح إلى جميع المستلمين!');
      setSelectedEmails([]);
      setMessage('');
    } catch (err) {
      setError(err.message || 'فشل في إرسال التقارير');
      console.error('Error sending emails:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">إرسال تقرير عبر الإيميل</h1>
      <Link href="/admin" className="inline-block mb-4 text-blue-600 hover:underline text-lg">
        العودة إلى لوحة التحكم
      </Link>
      {error && <p className="text-red-500 text-center mb-6 text-lg">{error}</p>}
      {success && <p className="text-green-500 text-center mb-6 text-lg">{success}</p>}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">اختر الشهر</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border text-b px-4 py-2 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">موضوع البريد</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border text-b px-4 py-2 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none"
            placeholder="أدخل موضوع البريد"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">رسالة</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border text-b px-4 py-2 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none"
            rows="4"
            placeholder="أدخل رسالتك هنا"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">اختر المستلمين</label>
          <div className="mt-2">
            <button
              onClick={handleSelectAll}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              {selectedEmails.length === employees.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </button>
            <div className="max-h-4 overflow-y-auto">
              {employees.map((emp) => (
                <div key={emp.employeenumber} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(emp.email)}
                    onChange={() => handleEmailSelect(emp.email)}
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span>{emp.employeename} ({emp.email})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleSendEmails}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
        >
          {loading ? 'جارٍ الإرسال...' : 'إرسال التقارير'}
        </button>
      </div>
    </div>
  );
}