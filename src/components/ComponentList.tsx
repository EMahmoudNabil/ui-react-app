import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getComponentsByProductId } from "../api/component.api";
import { Product } from "../types/Product";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { Component } from "../types/Component";
import SubcomponentGrid from "./SubcomponentGrid";

type Props = {
  product: Product;
};

export default function ComponentList({ product }: Props) {
  const { data, isLoading, error } = useQuery<Component[]>({
    queryKey: ["components", product.id],
    queryFn: () => getComponentsByProductId(product.id),
    enabled: !!product,
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">فشل تحميل المكونات</Typography>;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {data?.map((component) => (
        <Card key={component.id} variant="outlined">
          <CardContent>
            <Typography variant="h6">{component.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              الكمية: {component.quantity}
            </Typography>

            <SubcomponentGrid componentId={component.id} componentQuantity={0} />
            </CardContent>
        </Card>
      ))}
    </Box>
  );
}
