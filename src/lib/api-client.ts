import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../amplify_outputs.json';

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const getBaseUrl = (): string => {
  // Read from amplify_outputs.json
  const endpoint = outputs?.custom?.API?.echolabHttpApi?.endpoint;
  if (endpoint) return normalizeBaseUrl(endpoint);
  
  // Fallback to env var
  const envUrl = import.meta.env.VITE_ECHOLAB_API_URL;
  if (envUrl) return normalizeBaseUrl(envUrl);
  
  throw new Error('EchoLab API endpoint not configured');
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    throw new Error('Failed to get authentication token');
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      throw new ApiError(response.status, errorMessage, errorData);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, errorMessage);
    }
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

export const apiClient = {
  async get<T>(path: string, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers,
    });
    
    return handleResponse<T>(response);
  },
  
  async post<T>(path: string, data?: any, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return handleResponse<T>(response);
  },
  
  async put<T>(path: string, data: any, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    return handleResponse<T>(response);
  },
  
  async delete<T>(path: string, requireAuth = true): Promise<T> {
    const baseUrl = getBaseUrl();
    const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers,
    });
    
    return handleResponse<T>(response);
  },
};