import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmployeeReport({ supabaseClient }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonthYear] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [evaluationData, setEvaluationData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const { data, error } = await supabaseClient
          .from('employees')
          .select('employeenumber, employeename');
        if (error) throw new Error(`فشل في جلب الموظفين: ${error.message}`);
        setEmployees(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employees:', err);
      }
    }
    fetchEmployees();
  }, [supabaseClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !month) {
      setError('يرجى اختيار موظف وشهر');
      return;
    }
    setLoading(true);
    setError('');
    setEmployeeData(null);
    setAttendanceData([]);
    setEvaluationData([]);

    try {
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(year, parseInt(monthNum), 0).toISOString().split('T')[0];

      // Fetch employee details
      const { data: empData, error: empError } = await supabaseClient
        .from('employees')
        .select('employeenumber, employeename, email, jobtitle, workstatus, phonenumber')
        .eq('employeenumber', selectedEmployee)
        .single();
      if (empError || !empData) {
        throw new Error(`لم يتم العثور على الموظف: ${empError?.message || 'Unknown error'}`);
      }

      // Fetch attendance data
      const { data: attData, error: attError } = await supabaseClient
        .from('attendance')
        .select('check_date, check_in_time, check_out_time, status, notes')
        .eq('employeenumber', selectedEmployee)
        .gte('check_date', startDate)
        .lte('check_date', endDate)
        .order('check_date', { ascending: true });

      if (attError) {
        throw new Error(`فشل في جلب بيانات الحضور: ${attError.message}`);
      }

      // Fetch evaluation data
      const { data: evalData, error: evalError } = await supabaseClient
        .from('evaluation')
        .select('presentdays, lateminutes, monthlyevaluation, timestamp')
        .eq('employeenumber', selectedEmployee)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (evalError) {
        throw new Error(`فشل في جلب بيانات التقييم: ${evalError.message}`);
      }

      setEmployeeData(empData);
      setAttendanceData(attData || []);
      setEvaluationData(evalData || []);
    } catch (err) {
      setError(err.message || 'فشل في جلب البيانات');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">تقرير الموظف</h1>
      <Link href="/admin" className="inline-block mb-4 text-blue-600 hover:underline text-lg">
        العودة إلى لوحة التحكم
      </Link>
      {error && <p className="text-red-600 text-center mb-6 text-lg font-semibold">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="employee">
            اختر الموظف
          </label>
          <select
            id="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-lg text-gray-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="">-- اختر موظف --</option>
            {employees.map((emp) => (
              <option key={emp.employeenumber} value={emp.employeenumber}>
                {emp.employeename} ({emp.employeenumber})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="month">
            اختر الشهر
          </label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonthYear(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-lg text-gray-700 focus:border-blue-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'جارٍ التحميل...' : 'عرض التقرير'}
        </button>
      </form>

      {employeeData && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">تفاصيل الموظف</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <p><strong>رقم الموظف:</strong> {employeeData.employeenumber}</p>
            <p><strong>الاسم:</strong> {employeeData.employeename}</p>
            <p><strong>البريد الإلكتروني:</strong> {employeeData.email}</p>
            <p><strong>المسمى الوظيفي:</strong> {employeeData.jobtitle || '-'}</p>
            <p><strong>حالة العمل:</strong> {employeeData.workstatus || '-'}</p>
            <p><strong>رقم الهاتف:</strong> {employeeData.phonenumber || '-'}</p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">بيانات الحضور</h2>
          {attendanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 text-lg">التاريخ</th>
                    <th className="p-3 text-lg">وقت الدخول</th>
                    <th className="p-3 text-lg">وقت الخروج</th>
                    <th className="p-3 text-lg">الحالة</th>
                    <th className="p-3 text-lg">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 border">{row.check_date}</td>
                      <td className="p-3 border">{row.check_in_time || '-'}</td>
                      <td className="p-3 border">{row.check_out_time || '-'}</td>
                      <td className="p-3 border">{row.status || '-'}</td>
                      <td className="p-3 border">{row.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center">لا توجد بيانات حضور لهذا الشهر</p>
          )}

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">بيانات التقييم</h2>
          {evaluationData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 text-lg">أيام الحضور</th>
                    <th className="p-3 text-lg">دقائق التأخير</th>
                    <th className="p-3 text-lg">التقييم الشهري</th>
                    <th className="p-3 text-lg">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluationData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 border">{row.presentdays || 0}</td>
                      <td className="p-3 border">{row.lateminutes || 0}</td>
                      <td className="p-3 border">{row.monthlyevaluation || 0}</td>
                      <td className="p-3 border">{row.timestamp.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center">لا توجد بيانات تقييم لهذا الشهر</p>
          )}
        </div>
      )}
    </div>
  );
}