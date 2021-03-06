const express = require('express');
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getRules');
const addItem = require('./routes/addRule');
const handlePoint = require('./routes/handlePoint');

app.use(require('body-parser').json());

app.get('/rules', getItems);
app.post('/rules', addItem);
app.post('/points', handlePoint);

db.init().then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => { })
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
