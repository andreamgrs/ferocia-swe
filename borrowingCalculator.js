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

// Global constant for mortgage simulation
const LOAN_TERM_MONTHS = 360; // 30 Years
const INTEREST_RATE = 7.0; // 7.0% baseline interest rate
const ASSESSMENT_RATE_BUFFER = 3.0; // 3.0% buffer added to interest rates

const token = 'pat_abcdefghijklmnopqrstuvwxyz0123456789';

// Legacy placeholder functions to replace with API calls

//Make the function async and adding fetch
async function getTax(income) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/tax?income=${income}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    //if the response is not true (ej. not 200) then throw an error
    if (!response.ok) {
      throw new Error(`Error on Tax API: ${response.status}`);
    }

    const data = await response.json();
    //data.tax to access to tax because the json returns income and tax
    return data.tax;
    //adding catch in case the fetch failed
  } catch (error) {
    console.error('Error getting the data:', error);
    throw error; //without this line of returning the error again it return NaN
  }
}

async function getHEM(income, dependents) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/hem?income=${income}&dependents=${dependents}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    //if the response is not true (ej. not 200) then throw an error
    if (!response.ok) {
      throw new Error(`Error on HEM API: ${response.status}`);
    }

    const data = await response.json();
    //data.hem to access to hem because the json returns income, dependets and hem
    return data.hem;
    //adding catch in case the fetch failed
  } catch (error) {
    console.error('Error getting the data:', error);
    throw error; //without this line of returning the error again it return NaN
  }
}

/**
 * Calculates the total borrowing power amount and the monthly repayment configuration
 */
//make the function async same as the getTax and getHem
async function calculateBorrowingPower(
  income,
  dependents,
  expenses,
  creditLimits,
  annualAssessmentRate,
) {
  // 1. Calculate Net Monthly Income after tax deductions
  const annualTax = await getTax(income);
  const netMonthlyIncome = (income - annualTax) / 12;

  // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
  const baselineHEM = await getHEM(income, dependents);
  const totalLivingExpenses = Math.max(expenses, baselineHEM);

  // 3. Calculate credit card liability (~3% of total limits)
  const creditCardLiability = creditLimits * 0.03;

  // 4. Calculate monthly repayment capacity
  const maxMonthlyRepayment =
    netMonthlyIncome - totalLivingExpenses - creditCardLiability;

  // Return early if user cannot afford a loan at all
  if (maxMonthlyRepayment <= 0) {
    return { maxLoanAmount: 0, monthlyRepayment: 0 };
  }

  // 5. Calculate the monthly interest rate
  const monthlyRate = annualAssessmentRate / 100 / 12;

  // 6. Calculate maximum borrowing power using the following formula:
  // P = M * (1 - (1 + R)^-N) / R
  const maxLoanAmount =
    maxMonthlyRepayment *
    ((1 - Math.pow(1 + monthlyRate, -LOAN_TERM_MONTHS)) / monthlyRate);

  return {
    maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
    monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2)),
  };
}

function runConsoleMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

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
      rl.question('Declared Monthly Expenses: $', (expenses) => {
        //Make the callbank async too and adding try/ctach to handle the promise rejection
        rl.question('Total Credit Card Limits: $', async (creditLimits) => {
          try {
            // Banks assess loans using base rate + buffer for safety
            const assessmentRate = INTEREST_RATE + ASSESSMENT_RATE_BUFFER;

            const result = await calculateBorrowingPower(
              validIncome,
              parseInt(dependents),
              parseFloat(expenses),
              parseFloat(creditLimits),
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

module.exports = { calculateBorrowingPower };
