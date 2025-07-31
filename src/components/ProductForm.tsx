import React, { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, updateProduct } from "../api/product.api";
import { Product } from "../types/Product";

type Props = {
  initialProduct?: Product;
  onSuccess: () => void;

};

export default function ProductForm({ initialProduct, onSuccess }: Props) {
  const [name, setName] = useState(initialProduct?.name || "");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: initialProduct ? updateProduct : createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess();
    },
  });

  const handleSubmit = () => {
    const payload = { ...(initialProduct || {}), name };
    mutation.mutate(payload as Product);
  };

  return (
    <Box display="flex" gap={2} mt={2}>
      <TextField
        label="اسم المنتج"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      <Button variant="contained" onClick={handleSubmit}>
        {initialProduct ? "تحديث" : "إضافة"}
      </Button>
      <Button onClick={() => setName(initialProduct?.name || "")} color="secondary">إلغاء</Button>

    </Box>
  );
}
