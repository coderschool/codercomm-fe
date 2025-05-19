import { MOCK_JWT_SECRET } from "./config";
import { jwtVerify } from "jose";
import { HttpResponse } from "msw";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const generateApiResponse = ({
  status,
  data,
  errors,
  message,
  success,
}) => {
  const response = {};

  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (message) response.message = message;
  return HttpResponse.json(response, { status });
};

export const extractJWT = async (accessToken) => {
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, MOCK_JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
};

export const countBy = (array, prop) => {
  return array.reduce((acc, item) => {
    const key = item[prop];
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {});
};
