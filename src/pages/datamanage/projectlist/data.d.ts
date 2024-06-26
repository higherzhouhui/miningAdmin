export type TableListItem = {
  id: number;
  image: string;
  chntSubsidy: number;
  dayEarnings: number;
  period: string;
  price: number;
  putaway: string;
  insureType: number;
};

export type TableListPagination = {
  pageSize: number;
  current: number;
};

export type TableListData = {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
};

export type TableListParams = {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
};
