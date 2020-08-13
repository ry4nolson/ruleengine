# ruleengine
to run:

* edit Dockerfile
insert twilio SID and Auth

```
docker build -t ruleengine .
docker run -dp 3000:3000 ruleengine
```

apis can be accessed at localhost:3000

endpoints:
  `GET /rules`
  `POST /rules`
  `POST /points`