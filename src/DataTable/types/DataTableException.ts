type DataTableException = {
  error: string;
  row?: number;
  column?: number;
  from?: string;
  cause?: any;
};

export default DataTableException;
