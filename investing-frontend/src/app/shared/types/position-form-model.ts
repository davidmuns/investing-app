export type FormMode = 'view' | 'edit' | 'close';
export type PositionOperation = 'Compra' | 'Venta';

export type PositionFormModel = {
  id: number;
  symbol: string;
  date: string;
  quantity: string;
  price: string;
  commission: string;
};

export type EditPositionFormModel = PositionFormModel & {
  mode: FormMode;
  original: {
    date: string;
    quantity: string;
    price: string;
    commission: string;
  };
};

export type AddPositionFormModel = PositionFormModel & {
  operation: PositionOperation;
};
