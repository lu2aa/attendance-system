import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function EmployeeDetail() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [requests, setRequests] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

    const fetchEmployeeData = async () => {
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

        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('employeenumber', id)
          .single();
        if (employeeError || !employeeData) {
          throw new Error('الموظف غير موجود');
        }
        setEmployee(employeeData);

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('employeenumber', id);
        if (attendanceError) {
          throw attendanceError;
        }
        setAttendance(attendanceData);

        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('employeenumber', id);
        if (requestsError) {
          throw requestsError;
        }
        setRequests(requestsData);

        const { data: evaluationsData, error: evaluationsError } = await supabase
          .from('evaluation')
          .select('*')
          .eq('employeenumber', id);
        if (evaluationsError) {
          throw evaluationsError;
        }
        setEvaluations(evaluationsData);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('فشل تحميل بيانات الموظف: ' + (err.message || 'خطأ غير معروف'));
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, [id, router]);

const sendReportEmail = async () => {
  setReportStatus('');
  try {
    const reportContent = `
      <h1>تقرير الموظف: ${employee.employeename}</h1>
      <p>رقم الموظف: ${employee.employeenumber}</p>
      <p>البريد الإلكتروني: ${employee.email}</p>
      <h2>سجل الحضور</h2>
      <ul>
        ${attendance.map((rec) => `<li>${rec.check_date}: ${rec.status}</li>`).join('')}
      </ul>
    `;
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: employee.email,
        subject: `تقرير الموظف ${employee.employeename}`,
        content: reportContent,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    setReportStatus('تم إرسال التقرير إلى البريد الإلكتروني بنجاح!');
  } catch (err) {
    setReportStatus('فشل إرسال التقرير: ' + (err.message || 'خطأ غير معروف'));
  }
};
  if (error) {
    return <div className="bg-red-600 text-white p-4 text-center">{error}</div>;
  }

  if (loading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (!employee) {
    return <div className="text-center p-8">لا توجد بيانات موظف</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">تفاصيل الموظف: {employee.employeename}</h1>
        <Link href="/reports/employees" className="inline-block mb-6 text-blue-600 hover:underline text-lg">
          العودة إلى قائمة الموظفين
        </Link>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">بيانات الموظف</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              'رقم الموظف': employee.employeenumber,
              'اسم الموظف': employee.employeename,
              'البريد الإلكتروني': employee.email,
              'المسمى الوظيفي': employee.jobtitle,
              'الدرجة': employee.grade,
              'حالة العمل': employee.workstatus,
              'أيام العمل': employee.workdays,
              'دوام جزئي': employee.parttime ? 'نعم' : 'لا',
              'الوردية': employee.shift,
              'مسيحي': employee.ischristian ? 'نعم' : 'لا',
              'ساعة رضاعة': employee.nursinghour ? 'نعم' : 'لا',
              'إعاقة': employee.disability ? 'نعم' : 'لا',
              'رصيد الإجازة العادية': employee.regularleavebalance,
              'رصيد الإجازة العارضة': employee.casualleavebalance,
              'عدد أيام الغياب': employee.absencedayscount,
              'رقم الهاتف': employee.phonenumber,
              'الرقم القومي': employee.nationalid,
              'رابط': employee.link,
              'نوع ساعة الرضاعة': employee.nursinghourtype,
              'بداية ساعة الرضاعة': employee.nursinghourstart,
              'نهاية ساعة الرضاعة': employee.nursinghourend,
              'التقييم الشهري': employee.monthlyevaluation,
              'التدريب': employee.training,
              'ملاحظات': employee.notes
            }).map(([label, value]) => (
              <p key={label} className="text-lg">
                <span className="font-semibold">{label}:</span> {value || 'غير محدد'}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={sendReportEmail}
            className="px-6 py-3 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-lg mr-4"
          >
            إرسال تقرير إلى البريد الإلكتروني
          </button>
          {reportStatus && (
            <p className={`text-lg mt-4 ${reportStatus.includes('فشل') ? 'text-red-600' : 'text-green-600'}`}>
              {reportStatus}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">سجل الحضور</h2>
          {attendance.length === 0 ? (
            <p className="text-gray-600">لا توجد بيانات حضور</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-sm">تاريخ الحضور</th>
                    <th className="p-3 text-sm">وقت الدخول</th>
                    <th className="p-3 text-sm">وقت الخروج</th>
                    <th className="p-3 text-sm">الحالة</th>
                    <th className="p-3 text-sm">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-t">
                      <td className="p-3 text-center text-sm">{record.check_date}</td>
                      <td className="p-3 text-center text-sm">{record.check_in_time || 'غير محدد'}</td>
                      <td className="p-3 text-center text-sm">{record.check_out_time || 'غير محدد'}</td>
                      <td className="p-3 text-center text-sm">{record.status || 'غير محدد'}</td>
                      <td className="p-3 text-center text-sm">{record.notes || 'غير محدد'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">الطلبات</h2>
          {requests.length === 0 ? (
            <p className="text-gray-600">لا توجد طلبات</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-sm">نوع الطلب</th>
                    <th className="p-3 text-sm">تاريخ البدء</th>
                    <th className="p-3 text-sm">تاريخ الانتهاء</th>
                    <th className="p-3 text-sm">الموافقة</th>
                    <th className="p-3 text-sm">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-t">
                      <td className="p-3 text-center text-sm">{request.requesttype || 'غير محدد'}</td>
                      <td className="p-3 text-center text-sm">{request.requeststartdate || 'غير محدد'}</td>
                      <td className="p-3 text-center text-sm">{request.requestenddate || 'غير محدد'}</td>
                      <td className="p-3 text-center text-sm">{request.approval || 'غير محدد'}</td>
                      <td className="p-3 text-center text-sm">{request.notes || 'غير محدد'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}