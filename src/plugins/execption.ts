import { ExceptionExpands, ExceptionOptions, ExceptionResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class CustomException {
  public readonly traceId: string = uuidv4();

  public readonly code: string;
  public readonly messageParams: Record<string, any>;
  public readonly statusCode: number;
  public readonly expands: ExceptionExpands;
  public readonly quite: boolean;

  constructor({
    code,
    statusCode,
    expands,
    quite,
    messageParams,
  }: ExceptionOptions) {
    this.code = code || 'unknown';
    this.statusCode = statusCode || 500;
    this.expands = expands || {};
    this.quite = quite || true;
    this.messageParams = messageParams || {};
  }

  get response(): ExceptionResponse {
    const { traceId, code, statusCode, messageParams } = this;
    const { message, detail } = this.expands;

    return { traceId, code, statusCode, message, detail, messageParams };
  }
}
