# ccn-coverage-api
An API to receive POST data from Android phones and providing GET data in the measurement visualization.
## Usage
### POST `api/data`
Sample POST request in JSON
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
### GET `api/data`
Sample GET request in JSON
```
{
  {
  "lat_min": 47.551642902162804,
  "lat_max": 48.28339617848889,
  "lng_min": -10.551642902162804,
  "lng_max": -6.28339617848889,
  "timestamp_min": "2021-03-08T12:55:26.350403+00:00",
  "timestamp_max": "2021-04-08T12:55:26.350403+00:00",
  "upload_speed_min": 980392.1568627451,
  "download_speed_min": 4901960.784313725,
  "data_since_last_report_max": 4732548294.36119,
  "ping_max": 971.32,
  "cell_id": "Filipino Community Center",
}
```
Sample GET response in JSON
```
[
    {
        "_id": "6141239777ee02a45ee04607",
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
]
```
## On-going Features
- Add more filtering to the data
- Verify the timestamp format and other data sanitization
## Planned Features
- Filter the database based on radius of a sample point

