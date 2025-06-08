import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function EmployeesReport() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/signin');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (profileError || !profile.is_admin) {
          router.push('/');
          return;
        }

        const { data, error: dataError } = await supabase
          .from('employees')
          .select('*');
        if (dataError) {
          throw dataError;
        }
        setEmployees(data);
      } catch (err) {
        console.error('Supabase error:', err);
        setError('فشل تحميل بيانات الموظفين: ' + (err.message || 'خطأ غير معروف'));
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [router]);

  if (error) {
    return <div className="bg-red-600 text-white p-4 text-center">{error}</div>;
  }

  if (loading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  const columns = [
    'رقم الموظف', 'اسم الموظف', 'البريد الإلكتروني', 'المسمى الوظيفي', 'الدرجة', 'حالة العمل',
    'أيام العمل', 'دوام جزئي', 'الوردية', 'مسيحي', 'ساعة رضاعة', 'إعاقة',
    'رصيد الإجازة العادية', 'رصيد الإجازة العارضة', 'عدد أيام الغياب', 'رقم الهاتف',
    'الرقم القومي', 'رابط', 'نوع ساعة الرضاعة', 'بداية ساعة الرضاعة', 'نهاية ساعة الرضاعة',
    'التقييم الشهري', 'التدريب', 'ملاحظات'
  ];

  const columnKeys = [
    'employeenumber', 'employeename', 'email', 'jobtitle', 'grade', 'workstatus',
    'workdays', 'parttime', 'shift', 'ischristian', 'nursinghour', 'disability',
    'regularleavebalance', 'casualleavebalance', 'absencedayscount', 'phonenumber',
    'nationalid', 'link', 'nursinghourtype', 'nursinghourstart', 'nursinghourend',
    'monthlyevaluation', 'training', 'notes'
  ];

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">تقرير الموظفين</h1>
        {employees.length === 0 ? (
          <p className="text-center text-gray-600">لا توجد بيانات موظفين</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="p-4 text-sm">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/employees/${employee.employeenumber}`)}
                  >
                    {columnKeys.map((key) => (
                      <td key={key} className="p-4 text-center text-sm">
                        {typeof employee[key] === 'boolean'
                          ? employee[key] ? 'نعم' : 'لا'
                          : employee[key] || 'غير محدد'}
                      </td>
                    ))}
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