import { useState } from 'react'
     import { supabase } from '../../lib/supabase'
     import Link from 'next/link'
     import * as XLSX from 'xlsx'

     export default function UploadEmployees() {
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
             const data = new Uint8Array(event.target.result)
             const workbook = XLSX.read(data, { type: 'array' })
             const sheetName = workbook.SheetNames[0]
             const sheet = workbook.Sheets[sheetName]
             const jsonData = XLSX.utils.sheet_to_json(sheet)

             const employees = jsonData.map((row) => ({
               name: row['الاسم'] || row['Name'],
               email: row['البريد الإلكتروني'] || row['Email'],
             }))

             if (employees.length === 0) {
               setError('الملف فارغ أو لا يحتوي على بيانات صحيحة')
               setLoading(false)
               return
             }

             const { error: insertError } = await supabase.from('employees').insert(employees)
             if (insertError) throw insertError

             setSuccess(`تم رفع ${employees.length} موظف بنجاح!`)
             setFile(null)
             e.target.reset()
           }
           reader.onerror = () => {
             setError('حدث خطأ أثناء قراءة الملف')
             setLoading(false)
           }
           reader.readAsArrayBuffer(file)
         } catch (err) {
           console.error('Error uploading employees:', err)
           setError(err.message || 'فشل في رفع البيانات')
         } finally {
           setLoading(false)
         }
       }

       return (
         <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
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
                 الملف يجب أن يحتوي على أعمدة: الاسم, البريد الإلكتروني
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