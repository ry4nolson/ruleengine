const db = require('../persistence');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

//console.log(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

let delay = 0;

async function processRule(rule, point) {

  let temp = point.value;

  if (point.unit.toLowerCase() == "fahrenheit")
    temp = convertFtoC(temp);

  if (rule.comparison == ">") {
    if (temp > rule.temp1)
      return sendText(rule, point, delay += 500);
  } else if (rule.comparison == "<") {
    if (temp < rule.temp1)
      return sendText(rule, point, delay += 500);
  } else if (rule.comparison == "><") {
    if (temp > rule.temp1 && temp < rule.temp2)
      return sendText(rule, point), delay += 500;
  }

  return false;
}

function convertFtoC(temp) {
  return (temp - 32) * (5 / 9);
}

async function sendText(rule, point, delay) {

  let message = "";

  switch (rule.comparison) {
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

  let textBody = `${rule.sensor} sensor value (${point.value}) is currently ${message}`;

  let sms = {
    body: textBody,
    to: process.env.TWILIO_TO,
    from: process.env.TWILIO_FROM
  };

  console.log(sms);

  setTimeout(() => {
  twilio.messages.create(sms)
    .then((message) => console.log(message.sid))
    .catch(ex => console.log(ex));
  }, delay);

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

  if (rules.length == 0) {
    res.status(500).send({ errors: [`no rules for sensor '${req.body.id}`] })
    return;
  }

  let appliedRules = [];
  let timeout = 0;
  rules.forEach(rule => {
    if (processRule(rule, point))
      appliedRules.push(rule);
  });

  res.send({ appliedRules: appliedRules });
}