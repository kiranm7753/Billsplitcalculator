document.addEventListener("DOMContentLoaded", function () {
  // Fixed roommate list and groups
  const roommates = ["DEEKSHITH", "NAGI", "NANDITH", "PAVAN", "RAVI", "SASI"];
  const nonVegGroup = ["PAVAN", "SASI", "RAVI", "NANDITH"];
  const eggGroup = ["NAGI", "PAVAN", "SASI", "RAVI", "NANDITH"];

  // Balances and total amount
  let balances = {};
  let totalAmount = 0;
  roommates.forEach(name => (balances[name] = 0));

  // Array to store each expense (object with { amount, roommates })
  let allExpenses = [];

  const roommateList = document.getElementById("roommateList");

  // Create roommate checkboxes dynamically
  roommates.forEach((name, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="checkbox" id="roommate${index}" class="roommate-checkbox" value="${name}">
      <label for="roommate${index}">${name}</label>
    `;
    roommateList.appendChild(div);
  });

  function updateCheckboxSelection(names) {
    document.querySelectorAll(".roommate-checkbox").forEach(cb => {
      cb.checked = names.includes(cb.value);
    });
  }

  function resetSelection() {
    document.querySelectorAll(".roommate-checkbox").forEach(cb => {
      cb.checked = false;
    });
  }

  function updateRadioSelection() {
    const selectedRoommates = Array.from(document.querySelectorAll(".roommate-checkbox:checked")).map(cb => cb.value);
    if (selectedRoommates.length === roommates.length) {
      document.getElementById("selectAll").checked = true;
    } else if (
      selectedRoommates.length === nonVegGroup.length &&
      selectedRoommates.every(name => nonVegGroup.includes(name))
    ) {
      document.getElementById("selectNonVeg").checked = true;
    } else if (
      selectedRoommates.length === eggGroup.length &&
      selectedRoommates.every(name => eggGroup.includes(name))
    ) {
      document.getElementById("selectEgg").checked = true;
    } else {
      document.getElementById("selectCustom").checked = true;
    }
  }

  document.getElementById("selectAll").addEventListener("change", function () {
    updateCheckboxSelection(roommates);
  });

  document.getElementById("selectNonVeg").addEventListener("change", function () {
    updateCheckboxSelection(nonVegGroup);
  });

  document.getElementById("selectEgg").addEventListener("change", function () {
    updateCheckboxSelection(eggGroup);
  });

  document.getElementById("selectCustom").addEventListener("change", function () {
    resetSelection();
  });

  document.querySelectorAll(".roommate-checkbox").forEach(cb => {
    cb.addEventListener("change", updateRadioSelection);
  });

  // Add a new expense with 2-decimal split, distributing leftover cents equally among roommates
  window.addExpense = function () {
    const amount = parseFloat(document.getElementById("amount").value);
    const selectedRoommates = Array.from(document.querySelectorAll(".roommate-checkbox:checked")).map(cb => cb.value);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (selectedRoommates.length === 0) {
      alert("Please select at least one roommate.");
      return;
    }

    // Convert amount to cents
    const totalCents = Math.round(amount * 100);
    const shareCents = Math.floor(totalCents / selectedRoommates.length);
    const leftover = totalCents % selectedRoommates.length;

    selectedRoommates.forEach((name, index) => {
      balances[name] += shareCents / 100;
      if (index < leftover) {
        balances[name] += 0.01;
      }
      balances[name] = parseFloat(balances[name].toFixed(2));
    });

    totalAmount += amount;

    // Store the expense
    allExpenses.push({
      amount: amount,
      roommates: selectedRoommates
    });
    renderExpenses();

    document.getElementById("amount").value = "";
    resetSelection();
    document.getElementById("selectCustom").checked = true;
    document.getElementById("showResultsBtn").classList.remove("hidden");
  };

  // Render expenses with incremental numbering and small inline modify/delete buttons
  function renderExpenses() {
    const expenseList = document.getElementById("expenseList");
    expenseList.innerHTML = "";
    allExpenses.forEach((expense, index) => {
      const expenseItem = document.createElement("div");
      expenseItem.className = "expense-item";

      // Create a flex container: left part for text, right part for buttons
      const textSpan = document.createElement("span");
      textSpan.textContent = `Item ${index + 1}: $${expense.amount.toFixed(2)}`;
      expenseItem.appendChild(textSpan);

      // Container for small buttons
      const btnContainer = document.createElement("div");
      btnContainer.className = "btn-container";

      const modifyBtn = document.createElement("button");
      modifyBtn.className = "small-btn";
      modifyBtn.textContent = "Modify";
      modifyBtn.onclick = function () {
        window.modifyExpenseAt(index);
      };
      btnContainer.appendChild(modifyBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "small-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = function () {
        window.deleteExpenseAt(index);
      };
      btnContainer.appendChild(deleteBtn);

      expenseItem.appendChild(btnContainer);
      expenseList.appendChild(expenseItem);
    });
  }

  // Show final results
  window.showResults = function () {
    const resultList = document.getElementById("resultList");
    resultList.innerHTML = "";
    for (const [name, total] of Object.entries(balances)) {
      const resultItem = document.createElement("div");
      resultItem.textContent = `${name}: $${total.toFixed(2)}`;
      resultList.appendChild(resultItem);
    }
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<strong>Total: $${totalAmount.toFixed(2)}</strong>`;
    resultList.appendChild(totalDiv);

    document.getElementById("showResultsBtn").classList.add("hidden");
    document.getElementById("clearResultsBtn").classList.remove("hidden");
    document.getElementById("printPDFBtn").classList.remove("hidden");
  };

  // Clear results (reload)
  window.clearResults = function () {
    location.reload();
  };

  // Recalculate from scratch after modifications or deletions
  function recalcAll() {
    roommates.forEach(name => (balances[name] = 0));
    totalAmount = 0;
    document.getElementById("expenseList").innerHTML = "";
    allExpenses.forEach((exp, idx) => {
      const totalCents = Math.round(exp.amount * 100);
      const shareCents = Math.floor(totalCents / exp.roommates.length);
      const leftover = totalCents % exp.roommates.length;
      exp.roommates.forEach((name, i) => {
        balances[name] += shareCents / 100;
        if (i < leftover) {
          balances[name] += 0.01;
        }
        balances[name] = parseFloat(balances[name].toFixed(2));
      });
      totalAmount += exp.amount;
      const expenseList = document.getElementById("expenseList");
      const expenseItem = document.createElement("div");
      expenseItem.className = "expense-item";
      expenseItem.textContent = `Item ${idx + 1}: $${exp.amount.toFixed(2)}`;
      expenseList.appendChild(expenseItem);
    });
    if (allExpenses.length > 0) {
      document.getElementById("showResultsBtn").classList.remove("hidden");
    } else {
      document.getElementById("showResultsBtn").classList.add("hidden");
    }
    document.getElementById("resultList").innerHTML = "";
    document.getElementById("clearResultsBtn").classList.add("hidden");
  }

  // Modify expense at a given index with inline re-prompt until valid names are entered
  window.modifyExpenseAt = function (idx) {
    if (isNaN(idx) || idx < 0 || idx >= allExpenses.length) {
      alert("Invalid expense number.");
      return;
    }
    const oldExpense = allExpenses[idx];
    const newAmountStr = prompt("Enter new amount:", oldExpense.amount.toString());
    if (newAmountStr === null) return;
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount <= 0) {
      alert("Invalid new amount.");
      return;
    }
    let validRoommates = [];
    while (true) {
      const newRoommatesStr = prompt("Enter comma-separated roommate names:", oldExpense.roommates.join(", "));
      if (newRoommatesStr === null) return;
      const newRoommatesInput = newRoommatesStr.split(",").map(r => r.trim()).filter(r => r);
      if (newRoommatesInput.length === 0) {
        alert("No valid roommate names entered. Please try again.");
        continue;
      }
      validRoommates = [];
      const invalidRoommates = [];
      newRoommatesInput.forEach(name => {
        const match = roommates.find(r => r.toLowerCase() === name.toLowerCase());
        if (match) {
          validRoommates.push(match);
        } else {
          invalidRoommates.push(name);
        }
      });
      if (invalidRoommates.length > 0) {
        alert("The following names are invalid: " + invalidRoommates.join(", ") + "\nPlease re-enter the names.");
      } else {
        break;
      }
    }
    oldExpense.amount = newAmount;
    oldExpense.roommates = validRoommates;
    recalcAll();
  };

  // Delete expense at a given index
  window.deleteExpenseAt = function (idx) {
    if (isNaN(idx) || idx < 0 || idx >= allExpenses.length) {
      alert("Invalid expense number.");
      return;
    }
    allExpenses.splice(idx, 1);
    recalcAll();
  };

  // Generate PDF using jsPDF (if needed)
  window.generatePDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("Roommate Money Splitter Summary", 20, 20);
    doc.setFontSize(12);
    let y = 30;
    doc.text("Final Amounts:", 20, y);
    y += 10;
    for (const [name, total] of Object.entries(balances)) {
      doc.text(`${name}: $${total.toFixed(2)}`, 20, y);
      y += 10;
    }
    y += 10;
    doc.text(`Total: $${totalAmount.toFixed(2)}`, 20, y);
    doc.save("Roommate_Splitter_Summary.pdf");
  };
});


