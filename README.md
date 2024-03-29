# ccn-coverage-api
An API to receive POST data from Android phones and providing GET data for the measurement visualization.
## TODO
-  Add bypass to the API keys when running locally
-  Better compatiblity with local development environment e.g. Database connection
-  Lacks of documentation

## Optional
-  Make Typescript more strict
-  Unify Mongoose/Mongodb library with the front-end
## Installation
-  Generate API keys and put it in `keys/api-pub` and `keys/api-secret`, used it for signing/validating the keys from Android's measurement app

### CAUTION: EXTREMELY OUTDATED
## Usage
### POST `api/register`
Verify and register the user to the server and distribute to the EPCs
```
{
  "publicKey": string,  // ed25519, pem, pkcs8
  "message": Buffer,    // binary array of registration message
  "sigMessage": string, // signature of "message", hex
  "attestation": string // hardware-backed attestation generated from Android (TODO)
}
```
The registration message contains a byte arrays that can be serialized to:
```
{
  publicKey: string   // ed25519, pem, pkcs8
  identity: string    // hex
  attestation: string
}
```
Where identity is a hash of a concatenation of ICCID and phone number in SHA256

### POST `api/upload`
Verify that the user is connected to an EPC and upload measuremenet to the server

## For the /data endpoint, the api will be POST and accept:
The body R contains:
- Measurement R (in json, etc.)

The header contains:
- Hash of Public Key P_K. SHA 256 bits. Send it with 'identity' as a header key
- Signature Sigma_R (Again, just sign R with the secret), Send it with 'signature' as a header key. 2048 bits
### CAUTION: VERY OUTDATED
### POST `api/data`
Upload a single data point

Request in JSON
```
{
  "latitude": 47.551642902162804,
  "longitude": -122.28339617848889,
  "timestamp": "2021-03-08T12:55:26.350403+00:00",
  "upload_speed": 980392.1568627451,
  "download_speed": 4901960.784313725,
  "data_since_last_report": 4732548294.36119,
  "ping": 971.32,
  "cell_id": "Filipino Community Center",
  "device_id": "00000000-910b-e6c1-0000-000046c1fa63"
}
```
Batch insert can be done with JSON arrays
```
[
    {
        "latitude": 47.684392744724754,
        "longitude": -122.28869082503788,
        "timestamp": "2021-06-23T18:00:36.151Z",
        "upload_speed": 9.38326677980023,
        "download_speed": 8.26040129216674,
        "data_since_last_report": 225.72327895682997,
        "ping": 83.2573210844135,
        "cell_id": "Filipino Community Center",
        "device_id": "8fb07821ab16c79"
    },
    {
        "latitude": 47.62618423125857,
        "longitude": -122.31638714990046,
        "timestamp": "2021-04-19T15:10:05.941Z",
        "upload_speed": 2.37038746950478,
        "download_speed": 4.502819585012093,
        "data_since_last_report": 436.60773345367153,
        "ping": 58.65307341108881,
        "cell_id": "Hillside Church Kent",
        "device_id": "74f0d1a9251674f"
    },
    {
        "latitude": 47.6878209608481,
        "longitude": -122.37500681298992,
        "timestamp": "2021-04-04T19:02:26.331Z",
        "upload_speed": 2.760989642973184,
        "download_speed": 7.0442384052984615,
        "data_since_last_report": 942.9818408612952,
        "ping": 125.29498199311696,
        "cell_id": "Skyway Library",
        "device_id": "c7cee7432ea2c5f"
    }
]
```
### GET `api/data`
Filter the response by cell id
```
{
  "cell_id": "Filipino Community Center"
}
```
Output will always be sorted by timestamp
```
[
    {
        "_id": "614157263c28e1a473ede843",
        "latitude": 47.681932654395915,
        "longitude": -122.31829217664796,
        "timestamp": "2021-01-25T18:43:54.370Z",
        "upload_speed": 7.289173724717997,
        "download_speed": 5.234371563131994,
        "data_since_last_report": 735.2343217314725,
        "ping": 137.41470114174285,
        "cell_id": "Filipino Community Center",
        "device_id": "1e683a49d71ffd0"
    },
    {
        "_id": "614157263c28e1a473ede8ab",
        "latitude": 47.609018101754664,
        "longitude": -122.24328983549692,
        "timestamp": "2021-01-30T11:53:27.886Z",
        "upload_speed": 9.968546872273246,
        "download_speed": 9.086963230811842,
        "data_since_last_report": 129.52103778989633,
        "ping": 93.1574318200596,
        "cell_id": "Filipino Community Center",
        "device_id": "6a1e5f76cb63ff1"
    }
]
```
Sample out
```
{
    "timestamp_from": "2021-03-25T06:56:36.806Z",
    "timestamp_to": "2021-03-30T03:05:12.867Z"
}
```
Sample output
```
[
    {
        "_id": "614157263c28e1a473ede81b",
        "latitude": 47.709047326517286,
        "longitude": -122.36534582036059,
        "timestamp": "2021-03-25T06:56:36.806Z",
        "upload_speed": 5.753763485221568,
        "download_speed": 1.1635339066855188,
        "data_since_last_report": 869.5289269594277,
        "ping": 3.4899287499857223,
        "cell_id": "David-TCN",
        "device_id": "fa3a6983c38747e"
    },
    {
        "_id": "614157263c28e1a473ede8c1",
        "latitude": 47.63027523397995,
        "longitude": -122.26040422414964,
        "timestamp": "2021-03-27T18:35:21.620Z",
        "upload_speed": 6.0532965435700925,
        "download_speed": 2.536257071269179,
        "data_since_last_report": 502.1027748350426,
        "ping": 145.3383285501783,
        "cell_id": "SURGEtacoma",
        "device_id": "078508cd3e87a25"
    }
]
```
### GET `api/gen?num=<number of data points>`
Generate an array of randomized data picked from sites.json. The default `num` is `100`

Outputs of `/api/gen?num=5`
```
[
    {
        "latitude": 47.562590146039064,
        "longitude": -122.27121329254902,
        "timestamp": "2021-01-06T03:59:11.693Z",
        "upload_speed": 8.565901983191857,
        "download_speed": 4.056948098672207,
        "data_since_last_report": 844.2185393287868,
        "ping": 6.6858236095742996,
        "cell_id": "SURGEtacoma",
        "device_id": "e3a0756b4625cc0"
    },
    {
        "latitude": 47.56359056343538,
        "longitude": -122.29348036439217,
        "timestamp": "2021-01-08T09:22:52.246Z",
        "upload_speed": 8.652797292610275,
        "download_speed": 7.339071555037695,
        "data_since_last_report": 711.5498559064443,
        "ping": 88.08310517332608,
        "cell_id": "Oareao OCC Masjid",
        "device_id": "43b5762567a1ede"
    },
    {
        "latitude": 47.52153218349532,
        "longitude": -122.40630571577736,
        "timestamp": "2021-03-10T14:04:21.420Z",
        "upload_speed": 2.4371830347386436,
        "download_speed": 7.406915293378853,
        "data_since_last_report": 90.59233441241776,
        "ping": 94.21585530581041,
        "cell_id": "Hillside Church Kent",
        "device_id": "41e70d89e96dd2c"
    },
    {
        "latitude": 47.50573568571766,
        "longitude": -122.24128797767641,
        "timestamp": "2021-06-02T13:04:08.918Z",
        "upload_speed": 9.343958928370702,
        "download_speed": 8.797355710234472,
        "data_since_last_report": 968.1177110546795,
        "ping": 80.49796269600179,
        "cell_id": "David-TCN",
        "device_id": "9b25f68cb49ffd4"
    },
    {
        "latitude": 47.61852297543509,
        "longitude": -122.2565331465355,
        "timestamp": "2021-02-22T11:20:33.429Z",
        "upload_speed": 3.9712917680310644,
        "download_speed": 4.43083329601814,
        "data_since_last_report": 370.2994929850665,
        "ping": 131.9334027688888,
        "cell_id": "University Heights Center",
        "device_id": "c2dffea397893f9"
    }
]
```
## TODO
- Add more filtering to the data (upload_speed_min/max, latitude min/max, etc)
- Verify the timestamp format and other data sanitization
## Planned Features
- Filter the database based on what we need in the final visualization (e.g. get average data on a smaller square)

