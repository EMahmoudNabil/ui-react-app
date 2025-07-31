import { Component } from "../types/Component";
import { axiosInstance } from "./axios";



//  Get all components for a specific product
export const getComponentsByProductId = async (
  productId: number
): Promise<Component[]> => {
  const response = await axiosInstance.get(`/Component/byProduct/${productId}`);
  return response.data;
};

// Get component by ID (if needed)
export const getComponentById = async (id: number): Promise<Component> => {
  const response = await axiosInstance.get(`/Component/${id}`);
  return response.data;
};

//  Create new component
export const createComponent = async (component: Omit<Component, "id">): Promise<Component> => {
  const response = await axiosInstance.post("/Component", component);
  return response.data;
};

//  Update component
export const updateComponent = async (component: Component): Promise<Component> => {
  const response = await axiosInstance.put(`/Component/${component.id}`, component);
  return response.data;
};

//  Delete component
export const deleteComponent = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/Component/${id}`);
};
