const db = require('../persistence');
const twilio = require('twilio');
const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function processRule(rule, point) {

  let temp = point.value;

  if (rule.unit.toLowerCase() == "fahrenheit")
    temp = convertFtoC(temp);

  if (x.comparison == ">") {
    if (temp > rule.temp1)
      sendText(rule, point);
  } else if (x.comparison == "<") {
    if (temp < rule.temp1)
      sendText(rule, point);
  } else if (x.comparison == "><") {
    if (temp > rule.temp1 && temp < rule.temp2)
      sendText(rule, point);
  }
}

function convertFtoC(temp){
  return (temp - 32) * (5/9);
}

async function sendText(rule, point) {

  let message = "";

  switch(rule.comparison){
    case ">":
      message = `over ${rule.temp1}`;
      break;
    case "<":
      message = `under ${rule.temp1}`;
      break;
    case "><":
      message = `between ${rule.temp1} and ${rule.temp2}`;
      break;
  }

  twilioClient.messages.create({
    body: `${rule.sensor} sensor value (${point.value}) is currently ${message}`,
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

  if (rules.length == 0){
    res.status(500).send({errors: [`no rules for sensor '${req.body.id}`]})
    return;
  }

  let applicableRules = [];
  rules.foreEach(rule => {
    processRule(rule, point);
  });
}