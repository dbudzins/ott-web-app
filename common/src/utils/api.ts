import type { AxiosResponse } from 'axios';

export class ApiError extends Error {
  code: number;
  message: string;

  constructor(message = '', code: number) {
    super(message);
    this.name = 'ApiError';
    this.message = message;
    this.code = code;
  }
}

/**
 * Get data
 * @param response
 */
export const getDataOrThrow = async (response: AxiosResponse) => {
  const data = await response.data;
console.info(data);
  if (response.status !== 200) {
    const message = `Request '${response.request.url}' failed with ${response.status}`;
    const error = new ApiError(data?.message || message, response.status || 500);

    throw error;
  }

  return data;
};
