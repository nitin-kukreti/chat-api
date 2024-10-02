import { UseInterceptors } from '@nestjs/common';
import { ResponseTransformInterceptor } from '../interceptors/response-transform.interceptor';

export function Serialize(dto: any) {
  return UseInterceptors(new ResponseTransformInterceptor(dto));
}
