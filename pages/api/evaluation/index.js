import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('evaluation')
        .select('*')
      if (error) throw error
      res.status(200).json(data)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { data, error } = await supabase
        .from('evaluation')
        .insert([req.body])
      if (error) throw error
      res.status(201).json(data)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}