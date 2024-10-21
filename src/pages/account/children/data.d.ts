export type TableListItem = {
  id: number;
  auditStatus: number; //0.审核中 1审核通过 2.审核未通过
  amount: number;
  bankCode: string;
  bankName: string;
  createTime: string;
  name: string;
  phone: string;
  serviceCharge: string;
  type: string;
  nice_name: string;
  invite_amount: string;
  modifyStock: string;
  subUser: number;
  username: string;
  user_id: any;
};

export interface TableListPagination extends TableListItem {
  pageSize: number;
  current: number;
}

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
