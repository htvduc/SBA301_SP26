export enum EntityStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

export interface AreaDTO {
    areaId?: string;
    branchId: string;
    branchName?: string;
    name: string;
    status?: EntityStatus;
    createdAt?: string;
    updatedAt?: string;
    tableCount?: number;
}
