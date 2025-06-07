import { useState } from 'react'
   import Link from 'next/link'
   import * as XLSX from 'xlsx'

   export default function UploadEmployees({ supabaseClient }) {
     const [file, setFile] = useState(null)
     const [error, setError] = useState(null)
     const [success, setSuccess] = useState(null)
     const [loading, setLoading] = useState(false)

     const handleFileChange = (e) => {
       setFile(e.target.files[0])
       setError(null)
       setSuccess(null)
     }

     const handleUpload = async (e) => {
       e.preventDefault()
       if (!file) {
         setError('يرجى اختيار ملف Excel')
         return
       }
       setLoading(true)
       try {
         const reader = new FileReader()
         reader.onload = async (event) => {
           try {
             const data = new Uint8Array(event.target.result)
             const workbook = XLSX.read(data, { type: 'array' })
             const sheetName = workbook.SheetNames[0]
             const sheet = workbook.Sheets[sheetName]
             const jsonData = XLSX.utils.sheet_to_json(sheet)

             if (jsonData.length === 0) {
               setError('الملف فارغ أو لا يحتوي على بيانات صحيحة')
               setLoading(false)
               return
             }

             const employees = jsonData.map((row) => ({
               employeenumber: row['رقم الموظف']?.toString() || '',
               employeename: row['اسم الموظف'] || '',
               phonenumber: row['رقم الهاتف']?.toString() || '',
               nationalid: row['الرقم القومي']?.toString() || '',
               email: row['البريد الإلكتروني'] || '',
               jobtitle: row['المسمى الوظيفي'] || '',
               grade: row['الدرجة'] || '',
               workstatus: row['حالة العمل'] || '',
               workdays: parseInt(row['أيام العمل']) || null,
               parttime: row['دوام جزئي'] === 'نعم' || false,
               shift: row['الوردية'] || '',
               ischristian: row['مسيحي'] === 'نعم' || false,
               nursinghour: row['ساعة رضاعة'] === 'نعم' || false,
               disability: row['إعاقة'] === 'نعم' || false,
               regularleavebalance: parseInt(row['رصيد الإجازة العادية']) || null,
               casualleavebalance: parseInt(row['رصيد الإجازة العارضة']) || null,
               absencedayscount: parseInt(row['عدد أيام الغياب']) || null,
               remainingregularleave: parseInt(row['الإجازة العادية المتبقية']) || null,
               remainingcasualleave: parseInt(row['الإجازة العارضة المتبقية']) || null,
               remainingabsencedays: parseInt(row['أيام الغياب المتبقية']) || null,
               nursinghourtype: row['نوع ساعة الرضاعة'] || '',
               nursinghourstart: row['بداية ساعة الرضاعة'] || '',
               nursinghourend: row['نهاية ساعة الرضاعة'] || '',
               monthlyevaluation: parseInt(row['التقييم الشهري']) || null,
               training: row['التدريب'] || '',
               notes: row['ملاحظات'] || ''
             }))

             for (const emp of employees) {
               if (!emp.employeenumber || !emp.employeename || !emp.email) {
                 throw new Error('بيانات غير مكتملة: يجب توفير رقم الموظف، الاسم، والبريد الإلكتروني')
               }
             }

             const { error: insertError } = await supabaseClient
               .from('employees')
               .upsert(employees, { onConflict: 'employeenumber' })

             if (insertError) {
               console.error('Supabase insert error:', insertError)
               throw insertError
             }

             setSuccess(`تم رفع ${employees.length} موظف بنجاح!`)
             setFile(null)
             e.target.reset()
           } catch (err) {
             setError(err.message || 'فشل في معالجة الملف أو رفع البيانات')
             console.error('Processing error:', err)
           } finally {
             setLoading(false)
           }
         }
         reader.onerror = () => {
           setError('حدث خطأ أثناء قراءة الملف')
           setLoading(false)
         }
         reader.readAsArrayBuffer(file)
       } catch (err) {
         setError(err.message || 'فشل في رفع البيانات')
         console.error('Upload error:', err)
         setLoading(false)
       }
     }

     return (
       <div className="container mx-auto p-6 bg-gray-100 min-h-screen" dir="rtl">
         <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">رفع بيانات الموظفين</h1>
         <Link href="/employees" className="inline-block mb-6 text-blue-600 hover:underline">
           العودة إلى الموظفين
         </Link>
         {error && <p className="text-red-600 text-center mb-4">{error}</p>}
         {success && <p className="text-green-600 text-center mb-4">{success}</p>}
         <form onSubmit={handleUpload} className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl">
           <div className="mb-4">
             <label className="block text-sm font-semibold text-gray-700">اختر ملف Excel</label>
             <input
               type="file"
               accept=".xlsx, .xls"
               onChange={handleFileChange}
               className="mt-2 border p-3 w-full rounded-md shadow-sm"
             />
             <p className="text-sm text-gray-500 mt-2">
               الملف يجب أن يحتوي على أعمدة: رقم الموظف، اسم الموظف، البريد الإلكتروني، المسمى الوظيفي، الدرجة، حالة العمل، إلخ
             </p>
           </div>
           <button
             type="submit"
             disabled={loading}
             className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
           >
             {loading ? 'جارٍ الرفع...' : 'رفع الملف'}
           </button>
         </form>
       </div>
     )
   }