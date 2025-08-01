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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/product.api";
import { Product } from "../types/Product";


type Props = {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
};

export default function ProductGrid({ selectedProduct, onSelect }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data, error: queryError } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  useEffect(() => {
    if (queryError) {
      console.error("Error loading products:", queryError);
      setError("فشل تحميل المنتجات");
    }
  }, [queryError]);

  const mutationCreate = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const mutationUpdate = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const mutationDelete = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const handleChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], name: value };
    setRows(updated);
  };

  const handleBlur = async (row: Product, index: number) => {
    if (!row.name) {
      setError("اسم المنتج مطلوب");
      return;
    }

    try {
      if (row.id > 0) {
        await mutationUpdate.mutateAsync(row);
      } else {
        const { id, ...rest } = row;
        const result = await mutationCreate.mutateAsync(rest);
        const updated = [...rows];
        updated[index] = result;
        setRows(updated);
      }
      setError(null);
    } catch (err) {
      setError("فشل في الحفظ");
    }
  };

  
  const handleAdd = () => {
    if (rows.some((r) => r.id === 0)) return;
    setRows([...rows, { id: 0, name: "", price: 0 }]);
  };

  const handleDelete = (id: number) => {
    mutationDelete.mutate(id);
    if (selectedProduct?.id === id) {
      onSelect(null); // إزالة التحديد إذا تم حذف المنتج المحدد
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        إدارة المنتجات
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleAdd}
        sx={{ mb: 2 }}
      >
        إضافة منتج جديد
      </Button>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>اسم المنتج</TableCell>
              <TableCell>اختيار</TableCell>
              <TableCell>حذف</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.id || `new-${index}`}
                selected={selectedProduct?.id === row.id}
              >
                <TableCell>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={row.name}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onBlur={() => handleBlur(row, index)}
                  />
                </TableCell>
                <TableCell>
                  {row.id > 0 && (
                    <Button
                      variant="outlined"
                      color={
                        selectedProduct?.id === row.id ? "success" : "primary"
                      }
                      onClick={() => onSelect(row)}
                    >
                      {selectedProduct?.id === row.id ? "محدد" : "تحديد"}
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {row.id > 0 && (
                    <IconButton onClick={() => handleDelete(row.id)}>
                      <Delete color="error" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}