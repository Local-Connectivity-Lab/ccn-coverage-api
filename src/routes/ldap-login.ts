import express, { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import LdapStrategy from 'passport-ldapauth'
import { Admin, IAdmin, IExpressUser } from '../../models/admins'
import date from 'date-and-time';

const ldapURI = 'ldap://ldap.seattlecommunitynetwork.org'
const dn = 'cn=users,cn=accounts,dc=seattlecommunitynetwork,dc=org'
const tokenMinutes = 30;

declare global {
  namespace Express {
    interface User {
      uid: string;
      _id?: number;
    }
  }
}

var getLDAPConfiguration = function (req: any, callback: Function) {
  process.nextTick(function () {
    var opts = {
      server: {
        url: ldapURI,
        bindDn: `uid=${req.body.username},${dn}`,
        bindCredentials: `${req.body.password}`,
        searchBase: dn,
        searchFilter: `uid=${req.body.username}`,
        reconnect: true
      }
    };
    callback(null, opts);
  });
};

passport.use(new LdapStrategy(getLDAPConfiguration,
  function (user: any, done: any) {
    console.log("LDAP user ", user.displayName, "is logged in.")
    return done(null, user);
  }))

const router = express.Router();

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.body.uid || !req.body.token) {
    res.status(400).json({ success: false, message: "bad request" })
  }
  Admin.findOne({ uid: req.body.username, token: req.body.token }).exec().then(user => {
    if (!user) {
      res.status(401).json({ success: false, message: "not logged in" })
    }
    else if (user.exp < new Date()) {
      res.status(401).json({ success: false, message: "session expired" })
    } else {
      res.status(200).json({ success: true, message: "logged in" })
    }
  })
}

passport.serializeUser(function (user, done) {
  done(null, user.uid)
})

passport.deserializeUser(function (id, done) {
  Admin.findOne({ uid: id }).exec().then(user => {
    if (!user) {
      done(new Error(`Cannot find user with uid=${id}`))
    } else {
      done(null, user)
    }
  })
})

// Generate a new session token
function newToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

var ldapLogin = function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('ldapauth', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      res.status(401).json({ success: false, message: 'authentication failed' })
    } else {
      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }
        const token = newToken(); 
        const exp = date.addMinutes(new Date(), tokenMinutes);
        Admin.findOneAndUpdate({uid: user.uid}, { token: token, exp: exp }, {upsert: true, new: true}).exec().then(()=> {
          return res.json({ success: true, message: 'authentication succeeded', token: token, exp: exp });
        })
      });
    }
  })(req, res, next)
}

export { router as ldapRouter }

router.get("/secure/user", ensureAuthenticated);


router.post('/secure/login', ldapLogin);
