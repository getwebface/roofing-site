const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const expectedStructure = [
  '<details class="faq-item" name="faq-group">',
  '<summary class="faq-question">',
  '<span data-slot="faq_1">',
  '<span data-slot="faq_8">'
];

let allPassed = true;
expectedStructure.forEach(snippet => {
  if (html.includes(snippet)) {
    console.log(`✅ Passed: found '${snippet}'`);
  } else {
    console.error(`❌ Failed: missing '${snippet}'`);
    allPassed = false;
  }
});

// verify toggle script is gone
const toggleScript = "document.querySelectorAll('.faq-question').forEach(button => {";
if (!html.includes(toggleScript)) {
    console.log(`✅ Passed: Custom FAQ script removed`);
} else {
    console.error(`❌ Failed: Custom FAQ script still exists`);
    allPassed = false;
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
