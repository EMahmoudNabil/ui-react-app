import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getComponentsByProductId,
  createComponent,
  updateComponent,
  deleteComponent,
} from "../api/component.api";
import { Product } from "../types/Product";
import { Component as ProductComponent } from "../types/Component";
import SubcomponentGrid from "./SubcomponentGrid";

type Props = {
    product: Product;
    selectedComponentId: number | null;
    onSelectComponent: (id: number | null) => void;
  };
  
  
  export default function ComponentGrid({
    product,
    selectedComponentId,
    onSelectComponent,
  }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ProductComponent[]>([]);
  const [error, setError] = useState<string | null>(null);
//   const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null;)
  

  const { data, error: queryError } = useQuery({
    queryKey: ["components", product.id],
    queryFn: () => getComponentsByProductId(product.id),
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (data) {
      setRows(data);
      setError(null);
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      setError("فشل تحميل المكونات");
    }
  }, [queryError]);

  const mutationUpdate = useMutation({
    mutationFn: updateComponent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["components", product.id] }),
  });

  const mutationCreate = useMutation({
    mutationFn: createComponent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["components", product.id] }),
  });

  const mutationDelete = useMutation({
    mutationFn: deleteComponent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["components", product.id] }),
  });

  const handleChange = (
    index: number,
    field: keyof ProductComponent,
    value: string | number
  ) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: field === "quantity" ? parseInt(value as string) || 0 : value,
    };
    setRows(updated);
  };

  const handleBlur = async (row: ProductComponent, index: number) => {
    if (!row.name) {
      setError("اسم المكون مطلوب");
      return;
    }

    try {
      if (row.id > 0) {
        await mutationUpdate.mutateAsync(row);
      } else {
        const { id, ...newRow } = row;
        const result = await mutationCreate.mutateAsync({ ...newRow, productId: product.id });
        setRows((prev) => {
          const updated = [...prev];
          updated[index] = result;
          return updated;
        });
      }
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError("حدث خطأ أثناء الحفظ");
    }
  };

  const handleAdd = () => {
    if (rows.some((r) => r.id === 0)) return;
    setRows([
      ...rows,
      {
        id: 0,
        name: "",
        quantity: 1,
        productId: product.id,
      },
    ]);
  };

  const handleDelete = (id: number) => {
    mutationDelete.mutate(id);
    if (selectedComponentId === id) {
        onSelectComponent(null);
    }
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        المكونات الخاصة بالمنتج: {product.name}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={handleAdd}
      >
        إضافة مكون
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>الكمية</TableCell>
              <TableCell>تحديد</TableCell>
              <TableCell>حذف</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.id || `new-${index}`}
                selected={selectedComponentId === row.id}
                sx={{ backgroundColor: selectedComponentId === row.id ? "#f9f9f9" : "inherit" }}
              >
                <TableCell>
                  <TextField
                    value={row.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    onBlur={() => handleBlur(row, index)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleChange(index, "quantity", e.target.value)}
                    onBlur={() => handleBlur(row, index)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                <Button
                variant="outlined"
                color={selectedComponentId === row.id ? "success" : "primary"}
                onClick={() =>
                    onSelectComponent(selectedComponentId === row.id ? null : row.id)
                }
                >
                {selectedComponentId === row.id ? "محدد" : "تحديد"}
                </Button>

                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedComponentId && (
        <Box mt={3}>
            <SubcomponentGrid
            componentId={selectedComponentId}
            componentQuantity={rows.find((c) => c.id === selectedComponentId)?.quantity || 0}
            />
        </Box>
        )}


    </Box>
  );
}
