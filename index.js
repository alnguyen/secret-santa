require('dotenv').config()
const csvToJson = require('csvtojson')
const client = require('twilio')(
  process.env.TWILIO_ACCT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const fs = require('fs')
const { reduce, shuffle } = require('lodash')
const twilioNumber = process.env.TWILIO_PHONE_NBR
const dryRun = process.env.DRY_RUN == 'true'

function parseInput() {
  return csvToJson().fromFile('./data.csv')
}

function writeHistory(history) {
  fs.writeFile('history.json', JSON.stringify(history), err => {
    if (err) throw err
    console.log('Match set recorded')
  })
}

function matchUp(participants) {
  const randomized = shuffle(participants)
  return reduce(randomized, (acc, current, index) => {
    const matchIndex = index == randomized.length - 1 ? 0 : index + 1
    acc[current.name] = randomized[matchIndex].name
    return acc
  }, {})
}

async function notifyParticipants(participants, matches) {
  for (let participant in matches) {
    const matchInfo = participants.find(p => p.name === matches[participant])
    const participantInfo = participants.find(p => p.name === participant)
    await sendNotification(participantInfo, matchInfo)
  }
}

async function sendNotification(participant, match) {
  try {
    const body = `Ho ho ho! Hello ${participant.name}! Your secret santa match is ${match.name}.`
    dryRun ? console.log(`DRY :: ${body}`) : await client.messages.create({
      body,
      from: twilioNumber,
      to: participant.number
    })
  } catch (e) {
    console.error('Texting message error: ', e)
  }
}

async function init() {
  const participants = await parseInput()
  const matches = matchUp(participants)
  await notifyParticipants(participants, matches)
  writeHistory(matches)
}

init()
