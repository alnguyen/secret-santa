require('dotenv').config()
const csvToJson = require('csvtojson')
const client = require('twilio')(
  process.env.TWILIO_ACCT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const {
  clone,
  forEach,
  keys,
  reduce,
  sample
} = require('lodash')

function parseInput () {
  return csvToJson().fromFile('./data.csv')
}

function matchUp (participants) {
  const potentialMatches = clone(participants)
  const matches = reduce(participants, (matches, current) => {
    let matchIndex = Math.random() * (0, potentialMatches.length - 1)
    let match = potentialMatches.splice(matchIndex, 1)[0]
    while (match === current) {
      if (potentialMatches.length < 1) {
        const swapWith = sample(keys(matches))
        matches[current.name] = matches[swapWith]
        matches[swapWith] = match.name
        return matches
      } else {
        potentialMatches.push(match)
        matchIndex = Math.random() * (0, potentialMatches.length - 1)
        match = potentialMatches.splice(matchIndex, 1)[0]
      }
    }
    matches[current.name] = match.name
    return matches
  }, {})
  return matches
}

function notifyParticipants (participants, matches) {
  forEach(matches, (match, participant) => {
    const matchInfo = participants.find(p => p.name === match)
    const participantInfo = participants.find(p => p.name === participant)
    const body = `Ho ho ho! Hello ${participantInfo.name}! Your secret santa match is ${matchInfo.name}.`
    client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NBR,
      to: participantInfo.number
    }).then(message => {
      console.log(message.sid)
    }).done()
  })
}

async function init () {
  const participants = await parseInput()
  const matches = matchUp(participants)
  notifyParticipants(participants, matches)
}

init()
