module.exports = {
  ldap: {
    dn: 'cn=users,cn=accounts,dc=seattlecommunitynetwork,dc=org',
    url: 'ldap://ldap.seattlecommunitynetwork.org'
  },
  mongodbURI : 'mongodb://mongo:27017/api-data',  // Compatible with `docker compose`.
  // mongodbURI : 'mongodb://localhost:27017/api-data',  // Compatible with mongo server running on the same host as this `api`.
}