export const API_BASE = '/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include', // essential for HttpOnly session cookie
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${res.status}`,
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error occurred.',
    };
  }
}
