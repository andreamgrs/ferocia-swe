class CalculatorFunctions {
  //initialize to reuse this attributes,
  constructor(token, LOAN_TERM_MONTHS, INTEREST_RAT, ASSESSMENT_RATE_BUFFER) {
    this.token = token;
    this.LOAN_TERM_MONTHS = LOAN_TERM_MONTHS;
    this.INTEREST_RAT = INTEREST_RAT;
    this.ASSESSMENT_RATE_BUFFER = ASSESSMENT_RATE_BUFFER;
  }

  //Adding the methods that call the API
  async getTax(income) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/tax?income=${income}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
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

  async getHEM(income, dependents) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/hem?income=${income}&dependents=${dependents}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
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

  //Adding the principal methos with this.getTax and this.getHem
  async calculateBorrowingPower(
    income,
    dependents,
    expenses,
    creditLimits,
    annualAssessmentRate,
  ) {
    // 1. Calculate Net Monthly Income after tax deductions
    const annualTax = await this.getTax(income);
    const netMonthlyIncome = (income - annualTax) / 12;

    // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
    const baselineHEM = await this.getHEM(income, dependents);
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
    // adding this to LOAN TERM to access to it
    const maxLoanAmount =
      maxMonthlyRepayment *
      ((1 - Math.pow(1 + monthlyRate, -this.LOAN_TERM_MONTHS)) / monthlyRate);

    return {
      maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
      monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2)),
    };
  }
}

module.exports = { CalculatorFunctions };
