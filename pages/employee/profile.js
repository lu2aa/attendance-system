import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function EmployeeProfile() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          router.push('/signin');
          return;
        }
        setUser(user);

        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', user.email)
          .single();
        if (empError && empError.code !== 'PGRST116') {
          throw empError;
        }
        setEmployee(empData);
      } catch (err) {
        console.error('Error:', err);
        setError('فشل تحميل البيانات: ' + (err.message || 'خطأ غير معروف'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (error) {
    return <div className="bg-red-600 text-white p-4 text-center">{error}</div>;
  }

  if (loading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">ملفي الشخصي</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">البيانات الشخصية</h2>
          <div className="grid grid-cols-1 gap-2 mb-6">
            <p><span className="font-semibold">البريد الإلكتروني:</span> {user?.email || '-'}</p>
            {employee && (
              <>
                <p><span className="font-semibold">الاسم:</span> {employee.employeename || '-'}</p>
                <p><span className="font-semibold">رقم الهاتف:</span> {employee.phonenumber || '-'}</p>
                <p><span className="font-semibold">الرقم القومي:</span> {employee.nationalid || '-'}</p>
              </>
            )}
          </div>
          <h2 className="text-xl font-semibold mb-4">بيانات العمل</h2>
          {employee ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><span className="font-semibold">رقم الموظف:</span> {employee.employeenumber || '-'}</p>
              <p><span className="font-semibold">المسمى الوظيفي:</span> {employee.jobtitle || '-'}</p>
              <p><span className="font-semibold">الدرجة:</span> {employee.grade || '-'}</p>
              <p><span className="font-semibold">حالة العمل:</span> {employee.workstatus || '-'}</p>
              <p><span className="font-semibold">أيام العمل:</span> {employee.workdays || '-'}</p>
              <p><span className="font-semibold">دوام جزئي:</span> {employee.parttime ? 'نعم' : 'لا'}</p>
              <p><span className="font-semibold">الوردية:</span> {employee.shift || '-'}</p>
              <p><span className="font-semibold">مسيحي:</span> {employee.ischristian ? 'نعم' : 'لا'}</p>
              <p><span className="font-semibold">ساعة رضاعة:</span> {employee.nursinghour ? 'نعم' : 'لا'}</p>
              <p><span className="font-semibold">نوع ساعة الرضاعة:</span> {employee.nursinghourtype || '-'}</p>
              <p><span className="font-semibold">بداية ساعة الرضاعة:</span> {employee.nursinghourstart || '-'}</p>
              <p><span className="font-semibold">نهاية ساعة الرضاعة:</span> {employee.nursinghourend || '-'}</p>
              <p><span className="font-semibold">إعاقة:</span> {employee.disability ? 'نعم' : 'لا'}</p>
              <p><span className="font-semibold">رصيد الإجازة العادية:</span> {employee.regularleavebalance || '-'}</p>
              <p><span className="font-semibold">رصيد الإجازة العارضة:</span> {employee.casualleavebalance || '-'}</p>
              <p><span className="font-semibold">عدد أيام الغياب:</span> {employee.absencedayscount || '-'}</p>
              <p><span className="font-semibold">التقييم الشهري:</span> {employee.monthlyevaluation || '-'}</p>
              <p><span className="font-semibold">التدريب:</span> {employee.training || '-'}</p>
              <p><span className="font-semibold">ملاحظات:</span> {employee.notes || '-'}</p>
              <p><span className="font-semibold">رابط:</span> {employee.link || '-'}</p>
            </div>
          ) : (
            <p className="text-red-600">لا توجد بيانات عمل متاحة. يرجى التواصل مع الإدارة.</p>
          )}
        </div>
      </div>
    </div>
  );
}