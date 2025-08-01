import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
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
import { Add, Delete, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
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
};

export default function ComponentGrid({ product }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ProductComponent[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["components", product.id],
    queryFn: () => getComponentsByProductId(product.id),
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

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
        setRows(prev => {
          const updated = [...prev];
          updated[index] = result;
          return updated;
        });
      }
      setError(null);
    } catch (err) {
      setError("فشل حفظ المكون");
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
  };

  const toggleExpand = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        مكونات المنتج: {product.name}
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
        إضافة مكون
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>الاسم</TableCell>
              <TableCell>الكمية</TableCell>
              <TableCell>حذف</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <React.Fragment key={row.id || `new-${index}`}>
                <TableRow>
                  <TableCell>
                    {row.id > 0 && (
                      <IconButton size="small" onClick={() => toggleExpand(row.id)}>
                        {expandedRowId === row.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    )}
                  </TableCell>
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
                    {row.id > 0 && (
                      <IconButton onClick={() => handleDelete(row.id)}>
                        <Delete color="error" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>

                {row.id > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0 }}>
                      <Collapse in={expandedRowId === row.id} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2 }}>
                          <SubcomponentGrid
                            componentId={row.id}
                            componentQuantity={row.quantity}
                          />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
