import { FuseService } from "./fuse.service";
import { Router } from "express";

export class FuseController {
  private service: FuseService;
  private router: Router;

  constructor(fuseService: FuseService) {
    this.service = fuseService || new FuseService();
    this.router = Router();
    this.init();
  }

  init() {
    this.router.post("/create-session", (req, res, next) => {
      const { user_id, access_token, is_web_view } = req.body;
      this.service
        .createSession(user_id, access_token, is_web_view)
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((err) => {
          next(err);
        });
    });

    // After the user chooses an institution, the institution id is passed to this endpoint
    // which creates a link token needed by the front end fuse sdk to begin the process of connecting
    // the user.
    this.router.post("/create-link-token", (req, res, next) => {
      const { user_id, institution_id, client_secret } = req.body;
      this.service
        .createLinkToken(user_id, institution_id, client_secret)
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((err) => {
          next(err);
        });
    });

    // Once the user has connected (or reconnected) this will exchange the public token from the front end sdk
    // for an access token and financial connection needed to interact with the Fuse API.
    this.router.post("/exchange-public-token", async (req, res, next) => {
      const { public_token } = req.body;

      this.service
        .exchangePublicToken(public_token)
        .then(async (accessToken) => {
          await this.service.getAccounts(accessToken);
          await this.service.getAccountDetails(accessToken);
          await this.service.getBalances(accessToken);
          await this.service.getOwners(accessToken);
          await this.service.getTransactions(accessToken);
          res.status(200).json({});
        })
        .catch((err) => {
          next(err);
        });
    });

    this.router.post("/webhooks", async (req, res) => {
      const { status } = await this.service.handleWebhook(
        req.headers,
        req.body
      );
      res.status(status);
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
