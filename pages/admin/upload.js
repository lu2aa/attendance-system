import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

export default function AdminUpload({ supabaseClient }) {
  const [activeTab, setActiveTab] = useState('employees');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { tab } = router.query;
    if (tab && ['employees', 'attendance', 'schedule', 'requests', 'evaluation'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [router.query]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('يرجى اختيار ملف Excel أو CSV');
      return;
    }
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          let jsonData;
          const fileType = file.name.split('.').pop()?.toLowerCase();
          
          if (fileType === 'csv' && activeTab === 'attendance') {
            const text = event.target.result;
            const workbook = XLSX.read(text, { type: 'string', raw: true });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(sheet);
          } else if (['xls', 'xlsx'].includes(fileType)) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(sheet);
          } else {
            throw new Error('نوع الملف غير مدعوم: استخدم XLS/XLSX لجميع الجداول عدا الحركات (CSV)');
          }

          if (!jsonData.length) {
            throw new Error('الملف فارغ أو لا يحتوي على بيانات صالحة');
          }

          let table, dataToInsert, expectedHeaders;

          switch (activeTab) {
            case 'employees':
              table = 'employees';
              expectedHeaders = [
                'رقم الموظف', 'اسم الموظف', 'البريد الإلكتروني', 'المسمى الوظيفي', 'الدرجة', 'حالة العمل',
                'أيام العمل', 'دوام جزئي', 'الوردية', 'مسيحي', 'ساعة رضاعة', 'إعاقة',
                'رصيد الإجازة العادية', 'رصيد الإجازة العارضة', 'عدد أيام الغياب', 'رقم الهاتف',
                'الرقم القومي', 'رابط', 'نوع ساعة الرضاعة', 'بداية ساعة الرضاعة', 'نهاية ساعة الرضاعة',
                'التقييم الشهري', 'التدريب', 'ملاحظات'
              ];
              dataToInsert = jsonData.map(row => ({
                employeenumber: row['رقم الموظف']?.toString()?.trim() || '',
                employeename: row['اسم الموظف']?.toString()?.trim() || '',
                email: row['البريد الإلكتروني']?.toString()?.trim()?.toLowerCase() || '',
                jobtitle: row['المسمى الوظيفي']?.toString()?.trim() || '',
                grade: row['الدرجة']?.toString()?.trim() || '',
                workstatus: row['حالة العمل']?.toString()?.trim() || '',
                workdays: parseInt(row['أيام العمل']) || null,
                parttime: row['دوام جزئي'] === 'نعم' || false,
                shift: row['الوردية']?.toString()?.trim() || '',
                ischristian: row['مسيحي'] === 'نعم' || false,
                nursinghour: row['ساعة رضاعة'] === 'نعم' || false,
                disability: row['إعاقة'] === 'نعم' || false,
                regularleavebalance: parseInt(row['رصيد الإجازة العادية']) || null,
                casualleavebalance: parseInt(row['رصيد الإجازة العارضة']) || null,
                absencedayscount: parseInt(row['عدد أيام الغياب']) || null,
                phonenumber: row['رقم الهاتف']?.toString()?.trim() || '',
                nationalid: row['الرقم القومي']?.toString()?.trim() || '',
                link: row['رابط']?.toString()?.trim() || '',
                nursinghourtype: row['نوع ساعة الرضاعة']?.toString()?.trim() || '',
                nursinghourstart: row['بداية ساعة الرضاعة']?.toString()?.trim() || '',
                nursinghourend: row['نهاية ساعة الرضاعة']?.toString()?.trim() || '',
                monthlyevaluation: parseInt(row['التقييم الشهري']) || null,
                training: row['التدريب']?.toString()?.trim() || '',
                notes: row['ملاحظات']?.toString()?.trim() || ''
              }));
              for (const emp of dataToInsert) {
                if (!emp.employeenumber || !emp.employeename || !emp.email) {
                  throw new Error(`بيانات غير مكتملة في السطر: رقم الموظف=${emp.employeenumber || 'غير محدد'}، يجب توفير رقم الموظف، الاسم، والبريد الإلكتروني`);
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp.email)) {
                  throw new Error(`بريد إلكتروني غير صالح: ${emp.email}`);
                }
              }
              break;

            case 'evaluation':
              table = 'evaluation';
              expectedHeaders = [
                'رقم الموظف', 'اسم الموظف', 'المسمى الوظيفي', 'أيام الحضور', 'ساعات العمل',
                'إجازة عادية', 'إجازة عارضة', 'دقائق التأخير', 'التقييم الشهري', 'الطابع الزمني'
              ];
              dataToInsert = jsonData.map(row => ({
                id: uuidv4(),
                employeenumber: row['رقم الموظف']?.toString()?.trim() || '',
                employeename: row['اسم الموظف']?.toString()?.trim() || '',
                jobtitle: row['المسمى الوظيفي']?.toString()?.trim() || '',
                presentdays: parseInt(row['أيام الحضور']) || null,
                workhours: parseInt(row['ساعات العمل']) || null,
                regularleave: parseInt(row['إجازة عادية']) || null,
                casualleave: parseInt(row['إجازة عارضة']) || null,
                lateminutes: parseInt(row['دقائق التأخير']) || null,
                monthlyevaluation: parseInt(row['التقييم الشهري']) || null,
                timestamp: row['الطابع الزمني']?.toString()?.trim() || null
              }));
              for (const evalData of dataToInsert) {
                if (!evalData.employeenumber || !evalData.employeename) {
                  throw new Error(`بيانات غير مكتملة في السطر: رقم الموظف=${evalData.employeenumber || 'غير محدد'}، يجب توفير رقم الموظف والاسم`);
                }
                const { data: employee, error: empError } = await supabaseClient
                  .from('employees')
                  .select('employeenumber')
                  .eq('employeenumber', evalData.employeenumber)
                  .single();
                if (empError || !employee) {
                  throw new Error(`رقم الموظف ${evalData.employeenumber} غير موجود في جدول الموظفين`);
                }
              }
              break;

            case 'requests':
              table = 'requests';
              expectedHeaders = [
                'رقم الموظف', 'اسم الموظف', 'البريد الإلكتروني', 'نوع الطلب', 'تاريخ بدء الطلب',
                'تاريخ انتهاء الطلب', 'البدل', 'ملاحظات', 'تاريخ العودة للعمل', 'الموافقة', 'الرد'
              ];
              dataToInsert = jsonData.map(row => ({
                id: uuidv4(),
                employeenumber: row['رقم الموظف']?.toString()?.trim() || '',
                employeename: row['اسم الموظف']?.toString()?.trim() || '',
                email: row['البريد الإلكتروني']?.toString()?.trim()?.toLowerCase() || '',
                requesttype: row['نوع الطلب']?.toString()?.trim() || '',
                requeststartdate: row['تاريخ بدء الطلب']?.toString()?.trim() || '',
                requestenddate: row['تاريخ انتهاء الطلب']?.toString()?.trim() || null,
                allowance: row['البدل']?.toString()?.trim() || '',
                notes: row['ملاحظات']?.toString()?.trim() || '',
                backtoworkdate: row['تاريخ العودة للعمل']?.toString()?.trim() || null,
                approval: row['الموافقة']?.toString()?.trim() || 'معلق',
                reply: row['الرد']?.toString()?.trim() || ''
              }));
              for (const req of dataToInsert) {
                if (!req.employeenumber || !req.employeename || !req.email || !req.requesttype || !req.requeststartdate) {
                  throw new Error(`بيانات غير مكتملة في السطر: رقم الموظف=${req.employeenumber || 'غير محدد'}، يجب توفير رقم الموظف، الاسم، البريد الإلكتروني، نوع الطلب، وتاريخ البدء`);
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.email)) {
                  throw new Error(`بريد إلكتروني غير صالح: ${req.email}`);
                }
                const { data: employee, error: empError } = await supabaseClient
                  .from('employees')
                  .select('employeenumber, email')
                  .eq('employeenumber', req.employeenumber)
                  .eq('email', req.email)
                  .single();
                if (empError || !employee) {
                  throw new Error(`رقم الموظف ${req.employeenumber} أو البريد ${req.email} غير موجود في جدول الموظفين`);
                }
                if (!/^\d{4}-\d{2}-\d{2}$/.test(req.requeststartdate)) {
                  throw new Error(`تاريخ بدء الطلب غير صالح: ${req.requeststartdate}، يجب أن يكون بصيغة YYYY-MM-DD`);
                }
                if (req.requestenddate && !/^\d{4}-\d{2}-\d{2}$/.test(req.requestenddate)) {
                  throw new Error(`تاريخ انتهاء الطلب غير صالح: ${req.requestenddate}، يجب أن يكون بصيغة YYYY-MM-DD`);
                }
                if (req.backtoworkdate && !/^\d{4}-\d{2}-\d{2}$/.test(req.backtoworkdate)) {
                  throw new Error(`تاريخ العودة للعمل غير صالح: ${req.backtoworkdate}، يجب أن يكون بصيغة YYYY-MM-DD`);
                }
              }
              break;

            case 'schedule':
              table = 'schedule';
              expectedHeaders = [
                'اليوم', 'التاريخ', 'موظف المساء 1', 'موظف المساء 2', 'موظف الليل'
              ];
              dataToInsert = jsonData.map(row => ({
                id: uuidv4(),
                day: row['اليوم']?.toString()?.trim() || '',
                date: row['التاريخ']?.toString()?.trim() || '',
                eveningemployee_1: row['موظف المساء 1']?.toString()?.trim() || null,
                eveningemployee_2: row['موظف المساء 2']?.toString()?.trim() || null,
                nightemployee_1: row['موظف الليل']?.toString()?.trim() || null
              }));
              for (const sch of dataToInsert) {
                if (!sch.day || !sch.date) {
                  throw new Error(`بيانات غير مكتملة في السطر: التاريخ=${sch.date || 'غير محدد'}، يجب توفير اليوم والتاريخ`);
                }
                if (!/^\d{4}-\d{2}-\d{2}$/.test(sch.date)) {
                  throw new Error(`تاريخ غير صالح: ${sch.date}، يجب أن يكون بصيغة YYYY-MM-DD`);
                }
                for (const empField of ['eveningemployee_1', 'eveningemployee_2', 'nightemployee_1']) {
                  if (sch[empField]) {
                    const { data: employee, error: empError } = await supabaseClient
                      .from('employees')
                      .select('employeenumber')
                      .eq('employeenumber', sch[empField])
                      .single();
                    if (empError || !employee) {
                      throw new Error(`رقم الموظف ${sch[empField]} غير موجود في جدول الموظفين`);
                    }
                  }
                }
              }
              break;

            case 'attendance':
              table = 'attendance';
              expectedHeaders = [
                'رقم الموظف', 'تاريخ الحضور', 'وقت الدخول', 'وقت الخروج', 'الحالة', 'ملاحظات'
              ];
              dataToInsert = jsonData.map(row => ({
                id: uuidv4(),
                employeenumber: row['رقم الموظف']?.toString()?.trim() || '',
                check_date: row['تاريخ الحضور']?.toString()?.trim() || '',
                check_in_time: row['وقت الدخول']?.toString()?.trim() || null,
                check_out_time: row['وقت الخروج']?.toString()?.trim() || null,
                status: row['الحالة']?.toString()?.trim() || '',
                notes: row['ملاحظات']?.toString()?.trim() || ''
              }));
              for (const att of dataToInsert) {
                if (!att.employeenumber || !att.check_date) {
                  throw new Error(`بيانات غير مكتملة في السطر: رقم الموظف=${att.employeenumber || 'غير محدد'}، يجب توفير رقم الموظف وتاريخ الحضور`);
                }
                if (!/^\d{4}-\d{2}-\d{2}$/.test(att.check_date)) {
                  throw new Error(`تاريخ حضور غير صالح: ${att.check_date}، يجب أن يكون بصيغة YYYY-MM-DD`);
                }
                if (att.check_in_time && !/^\d{2}:\d{2}(:\d{2})?$/.test(att.check_in_time)) {
                  throw new Error(`وقت الدخول غير صالح: ${att.check_in_time}، يجب أن يكون بصيغة HH:MM أو HH:MM:SS`);
                }
                if (att.check_out_time && !/^\d{2}:\d{2}(:\d{2})?$/.test(att.check_out_time)) {
                  throw new Error(`وقت الخروج غير صالح: ${att.check_out_time}، يجب أن يكون بصيغة HH:MM أو HH:MM:SS`);
                }
                const { data: employee, error: empError } = await supabaseClient
                  .from('employees')
                  .select('employeenumber')
                  .eq('employeenumber', att.employeenumber)
                  .single();
                if (empError || !employee) {
                  throw new Error(`رقم الموظف ${att.employeenumber} غير موجود في جدول الموظفين`);
                }
              }
              break;

            default:
              throw new Error('جدول غير معروف');
          }

          const receivedHeaders = Object.keys(jsonData[0]);
          const missingHeaders = expectedHeaders.filter(h => !receivedHeaders.includes(h));
          if (missingHeaders.length > 0) {
            throw new Error(`أعمدة مفقودة في الملف: ${missingHeaders.join(', ')}`);
          }

          const { error: insertError } = await supabaseClient
            .from(table)
            .insert(dataToInsert);

          if (insertError) {
            throw new Error(`فشل في رفع البيانات: ${insertError.message}`);
          }

          setSuccess(`تم رفع ${dataToInsert.length} سجل بنجاح إلى جدول ${activeTab === 'employees' ? 'الموظفين' : activeTab === 'attendance' ? 'الحركات' : activeTab === 'schedule' ? 'الجداول' : activeTab === 'requests' ? 'الطلبات' : 'التقييمات'}!`);
          setFile(null);
          e.target.reset();
        } catch (err) {
          setError(err.message || 'فشل في معالجة الملف أو رفع البيانات');
          console.error('Processing error:', err);
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('حدث خطأ أثناء قراءة الملف');
        setLoading(false);
      };
      if (fileType === 'csv' && activeTab === 'attendance') {
        reader.readAsText(file, 'UTF-8');
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError(err.message || 'فشل في رفع البيانات');
      setLoading(false);
    }
  };

  const getTemplateExtension = () => activeTab === 'attendance' ? '.csv' : '.xlsx';

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">رفع البيانات</h1>
      <Link href="/admin" className="inline-block mb-6 text-blue-600 hover:underline text-lg">
        العودة إلى لوحة التحكم
      </Link>
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {[
            { id: 'employees', label: 'الموظفين', color: 'blue' },
            { id: 'attendance', label: 'الحركات', color: 'green' },
            { id: 'schedule', label: 'الجداول', color: 'purple' },
            { id: 'requests', label: 'الطلبات', color: 'orange' },
            { id: 'evaluation', label: 'التقييمات', color: 'teal' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-3 px-4 text-center text-lg font-semibold rounded-t-lg transition duration-200 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-600 text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-red-600 text-center mb-6 text-lg font-semibold">{error}</p>}
      {success && <p className="text-green-600 text-center mb-6 text-lg font-semibold">{success}</p>}
      <form onSubmit={handleUpload} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            اختر ملف {activeTab === 'attendance' ? 'CSV' : 'Excel'}
          </label>
          <input
            type="file"
            accept={activeTab === 'attendance' ? '.csv' : '.xlsx, .xls'}
            onChange={handleFileChange}
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-lg text-gray-700 focus:border-blue-600 focus:outline-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            الملف يجب أن يحتوي على الأعمدة المناسبة لجدول {activeTab === 'employees' ? 'الموظفين' : activeTab === 'attendance' ? 'الحركات' : activeTab === 'schedule' ? 'الجداول' : activeTab === 'requests' ? 'الطلبات' : 'التقييمات'}
          </p>
          <a
            href={`/templates/${activeTab}_template${getTemplateExtension()}`}
            className="inline-block mt-2 text-blue-600 hover:underline text-lg"
            download
          >
            تحميل قالب {activeTab === 'attendance' ? 'CSV' : 'Excel'}
          </a>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'جارٍ الرفع...' : 'رفع الملف'}
        </button>
      </form>
    </div>
  );
}