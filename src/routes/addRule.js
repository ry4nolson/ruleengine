const db = require('../persistence');
const uuid = require('uuid/v4');

module.exports = async (req, res) => {
    let errors = [];
    if (!req.body.sensor)
        errors.push("'sensor' is required");

    if (!req.body.comparison)
        errors.push("'comparison' is required");

    if (!req.body.temperature)
        errors.push("'temperature' is required");

    if (!["<", ">", "><"].includes(req.body.comparison))
        errors.push("'comparison' needs to be '<', '>', or '><'");

    if (req.body.comparison == "><" && !Array.isArray(req.body.temperature))
        errors.push("for '><' rules, 'temperature' needs to be an Array")
    

    if (errors.length) {
        res.status(500).send({ errors: errors });
    } else {
        const rule = {
            id: uuid(),
            sensor: req.body.sensor,
            comparison: req.body.comparison,
            temperature: req.body.temperature
        };

        await db.storeRule(rule);
        res.send(rule);
    }
};
