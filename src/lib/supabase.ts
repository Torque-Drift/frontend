import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our metadata table
export interface NFTMetadataRow {
  id?: number
  token_id: string
  metadata: any
  created_at?: string
  updated_at?: string
}

export class MetadataService {
  static async saveMetadata(tokenId: string, metadata: any): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('nft_metadata')
        .upsert({
          token_id: tokenId,
          metadata: metadata,
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error('Error saving metadata to Supabase:', error)
        return false
      }

      console.log(`Metadata saved for token ${tokenId}`)
      return true
    } catch (error) {
      console.error('Exception saving metadata:', error)
      return false
    }
  }

  static async getMetadata(tokenId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('nft_metadata')
        .select('metadata')
        .eq('token_id', tokenId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        console.error('Error fetching metadata from Supabase:', error)
        return null
      }

      return data?.metadata || null
    } catch (error) {
      console.error('Exception fetching metadata:', error)
      return null
    }
  }

  static async getAllMetadata(): Promise<NFTMetadataRow[]> {
    try {
      const { data, error } = await supabase
        .from('nft_metadata')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all metadata:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Exception fetching all metadata:', error)
      return []
    }
  }

  static async deleteMetadata(tokenId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nft_metadata')
        .delete()
        .eq('token_id', tokenId)

      if (error) {
        console.error('Error deleting metadata:', error)
        return false
      }

      console.log(`Metadata deleted for token ${tokenId}`)
      return true
    } catch (error) {
      console.error('Exception deleting metadata:', error)
      return false
    }
  }
} 