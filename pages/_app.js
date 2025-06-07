import '../styles/globals.css'
       import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
       import { SessionContextProvider } from '@supabase/auth-helpers-react'
       import { useState } from 'react'

       export default function MyApp({ Component, pageProps }) {
         const [supabaseClient] = useState(() => createPagesBrowserClient())
         return (
           <SessionContextProvider supabaseClient={supabaseClient}>
             <Component {...pageProps} />
           </SessionContextProvider>
         )
       }