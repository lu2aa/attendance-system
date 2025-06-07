import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MonthlyReport({ supabaseClient }) {
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMonthlyData() {
      setLoading(true);
      try {
        const startDate = '2025-06-01';
        const endDate = '2025-06-30';
        const { data, error: fetchError } = await supabaseClient
          .from('evaluation')
          .select('employeenumber, employeename, presentdays, lateminutes, monthlyevaluation')
          .gte('timestamp', startDate)
          .lte('timestamp', endDate);
        if (fetchError) {
          throw new Error(`فشل في جلب البيانات الشهرية: ${fetchError.message}`);
        }
        setReportData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching monthly data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMonthlyData();
  }, [supabaseClient]);

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">تقرير شهري</h1>
      <Link href="/admin" className="inline-block mb-4 text-blue-600 hover:underline text-lg">
        العودة إلى لوحة التحكم
      </Link>
      {error && <p className="text-red-600 text-center mb-6 text-lg font-semibold">{error}</p>}
      {loading ? (
        <p className="text-center text-gray-700 text-lg">جارٍ التحميل...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="py-3 px-6 text-right text-lg">رقم الموظف</th>
                <th className="py-3 px-6 text-right text-lg">اسم الموظف</th>
                <th className="py-3 px-6 text-right text-lg">أيام الحضور</th>
                <th className="py-3 px-6 text-right text-lg">دقائق التأخير</th>
                <th className="py-3 px-6 text-right text-lg">التقييم الشهري</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.employeenumber} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-6 text-right">{row.employeenumber}</td>
                  <td className="py-3 px-6 text-right">{row.employeename}</td>
                  <td className="py-3 px-6 text-right">{row.presentdays || 0}</td>
                  <td className="py-3 px-6 text-right">{row.lateminutes || 0}</td>
                  <td className="py-3 px-6 text-right">{row.monthlyevaluation || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}