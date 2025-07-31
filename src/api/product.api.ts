// src/api/product.api.ts

import { axiosInstance } from "./axios";
import { Product } from "../types/Product";

export const getAllProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>("/Product");
  return response.data;
};

export const createProduct = async (product: Omit<Product, "id">) => {
  const response = await axiosInstance.post("/Product", product);
  return response.data;
};

export const updateProduct = async (product: Product) => {
  const response = await axiosInstance.put(`/Product/${product.id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await axiosInstance.delete(`/Product/${id}`);
  return response.data;
};
