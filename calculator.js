// Calculator state machine, independent of the DOM so it can be tested in Node.
(function (root) {
  const SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function apply(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
    }
    return b;
  }

  // Trim floating-point noise (0.1 + 0.2 -> 0.3) and keep output readable.
  function format(n) {
    if (!Number.isFinite(n)) return 'Error';
    const rounded = parseFloat(n.toPrecision(12));
    if (Math.abs(rounded) >= 1e12 || (rounded !== 0 && Math.abs(rounded) < 1e-9)) {
      return rounded.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return String(rounded);
  }

  class Calculator {
    constructor() { this.clear(); }

    clear() {
      this.current = '0';     // what is shown / being typed
      this.stored = null;     // left operand
      this.op = null;         // pending operator
      this.fresh = true;      // next digit starts a new number
      this.lastOp = null;     // for repeated "=" presses
      this.lastOperand = null;
      this.expression = '';
    }

    get isError() { return this.current === 'Error'; }

    inputDigit(d) {
      if (this.isError) this.clear();
      if (this.fresh) {
        this.current = d;
        this.fresh = false;
      } else if (this.current === '0') {
        this.current = d;
      } else if (this.current.replace(/[-.]/g, '').length < 15) {
        this.current += d;
      }
    }

    inputDecimal() {
      if (this.isError) this.clear();
      if (this.fresh) {
        this.current = '0.';
        this.fresh = false;
      } else if (!this.current.includes('.')) {
        this.current += '.';
      }
    }

    backspace() {
      if (this.isError) return this.clear();
      if (this.fresh) return;
      this.current = this.current.length > 1 ? this.current.slice(0, -1) : '0';
      if (this.current === '-') this.current = '0';
    }

    toggleSign() {
      if (this.isError || this.current === '0') return;
      this.current = this.current.startsWith('-') ? this.current.slice(1) : '-' + this.current;
    }

    percent() {
      if (this.isError) return;
      const value = parseFloat(this.current);
      // In "a + b%" style, b% means b percent of a; otherwise just divide by 100.
      const result = this.stored !== null && (this.op === '+' || this.op === '-')
        ? this.stored * value / 100
        : value / 100;
      this.current = format(result);
      this.fresh = true;
    }

    setOperator(op) {
      if (this.isError) return;
      const value = parseFloat(this.current);
      if (this.op !== null && !this.fresh) {
        const result = apply(this.stored, this.op, value);
        this.current = format(result);
        this.stored = this.isError ? null : parseFloat(this.current);
      } else if (this.op === null || this.stored === null) {
        this.stored = value;
      }
      if (this.isError) { this.op = null; this.expression = ''; return; }
      this.op = op;
      this.fresh = true;
      this.lastOp = null;
      this.expression = `${format(this.stored)} ${SYMBOLS[op]}`;
    }

    equals() {
      if (this.isError) return;
      let a, op, b;
      if (this.op !== null) {
        a = this.stored;
        op = this.op;
        b = parseFloat(this.current);
      } else if (this.lastOp !== null) {
        a = parseFloat(this.current);
        op = this.lastOp;
        b = this.lastOperand;
      } else {
        return;
      }
      const result = format(apply(a, op, b));
      this.expression = `${format(a)} ${SYMBOLS[op]} ${format(b)} =`;
      this.current = result;
      this.lastOp = this.isError ? null : op;
      this.lastOperand = b;
      this.stored = null;
      this.op = null;
      this.fresh = true;
    }
  }

  Calculator.format = format;
  if (typeof module !== 'undefined' && module.exports) module.exports = Calculator;
  else root.Calculator = Calculator;
})(this);
