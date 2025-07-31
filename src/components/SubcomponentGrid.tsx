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
  getSubcomponentsByComponentId,
  createSubcomponent,
  updateSubcomponent,
  deleteSubcomponent,
} from "../api/subcomponent.api";
import { Subcomponent } from "../types/Subcomponent";

type Props = {
  componentId: number;
  componentQuantity: number;
};

// Utility function to sanitize subcomponent data
const sanitizeSubcomponent = (item: any): Subcomponent => ({
  ...item,
  detailSize: {
    length: item.detailSize?.length || 0,
    width: item.detailSize?.width || 0,
    thickness: item.detailSize?.thickness || 0,
  },
  cuttingSize: {
    length: item.cuttingSize?.length || 0,
    width: item.cuttingSize?.width || 0,
    thickness: item.cuttingSize?.thickness || 0,
  },
  finalSize: {
    length: item.finalSize?.length || 0,
    width: item.finalSize?.width || 0,
    thickness: item.finalSize?.thickness || 0,
  },
  count: item.count || 0,
  totalQuantity: item.totalQuantity || 0,
  notes: item.notes || "",
  veneerInner: item.veneerInner || "",
  veneerOuter: item.veneerOuter || "",
});

export default function SubcomponentGrid({ componentId, componentQuantity }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Subcomponent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data, error: queryError } = useQuery({
    queryKey: ["subcomponents", componentId],
    queryFn: () => getSubcomponentsByComponentId(componentId),
  });

  useEffect(() => {
    if (data) {
      try {
        const sanitizedData = data.map((item) => sanitizeSubcomponent(item));
        setRows(sanitizedData);
        setError(null);
      } catch (err) {
        console.error("Error sanitizing data:", err);
        setError("Error loading subcomponents data");
      }
    }
  }, [data]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      console.error("Query error:", queryError);
      setError("Failed to load subcomponents");
    }
  }, [queryError]);

  const mutationUpdate = useMutation({
    mutationFn: updateSubcomponent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["subcomponents", componentId] }),
  });

  const mutationCreate = useMutation({
    mutationFn: createSubcomponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcomponents", componentId] });
    },
  });
  

  const mutationDelete = useMutation({
    mutationFn: deleteSubcomponent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["subcomponents", componentId] }),
  });

  const handleChange = (
    index: number,
    field: keyof Subcomponent | string,
    value: any
  ) => {
    const updated = [...rows];
    const row = { ...updated[index] };

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      row[parent] = {
        ...row[parent],
        [child]: parseFloat(value) || 0,
      };
    } else {
      if (field === "count") {
        row.count = parseInt(value) || 0;
        row.totalQuantity = row.count * componentQuantity;
      } else {
        (row[field as keyof Subcomponent] as any) = value ?? "";
      }
    }

    updated[index] = row;
    setRows(updated);
  };
  const mapToDto = (row: Subcomponent): any => ({
    id: row.id,
    componentId: row.componentId,
    name: row.name,
    material: row.material,
    notes: row.notes,
    count: row.count,
    totalQuantity: row.totalQuantity,
    veneerInner: row.veneerInner,
    veneerOuter: row.veneerOuter,
    detailSize: row.detailSize,
    cuttingSize: row.cuttingSize,
    finalSize: row.finalSize,
  });
  
const handleBlur = async (row: Subcomponent) => {
  if (!row.name || !row.material) return;

  try {
    if (row.id > 0) {
      // Update existing subcomponent
      const dto = mapToDto(row);
      console.log("Updating row:", dto);
      await mutationUpdate.mutateAsync(dto);
    } else {
      // Create new subcomponent - exclude id field
      const { id, ...createDto } = mapToDto(row);
      console.log("Creating row:", createDto);
      const result = await mutationCreate.mutateAsync(createDto);
      console.log("Created result:", result);
      
      // Sanitize the result before updating state
      const sanitizedResult = sanitizeSubcomponent(result);
      
      // Replace the temporary row with the created row from server
      setRows((prev) => prev.map(r => r === row ? sanitizedResult : r));
    }
  } catch (error) {
    console.error("Failed to save subcomponent:", error);
    console.error("Error details:", {
      row,
      componentId,
      componentQuantity
    });
    // You can add user notification here
  }
};
  

  const handleAdd = () => {
    if (rows.some((r) => r.id === 0)) return;
    setRows([
      ...rows,
      {
        id: 0,
        name: "",
        material: "",
        count: 1,
        notes: "",
        componentId,
        totalQuantity: componentQuantity,
        veneerInner: "",
        veneerOuter: "",
        detailSize: { length: 0, width: 0, thickness: 0 },
        cuttingSize: { length: 0, width: 0, thickness: 0 },
        finalSize: { length: 0, width: 0, thickness: 0 },
      },
    ]);
  };
  

  const handleDelete = (id: number) => {
    mutationDelete.mutate(id);
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        الأجزاء الفرعية
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
        إضافة صف جديد
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2}>الاسم</TableCell>
              <TableCell rowSpan={2}>الخامة</TableCell>
              <TableCell rowSpan={2}>عدد</TableCell>
              <TableCell rowSpan={2}>عدد الإنتاج</TableCell>
              <TableCell rowSpan={2}>ملاحظات</TableCell>
              <TableCell rowSpan={2}>قشرة داخلية</TableCell>
              <TableCell rowSpan={2}>قشرة خارجية</TableCell>

              <TableCell colSpan={3} align="center">مقاس تفصيل</TableCell>
              <TableCell colSpan={3} align="center">مقاس تقصيب</TableCell>
              <TableCell colSpan={3} align="center">مقاس نهائي</TableCell>

              <TableCell rowSpan={2}>حذف</TableCell>
            </TableRow>
            <TableRow>
              {["طول", "عرض", "سمك"].map((dim) => (
                <TableCell key={"detail-" + dim}>{dim}</TableCell>
              ))}
              {["طول", "عرض", "سمك"].map((dim) => (
                <TableCell key={"cutting-" + dim}>{dim}</TableCell>
              ))}
              {["طول", "عرض", "سمك"].map((dim) => (
                <TableCell key={"final-" + dim}>{dim}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) =>
              row.id === 0 ? (
                <TableRow key={`new-${index}`}>
                <TableCell>
                  <TextField
                    value={row.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
              
                <TableCell>
                  <TextField
                    value={row.material}
                    onChange={(e) => handleChange(index, "material", e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
              
                <TableCell>
                  <TextField
                    type="number"
                    value={row.count ?? 0}
                    onChange={(e) => handleChange(index, "count", e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
              
                <TableCell>{row.totalQuantity ?? 0}</TableCell>
              
                <TableCell>
                  <TextField
                    value={row.notes ?? ""}
                    onChange={(e) => handleChange(index, "notes", e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
              
                <TableCell>
                  <TextField
                    value={row.veneerInner ?? ""}
                    onChange={(e) => handleChange(index, "veneerInner", e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
              
                <TableCell>
                  <TextField
                    value={row.veneerOuter ?? ""}
                    onChange={(e) => handleChange(index, "veneerOuter", e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
              
                {["length", "width", "thickness"].map((dim) => (
                  <TableCell key={`detail-new-${dim}`}>
                    <TextField
                      type="number"
                      variant="standard"
                      value={row.detailSize?.[dim] ?? 0}
                      onChange={(e) => handleChange(index, `detailSize.${dim}`, e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                ))}
              
                {["length", "width", "thickness"].map((dim) => (
                  <TableCell key={`cutting-new-${dim}`}>
                    <TextField
                      type="number"
                      variant="standard"
                      value={row.cuttingSize?.[dim] ?? 0}
                      onChange={(e) => handleChange(index, `cuttingSize.${dim}`, e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                ))}
              
                {["length", "width", "thickness"].map((dim) => (
                  <TableCell key={`final-new-${dim}`}>
                    <TextField
                      type="number"
                      variant="standard"
                      value={row.finalSize?.[dim] ?? 0}
                      onChange={(e) => handleChange(index, `finalSize.${dim}`, e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                ))}
              
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Add />}
                    onClick={() => handleBlur(row)}
                  >
                    حفظ
                  </Button>
                </TableCell>
              </TableRow>
              
              ) : (
                <TableRow key={`${row.id}-${index}`}>

                  <TableCell>
                    <TextField
                      value={row.name}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                      onBlur={() => handleBlur(row)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      value={row.material}
                      onChange={(e) => handleChange(index, "material", e.target.value)}
                      onBlur={() => handleBlur(row)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      type="number"
                      value={row.count ?? 0}
                      onChange={(e) => handleChange(index, "count", e.target.value)}
                      onBlur={() => handleBlur(row)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>{row.totalQuantity ?? 0}</TableCell>

                  <TableCell>
                    <TextField
                      value={row.notes ?? ""}
                      onChange={(e) => handleChange(index, "notes", e.target.value)}
                      onBlur={() => handleBlur(row)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      value={row.veneerInner ?? ""}
                      onChange={(e) => handleChange(index, "veneerInner", e.target.value)}
                      onBlur={() => handleBlur(row)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      value={row.veneerOuter ?? ""}
                      onChange={(e) => handleChange(index, "veneerOuter", e.target.value)}
                      onBlur={() => handleBlur(row)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  {["length", "width", "thickness"].map((dim) => (
                    <TableCell key={"detail-" + dim}>
                      <TextField
                        type="number"
                        variant="standard"
                        value={row.detailSize?.[dim] ?? 0}
                        onChange={(e) => handleChange(index, `detailSize.${dim}`, e.target.value)}
                        onBlur={() => handleBlur(row)}
                        fullWidth
                      />
                    </TableCell>
                  ))}

                  {["length", "width", "thickness"].map((dim) => (
                    <TableCell key={"cutting-" + dim}>
                      <TextField
                        type="number"
                        variant="standard"
                        value={row.cuttingSize?.[dim] ?? 0}
                        onChange={(e) => handleChange(index, `cuttingSize.${dim}`, e.target.value)}
                        onBlur={() => handleBlur(row)}
                        fullWidth
                      />
                    </TableCell>
                  ))}

                  {["length", "width", "thickness"].map((dim) => (
                    <TableCell key={"final-" + dim}>
                      <TextField
                        type="number"
                        variant="standard"
                        value={row.finalSize?.[dim] ?? 0}
                        onChange={(e) => handleChange(index, `finalSize.${dim}`, e.target.value)}
                        onBlur={() => handleBlur(row)}
                        fullWidth
                      />
                    </TableCell>
                  ))}

                  <TableCell>
                    <IconButton onClick={() => handleDelete(row.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
