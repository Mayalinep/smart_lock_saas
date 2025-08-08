/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateAccessRequest = {
    propertyId: string;
    userId: string;
    startDate: string;
    endDate: string;
    accessType: 'TEMPORARY' | 'PERMANENT';
    description?: string;
};

