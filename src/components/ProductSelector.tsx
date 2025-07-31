import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../api/product.api";
import { Product } from "../types/Product";

import {
  Autocomplete,
  CircularProgress,
  TextField,
  Box,
  Typography,
} from "@mui/material";

type Props = {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
};

export default function ProductSelector({ selectedProduct, onSelect }: Props) {
  const { data, isLoading, error } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading products</Typography>;

  return (
    <Box mb={3}>
      <Autocomplete
        options={data || []}
        getOptionLabel={(option) => option.name}
        value={selectedProduct}
        onChange={(event, newValue) => onSelect(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="اختر المنتج" variant="outlined" fullWidth />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </Box>
  );
}
