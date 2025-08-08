/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LockEvent } from './LockEvent';

export type LockEventsResponse = {
    propertyId?: string;
    events?: Array<LockEvent>;
    total?: number;
    filteredBy?: string;
    nextCursor?: string | null;
    hasMore?: boolean;
};

