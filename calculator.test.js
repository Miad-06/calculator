const test = require('node:test');
const assert = require('node:assert');
const Calculator = require('./calculator');

function run(keys) {
  const c = new Calculator();
  for (const k of keys.split(' ')) {
    if (/^\d$/.test(k)) c.inputDigit(k);
    else if (k === '.') c.inputDecimal();
    else if ('+-*/'.includes(k)) c.setOperator(k);
    else if (k === '=') c.equals();
    else if (k === '%') c.percent();
    else if (k === '±') c.toggleSign();
    else if (k === '<') c.backspace();
  }
  return c.current;
}

test('basic operations', () => {
  assert.strictEqual(run('1 2 + 7 ='), '19');
  assert.strictEqual(run('9 - 1 2 ='), '-3');
  assert.strictEqual(run('6 * 7 ='), '42');
  assert.strictEqual(run('1 / 4 ='), '0.25');
});

test('chained operations evaluate left to right', () => {
  assert.strictEqual(run('2 + 3 * 4 ='), '20');
});

test('floating point noise is trimmed', () => {
  assert.strictEqual(run('. 1 + . 2 ='), '0.3');
});

test('division by zero is an error and recovers', () => {
  assert.strictEqual(run('5 / 0 ='), 'Error');
  assert.strictEqual(run('5 / 0 = 3'), '3');
});

test('repeated equals repeats last operation', () => {
  assert.strictEqual(run('2 + 3 = = ='), '11');
});

test('changing operator replaces it', () => {
  assert.strictEqual(run('8 + * 2 ='), '16');
});

test('percent, sign, backspace', () => {
  assert.strictEqual(run('5 0 %'), '0.5');
  assert.strictEqual(run('2 0 0 + 1 0 % ='), '220');
  assert.strictEqual(run('5 ±'), '-5');
  assert.strictEqual(run('1 2 3 <'), '12');
});

test('single decimal point', () => {
  assert.strictEqual(run('1 . . 5'), '1.5');
});
