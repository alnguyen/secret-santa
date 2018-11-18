const csvToJson = require('csvtojson')
const { clone, keys, reduce, sample } = require('lodash')

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

function notifyParticipants (matches) {
  console.log({matches})
}

async function init () {
  const participants = await parseInput()
  const matches = matchUp(participants)
  notifyParticipants(matches)
}

init()
