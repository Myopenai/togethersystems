import { DataSource } from 'typeorm';
export declare function connectDatabase(): Promise<DataSource>;
export declare const AppDataSource: DataSource;
