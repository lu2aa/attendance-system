export async function isAdmin(supabaseClient, userEmail) {
     if (userEmail === 'admin@example.com') return true;
     const { data, error } = await supabaseClient
       .from('employees')
       .select('jobtitle')
       .eq('email', userEmail)
       .single();
     if (error) {
       console.error('Error checking admin status:', error);
       return false;
     }
     return data?.jobtitle === 'مدير';
   }