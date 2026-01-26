export type ParserResult<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};

export default ParserResult;
