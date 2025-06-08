export default function About() {
  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">عن النظام</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <p className="text-lg mb-4">
            نظام إدارة الحضور هو تطبيق لتتبع حضور الموظفين، إدارة الطلبات، وإنشاء التقارير.
          </p>
          <p className="text-lg">
            تم تطويره باستخدام Next.js وSupabase لتوفير تجربة مستخدم سلسة وآمنة.
          </p>
        </div>
      </div>
    </div>
  );
}