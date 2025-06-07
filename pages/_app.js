import '../styles/globals.css'
     import { useState } from 'react'
     import { createBrowserSupabaseClient } from '@supabase/ssr'

     export default function MyApp({ Component, pageProps }) {
       const [supabaseClient] = useState(() => createBrowserSupabaseClient())
       return <Component {...pageProps} supabaseClient={supabaseClient} />
     }