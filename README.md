# ruleengine
to run:

* edit Dockerfile

populate twilio env variables

```
docker build -t ruleengine .
docker run -dp 3000:3000 ruleengine
```

apis can be accessed at localhost:3000

endpoints:
 * `GET /rules`
 * `POST /rules`
   * if `comparison` is `">"` or `"<"`, `temperature` is a `Number`, if `comparison` is `"><"`, `temperature` is an `Array` of `Number`(s)
```
POST {
    "sensor": "test",
    "comparison" : "><",
    "temperature" : [70,81]
  }
  ```
 * `POST /points`
```
 POST {
    "id": "test",
    "value" : 71,
    "unit": "celsius"
 }
 ```
