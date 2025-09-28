// Simple test for profanity filter

// Import the profanity filter
const profanityFilter = require('./src/utils/profanityFilter');

// Test messages
const messages = [
    "This is a normal message without any bad words.",
    "This message contains damn that should be filtered.",
    "Multiple bad words: hell, fuck, and shit should all be filtered.",
    "Partial matches should not be filtered: xhellx"
];

console.log("Testing profanity filter:");
console.log("-------------------------");

messages.forEach((message, index) => {
    console.log(`\nOriginal message ${index + 1}:`);
    console.log(message);
    console.log(`Filtered message ${index + 1}:`);
    console.log(profanityFilter.filter(message));
    console.log(`Contains profanity: ${profanityFilter.hasProfanity(message)}`);
});

// Test adding custom words
console.log("\n\nTesting custom words:");
console.log("---------------------");
profanityFilter.addWords(['badword1', 'badword2', 'custom']);

console.log("\nOriginal message:");
console.log("This message has badword1 and custom bad word.");
console.log("Filtered with custom words:");
console.log(profanityFilter.filter("This message has badword1 and custom bad word."));