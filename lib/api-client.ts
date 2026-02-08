// API Client utilities for consistent error handling and requests

export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include" as const,
  }

  try {
    const response = await fetch(endpoint, {
      ...defaultOptions,
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error("[v0] API Call Error:", error)
    throw error
  }
}

export async function get(endpoint: string) {
  return apiCall(endpoint, { method: "GET" })
}

export async function post(endpoint: string, body: any) {
  return apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function put(endpoint: string, body: any) {
  return apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export async function del(endpoint: string) {
  return apiCall(endpoint, { method: "DELETE" })
}
