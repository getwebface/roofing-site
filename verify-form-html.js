import { FormAsset } from './js/form-asset.js';

let html = FormAsset.renderFormHTML();

let tests = [
  ['Fast dispatch available', html.includes('Fast dispatch available')],
  ['Start Free Quote', html.includes('Start Free Quote')],
  ['What do you need help with?', html.includes('What do you need help with?')],
  ['What is your roof made of?', html.includes('What is your roof made of?')],
  ['How many storeys?', html.includes('How many storeys?')],
  ['Get My Free Quote', html.includes('Get My Free Quote')]
];

let failed = false;
for (let [name, result] of tests) {
  if (result) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}