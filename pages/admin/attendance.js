import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState({ type: 'daily', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);
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
        return;
      }
      fetchAttendance();
    };
    checkAdmin();
  }, [router]);

  const fetchAttendance = async () => {
    let query = supabase.from('attendance').select('*');
    if (filter.type === 'daily') {
      query = query.eq('check_date', filter.date);
    } else {
      const [year, month] = filter.date.split('-');
      query = query.gte('check_date', `${year}-${month}-01`).lte('check_date', `${year}-${month}-31`);
    }
    const { data } = await query;
    setAttendance(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">الحركات</h1>
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
          <button
            onClick={fetchAttendance}
            className="mt-4 px-6 py-3 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            عرض الحركات
          </button>
        </div>
        {loading ? (
          <p className="text-center">جاري التحميل...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3">رقم الموظف</th>
                  <th className="p-3">تاريخ الحضور</th>
                  <th className="p-3">وقت الدخول</th>
                  <th className="p-3">وقت الخروج</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec) => (
                  <tr key={rec.id} className="border-t">
                    <td className="p-3 text-center">{rec.employeenumber}</td>
                    <td className="p-3 text-center">{rec.check_date}</td>
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