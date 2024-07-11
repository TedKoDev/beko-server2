export declare type ExceptionOptions = {
  code?: string;
  statusCode?: number;
  expands?: ExceptionExpands;
  quite?: boolean;
  messageParams?: Record<string, any>;
};
export declare type ExceptionExpands = {
  message?: string;
  detail?: any;
  messageParams?: Record<string, any>;
};
export declare type ExceptionResponse = {
  code: string;
  traceId: string;
  statusCode: number;
} & ExceptionExpands;
