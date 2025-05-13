import { extractJWT, generateApiResponse } from "./utils";

export function withAuth(resolver) {
  return async (input) => {
    const { request } = input;
    const accessToken = request.headers.get("Authorization").split(" ")[1];

    const payload = await extractJWT(accessToken);

    if (!payload || payload.exp < Date.now() / 1000) {
      return generateApiResponse({
        success: false,
        errors: ["Unauthorized"],
        message: "Unauthorized",
        status: 401,
      });
    }

    return resolver(input);
  };
}
