import React, { useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import ProductGrid from "../components/ProductGrid";
import ComponentGrid from "../components/ComponentGrid";
import { Product } from "../types/Product";

export default function ProductComponentPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);

  return (
    <Box p={3} dir="rtl">
      <Typography variant="h5" gutterBottom>
        إدارة المنتجات والمكونات
      </Typography>

      <ProductGrid
        selectedProduct={selectedProduct}
        onSelect={(product) => {
          setSelectedProduct(product);
          setSelectedComponentId(null); 
        }}
      />

      <Divider sx={{ my: 3 }} />

      {selectedProduct ? (
        <ComponentGrid
            product={selectedProduct}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => {
            setSelectedComponentId(id); 
            }}
        />
        ) : (
        <Typography color="text.secondary" mt={2}>
            اختر منتجًا لعرض مكوناته
        </Typography>
        )}
    </Box>
  );
}
