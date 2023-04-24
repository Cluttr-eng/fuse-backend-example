import {
    Aggregator,
    Configuration,
    CreateLinkTokenRequest,
    CreateSessionRequest,
    ExchangeFinancialConnectionsPublicTokenRequest,
    FuseApi,
    Product,
    WebhookEvent,
    WebhookType
} from 'fuse-node';
import {IncomingHttpHeaders} from 'http';
import * as crypto from 'crypto';
import keys from "./keys";

const configuration = new Configuration({
    basePath: keys.FUSE_BASE_PATH,
    baseOptions: {
        headers: {
            'Fuse-Client-Id': keys.FUSE_CLIENT_ID,
            'Fuse-Api-Key': keys.FUSE_API_KEY,
            'Content-Type': 'application/json',
            'Plaid-Client-Id': keys.PLAID_CLIENT_ID,
            'Plaid-Secret': keys.PLAID_SECRET,
            'Teller-Application-Id': keys.TELLER_APPLICATION_ID,
            'Teller-Certificate': keys.TELLER_CERTIFICATE,
            'Teller-Private-Key': keys.TELLER_PRIVATE_KEY,
            'Teller-Signing-Secret': keys.TELLER_SIGNING_SECRET,
            'Mx-Client-Id': keys.MX_CLIENT_ID,
            'Mx-Api-Key': keys.MX_API_KEY
        }
    }
});

const fuseApi = new FuseApi(configuration);

export class FuseService {

    async createSession(entityId: string, accessToken?: string, isWebView?: boolean) {
        const createSessionRequest: CreateSessionRequest = {
            supported_financial_institution_aggregators: [
                Aggregator.Plaid,
                Aggregator.Mx,
                Aggregator.Teller,
            ],
            products: [
                Product.Balance,
                Product.AccountDetails,
                Product.Ownership,
                Product.Transactions,
            ],
            entity: {
                id: entityId
            },
            ...(accessToken && {
                access_token: accessToken,
            }),
            // True by default.
            // If you are NOT using mobile, set to False.
            // If using mobile, set to true/false depending on if a webview is being used.
            ...(isWebView && {
                is_web_view: isWebView
            })
        };

        const response = await fuseApi.createSession(createSessionRequest);
        console.log(response.data.client_secret);
        return response.data;
    }

    async createLinkToken(
        userId: string,
        institutionId: string,
        sessionClientSecret: string,
    ) {

        const createLinkTokenRequest: CreateLinkTokenRequest = {
            entity: {
                id: userId
            },
            institution_id: institutionId,
            client_name: 'Fuse Example',
            session_client_secret: sessionClientSecret,
            mx: {
                // MX specific configuration. See https://docs.mx.com/api#connect_request_a_url
                config: {
                }
            },
            plaid: {
                // Plaid specific configuration. See https://plaid.com/docs/api/tokens/#linktokencreate
                config: {

                }
            }
        };

        const response = await fuseApi.createLinkToken(createLinkTokenRequest);
        console.log(response.data.link_token);
        return response.data;

    }

    async exchangePublicToken(
        publicToken: string,
    ) {
        const exchangePublicTokenRequest: ExchangeFinancialConnectionsPublicTokenRequest = {
            public_token: publicToken
        };
        const response = await fuseApi.exchangeFinancialConnectionsPublicToken(exchangePublicTokenRequest);
        //Store the access token and financial connection id
        console.log(response.data.access_token);
        console.log(response.data.financial_connection_id);
        return response.data
    }

    async getAccounts(
        accessToken: string
    ) {
        const response = await fuseApi.getFinancialConnectionsAccounts({
            access_token: accessToken
        });
        // For reconnections, the account remote_id will change even if the user is reconnecting to the same institution,
        // as we may use a different aggregator for reconnections.
        // See https://letsfuse.readme.io/docs/duplicate-accounts
        console.log(response.data.accounts);
        console.log(response.data.financial_connection);
        return response.data
    }

    async getAccountDetails(
        accessToken: string
    ) {
        const response = await fuseApi.getFinancialConnectionsAccountDetails({
            access_token: accessToken
        });
        console.log(response.data.account_details);
        console.log(response.data.financial_connection);
        return response.data;
    }

    async getBalances(accessToken: string, remoteAccountIds?: string[]) {
        // A remote account id is the "remote_id" field returned as part of the getFinancialConnectionsAccounts call.
        const response = await fuseApi.getFinancialConnectionsBalances({
            access_token: accessToken,
            ...(remoteAccountIds && remoteAccountIds.length > 0 && {
                options: {
                    remote_account_ids: remoteAccountIds
                }
            })
        });
        console.log(response.data.balances);
        return response.data;
    }

    async getOwners(
        accessToken: string
    ) {
        const response = await fuseApi.getFinancialConnectionsOwners({
            access_token: accessToken
        });
        console.log(response.data.accounts);
        response.data.accounts.forEach(curAccount => {
            console.log(curAccount.owners);
        })
        return response.data;
    }

    async getTransactions(accessToken: string) {

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const response =  await fuseApi.getFinancialConnectionsTransactions({
            access_token: accessToken,
            //YYYY-MM-DD
            start_date: threeMonthsAgo.toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            //Starts at page 1.
            page: 1,
            // Max is 100. Keep incrementing the page until the 'transactions' array is empty.
            records_per_page: 100
        });
        console.log(response.data.total_transactions);
        console.log(response.data.transactions);
        return  response.data;
    }

    async handleWebhook(headers: IncomingHttpHeaders, event: WebhookEvent) {
        const fuseVerificationHeader = headers[
            'fuse-verification'
        ] as string;

        if (!fuseVerificationHeader) {
            return {
                status: 403
            }
        }

        const isValidRequest = this.requestIsFromFuse(
            keys.FUSE_API_KEY,
            event,
            fuseVerificationHeader
        );

        if (!isValidRequest) {
            return {
                status: 403,
            };
        }

        if (event.type === WebhookType.FinancialConnectionSyncData) {
            await this.syncFinancialConnectionData(fuseVerificationHeader, event);
        } else if (
            event.type === WebhookType.FinancialConnectionDisconnected
        ) {
            //handle disconnections.
        }

        return {
            status: 200
        };
    }

    async syncFinancialConnectionData(
        fuseVerificationHeader: string,
        body: any,
    ) {
        return fuseApi.syncFinancialConnectionsData(body, {
            headers: {
                'fuse-verification': fuseVerificationHeader
            }
        })
    }

    requestIsFromFuse(
        apiKey: string,
        webhook: WebhookEvent,
        requestHmac: string
    ): boolean {
        const replacer = (key: any, value: any) =>
            value instanceof Object && !(value instanceof Array)
                ? Object.keys(value)
                    .sort()
                    .reduce((sorted: any, key) => {
                        sorted[key] = value[key];
                        return sorted;
                    }, {})
                : value;

        const requestJson = JSON.stringify(webhook, replacer);
        const dataHmac = this.hmacSignature(apiKey, requestJson);

        return crypto.timingSafeEqual(
            Buffer.from(requestHmac),
            Buffer.from(dataHmac)
        );
    }

    hmacSignature(key: any, msg: any): string {
        return crypto.createHmac('sha256', key).update(msg).digest('base64');
    }
}
