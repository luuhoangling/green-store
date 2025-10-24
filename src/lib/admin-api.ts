// Helper function for admin API calls with authentication
export const adminApiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  return fetch(url, config)
}

// Helper function for GET requests
export const adminGet = async (url: string) => {
  return adminApiCall(url, { method: 'GET' })
}

// Helper function for POST requests
export const adminPost = async (url: string, data: any) => {
  return adminApiCall(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Helper function for PUT requests
export const adminPut = async (url: string, data: any) => {
  return adminApiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// Helper function for DELETE requests
export const adminDelete = async (url: string) => {
  return adminApiCall(url, { method: 'DELETE' })
}
