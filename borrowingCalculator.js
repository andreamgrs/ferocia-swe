/**
 * Borrowing Power Calculator
 *
 * Gen's incomplete prototype.
 * This currently calculates what a user can borrow over 30 years.
 * Currently this code uses placeholder methods for Tax and HEM values.
 *
 * TODO: Refactor the code to pull Tax and HEM values from an API call.
 * A server.js has been provided to supply these values.
 */

const { CalculatorFunctions } = require('./calculatorFunctions');

// Global constant for mortgage simulation
const LOAN_TERM_MONTHS = 360; // 30 Years
const INTEREST_RATE = 7.0; // 7.0% baseline interest rate
const ASSESSMENT_RATE_BUFFER = 3.0; // 3.0% buffer added to interest rates
const token = 'pat_abcdefghijklmnopqrstuvwxyz0123456789';

function runConsoleMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const calculator = new CalculatorFunctions(
    token,
    LOAN_TERM_MONTHS,
    INTEREST_RATE,
    ASSESSMENT_RATE_BUFFER,
  );

  console.log('Mortgage Borrowing Power Calculator');
  console.log('===================================');

  rl.question('Gross Annual Income: $', (income) => {
    //adding an if validation before calling the API
    const validIncome = parseFloat(income);
    //calling isNaN function to return true or false
    if (isNaN(validIncome) || validIncome <= 0) {
      console.error('Error: Please add a Gross Annual Income greater than 0.');
      rl.close();
      return;
    }
    rl.question('Number of Dependents: ', (dependents) => {
      //adding an if validation before calling the API
      const validDependents = parseInt(dependents);
      //calling isNaN function to return true or false
      if (isNaN(validDependents) || validDependents < 0) {
        console.error(
          'Error: the number of dependents needs to be 0 or greater than 0.',
        );
        rl.close();
        return;
      }
      rl.question('Declared Monthly Expenses: $', (expenses) => {
        //adding an if validation before calling the API
        const validExpenses = parseFloat(expenses);
        //calling isNaN function to return true or false
        if (isNaN(validExpenses) || validExpenses <= 0) {
          console.error(
            'Error: the Monthly Expenses needs to be greater than 0.',
          );
          rl.close();
          return;
        }
        //Make the callbank async too and adding try/ctach to handle the promise rejection
        rl.question('Total Credit Card Limits: $', async (creditLimits) => {
          //adding an if validation before calling the API
          const validCreditLimits = parseFloat(creditLimits);
          //calling isNaN function to return true or false
          if (isNaN(validCreditLimits) || validCreditLimits < 0) {
            console.error(
              'Error: the Credit Card Limits needs to be 0 or greater than 0.',
            );
            rl.close();
            return;
          }
          try {
            // Banks assess loans using base rate + buffer for safety
            const assessmentRate = INTEREST_RATE + ASSESSMENT_RATE_BUFFER;

            const result = await calculator.calculateBorrowingPower(
              //I change it to call the variables
              validIncome,
              validDependents,
              validExpenses,
              validCreditLimits,
              assessmentRate,
            );

            console.log('\n--- Calculation Summary ---');
            console.log(
              `Maximum Borrowing Power at ${INTEREST_RATE}%: $${result.maxLoanAmount.toLocaleString()}`,
            );
            console.log(
              `Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over 30 years`,
            );
          } catch (error) {
            console.error(
              'There was an error during the calculation: ',
              error.message,
            );
            //adding finally so the rl can be execute always with or without error
          } finally {
            rl.close();
          }
        });
      });
    });
  });
}

if (require.main === module) {
  runConsoleMode();
}
