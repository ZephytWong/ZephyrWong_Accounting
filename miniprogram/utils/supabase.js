// We will use standard wx.request since Supabase JS client doesn't work out-of-the-box in Miniprogram without polyfills
// and user's environment might not have npm.

const SUPABASE_URL = 'https://vvyuxaprbgexzzspuwfk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eXV4YXByYmdleHp6c3B1d2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDg3MDMsImV4cCI6MjA5MDAyNDcwM30.CnibF64nf247ASYS6jxVg3V-BY8HQIcWlglUBBiDDxY'

const getHeaders = () => {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
}

export const supabase = {
  from: (table) => ({
    insert: (data) => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${SUPABASE_URL}/rest/v1/${table}`,
          method: 'POST',
          header: getHeaders(),
          data: data,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ data: res.data, error: null })
            } else {
              resolve({ data: null, error: res.data })
            }
          },
          fail: (err) => reject(err)
        })
      })
    },
    select: (query = '*') => {
      let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(query)}`
      
      let chain = {
        eq: (column, value) => {
          url += `&${column}=eq.${encodeURIComponent(value)}`
          return chain
        },
        gte: (column, value) => {
          url += `&${column}=gte.${encodeURIComponent(value)}`
          return chain
        },
        lt: (column, value) => {
          url += `&${column}=lt.${encodeURIComponent(value)}`
          return chain
        },
        order: (column, options = { ascending: true }) => {
          url += `&order=${column}.${options.ascending ? 'asc' : 'desc'}`
          return chain
        },
        limit: (count) => {
          url += `&limit=${count}`
          return chain
        },
        then: (resolve, reject) => {
          wx.request({
            url: url,
            method: 'GET',
            header: getHeaders(),
            success: (res) => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ data: res.data, error: null })
              } else {
                resolve({ data: null, error: res.data })
              }
            },
            fail: (err) => reject(err)
          })
        }
      }
      return chain
    }
  }),
  functions: {
    invoke: (functionName, options = {}) => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${SUPABASE_URL}/functions/v1/${functionName}`,
          method: 'POST',
          header: getHeaders(),
          data: options.body || {},
          success: (res) => {
             if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ data: res.data, error: null })
            } else {
              resolve({ data: null, error: res.data })
            }
          },
          fail: (err) => reject(err)
        })
      })
    }
  }
}