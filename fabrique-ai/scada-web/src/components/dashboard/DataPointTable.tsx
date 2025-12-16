import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  useTheme,
  SvgIcon,
  Typography,
  Paper
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { Device, DataPoint } from '../../types/device';
import { format } from 'date-fns';

interface DataPointTableProps {
  devices: Device[];
  realTimeData: Record<string, { value: any; timestamp: string }>;
}

interface DataPointRow {
  id: string;
  deviceId: string;
  deviceName: string;
  name: string;
  address: string;
  value: any;
  unit?: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'error';
  type: string;
}\n
type Order = 'asc' | 'desc';

const DataPointTable: React.FC<DataPointTableProps> = ({ devices, realTimeData }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DataPointRow>('deviceName');
  const [searchTerm, setSearchTerm] = useState('');

  // Transform devices and data points into table rows
  const rows = useMemo(() => {
    const result: DataPointRow[] = [];
    
    devices.forEach(device => {
      device.dataPoints?.forEach(point => {
        const dataKey = `${device.id}-${point.id}`;
        const realTimeValue = realTimeData[dataKey] || {};
        
        result.push({
          id: point.id,
          deviceId: device.id,
          deviceName: device.name,
          name: point.name,
          address: point.address || 'N/A',
          value: realTimeValue.value !== undefined ? realTimeValue.value : point.value,
          unit: point.unit,
          timestamp: realTimeValue.timestamp || new Date().toISOString(),
          status: getStatus(point.value, point.minValue, point.maxValue),
          type: point.type || 'analog',
        });
      });
    });
    
    return result;
  }, [devices, realTimeData]);
  
  // Determine status based on value and thresholds
  function getStatus(
    value: number, 
    minValue?: number, 
    maxValue?: number
  ): 'normal' | 'warning' | 'error' {
    if (minValue === undefined || maxValue === undefined) return 'normal';
    
    const range = maxValue - minValue;
    const warningThreshold = range * 0.1; // 10% threshold for warning
    
    if (value <= minValue + warningThreshold || value >= maxValue - warningThreshold) {
      return 'warning';
    }
    
    if (value <= minValue || value >= maxValue) {
      return 'error';
    }
    
    return 'normal';
  }
  
  // Handle sorting
  const handleRequestSort = (property: keyof DataPointRow) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle search
  const filteredRows = useMemo(() => {
    return rows.filter(row => 
      Object.values(row).some(
        value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [rows, searchTerm]);
  
  // Sort rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let comparison = 0;
      
      if (a[orderBy] > b[orderBy]) {
        comparison = 1;
      } else if (a[orderBy] < b[orderBy]) {
        comparison = -1;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, order, orderBy]);
  
  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      default:
        return <CheckCircleIcon color="success" fontSize="small" />;
    }
  };
  
  // Format value with unit
  const formatValue = (value: any, unit?: string) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
    if (typeof value === 'number') {
      const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(2);
      return unit ? `${formatted} ${unit}` : formatted;
    }
    return value;
  };
  
  // If no data, show a message
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader 
          title="Data Points" 
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 200,
              color: theme.palette.text.secondary,
            }}
          >
            <SvgIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              <path d="M11 7h2v2h-2zM11 11h2v6h-2z" />
            </SvgIcon>
            <Typography variant="body1">No data points available</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Add devices and data points to see real-time data
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        title="Data Points" 
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: 200 }}
            />
            <Tooltip title="Refresh">
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent sx={{ p: 0 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                {[
                  { id: 'status', label: 'Status', align: 'center', width: 80 },
                  { id: 'deviceName', label: 'Device', align: 'left' },
                  { id: 'name', label: 'Data Point', align: 'left' },
                  { id: 'address', label: 'Address', align: 'left' },
                  { id: 'value', label: 'Value', align: 'right' },
                  { id: 'timestamp', label: 'Last Update', align: 'right' },
                ].map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align as any}
                    sx={{ 
                      fontWeight: 600,
                      width: headCell.width,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id as keyof DataPointRow)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow
                    key={`${row.deviceId}-${row.id}`}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell align="center">
                      {getStatusIcon(row.status)}
                    </TableCell>
                    <TableCell>{row.deviceName}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{
                        fontWeight: 500,
                        color: 
                          row.status === 'error' 
                            ? theme.palette.error.main 
                            : row.status === 'warning'
                            ? theme.palette.warning.dark
                            : 'inherit',
                      }}
                    >
                      {formatValue(row.value, row.unit)}
                    </TableCell>
                    <TableCell align="right">
                      {format(new Date(row.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-toolbar': {
              minHeight: 52,
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default DataPointTable;
