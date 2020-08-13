const db = require('../persistence');
const twilio = require('twilio');
const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function processRule(rule, point) {
  if (x.comparison == ">") {
    if (point.value > x.temperature)
      sendText(rule, point);
  } else if (x.comparison == "<") {
    if (point.value < x.temperature)
      sendText(rule, point);
  } else if (x.comparison == "><") {
    if (point.value > x.temperature)
      sendText(rule, point);
  }
}

async function sendText(rule, point) {

  let comparison = "";

  switch(rule.comparison){
    case ">":
      comparison = "over";
      break;
    case "<":
      comparison = "under";
      break;
    case "><":
      comparison = "over or under";
      break;
  }

  twilioClient.messages.create({
    body: `${rule.sensor} current is measuring a  temperature of ${point.value} 
    which is ${comparison} the threshold (${rule.temperature})`,
    to: process.env.TWILIO_TO,
    from: process.env.TWILIO_FROM
  })
    .then((message) => console.log(message.sid));
}

module.exports = async (req, res) => {
  const point = req.body;
  let errors = [];
  if (!point.id)
    errors.push("'id' is required");

  if (!point.value)
    errors.push("'value' is required");

  if (!point.unit)
    errors.push("'unit' is required");

  if (errors.length) {
    res.status(500).send({ errors: errors });
    return;
  }


  const rules = await db.getRulesForSensor(req.body.id);
  let applicableRules = [];
  rules.foreEach(rule => {
    processRule(rule, point);
  });


}