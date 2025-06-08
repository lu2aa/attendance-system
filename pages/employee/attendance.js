import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState({ type: 'daily', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          router.push('/signin');
          return;
        }
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select('employeenumber')
          .eq('email', user.email)
          .single();
        if (empError || !employee) {
          throw new Error('لم يتم العثور على بيانات الموظف');
        }
        let query = supabase
          .from('attendance')
          .select('id, check_date, check_in_time, check_out_time, status')
          .eq('employeenumber', employee.employeenumber);
        if (filter.type === 'daily') {
          query = query.eq('check_date', filter.date);
        } else {
          const [year, month] = filter.date.split('-');
          query = query
            .gte('check_date', `${year}-${month}-01`)
            .lte('check_date', `${year}-${month}-31`);
        }
        const { data, error: attError } = await query;
        if (attError) throw attError;
        setAttendance(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('فشل تحميل الحضور: ' + (err.message || 'خطأ غير معروف'));
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [filter, router]);

  if (error) {
    return <div className="bg-red-600 text-white p-4 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">تقرير الحضور</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg mb-2">نوع الفلتر</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full border-2 p-2 rounded-lg"
              >
                <option value="daily">يومي</option>
                <option value="monthly">شهري</option>
              </select>
            </div>
            <div>
              <label className="block text-lg mb-2">التاريخ</label>
              <input
                type={filter.type === 'daily' ? 'date' : 'month'}
                value={filter.date}
                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                className="w-full border-2 p-2 rounded-lg"
              />
            </div>
          </div>
        </div>
        {loading ? (
          <p className="text-center text-lg">جاري التحميل...</p>
        ) : attendance.length === 0 ? (
          <p className="text-center text-lg text-gray-600">لا توجد بيانات حضور</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3">تاريخ الحضور</th>
                  <th className="p-3">وقت الدخول</th>
                  <th className="p-3">وقت الخروج</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec) => (
                  <tr key={rec.id} className="border-t">
                    <td className="p-3 text-center">{rec.check_date || '-'}</td>
                    <td className="p-3 text-center">{rec.check_in_time || '-'}</td>
                    <td className="p-3 text-center">{rec.check_out_time || '-'}</td>
                    <td className="p-3 text-center">{rec.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}