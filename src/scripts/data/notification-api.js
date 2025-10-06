// src/scripts/data/notification-api.js

import CONFIG from '../config';
import { isUserLoggedIn } from './api';

const ENDPOINTS = {
    // Endpoint ini adalah asumsi. Sesuaikan jika dokumentasi API Anda berbeda
    SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`, 
};

/**
 * Mengirim objek PushSubscription ke server
 * @param {PushSubscription} subscription Objek subscription dari browser
 */
export async function sendSubscriptionToServer(subscription) {
    const token = isUserLoggedIn(); // Ambil token dari local storage
    
    if (!token) {
        throw new Error("Pengguna belum login.");
    }

    const response = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Gagal menyimpan subscription: ${errorBody.message || response.statusText}`);
    }
}