import CONFIG from '../config';
import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Admin, IAdmin, IExpressUser } from '../models/admins';
import date from 'date-and-time';
import connectEnsureLogin from 'connect-ensure-login';

const CustomStrategy = require('passport-custom').Strategy;
import { authenticate } from 'ldap-authentication';
import logger from '../logger';

passport.use(
  'ldap',
  new CustomStrategy(async function (req: Request, done: any) {
    try {
      if (!req.body.username || !req.body.password) {
        throw new Error('username and password are not provided');
      }
      // construct the parameter to pass in authenticate() function
      let ldapBaseDn = CONFIG.ldap.dn;
      let options = {
        ldapOpts: {
          url: CONFIG.ldap.url,
        },
        // note in this example it only use the user to directly
        // bind to the LDAP server. You can also use an admin
        // here. See the document of ldap-authentication.
        userDn: `uid=${req.body.username},${ldapBaseDn}`,
        userPassword: req.body.password,
        userSearchBase: ldapBaseDn,
        usernameAttribute: 'uid',
        username: req.body.username,
      };
      // ldap authenticate the user
      let user = await authenticate(options);
      // success
      done(null, user);
    } catch (error) {
      // authentication failure
      done(error, null);
    }
  }),
);

// passport requires this
passport.serializeUser(function (user, done: (a: any, b: any) => void) {
  done(null, user);
});
// passport requires this
passport.deserializeUser(function (user, done: (a: any, b: any) => void) {
  done(null, user);
});

declare global {
  namespace Express {
    interface User {
      uid: string;
      _id?: number;
    }
  }
}

const router = express.Router();

export { router as ldapRouter };

router.get('/api/success', (req: Request, res: Response) => {
  res.status(200).send('success');
  return;
});

router.get('/api/failure', (req: Request, res: Response) => {
  res.status(500).send('Unauthorized, please login');
  return;
});

router.post(
  '/secure/login',
  passport.authenticate('ldap', {
    failureRedirect: '/api/failure',
    successRedirect: '/api/success',
  }),
  (req: Request, res: Response) => {
    res.status(200).send('success');
  },
);

router.get('/api/logout', (req: Request, res: Response) => {
  req.logout(err => {
    if (err) {
      logger.error(err);
      res.status(500).send('logout failed');
      return;
    }
  });
  res.status(200).send('logged out');
});
