#!/bin/bash
set -e

echo "[$(date)] Starting LDAP setup"

# Check required environment variables
for var in LDAP_DOMAIN LDAP_ADMIN_PASSWORD LDAP_CONFIG_PASSWORD LDAP_ORGANISATION; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var environment variable is not set"
    exit 1
  fi
done

# Check if slapd is running and kill it
echo "Checking for existing slapd processes"
if ps aux | grep -v grep | grep slapd > /dev/null; then
    echo "Found running slapd process, stopping it"
    ps aux | grep slapd | grep -v grep | awk '{print $2}' | xargs -r kill
    sleep 5
    
    # Force kill if still running
    if ps aux | grep -v grep | grep slapd > /dev/null; then
        echo "Force killing slapd"
        ps aux | grep slapd | grep -v grep | awk '{print $2}' | xargs -r kill -9
        sleep 2
    fi
fi

# Check if ports are already in use
if netstat -tln | grep -q ':389 '; then
    echo "ERROR: Port 389 is already in use by another process"
    netstat -tln | grep ':389 '
    echo "Attempting to find and kill the process"
    
    # Try to find and kill the process using port 389
    pid=$(netstat -tln | grep ':389 ' | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$pid" ]; then
        echo "Killing process $pid"
        kill -9 $pid || true
    fi
    
    sleep 2
fi

# Clean up existing directories
echo "Cleaning up existing LDAP data"
rm -rf /var/lib/ldap/* /etc/ldap/slapd.d/*

# Preconfigure slapd answers for noninteractive setup
echo "Preconfiguring slapd"
debconf-set-selections <<EOF
slapd slapd/password1 password ${LDAP_ADMIN_PASSWORD}
slapd slapd/password2 password ${LDAP_ADMIN_PASSWORD}
slapd slapd/domain string ${LDAP_DOMAIN}
slapd shared/organization string ${LDAP_ORGANISATION}
slapd slapd/backend select MDB
slapd slapd/purge_database boolean true
slapd slapd/move_old_database boolean true
slapd slapd/allow_ldap_v2 boolean false
slapd slapd/no_configuration boolean false
EOF

# Reconfigure slapd
echo "Reconfiguring slapd package"
DEBIAN_FRONTEND=noninteractive dpkg-reconfigure slapd

# Make sure permissions are correct
chown -R openldap:openldap /var/lib/ldap /etc/ldap/slapd.d

# Convert domain to LDAP base DN
LDAP_BASE_DN=$(echo "$LDAP_DOMAIN" | sed 's/\./,dc=/g' | sed 's/^/dc=/')
echo "LDAP_BASE_DN: $LDAP_BASE_DN"

# Start slapd temporarily for configuration
echo "Starting slapd for configuration"
slapd -h "ldapi:///" -u openldap -g openldap
sleep 3

echo $LDAP_BASE_DN

# Add people and groups OUs if they don't exist yet
echo "Creating people and groups OUs"
cat > /tmp/structure.ldif << EOF
dn: ou=people,${LDAP_BASE_DN}
objectClass: organizationalUnit
ou: people

dn: ou=groups,${LDAP_BASE_DN}
objectClass: organizationalUnit
ou: groups
EOF

cat > /tmp/users.ldif << EOF
# Define test_user1
dn: uid=test_user1,ou=people,${LDAP_BASE_DN}
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: inetOrgPerson
cn: Test User1
sn: User1
uid: test_user1
userPassword: test123
mail: test_user1@seattlecommunitynetwork.org.org
givenName: Test

# Define test_user2
dn: uid=test_user2,ou=people,${LDAP_BASE_DN}
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: inetOrgPerson
cn: Test User2
sn: User2
uid: test_user2
userPassword: test123
mail: test_user2@seattlecommunitynetwork.org.org
givenName: Test
EOF

sleep 5

ldapadd -x -H ldapi:/// -D "cn=admin,${LDAP_BASE_DN}" -w "${LDAP_ADMIN_PASSWORD}" -f /tmp/structure.ldif || echo "OUs already exist, skipping"

# Import users if they exist
if [ -f /tmp/users.ldif ]; then
    echo "Importing users"
    ldapadd -x -H ldapi:/// -D "cn=admin,${LDAP_BASE_DN}" -w "${LDAP_ADMIN_PASSWORD}" -f /tmp/users.ldif || echo "Users may already exist, skipping"
fi

# Stop slapd
echo "Stopping temporary slapd instance"
ps aux | grep slapd | grep -v grep | awk '{print $2}' | xargs -r kill
sleep 3

# Final check to ensure no slapd is running
if ps aux | grep -v grep | grep slapd > /dev/null; then
    echo "WARNING: slapd is still running, force killing"
    ps aux | grep slapd | grep -v grep | awk '{print $2}' | xargs -r kill -9
    sleep 2
fi

echo "LDAP setup complete"

# Start slapd in foreground mode
echo "Starting slapd in foreground mode with debugging"
exec slapd -d 256 -h "ldap:/// ldapi:///" -u openldap -g openldap -F /etc/ldap/slapd.d