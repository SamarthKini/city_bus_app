import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function fetchStops() {
  const response = await api.get("/stops/");
  return response.data;
}

export async function fetchRouteStops() {
  const response = await api.get("/route_stops/");
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

export async function findNearestStop(routeNumber, latitude, longitude) {
  const response = await api.get("/nearest-stop/", {
    params: {
      route_number: routeNumber,
      lat: latitude,
      lng: longitude,
    },
  });

  return response.data;
}
