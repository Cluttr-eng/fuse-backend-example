import { ExchangeFinancialConnectionsPublicTokenResponse } from "fuse-node/api";
import { FuseService } from "./fuse.service";
import {Router} from "express";

export class FuseController {
    private service: FuseService;
    private router: Router;

    constructor(fuseService: FuseService) {
        this.service = fuseService || new FuseService();
        this.router = Router();
        this.init();
    }

    init() {
        // This generates a client secret which the front end fuse sdk uses to open up the list of bank institutions
        this.router.post('/create-session', async (req, res) => {
            const { userId, financialConnectionId } = req.body;
            const { status, response } = await this.service.createSession(userId, financialConnectionId);
            res.status(status).json(response);
        });

        // After the user chooses an institution, the institution id is passed to this endpoint
        // which creates a link token needed by the front end fuse sdk to begin the process of connecting
        // the user.
        this.router.post('/create-link-token', async (req, res) => {
            const { user_id, institution_id, client_secret } = req.body;
            const { status, response } = await this.service.createLinkToken(user_id, institution_id, client_secret);
            res.status(status).json(response);
        });

        // Once the user has connected (or reconnected) this will exchange the public token from the front end sdk
        // for an access token and financial connection needed to interact with the Fuse API.
        this.router.post('/exchange-public-token', async (req, res) => {
            const { public_token } = req.body;
            res.status(200).json(await this.service.exchangePublicToken(public_token));
        });

        this.router.get('/accounts', async (req, res) => {
            const { access_token } = req.body;
            res.status(200).json(await this.service.getAccounts(access_token));
        });

        this.router.get('/account-details', async (req, res) => {
            const { access_token, remote_account_ids } = req.body;
            res.status(200).json(await this.service.getAccountDetails(access_token));
        });

        this.router.get('/balances', async (req, res) => {
            const { access_token, remote_account_ids } = req.body;
            res.status(200).json(await this.service.getBalances(access_token, remote_account_ids));
        });

        this.router.get('/owners', async (req, res) => {
            const { access_token } = req.body;
            res.status(200).json(await this.service.getOwners(access_token));
        });

        this.router.get('/transactions', async (req, res) => {
            const { access_token } = req.body;
            res.status(200).json(await this.service.getTransactions(access_token));
        });

        this.router.post('/webhooks', async (req, res) => {
            const { status } = await this.service.handleWebhook(req.headers, req.body);
            res.status(status);
        });
    }
}
