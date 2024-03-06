export type TableListItem = {
  id: number;
  image: string;
  url: string;
  sort: number;
  provinceId: number;
  province: string;
  cityId: number;
  city: string;
  regionId: number;
  region: string;
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
