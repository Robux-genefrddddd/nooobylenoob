export async function adminFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const token = sessionStorage.getItem("admin_token");
  const headers: any = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function adminFetchJSON<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await adminFetch(url, options);

  if (!response.ok) {
    let error = "API request failed";
    try {
      const data = await response.json();
      error = data.error || error;
    } catch {
      error = `${response.status} ${response.statusText}`;
    }
    throw new Error(error);
  }

  return response.json();
}
