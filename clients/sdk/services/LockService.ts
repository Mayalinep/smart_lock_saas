/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LockEventsResponse } from '../models/LockEventsResponse';
import type { LockStatus } from '../models/LockStatus';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LockService {

    /**
     * Statut de la serrure
     * Authentification requise. Envoyer le cookie d'authentification: `Cookie: token=...`
     * @returns LockStatus OK
     * @throws ApiError
     */
    public static getLockStatus({
        propertyId,
    }: {
        propertyId: string,
    }): CancelablePromise<LockStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lock/status/{propertyId}',
            path: {
                'propertyId': propertyId,
            },
            errors: {
                401: `Non authentifié (cookie manquant ou invalide)`,
                403: `Accès non autorisé à cette propriété`,
            },
        });
    }

    /**
     * Historique des événements (cursor-based)
     * Authentification requise. Envoyer le cookie d'authentification: `Cookie: token=...`
     * @returns LockEventsResponse OK
     * @throws ApiError
     */
    public static getLockEvents({
        propertyId,
        type,
        limit,
        cursor,
    }: {
        propertyId: string,
        type?: string,
        limit?: number,
        cursor?: string,
    }): CancelablePromise<LockEventsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lock/events/{propertyId}',
            path: {
                'propertyId': propertyId,
            },
            query: {
                'type': type,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                401: `Non authentifié (cookie manquant ou invalide)`,
                403: `Accès non autorisé à cette propriété`,
            },
        });
    }

}
