#!/bin/bash
set -e

echo "Waiting for MongoDB to be ready..."
until mongosh --eval "print(\"waited for connection\")"
do
  sleep 1
done

echo "Restoring database from dump..."
mongorestore /docker-entrypoint-initdb.d/dump/

echo "MongoDB successfully initialized with test data!"
