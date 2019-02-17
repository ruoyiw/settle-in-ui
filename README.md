# Settle In UI

Description
-----------
A frontend data collector written in JQuery for settlement data collection.

Currently deployed to [https://lsc.data.settletech.com.au](https://lsc.data.settletech.com.au)

The url for generating and saving new scenarios: [https://lsc.data.settletech.com.au/generate.html](https://lsc.data.settletech.com.au/generate.html)


Uses [Settle-In](https://bitbucket.org/portable/settle-in/src/master/) for the back-end.

Deployment
-----------

To sync the file to the s3 for serving

 ```aws --profile ruoyi s3 sync --acl public-read --delete . s3://settle-in-dev-new/ && aws cloudfront create-invalidation --distribution-id EAJDL6BYQFH5H --profile ruoyi --paths /index.html /about.html /start.html /generate.html /js/main.js /js/about.js /css/main.css /css/about.css /robots.txt /README.md /```

Webpage URL `http://settle-in-dev-new.s3-website-ap-southeast-2.amazonaws.com`

Endpoints
-----------
Base URL 
`https://ho1k9awhxg.execute-api.us-east-1.amazonaws.com/dev`

### GET
* To list all scenarios that *name* hasn't settled - `/scenario/list/not/{name}`  

### POST
* Save the new scenario with its settlement - `/create`
```
{ 
    type: <type of scenario. eg "random" - optional>
    values: {
        key: value,
        key2: value2
    },
    parentId: <id of the scenario this new scenario is derived from - optional>
    settlements: { // OPTIONAL. Allows adding settlements on creation
        name: value
    }
}
```
returns `{id: <newly created id>}`

* Save the settlement for an existed scenario - `/settle`
```
{ 
    id: <scenario id>
    name: <userId (email) of person creating this settlement>
    value: <0-100 value of the settlement>
}
```
* `user/create` 
```
{ 
    email: <email address>
    val1: <some value>
    ...
    valN: <another value>
}
```
returns the same data back to you on success



