import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import jsPDF from 'jspdf';

export default function AdminReports() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState({ type: 'daily', date: new Date().toISOString().split('T')[0], employee: 'all' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        const { data: empData } = await supabase.from('employees').select('employeenumber, employeename');
        setEmployees(empData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const fetchAttendance = async () => {
    try {
      let query = supabase.from('attendance').select('*');
      if (filter.employee !== 'all') {
        query = query.eq('employeenumber', filter.employee);
      }
      if (filter.type === 'daily') {
        query = query.eq('check_date', filter.date);
      } else {
        const [year, month] = filter.date.split('-');
        query = query
          .gte('check_date', `${year}-${month}-01`)
          .lte('check_date', `${year}-${month}-31`);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      setAttendance(data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendance([]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('Amiri', 'normal');
    doc.text('تقرير الحضور', 190, 10, { align: 'right' });
    let y = 20;
    attendance.forEach((rec) => {
      const text = `${rec.employeenumber} - ${rec.check_date}: ${rec.status}`;
      doc.text(text, 190, y, { align: 'right' });
      y += 10;
    });
    doc.save('attendance-report.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">التقارير</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-lg mb-2">نوع التقرير</label>
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
            <div>
              <label className="block text-lg mb-2">الموظف</label>
              <select
                value={filter.employee}
                onChange={(e) => setFilter({ ...filter, employee: e.target.value })}
                className="w-full border-2 p-2 rounded-lg"
              >
                <option value="all">الكل</option>
                {employees.map((emp) => (
                  <option key={emp.employeenumber} value={emp.employeenumber}>
                    {emp.employeename}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={fetchAttendance}
            className="mt-4 px-6 py-3 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            عرض التقرير
          </button>
          {attendance.length > 0 && (
            <button
              onClick={generatePDF}
              className="mt-4 ml-4 px-6 py-3 text-lg text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              تحميل PDF
            </button>
          )}
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
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-3 text-center">لا توجد بيانات</td>
                  </tr>
                ) : (
                  attendance.map((rec) => (
                    <tr key={rec.id} className="border-t">
                      <td className="p-3 text-center">{rec.employeenumber}</td>
                      <td className="p-3 text-center">{rec.check_date}</td>
                      <td className="p-3 text-center">{rec.status || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}