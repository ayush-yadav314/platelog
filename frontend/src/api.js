const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // expired or invalid token: log out and go to the login page
    if (res.status === 401 && token) {
      clearToken();
      window.location.assign("/login");
    }
    let message = "Request failed";
    if (typeof data?.detail === "string") message = data.detail;
    else if (Array.isArray(data?.detail))
      message = data.detail.map((d) => d.msg).join(", ");
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Auth ----------

export function registerUser(email, password) {
  return request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function loginUser(email, password) {
  // OAuth2PasswordRequestForm expects form fields, not JSON
  const body = new URLSearchParams({ username: email, password });
  return request("/auth/login", { method: "POST", body });
}

export function getMe() {
  return request("/auth/me");
}

// ---------- Exercises ----------

export function getExercises() {
  return request("/exercises");
}

export function createExercise(name, muscle_group) {
  return request("/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, muscle_group }),
  });
}

// ---------- Workouts ----------

export function getWorkouts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/workouts${qs ? `?${qs}` : ""}`);
}

export function createWorkout(payload) {
  return request("/workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteWorkout(id) {
  return request(`/workouts/${id}`, { method: "DELETE" });
}
// ---------- Coach ----------

export function getCoaching() {
  return request("/coach/advice", { method: "POST" });
}