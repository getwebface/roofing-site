const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf-8');

const checks = [
  { text: '<details class="faq-item" name="faq">', expected: true },
  { text: '<summary class="faq-question">', expected: true },
  { text: '<div class="faq-item"', expected: false }
];

let allPassed = true;

for (const check of checks) {
  const found = content.includes(check.text);
  if (found === check.expected) {
    console.log(`✅ Passed: Expected "${check.text}" to be ${check.expected ? 'present' : 'absent'}, and it was.`);
  } else {
    console.error(`❌ Failed: Expected "${check.text}" to be ${check.expected ? 'present' : 'absent'}, but found=${found}.`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('All checks passed!');
}
