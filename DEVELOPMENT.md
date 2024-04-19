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
### Troubleshooting Nginx Error 502 on Website

If you encounter a 502 error, it's likely due to `ccn-coverage-api` and `ccn-coverage-vis` not running. You can check if the servers are running by executing `ps aux | grep node` inside the respective directories. If the server is down, this command will likely only output the grep command.

If you encounter issues with `npm start` in the API, such as the build failing with error messages like `"[ERROR] 19:28:10 Error: models/signal.js: Emit skipped"`, it might be due to redundant JavaScript and TypeScript duplicate files within `ccn-coverage-api`. These duplicates can cause TypeScript to encounter type errors or inconsistencies in the JavaScript files, resulting in compilation errors during the build process.

To resolve this issue, navigate to `ccn-coverage-api/tsconfig.json` and take a look:

```bash
/* JavaScript Support */
"allowJs": true, /* Allow JavaScript files to be a part of your program. Use the `checkJs` option to get errors from these files. */
// "checkJs": true, /* Enable error reporting in type-checked JavaScript files. */
```

We suggest either removing the redundant JavaScript files before compiling or setting the `allowJs` and `checkJs` options above to `false` to prevent build issues from occurring in the future.

Once fixed, you can run `npm start &` to run the API and visualization servers in the background, allowing you to exit the servers safely.
