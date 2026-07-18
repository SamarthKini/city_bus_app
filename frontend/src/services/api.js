import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function fetchStops() {
  const response = await api.get("/stops/");
  return response.data;
}

export async function fetchConnections(fromStop, toStop) {
  const response = await api.get("/connections/", {
    params: {
      from_stop: fromStop,
      to_stop: toStop,
    },
  });

  return response.data;
}

export async function findNearestStop() {
  // TODO: Call POST /api/neareststop with bus_number, latitude, and longitude.
}
