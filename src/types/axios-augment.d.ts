import "axios";

declare module "axios" {
  export interface AxiosRequestConfig<D = any> {
    skipProgress?: boolean;
    meta?: any;
    _retry?: boolean;
  }
}
