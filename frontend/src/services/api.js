const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin);

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload.detail || 'Request failed';
    throw new Error(message);
  }
  return payload;
}

export async function analyzeImage(formData) {
  const response = await fetch(`${API_BASE_URL}/analyze-image`, {
    method: 'POST',
    body: formData,
  });
  return parseResponse(response);
}

export async function analyzeText(complaintText) {
  const formData = new FormData();
  formData.append('complaint_text', complaintText);
  const response = await fetch(`${API_BASE_URL}/analyze-text`, {
    method: 'POST',
    body: formData,
  });
  return parseResponse(response);
}

export async function adminLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  return parseResponse(response);
}

export async function fetchComplaints(token) {
  const response = await fetch(`${API_BASE_URL}/complaints`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseResponse(response);
}

export async function resolveComplaint(token, complaintId, resolved = true) {
  const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/resolve`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resolved }),
  });
  return parseResponse(response);
}

export async function createComplaint(payload) {
  const response = await fetch(`${API_BASE_URL}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}
