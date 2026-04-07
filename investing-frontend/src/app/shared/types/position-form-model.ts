export type FormMode = 'view' | 'edit' | 'close';

export type PositionFormModel = {
  id: number;
  symbol: string;
  date: string;
  quantity: string;
  price: string;
  commission: string;
  operation?: string | undefined;
  mode: FormMode;
  original: {
    date: string;
    quantity: string;
    price: string;
    commission: string;
  };
};
