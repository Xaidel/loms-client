type DataTableException = {
  error: string;
  index?: {
    row: number;
    column: number;
  };
};

export default DataTableException;
