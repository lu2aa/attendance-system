import '../styles/globals.css'
     import { useState } from 'react'
     import { createClient } from '@supabase/supabase-js'
     import Navbar from '../components/Navbar'

     export default function MyApp({ Component, pageProps }) {
       const [supabaseClient] = useState(() =>
         createClient(
           process.env.NEXT_PUBLIC_SUPABASE_URL,
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
         )
       )

       return (
         <>
           <Navbar supabaseClient={supabaseClient} />
           <Component {...pageProps} supabaseClient={supabaseClient} />
         </>
       )
     }