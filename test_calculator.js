/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require('assert');
const { CalculatorFunctions } = require('./calculatorFunctions');

describe('Calculator Tests', () => {
  it('should calculate borrowing power for standard values', async () => {
    const calculate = new CalculatorFunctions('fakeToken', 360, 7, 3);

    //mocking the API calls using 30000 and 2800 to get 4200
    calculate.getTax = async function json() {
      return 30000;
    };
    calculate.getHEM = async () => 2800;

    const result = await calculate.calculateBorrowingPower(
      120000,
      2,
      3000,
      10000,
      7.5,
    );
    assert.ok(
      result.maxLoanAmount > 0,
      'Should yield a positive borrowing power amount',
    );
    assert.strictEqual(result.monthlyRepayment, 4200);
  });

  it('should return 0 for invalid negative inputs', async () => {
    const calculate = new CalculatorFunctions('fakeToken', 360, 7, 3);
    //mocking the API calls using 30000 and 2800 to get 4200
    calculate.getTax = async () => 30000;
    calculate.getHEM = async () => 2800;
    const result = await calculate.calculateBorrowingPower(
      30000,
      3,
      4000,
      5000,
      7.5,
    );
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });
});
