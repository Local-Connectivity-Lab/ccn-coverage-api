# query.ts
`Query` serves as a primary route for responding to the front-end API

## `api/sites`
Reply the sender with sites information in .json format
```
type Site = {
  name: string;
  latitude: number;
  longitude: number;
  status: SiteStatus; // 'active' | 'confirmed' | 'in-conversation'
  address: string;
  cell_id?: string[] // List of all cell IDs connected to the Site
};
```

## `api/dataRanges`
Respond with the boundary generated from utils/get-data-range
`{ center, minLat, minLon, maxLat, maxLon }`

## `api/data`
Reply with the map data 
1. `width`: width of the map
2. `height`: height of the map
3. `top`: position at the top (higher latitude)
4. `left`: position at the left-most (lower longitude
5. `binSizeShift`: the size of individual grid in binary
6. `zoom`: the zoom level
7. `selectedSites`: sites to query
8. `mapType`: type of the map (e.g. dbs, signal)
9. `timeFrom`: filtering by beginning of the given time
10. `timeto`: filtering by the end of the given time

## `api/sitesSummary`
Calculate and return site information for visualizing the map
1. `timeFrom`
2. `timeTo`

## `api/linesUmmary`
Calculate and return data for visualzing charts
1. `selectedSites`
2. `timeFrom`
3. `timeTo`


## `api/markers`
Return the positions and data from individual data point collections. Used for map markers
1. `selectedSites`
2. `selectedDevices`:
3. `timeFrom`
4. `timeTo`
 const selectedSites = req.query.sites + '';
    const selectedDevices = req.query.devices + '';
    const timeFrom = req.query.timeFrom + '';
    const timeTo = req.query.timeTo + '';

# report.ts
## `api/report_signal`
## `api/report_measurement`

# upload.ts
## `secure/get_groups`
## `secure/delete_group`
## `secure/delete_manual`
## `secure/upload_data`

# new-users.ts
## `secure/new-user`

# users.ts
## `secure/get-users`
## `secure/toggle-users`

# register.ts
## `api/register`

# edit-sites.ts
## `secure/edit_sites`

# ldap-login.ts
## `secure/login`
