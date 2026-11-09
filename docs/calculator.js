const TokenType = {
    'undefined' : -1,

    'number' : 0,
    'plus' : 1,
    'sub' : 2,
    'mul' : 3,
    'div' : 4,

    'leftbrace' : 5,
    'rightbrace' : 6,
}

class Token {
    constructor(value = '', type = TokenType.undefined) {
        this.value = value;
        this.type = type;
    }
}

class ASTNode {
    constructor(type, value = null, left = null, right = null) {
        this.type = type;
        this.value = value;
        this.left = left;
        this.right = right;
    }
}

class Calculator {
    constructor() {
        this.expression = '';
        this.tokens = [];
        this.ast = null;
        this.cursor = 0;
    }

    convert_to_expr(str) {
        if (str === '×') {
            return '*';
        }
        else if (str === '÷') {
            return '/';
        }
        else {
            return str;
        }
    }

    convert_to_normal(str) {
        if (str === '*') {
            return '×';
        }
        else if (str === '/') {
            return '÷';
        }
        else {
            return str;
        }
    }

    display() {
        let v_string = Array.from(this.expression);

        for (let i = 0; i < v_string.length; i++) {
            v_string[i] = this.convert_to_normal(v_string[i]);
        }

        return v_string.join('');
    }

    lex() {
        this.tokens = [];
        let v_string = Array.from(this.expression);

        // for (let i = 0; i < v_string.length; i++) {
        //     v_string[i] = convert_to_expr(v_string[i]);
        // }

        for (let i = 0; i < v_string.length;) {
            const c = v_string[i];
            
            if ((c >= '0' && c <= '9') || c === '.') {
                let num = [];
                let hasDot = false;

                while (i < v_string.length) {
                    const ch = v_string[i];

                    if (ch >= '0' && ch <= '9') {
                        num.push(ch);
                    }
                    else if (ch === '.' && !hasDot) {
                        num.push(ch);
                        hasDot = true;
                    }
                    else {
                        break;
                    }

                    i++;
                }

                const value = num.join('');
                const type = value === '.'
                    ? TokenType.undefined
                    : TokenType.number;

                this.tokens.push(new Token(value, type));
            }
            else {
                // let v = c;
                let t = TokenType.undefined;

                if      (c === '+') {
                    t = TokenType.plus
                }
                else if (c === '-') {
                    t = TokenType.sub
                }
                else if (c === '*') {
                    t = TokenType.mul
                }
                else if (c === '/') {
                    t = TokenType.div
                }
                else if (c === '(') {
                    t = TokenType.leftbrace
                }
                else if (c === ')') {
                    t = TokenType.rightbrace
                }

                this.tokens.push(new Token(c, t));
                i++;
            }
        }
    }

    parseFactor() {
        const token = this.tokens[this.cursor];

        if (!token) {
            return null;
        }

        if (token.type === TokenType.number) {
            this.cursor++;
            return new ASTNode(TokenType.number, Number(token.value));
        }

        if (token.type === TokenType.leftbrace) {
            this.cursor++;

            const node = this.parseExpression();

            if (!node || this.tokens[this.cursor]?.type !== TokenType.rightbrace) {
                return null;
            }

            this.cursor++;
            return node;
        }

        return null;
    }

    parseTerm() {
        let node = this.parseFactor();

        if (!node) {
            return null;
        }

        while (this.cursor < this.tokens.length) {
            const type = this.tokens[this.cursor].type;

            if (type !== TokenType.mul && type !== TokenType.div) {
                break;
            }

            this.cursor++;

            const right = this.parseFactor();

            if (!right) {
                return null;
            }

            node = new ASTNode(type, null, node, right);
        }

        return node;
    }

    parseExpression() {
        let node = this.parseTerm();

        if (!node) {
            return null;
        }

        while (this.cursor < this.tokens.length) {
            const type = this.tokens[this.cursor].type;

            if (type !== TokenType.plus && type !== TokenType.sub) {
                break;
            }

            this.cursor++;

            const right = this.parseTerm();

            if (!right) {
                return null;
            }

            node = new ASTNode(type, null, node, right);
        }

        return node;
    }

    parse() {
        this.cursor = 0;

        const ast = this.parseExpression();

        if (!ast || this.cursor !== this.tokens.length) {
            this.ast = null;
            return false;
        }

        this.ast = ast;
        return true;
    }

    evaluate(node) {
        if (node.type === TokenType.number) {
            return node.value;
        }

        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        if (left === null || right === null) {
            return null;
        }

        let result;

        switch (node.type) {
            case TokenType.plus:
                result = left + right;
                break;

            case TokenType.sub:
                result = left - right;
                break;

            case TokenType.mul:
                result = left * right;
                break;

            case TokenType.div:
                result = left / right;
                break;

            default:
                return null;
        }

        return Number.isFinite(result) ? result : null;
    }

    calculate() {
        this.lex();

        if (!this.parse()) {
            return null;
        }

        return this.evaluate(this.ast);
    }

    input(str) {
        this.expression += this.convert_to_expr(str);
    }
};

const calculatorWindow = document.querySelector("#calculator-window");
const calculatorDisplay = calculatorWindow.querySelector(".calc-display");

const calculator = new Calculator();
let calculationFinished = false;

calculatorWindow.querySelectorAll(".calc-key").forEach((button) => {
    button.addEventListener("click", () => {
        console.log("Clicked:", button.value, button.dataset.action);

        const action = button.dataset.action;

        if (action === "clear") {
            calculator.expression = "";
            calculationFinished = false;
            calculatorDisplay.textContent = "0";
            return;
        }

        if (action === "backspace") {
            if (calculationFinished) {
                calculator.expression = "";
                calculationFinished = false;
            }
            else {
                const chars = Array.from(calculator.expression);
                chars.pop();
                calculator.expression = chars.join("");
            }

            calculatorDisplay.textContent = calculator.display() || "0";
            return;
        }

        if (action === "equals") {
            const result = calculator.calculate();

            calculatorDisplay.textContent =
                result === null ? "Error" : String(result);

            calculationFinished = true;
            return;
        }

        if (calculationFinished) {
            calculator.expression = "";
            calculationFinished = false;
        }

        calculator.input(button.value);
        calculatorDisplay.textContent = calculator.display();
    });
});