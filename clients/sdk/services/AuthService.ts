/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Inscription utilisateur
     * @returns any Créé
     * @throws ApiError
     */
    public static postAuthRegister({
        requestBody,
    }: {
        requestBody: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Erreur de validation (ex: mot de passe non conforme)`,
            },
        });
    }

    /**
     * Login (dépose un cookie token)
     * @returns any OK
     * @throws ApiError
     */
    public static postAuthLogin({
        requestBody,
    }: {
        requestBody: {
            email: string;
            password: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Identifiants invalides`,
                429: `Trop de tentatives (rate limit)`,
            },
        });
    }

}
