
const form = document.getElementById("transactionForm");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionList = document.getElementById("transactionList");

let transactions = [];

try {
  const savedData = JSON.parse(
    localStorage.getItem("expenseTransactions") || "[]"
  );

  if (Array.isArray(savedData)) {
    transactions = savedData.filter(item =>
      item &&
      Number.isFinite(item.id) &&
      (item.type === "income" || item.type === "expense") &&
      typeof item.description === "string" &&
      typeof item.category === "string" &&
      Number.isFinite(item.amount) &&
      item.amount > 0
    );
  }
} catch {
  transactions = [];
}

function formatMoney(amount) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR"
  });
}

function saveTransactions() {
  localStorage.setItem(
    "expenseTransactions",
    JSON.stringify(transactions)
  );
}

function renderTransactions() {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(transaction => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpenses += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpenses;

  balanceElement.textContent = formatMoney(balance);
  incomeElement.textContent = formatMoney(totalIncome);
  expensesElement.textContent = formatMoney(totalExpenses);

  transactionList.replaceChildren();

  if (transactions.length === 0) {
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent = "No transactions yet. Add your first one!";
    transactionList.appendChild(message);
    return;
  }

  [...transactions].reverse().forEach(transaction => {
    const row = document.createElement("div");
    row.className = "transaction";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("strong");
    title.textContent = transaction.description;

    const details = document.createElement("p");
    details.textContent =
      `${transaction.category} • ${transaction.date}`;

    info.append(title, details);

    const right = document.createElement("div");
    right.className = "transaction-right";

    const amount = document.createElement("span");
    amount.className =
      "transaction-amount " +
      (transaction.type === "income" ? "income-text" : "expense-text");

    amount.textContent =
      `${transaction.type === "income" ? "+" : "-"}${formatMoney(transaction.amount)}`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      transactions = transactions.filter(
        item => item.id !== transaction.id
      );

      saveTransactions();
      renderTransactions();
    });

    right.append(amount, deleteButton);
    row.append(info, right);
    transactionList.appendChild(row);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 100000000
  ) {
    alert("Please enter a valid description and amount.");
    return;
  }

  const transaction = {
    id: Date.now() + Math.random(),
    type: typeInput.value,
    description: description,
    category: categoryInput.value,
    amount: Math.round(amount * 100) / 100,
    date: new Date().toLocaleDateString("en-IN")
  };

  transactions.push(transaction);
  saveTransactions();
  renderTransactions();

  form.reset();
  typeInput.value = "expense";
  descriptionInput.focus();
});

renderTransactions();
