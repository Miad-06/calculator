(function () {
  const calc = new Calculator();
  const resultEl = document.getElementById('result');
  const exprEl = document.getElementById('expression');
  const clearBtn = document.querySelector('[data-action="clear"]');
  const opButtons = document.querySelectorAll('[data-op]');

  function render() {
    resultEl.textContent = calc.current;
    exprEl.textContent = calc.expression;
    clearBtn.textContent = calc.current !== '0' || calc.op ? 'C' : 'AC';
    opButtons.forEach((b) => {
      b.classList.toggle('active', calc.fresh && calc.op === b.dataset.op);
    });
  }

  function handle(button) {
    const { digit, op, action } = button.dataset;
    if (digit !== undefined) calc.inputDigit(digit);
    else if (op) calc.setOperator(op);
    else if (action === 'clear') calc.clear();
    else if (action === 'sign') calc.toggleSign();
    else if (action === 'percent') calc.percent();
    else if (action === 'decimal') calc.inputDecimal();
    else if (action === 'backspace') calc.backspace();
    else if (action === 'equals') calc.equals();
    render();
  }

  document.querySelector('.keys').addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) handle(button);
  });

  const keyMap = {
    Enter: '[data-action="equals"]',
    '=': '[data-action="equals"]',
    Escape: '[data-action="clear"]',
    Delete: '[data-action="clear"]',
    Backspace: '[data-action="backspace"]',
    '.': '[data-action="decimal"]',
    ',': '[data-action="decimal"]',
    '%': '[data-action="percent"]',
    '+': '[data-op="+"]',
    '-': '[data-op="-"]',
    '*': '[data-op="*"]',
    x: '[data-op="*"]',
    '/': '[data-op="/"]',
  };

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const selector = /^[0-9]$/.test(e.key) ? `[data-digit="${e.key}"]` : keyMap[e.key];
    if (!selector) return;
    e.preventDefault();
    const button = document.querySelector(selector);
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);
    handle(button);
  });

  render();
})();
