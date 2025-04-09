export default {
  ldap: {
    dn: 'cn=users,cn=accounts,dc=cloud,dc=seattlecommunitynetwork,dc=org',
    url: process.env.LDAP_URI || 'ldap://ldap:389',
  },
  mongodbURI: process.env.MONGODB_URI || 'mongodb://mongodb:27017/api-data',
  secureCookie: process.env.SAVE_COOKIE === 'true',
};
