export type Subcomponent = {
    id: number;
    name: string;
    material: string;
    count: number;
    totalQuantity: number;
    notes?: string;
    veneerInner?: string;
    veneerOuter?: string;
    componentId: number;
  
    detailSize: {
      length: number;
      width: number;
      thickness: number;
    };
    cuttingSize: {
      length: number;
      width: number;
      thickness: number;
    };
    finalSize: {
      length: number;
      width: number;
      thickness: number;
    };
  };
  