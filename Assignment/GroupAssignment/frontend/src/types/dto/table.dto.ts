export enum TableStatus {
    FREE = 'FREE',
    OCCUPIED = 'OCCUPIED',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface AreaTableDTO {
    areaTableId?: string;
    areaId: string;
    areaName?: string;
    tag: string;
    capacity: number;
    status?: TableStatus;
    qr?: string;
    createdAt?: string;
    updatedAt?: string;
}
