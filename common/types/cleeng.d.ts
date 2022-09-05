export interface ApiResponse {
  errors: string[];
}
export type CleengResponse<R> = { responseData: R } & ApiResponse;
export type CleengEmptyRequest<R> = (sandbox: boolean) => Promise<CleengResponse<R>>;
export type CleengEmptyAuthRequest<R> = (sandbox: boolean, jwt: string) => Promise<CleengResponse<R>>;
export type CleengRequest<P, R> = (payload: P, sandbox: boolean) => Promise<CleengResponse<R>>;
export type CleengAuthRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<CleengResponse<R>>;
