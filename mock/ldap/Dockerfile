FROM debian:bullseye-slim

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install OpenLDAP and required packages
RUN apt-get update && apt-get install -y \
    slapd \
    ldap-utils \
    debconf \
    procps \
    net-tools \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy entrypoint script and users
COPY entrypoint.sh /entrypoint.sh
# COPY users.ldif /tmp/users.ldif
RUN chmod +x /entrypoint.sh

# Expose LDAP ports
EXPOSE 389 636

ENTRYPOINT ["/entrypoint.sh"]