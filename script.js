"use strict";
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

let currentAccount,timer;
//creating usernames for every account owner
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = function (date1, date2) {
    Math.round(Math.abs(date2 - date1) /(1000 * 60 * 60 * 24));
  };
  const daysPassed=calcDaysPassed(new Date(),date);
  if(daysPassed===0) return 'Today';
  if(daysPassed===1) return 'Yesterday';
  if(daysPassed<=7)  return `${daysPassed}days ago`

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurr=function (value,locale,currency){
  return new Intl.NumberFormat(locale,{
    style:'currency',
    currency:currency,
  }).format(value);
}
//display movements
const displayMovements = function (acc, sort = false) {
  //clear movements
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const date= new Date(acc.movementsDates[i]);
    const formattedCurrency=formatCurr(mov,acc.locale,acc.currency);
    const formattedDate=formatMovementDate(date,acc.locale);

    const html = `
    <div class="each-mov">
    <span class="${type}">${1 + i} ${type}</span>
    <span  id="mov-date">${formattedDate}</span>
    <span >${formattedCurrency}</span>
  </div>
`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//logout timer
const startLogoutTimer=function(){
  const tick=function(){
    const min=String(Math.trunc(time/60)).padStart(2,0);
    const sec=String(time % 60).padStart(2,0);

    labelTimer.textContent=`${min}:${sec}`;

    if (time===0){
      clearInterval(timer);
      labelWelcome.textContent='Log in to get started';
      containerApp.style.opacity=0;
    }
    time--;
  }
 let time=300;
  tick();
  const timer=setInterval(tick,1000);

  return timer
}
//calculate current balance
const currentBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent =formatCurr(acc.balance,acc.locale,acc.currency);

  //calculate deposits
  const deposit = Math.round(
    currentAccount.movements
      .filter((acc) => acc > 0)
      .reduce((acc, mov) => acc + mov, 0)
  ).toFixed(2);
  labelSumIn.textContent = deposit;

  //calculate withdrawals
  const withdrawal = Math.round(
    currentAccount.movements
      .filter((acc) => acc < 0)
      .reduce((acc, mov) => acc + mov, 0)
  ).toFixed(2);
  labelSumOut.textContent = Math.abs(withdrawal);

  //interest
  const interest = currentAccount.movements
    .filter((acc) => acc > 0)
    .map((deposit) => (deposit * currentAccount.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, mov) => acc + mov, 0);
  const roundedInterest = Math.round(interest).toFixed(2);
  labelSumInterest.textContent = roundedInterest;
};

//activating login button
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  //find account with the username
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  //check if pin is correct
  if (currentAccount?.pin === +inputLoginPin.value) {
    //welcome message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(" ")[0]
    }`;
    //display dashboard
    containerApp.style.opacity = 1;
    //clear input field
    inputLoginUsername.value = inputLoginPin.value = "";
  }
  displayMovements(currentAccount);
  currentBalance(currentAccount);

  // todays's date
const now=new Date();
const options={
  hour:'numeric',
  minute:'numeric',
  day:'numeric',
  month:'numeric',
  year:'numeric',
}
labelDate.textContent= new Intl.DateTimeFormat(currentAccount.locale,options).format(now);

if(timer) clearInterval(timer);
timer=startLogoutTimer();
});


//transfer money
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  if (
    receiverAcc &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAcc.username !== currentAccount.username
  ) {

    // push transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //push date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    displayMovements(currentAccount);
    currentBalance(currentAccount);
    inputTransferAmount.value = inputTransferTo.value = "";
  }
});

//request loan
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = inputLoanAmount.value;
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    //add loan date
        currentAccount.movementsDates.push(new Date().toISOString());

  }
  inputLoanAmount.value = "";
  displayMovements(currentAccount);
  currentBalance(currentAccount);
});

//close account
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    //delete
    accounts.splice(index, 1);
    //hide ui
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

//sorting
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
//keydown event
