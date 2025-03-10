export default {
  ldap: {
    dn: 'cn=users,cn=accounts,dc=cloud,dc=seattlecommunitynetwork,dc=org',
    url: 'ldap://10.0.1.4',
  },
  mongodbURI: process.env.MONGODB_URI || 'mongodb://mongodb:27017/api-data',
};
