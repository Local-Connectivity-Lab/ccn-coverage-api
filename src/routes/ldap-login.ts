import express, { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import passport from 'passport'
import LdapStrategy from 'passport-ldapauth'
import { Admin, IAdmin, IExpressUser } from '../../models/admins'

const ldapURI = 'ldaps://ldap.seattlecommunitynetwork.org'
const dn = 'cn=users,cn=accounts,dc=seattlecommunitynetwork,dc=org'

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

const router = express.Router()
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ success: false, message: "not logged in" })
  } else {
    next()
  }
}

passport.serializeUser(function (user, done) {
  done(null, user.uid)
})

passport.deserializeUser(function (id, done) {
  Admin.findOne({ uid: id }).exec()
    .then(user => {
      if (!user) {
        done(new Error(`Cannot find user with uid=${id}`))
      } else {
        done(null, user)
      }
    })
})

var myLogin = function (req: Request, res: Response, next: NextFunction) {
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
        Admin.findOneAndUpdate({uid: user.uid}, user, {upsert: true, new: true}).exec().then(user=> {
          return res.json({ success: true, message: 'authentication succeeded', user: Object.assign({name: user.uid}, user) });
        })
      });
    }
  })(req, res, next)
}

router.get("/secure/user", ensureAuthenticated, function (req, res) {
  res.json({success: true, user:req.user})
})


export { router as ldapRouter }


router.post('/secure/login', myLogin);
