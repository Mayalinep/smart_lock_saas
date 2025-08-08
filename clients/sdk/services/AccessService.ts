/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAccessRequest } from '../models/CreateAccessRequest';
import type { PagedAccessResponse } from '../models/PagedAccessResponse';
import type { ValidateCodeRequest } from '../models/ValidateCodeRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AccessService {

    /**
     * Valider un code d'accès
     * @returns any Valide
     * @throws ApiError
     */
    public static postAccessValidate({
        requestBody,
    }: {
        requestBody: ValidateCodeRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/access/validate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Non valide (NOT_STARTED, EXPIRED, CODE_INVALID)`,
            },
        });
    }

    /**
     * Liste des accès d'une propriété (cursor-based)
     * Authentification requise. Envoyer le cookie d'authentification: `Cookie: token=...`
     * @returns PagedAccessResponse OK
     * @throws ApiError
     */
    public static getAccessProperty({
        propertyId,
        limit,
        cursor,
    }: {
        propertyId: string,
        limit?: number,
        cursor?: string,
    }): CancelablePromise<PagedAccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/access/property/{propertyId}',
            path: {
                'propertyId': propertyId,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                401: `Non authentifié (cookie manquant ou invalide)`,
                403: `Accès non autorisé à cette propriété`,
            },
        });
    }

    /**
     * Accès de l'utilisateur connecté (cursor-based)
     * Authentification requise. Envoyer le cookie d'authentification: `Cookie: token=...`
     * @returns PagedAccessResponse OK
     * @throws ApiError
     */
    public static getAccessMyAccesses({
        limit,
        cursor,
    }: {
        limit?: number,
        cursor?: string,
    }): CancelablePromise<PagedAccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/access/my-accesses',
            query: {
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                401: `Non authentifié (cookie manquant ou invalide)`,
            },
        });
    }

    /**
     * Créer un accès
     * @returns any Créé
     * @throws ApiError
     */
    public static postAccess({
        requestBody,
    }: {
        requestBody: CreateAccessRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/access',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
