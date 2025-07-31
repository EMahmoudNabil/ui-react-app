import React, { useState } from "react";
import ProductSelector from "../components/ProductSelector";
import ComponentList from "../components/ComponentList";
import ProductForm from "../components/ProductForm";
import ComponentForm from "../components/ComponentForm";
import { Product } from "../types/Product";
import { Box, Button, Divider, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createMode, setCreateMode] = useState(false);
  const queryClient = useQueryClient();

  const handleProductCreated = (newProduct: Product) => {
    setSelectedProduct(newProduct);
    setCreateMode(false);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleProductUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <Box p={3} dir="rtl">
      <Typography variant="h5" gutterBottom>المنتجات</Typography>

      <ProductSelector
        selectedProduct={selectedProduct}
        onSelect={(product) => {
          setSelectedProduct(product);
          setCreateMode(false);
        }}
      />

      <Box my={2}>
        <Button variant="outlined" onClick={() => setCreateMode(true)}>
          إنشاء منتج جديد
        </Button>
      </Box>

      {createMode && (
        <>
          <Typography variant="h6">إضافة منتج جديد</Typography>
          <ProductForm onSuccess={() => handleProductCreated({} as Product)} />
        </>
      )}

      {selectedProduct && !createMode && (
        <>
          <Typography variant="h6">تعديل المنتج</Typography>
          <ProductForm initialProduct={selectedProduct} onSuccess={handleProductUpdated} />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">المكونات المرتبطة بالمنتج</Typography>
          <ComponentForm
            productId={selectedProduct.id}
            onSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ["components", selectedProduct.id] })
            }
          />
          <ComponentList product={selectedProduct} />
        </>
      )}
    </Box>
  );
}
