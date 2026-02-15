const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

export const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phoneNumber }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
};

export const fetchFarms = async () => {
    const response = await fetch(`${API_BASE_URL}/farms`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch farms');
    return response.json();
};

export const fetchFarmDetails = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch farm details');
    return response.json();
};

export const fetchStats = async () => {
    const response = await fetch(`${API_BASE_URL}/farms/stats`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
};

export const analyzeFarmImage = async (farmId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('farmId', farmId);
    formData.append('image', imageFile);

    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/analysis/analyze`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
};

export const chatWithAI = async (message: string) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Chat failed');
    return response.json();
};

export const fetchReports = async () => {
    const response = await fetch(`${API_BASE_URL}/reports`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
};

export const fetchVegetationReports = async () => {
    const response = await fetch(`${API_BASE_URL}/vegetation`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch vegetation reports');
    return response.json();
};

export const uploadVegetationBatch = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/vegetation/batch`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
    }
    return response.json();
};
