import {
  MOCK_ACCESS_TOKEN_EXPIRATION,
  MOCK_ACCESS_TOKEN_SECRET,
} from "./config";
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
  accessToken,
  removeAccessToken,
}) => {
  const response = {};
  let headers = {};

  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (message) response.message = message;
  if (accessToken) {
    headers = {
      "Set-Cookie": `codercomm-access-token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MOCK_ACCESS_TOKEN_EXPIRATION}`,
    };
  }

  if (removeAccessToken) {
    headers = {
      "Set-Cookie": `codercomm-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    };
  }

  return new HttpResponse(JSON.stringify(response), {
    status,
    headers,
  });
};

export const extractJWT = async (accessToken) => {
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, MOCK_ACCESS_TOKEN_SECRET);

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

export const queryParams = (request) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return params;
};
