import CONFIG from '../config';
import express, { Request, Response } from 'express';
import passport from 'passport';

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

router.post('/secure/login', (req, res, next) => {
  passport.authenticate('ldap', (error: any, user: any, info: any) => {
    if (error || !user) {
      logger.error(
        `LDAP authentication error: ${error?.message || 'No user found'}`,
      );
      return res.status(401).json({ error: 'Authentication failed' });
    }

    req.login(user, loginErr => {
      if (loginErr) {
        return res.status(500).json({ error: 'Failed to establish session' });
      }

      // Force session save
      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Failed to save session' });
        }

        // Return success with redirect instruction
        return res.status(200).json({
          result: 'success',
        });
      });
    });
  })(req, res, next);
});

router.get('/api/logout', (req: Request, res: Response) => {
  req.logout(err => {
    if (err) {
      logger.error(err);
      res.status(500).send('logout failed');
      return;
    }
    res.status(200).json('logged out');
  });
});
