import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: 'names', label: 'Nombres', minWidth: 100 },
    { id: 'cellPhone', label: 'Celular', minWidth: 50 },
    { id: 'address', label: 'Dirección', minWidth: 100 },
];

export default function StickyHeadTable() {
    const [page, setPage] = React.useState(0);
    const [open, setOpen] = React.useState(false)
    const [rowsPerPage] = React.useState(10);
    const [rows, setRows] = React.useState<Array<any>>([]);

    const formik = useFormik({
        initialValues: {
          firstName: '',
          lastName: '',
          age: '',
          cellPhone: '',
          address: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Requiredo'),
            lastName: Yup.string().required('Requiredo'),
            cellPhone: Yup.number().test('len', 'Deben ser 10 números', (val: any) => val && val.toString().length === 10),
            age: Yup.number().test('len', 'Deben ser entre 1 a 3 números', (val: any) => val && val.toString().length <= 3),
            address: Yup.string().required('Requiredo'),
        }),
        onSubmit: values => addRow(values),
      });

    React.useEffect(() => {
        if (!open) getRows();
    }, [open]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const getRows = () => {
        const q = query(collection(db,'guest'),orderBy('createdAt','desc'));
        onSnapshot(q, (snap) => {
            const data: any = snap.docs.map((doc) => doc.data());
            setRows(data.map((d: any) => ({ names: d.firstName + ' ' + d.lastName, ...d })));
        });
    }

    const handleOpen = () => setOpen(!open);

    const addRow = ({ firstName, lastName, cellPhone, address, age}: any) => {
        addDoc(collection(db,'guest'), {
            firstName,
            lastName,
            cellPhone,
            address,
            age,
            createdAt: serverTimestamp()
        });
        handleOpen();
    }

    return (
        <Box sx={{ my: 4, mx: 4 }}>
            <Dialog open={open} keepMounted maxWidth="md" fullWidth>
                <DialogTitle>Agregar invitado</DialogTitle>
                <DialogContent>
                    <Box sx={{ my: 2}}>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Nombre"
                                        fullWidth
                                        name="firstName"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.firstName}
                                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                        helperText={formik.touched.firstName && Boolean(formik.errors.firstName) && formik.errors.firstName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Apellido"
                                        fullWidth
                                        name="lastName"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.lastName}
                                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                        helperText={formik.touched.lastName && Boolean(formik.errors.lastName) && formik.errors.lastName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Celular"
                                        fullWidth
                                        name="cellPhone"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.cellPhone}
                                        error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                                        helperText={formik.touched.cellPhone && Boolean(formik.errors.cellPhone) && formik.errors.cellPhone}
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                        type="number"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Edad"
                                        fullWidth
                                        name="age"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.age}
                                        error={formik.touched.age && Boolean(formik.errors.age)}
                                        helperText={formik.touched.age && Boolean(formik.errors.age) && formik.errors.age}
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                        type="number"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Dirección"
                                        fullWidth
                                        name="address"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.address}
                                        error={formik.touched.address && Boolean(formik.errors.address)}
                                        helperText={formik.touched.address && Boolean(formik.errors.address) && formik.errors.address}
                                    />
                                </Grid>
                            </Grid>
                        </form>
                    </Box>
                        
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleOpen} size="small">Cancelar</Button>
                    <Button
                        onClick={() => formik.handleSubmit()}
                        variant="contained"
                        size="small"
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
            <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" sx={{ mt: 3 }}>Invitados</Typography>
            </Box>
            <Box display="flex" sx={{ mb: 3 }}>                    
                <Button variant="contained" size="small" onClick={getRows}>
                    Refrescar
                </Button>
                <Button variant="contained" size="small" onClick={handleOpen} color="success" sx={{ mx: 2 }}>
                    Agregar
                </Button>
            </Box>
            {/*<Box display="flex" sx={{ mb: 3, mt: 2 }}>                    
                <TextField
                    label="Buscar"
                    fullWidth
                    variant="standard"
                    InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                    }}
                    onKeyUp={handleKeyPress}
                />
                </Box>*/}

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                            {columns.map((column) => {
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {row[column.id]}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[]}
                />
            </Paper>
        </Box>
    );
}
