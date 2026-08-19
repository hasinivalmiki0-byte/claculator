const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");

const statusDisplay = document.getElementById("status");
const operationsDisplay = document.getElementById("operations");
const lastResultDisplay = document.getElementById("lastResult");

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

const buttons = document.querySelectorAll(".buttons button");

let currentInput = "";
let firstNumber = null;
let operator = null;
let waitingForSecondNumber = false;

let operationCount = 0;
let lastResult = null;


/*
    Safely perform the mathematical operation.
    This avoids using eval().
*/
function calculate(first, second, selectedOperator) {

    switch (selectedOperator) {

        case "+":
            return first + second;

        case "-":
            return first - second;

        case "*":
            return first * second;

        case "/":

            if (second === 0) {
                throw new Error("Cannot divide by zero");
            }

            return first / second;

        default:
            return second;
    }
}


/*
    Update the calculator display.
*/
function updateDisplay(value = currentInput || "0") {

    display.textContent = value;

    expressionDisplay.textContent =
        firstNumber !== null && operator
            ? `${formatNumber(firstNumber)} ${operator}`
            : "";
}


/*
    Format large or decimal numbers.
*/
function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    return Number.parseFloat(number.toFixed(10)).toString();
}


/*
    Add a number to the current input.
*/
function inputNumber(number) {

    if (waitingForSecondNumber) {
        currentInput = "";
        waitingForSecondNumber = false;
    }

    if (currentInput === "0") {
        currentInput = number;
    } else {
        currentInput += number;
    }

    updateDisplay();
    setStatus("INPUT");
}


/*
    Add decimal point.
*/
function inputDecimal() {

    if (waitingForSecondNumber) {
        currentInput = "0";
        waitingForSecondNumber = false;
    }

    if (!currentInput.includes(".")) {
        currentInput = currentInput || "0";
        currentInput += ".";
    }

    updateDisplay();
}


/*
    Select an operator.
*/
function selectOperator(selectedOperator) {

    if (currentInput === "" && firstNumber === null) {
        return;
    }

    const inputValue = Number(currentInput);

    if (firstNumber === null) {
        firstNumber = inputValue;
    }

    else if (!waitingForSecondNumber) {

        const result = calculate(
            firstNumber,
            inputValue,
            operator
        );

        firstNumber = result;
        currentInput = formatNumber(result);
    }

    operator = selectedOperator;
    waitingForSecondNumber = true;

    updateDisplay(currentInput);
    setStatus("PROCESSING");
}


/*
    Calculate the final result.
*/
function performCalculation() {

    if (
        firstNumber === null ||
        operator === null ||
        currentInput === ""
    ) {
        return;
    }

    const secondNumber = Number(currentInput);

    try {

        const result = calculate(
            firstNumber,
            secondNumber,
            operator
        );

        const expression =
            `${formatNumber(firstNumber)} ${operator} ${formatNumber(secondNumber)}`;

        const formattedResult = formatNumber(result);

        display.textContent = formattedResult;
        expressionDisplay.textContent = expression + " =";

        addToHistory(expression, formattedResult);

        operationCount++;

        operationsDisplay.textContent = operationCount;
        lastResultDisplay.textContent = formattedResult;

        lastResult = result;

        currentInput = formattedResult;
        firstNumber = null;
        operator = null;
        waitingForSecondNumber = true;

        setStatus("COMPLETE");

    } catch (error) {

        display.textContent = "ERROR";
        expressionDisplay.textContent = error.message;

        setStatus("ERROR");

        resetCalculation();
    }
}


/*
    Clear everything.
*/
function clearCalculator() {

    currentInput = "";
    firstNumber = null;
    operator = null;
    waitingForSecondNumber = false;

    updateDisplay();
    setStatus("READY");
}


/*
    Delete the last digit.
*/
function deleteLastCharacter() {

    if (waitingForSecondNumber) {
        return;
    }

    currentInput = currentInput.slice(0, -1);

    updateDisplay();

    if (currentInput === "") {
        setStatus("READY");
    }
}


/*
    Percentage calculation.
*/
function calculatePercentage() {

    if (currentInput === "") {
        return;
    }

    const value = Number(currentInput);

    currentInput = formatNumber(value / 100);

    updateDisplay();
}


/*
    Add calculation to history.
*/
function addToHistory(expression, result) {

    if (historyList.querySelector(".empty-history")) {
        historyList.innerHTML = "";
    }

    const item = document.createElement("div");

    item.className = "history-item";

    item.innerHTML = `
        <span>${expression}</span>
        <strong>= ${result}</strong>
    `;

    historyList.prepend(item);
}


/*
    Update system status.
*/
function setStatus(status) {
    statusDisplay.textContent = status;
}


/*
    Reset calculation state.
*/
function resetCalculation() {

    currentInput = "";
    firstNumber = null;
    operator = null;
    waitingForSecondNumber = false;
}


/*
    Handle calculator button clicks.
*/
buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {

            if (!isNaN(value)) {
                inputNumber(value);
            }

            else if (value === ".") {
                inputDecimal();
            }

            else {
                selectOperator(value);
            }

            return;
        }

        switch (action) {

            case "clear":
                clearCalculator();
                break;

            case "delete":
                deleteLastCharacter();
                break;

            case "percent":
                calculatePercentage();
                break;

            case "calculate":
                performCalculation();
                break;
        }
    });
});


/*
    Keyboard support.
*/
document.addEventListener("keydown", event => {

    const key = event.key;

    if (!isNaN(key)) {
        inputNumber(key);
        return;
    }

    if (key === ".") {
        inputDecimal();
        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
        selectOperator(key);
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        performCalculation();
        return;
    }

    if (key === "Backspace") {
        deleteLastCharacter();
        return;
    }

    if (key === "Escape") {
        clearCalculator();
    }

    if (key === "%") {
        calculatePercentage();
    }
});


/*
    Clear calculation history.
*/
clearHistoryButton.addEventListener("click", () => {

    historyList.innerHTML = `
        <span class="empty-history">
            No calculations yet
        </span>
    `;

    setStatus("READY");
});


/*
    Initial state.
*/
updateDisplay();