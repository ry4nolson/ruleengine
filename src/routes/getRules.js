const db = require('../persistence');

module.exports = async (req, res) => {
    const rules = await db.getRules();
    res.send(rules);
};
