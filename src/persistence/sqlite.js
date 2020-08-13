const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const location = process.env.SQLITE_DB_LOCATION || '/etc/rules/rules.db';

let db, dbAll, dbRun;

function init() {
    const dirName = require('path').dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    return new Promise((acc, rej) => {
        db = new sqlite3.Database(location, err => {
            if (err) return rej(err);

            if (process.env.NODE_ENV !== 'test')
                console.log(`Using sqlite database at ${location}`);

            db.run(
                'CREATE TABLE IF NOT EXISTS rules (id varchar(36), sensor varchar(255), comparison varchar(2), temp1 double, temp2 double)',
                (err, result) => {
                    if (err) return rej(err);
                    acc();
                },
            );
        });
    });
}

async function teardown() {
    return new Promise((acc, rej) => {
        db.close(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function getRules() {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM rules', (err, rows) => {
            if (err) return rej(err);
            acc(rows);
        });
    });
}

async function getRulesForSensor(sensor) {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM rules WHERE sensor=?', [sensor], (err, rows) => {
            if (err) return rej(err);
            acc(rows);
        });
    });
}

async function storeRule(item) {
    return new Promise((acc, rej) => {

        let temp1, temp2 = null;
        if (Array.isArray(item.temperature)) {
            temp1 = item.temperature[0];
            temp2 = item.temperature[1];
        } else
            temp1 = item.temperature;

        console.log(item.temperature);

        db.run(
            'INSERT INTO rules (id, sensor, comparison, temp1, temp2) VALUES (?, ?, ?, ?, ?)',
            [item.id, item.sensor, item.comparison, temp1, temp2],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}


module.exports = {
    init,
    teardown,
    getRules,
    getRulesForSensor,
    storeRule,
};
