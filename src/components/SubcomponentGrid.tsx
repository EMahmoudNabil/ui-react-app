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
  id: item.id,
  name: item.name,
  material: item.material,
  count: item.count,
  totalQuantity: item.totalQuantity,
  notes: item.notes || "",
  veneerInner: item.veneerInner || "",
  veneerOuter: item.veneerOuter || "",
  componentId: item.componentId,

  detailSize: {
    length: item.detailLength || 0,
    width: item.detailWidth || 0,
    thickness: item.detailThickness || 0,
  },
  cuttingSize: {
    length: item.cuttingLength || 0,
    width: item.cuttingWidth || 0,
    thickness: item.cuttingThickness || 0,
  },
  finalSize: {
    length: item.finalLength || 0,
    width: item.finalWidth || 0,
    thickness: item.finalThickness || 0,
  },
});


export default function SubcomponentGrid({ componentId, componentQuantity }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Subcomponent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data, error: queryError } = useQuery({
    queryKey: ["subcomponents", componentId],
    queryFn: () => getSubcomponentsByComponentId(componentId),
    enabled: !!componentId, 
  });

useEffect(() => {
  if (data) {
    try {
      const sanitizedData = data.map((item) => {
        const sanitized = sanitizeSubcomponent(item);
        sanitized.totalQuantity = sanitized.count * componentQuantity; 
        return sanitized;
      });
      setRows(sanitizedData);
      setError(null);
    } catch (err) {
      console.error("Error sanitizing data:", err);
      setError("Error loading subcomponents data");
    }
  }
}, [data, componentQuantity]);

useEffect(() => {
  setRows((prevRows) =>
    prevRows.map((row) => ({
      ...row,
      totalQuantity: row.count * componentQuantity,
    }))
  );
}, [componentQuantity]);


  
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

// Fix the handleChange function to properly calculate totalQuantity
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
      const count = parseInt(value) || 0;
      row.count = count;
      row.totalQuantity = count * componentQuantity; // Ensure this calculation happens
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

  // detailSize fields
  detailLength: row.detailSize.length,
  detailWidth: row.detailSize.width,
  detailThickness: row.detailSize.thickness,

  // cuttingSize fields
  cuttingLength: row.cuttingSize.length,
  cuttingWidth: row.cuttingSize.width,
  cuttingThickness: row.cuttingSize.thickness,

  // finalSize fields
  finalLength: row.finalSize.length,
  finalWidth: row.finalSize.width,
  finalThickness: row.finalSize.thickness,
});


  
// Enhance the handleBlur function with better error handling
const handleBlur = async (row: Subcomponent, index: number) => {
  if (!row.name || !row.material) {
    setError("الاسم والخامة مطلوبان");
    return;
  }

  try {
    if (row.id > 0) {
      await mutationUpdate.mutateAsync(mapToDto(row));
    } else {
      const { id, ...createDto } = mapToDto(row);
      const result = await mutationCreate.mutateAsync(createDto);

     
      setRows(prev => {
        const updated = [...prev];
        updated[index] = sanitizeSubcomponent(result); 
        return updated;
      });
    }

    setError(null); 
  } catch (error) {
    console.error("Error saving subcomponent:", error);
    setError("فشل حفظ البيانات. يرجى المحاولة مرة أخرى");
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
                    onClick={() => handleBlur(row, index)}
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
                      onBlur={() => handleBlur(row, index)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      value={row.material}
                      onChange={(e) => handleChange(index, "material", e.target.value)}
                      onBlur={() => handleBlur(row, index)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      type="number"
                      value={row.count ?? 0}
                      onChange={(e) => handleChange(index, "count", e.target.value)}
                      onBlur={() => handleBlur(row, index)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>{row.totalQuantity ?? 0}</TableCell>

                  <TableCell>
                    <TextField
                      value={row.notes ?? ""}
                      onChange={(e) => handleChange(index, "notes", e.target.value)}
                      onBlur={() => handleBlur(row, index)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      value={row.veneerInner ?? ""}
                      onChange={(e) => handleChange(index, "veneerInner", e.target.value)}
                      onBlur={() => handleBlur(row, index)}
                      variant="standard"
                      fullWidth
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      value={row.veneerOuter ?? ""}
                      onChange={(e) => handleChange(index, "veneerOuter", e.target.value)}
                      onBlur={() =>handleBlur(row, index)}
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
                        onBlur={() => handleBlur(row, index)}
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
                        onBlur={() =>handleBlur(row, index)}
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
                        onBlur={() => handleBlur(row, index)}
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
