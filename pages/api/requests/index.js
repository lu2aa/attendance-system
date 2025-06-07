import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
      if (error) throw error
      res.status(200).json(data)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert([req.body])
      if (error) throw error
      res.status(201).json(data)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id, approval, reply } = req.body
      const { data, error } = await supabase
        .from('requests')
        .update({ approval, reply, updated_at: new Date() })
        .eq('id', id)
      if (error) throw error
      res.status(200).json(data)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}