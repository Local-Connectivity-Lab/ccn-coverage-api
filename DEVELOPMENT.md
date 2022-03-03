# For development
1. Create a directory ```/keys```. In ```/keys``` run ```openssl ecparam -name secp256k1 -genkey -out api-secret``` and ```openssl ec -in api-secret -pubout -out api-pub``` to create the API key pair
2. Due to browser policy for CORS and protecting session cookie middleware, we need to set up proxy to make both servers accessible from the same host.
3. Adjust ```config.ts```, ```index.ts/mongodbURI```, and ```index.ts/listeningPort``` if nessessary
## Nginx
Given ccn-coverage-viz runs on port 3000 and ccn-coverage-api runs on port 3002
```
server_name localhost;
location /api {
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
                proxy_pass       http://localhost:3000;
}
        location /secure {
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
        proxy_pass       http://localhost:3000;
}
        location / {
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
        proxy_pass       http://localhost:3002;
}
 ```
