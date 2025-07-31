import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComponent, updateComponent } from "../api/component.api";
import { Component } from "../types/Component";

type Props = {
  productId: number;
  initialComponent?: Component;
  onSuccess: () => void;
};

export default function ComponentForm({ productId, initialComponent, onSuccess }: Props) {
  const [name, setName] = useState(initialComponent?.name || "");
  const [quantity, setQuantity] = useState(initialComponent?.quantity || 0);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: initialComponent ? updateComponent : createComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components", productId] });
      onSuccess();
    },
  });

  const handleSubmit = () => {
    const payload = {
      ...(initialComponent || {}),
      productId,
      name,
      quantity,
    };
    mutation.mutate(payload as Component);
  };

  return (
    <Box display="flex" gap={2} mt={2}>
      <TextField
        label="اسم المكون"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      <TextField
        label="الكمية"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        fullWidth
      />
      <Button variant="contained" onClick={handleSubmit}>
        {initialComponent ? "تحديث" : "إضافة"}
      </Button>
    </Box>
  );
}
