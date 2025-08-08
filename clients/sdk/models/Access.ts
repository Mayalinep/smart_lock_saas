/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Access = {
    id?: string;
    propertyId?: string;
    userId?: string;
    accessType?: 'TEMPORARY' | 'PERMANENT';
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    /**
     * Masqué hors création
     */
    code?: string;
};

