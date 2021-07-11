import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import routes from './routes';
import config from './config/default';
import connect from './db/connect';

const app: Express = express();
const port = config['port'] as number;
const host = config['host'] as string;

/** Logging */
app.use(morgan('dev'));
/** Parse the request */
app.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
app.use(express.json());

/** RULES OF OUR API */
app.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});

/** Server */
const httpServer = http.createServer(app);
httpServer.listen(port, host, () => {
    console.log(`The server is running at http://${host}:${port}`);
    connect();
    routes(app);
});
