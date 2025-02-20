/**
 * Configuration for TAAL's ARC (Authenticated Resource Calls) service.
 * This module sets up and exports an ARC client instance for blockchain data management.
 * 
 * The ARC service provides reliable access to the Bitcoin SV blockchain with features like:
 * - Transaction broadcasting
 * - Merkle proof verification
 * - Callback notifications for transaction confirmations
 */

import { ARC } from "@bsv/sdk"
import dotenv from 'dotenv'
dotenv.config()

// Environment variables for ARC configuration
const { NETWORK, DOMAIN, CALLBACK_TOKEN } = process.env

/**
 * ARC client configuration options
 * @property {string} callbackUrl - Webhook URL where ARC will send transaction notifications
 * @property {string} callbackToken - Authentication token for securing webhook endpoints
 */
const options = {
    callbackUrl: 'https://' + DOMAIN + '/callback',
    callbackToken: CALLBACK_TOKEN,
}

/**
 * Initialize ARC client based on network environment
 * Uses production endpoint for 'main' network, test endpoint otherwise
 */
const Arc = (NETWORK === 'main') 
    ? new ARC('https://arc.taal.com', options) 
    : new ARC('https://arc-test.taal.com', options)

export default Arc  