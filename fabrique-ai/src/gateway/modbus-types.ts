import { ModbusRTU } from 'modbus-serial';

export enum ModbusRegisterType {
  COIL = 'coil',
  DISCRETE_INPUT = 'discreteInput',
  HOLDING_REGISTER = 'holdingRegister',
  INPUT_REGISTER = 'inputRegister'
}

export enum ModbusFunctionCode {
  // Read functions
  READ_COIL = 0x01,
  READ_DISCRETE_INPUT = 0x02,
  READ_HOLDING_REGISTERS = 0x03,
  READ_INPUT_REGISTERS = 0x04,
  
  // Write functions
  WRITE_SINGLE_COIL = 0x05,
  WRITE_SINGLE_REGISTER = 0x06,
  WRITE_MULTIPLE_COILS = 0x0F,
  WRITE_MULTIPLE_REGISTERS = 0x10
}

export interface ModbusConfig {
  // Common configuration
  id: string;
  name: string;
  type: 'modbus';
  transport: 'tcp' | 'rtu' | 'ascii' | 'tcp-rtu-buffered';
  
  // Connection parameters
  host?: string;           // TCP: Hostname or IP address
  port?: number;           // TCP: Port number (default: 502)
  baudRate?: number;       // RTU: Baud rate (default: 9600)
  dataBits?: number;       // RTU: Data bits (5, 6, 7, or 8, default: 8)
  stopBits?: number;       // RTU: Stop bits (1 or 2, default: 1)
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space'; // RTU: Parity (default: 'none')
  rtscts?: boolean;        // RTU: Enable RTS/CTS flow control
  xon?: boolean;           // RTU: Enable XON/XOFF flow control
  xoff?: boolean;          // RTU: Enable XON/XOFF flow control
  rtsMode?: 'none' | 'rs485' | 'modem' | 'rs232'; // RTU: RTS mode
  
  // Connection pool settings
  poolSize?: number;       // Maximum number of connections in the pool (default: 5)
  timeout?: number;        // Operation timeout in milliseconds (default: 5000)
  retryInterval?: number;  // Delay between retry attempts in milliseconds (default: 5000)
  maxRetries?: number;     // Maximum number of retry attempts (default: 3)
  
  // Modbus specific
  unitId?: number;         // Modbus unit/slave ID (default: 1)
  
  // Advanced options
  debug?: boolean;         // Enable debug logging
  
  // Required flag - if true, failure to initialize will throw an error
  required?: boolean;
}

export interface ModbusDataPointConfig {
  // Register configuration
  registerType: ModbusRegisterType;
  functionCode: ModbusFunctionCode;
  
  // Data type and formatting
  dataType: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float' | 'double' | 'boolean' | 'string';
  byteOrder?: 'ABCD' | 'BADC' | 'CDAB' | 'DCBA'; // For multi-register values
  
  // Addressing
  address: number;         // Register/coil address
  length?: number;         // Number of registers/coils (for arrays/strings)
  
  // Scaling and transformation
  scale?: number;          // Scale factor (value = rawValue * scale + offset)
  offset?: number;         // Offset value
  
  // Unit ID override (if different from connection config)
  unitId?: number;
  
  // Read/Write permissions
  readOnly?: boolean;
}

export interface ModbusDataPointValue {
  id: string;
  name: string;
  value: any;
  timestamp: Date;
  quality: 'good' | 'bad' | 'uncertain';
  source: string;
  protocol: 'modbus';
  rawValue: any;
  modbus: {
    address: number;
    registerType: ModbusRegisterType;
    functionCode: ModbusFunctionCode;
    dataType: string;
    unitId: number;
  };
}

export interface ModbusConnectionOptions extends ModbusRTU.TcpPortOptions, ModbusRTU.RtuPortOptions {
  // Extended options for our implementation
  poolSize?: number;
  timeout?: number;
  retryInterval?: number;
  maxRetries?: number;
  debug?: boolean;
}
