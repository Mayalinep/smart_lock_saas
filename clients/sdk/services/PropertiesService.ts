/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePropertyRequest } from '../models/CreatePropertyRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PropertiesService {

    /**
     * Créer une propriété
     * @returns any Créée
     * @throws ApiError
     */
    public static postProperties({
        requestBody,
    }: {
        requestBody: CreatePropertyRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/properties',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
