const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let passed = true;
for (let i = 1; i <= 8; i++) {
  const buttonExpected = `aria-controls="faq-answer-${i}"`;
  const divExpected = `id="faq-answer-${i}"`;

  if (!html.includes(buttonExpected)) {
    console.error(`Missing or incorrect aria-controls for faq-answer-${i}`);
    passed = false;
  }

  if (!html.includes(divExpected)) {
    console.error(`Missing or incorrect id for faq-answer-${i}`);
    passed = false;
  }
}

if (passed) {
  console.log('✅ All 8 FAQ items correctly configured with aria-controls and id.');
  process.exit(0);
} else {
  console.error('❌ Tests failed.');
  process.exit(1);
}
