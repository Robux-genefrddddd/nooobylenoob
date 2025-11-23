export async function adminFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
    "X-Admin-Auth":
      sessionStorage.getItem("admin_authenticated") === "true"
        ? "true"
        : "false",
  };

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
