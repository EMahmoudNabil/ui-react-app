import { Subcomponent } from "../types/Subcomponent";
import { axiosInstance } from "./axios";



//  Get all Subcomponents by Component
export const getSubcomponentsByComponentId = async (
  componentId: number
): Promise<Subcomponent[]> => {
  const response = await axiosInstance.get(`/Subcomponent/byComponent/${componentId}`);
  return response.data;
};

//  Add
export const createSubcomponent = async (
  subcomponent: {
    componentId: number;
    name: string;
    material: string;
    count: number;
    totalQuantity: number;
    notes?: string;
    veneerInner?: string;
    veneerOuter?: string;
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
  }
): Promise<Subcomponent> => {
  const response = await axiosInstance.post("/Subcomponent", subcomponent);
  return response.data;
};

//  Update
export const updateSubcomponent = async (
  subcomponent: Subcomponent
): Promise<Subcomponent> => {
  const response = await axiosInstance.put(`/Subcomponent/${subcomponent.id}`, subcomponent);
  return response.data;
};

//  Delete
export const deleteSubcomponent = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/Subcomponent/${id}`);
};
