document.addEventListener("DOMContentLoaded", function () {
    const roommates = ["DEEKSHITH", "NAGI", "NANDITH", "PAVAN", "RAVI", "SASI", "SUNDAR"];
    const nonVegGroup = ["PAVAN", "SASI", "RAVI", "NANDITH"];
    const eggGroup = ["NAGI", "PAVAN", "SASI", "RAVI", "NANDITH"];
  
    // Original balances + total
    let balances = {};
    let totalAmount = 0;
  
    // NEW: Keep track of all added expenses here
    let allExpenses = [];
  
    // Initialize balances
    roommates.forEach(name => balances[name] = 0);
  
    const roommateList = document.getElementById("roommateList");
  
    // Creating roommate checkboxes
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
      document.querySelectorAll(".roommate-checkbox").forEach(cb => cb.checked = false);
    }
  
    function updateRadioSelection() {
      const selectedRoommates = Array.from(document.querySelectorAll(".roommate-checkbox:checked"))
        .map(cb => cb.value);
  
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
  
    // ======== Original Add Expense Logic + storing in allExpenses ========
    window.addExpense = function () {
      const amount = parseFloat(document.getElementById("amount").value);
      const selectedRoommates = Array.from(document.querySelectorAll(".roommate-checkbox:checked"))
        .map(cb => cb.value);
  
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }
      if (selectedRoommates.length === 0) {
        alert("Please select at least one roommate.");
        return;
      }
  
      // We do the original logic
      let splitAmount = amount / selectedRoommates.length;
      splitAmount = Math.round(splitAmount * 100) / 100;
      let totalSplit = splitAmount * selectedRoommates.length;
      let remainingAmount = Math.round((amount - totalSplit) * 100) / 100;
  
      selectedRoommates.forEach((name, index) => {
        balances[name] += splitAmount;
        if (index === 0) {
          balances[name] += remainingAmount;
        }
      });
      totalAmount += amount;
  
      // Create a visual item
      const expenseList = document.getElementById("expenseList");
      const expenseItem = document.createElement("div");
      expenseItem.textContent = `Item: $${amount.toFixed(2)}`;
      expenseList.appendChild(expenseItem);
  
      // NEW: Also store it in our allExpenses array
      allExpenses.push({
        amount: amount,
        roommates: selectedRoommates
      });
  
      document.getElementById("amount").value = "";
      resetSelection();
      document.getElementById("selectCustom").checked = true;
      document.getElementById("showResultsBtn").classList.remove("hidden");
    };
  
    // ======== Show Results (unchanged) ========
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
    };
  
    // ======== Clear Results (unchanged) ========
    window.clearResults = function () {
      location.reload();
    };
  
    // ======== NEW: Recalculate from scratch after modifications ========
    function recalcAll() {
      // 1) Reset all balances, totalAmount, and expense list
      for (let name of Object.keys(balances)) {
        balances[name] = 0;
      }
      totalAmount = 0;
      document.getElementById("expenseList").innerHTML = "";
  
      // 2) Reapply each expense in allExpenses
      allExpenses.forEach(exp => {
        let amount = exp.amount;
        let selectedRoommates = exp.roommates;
  
        // Original distribution logic
        let splitAmount = amount / selectedRoommates.length;
        splitAmount = Math.round(splitAmount * 100) / 100;
        let totalSplit = splitAmount * selectedRoommates.length;
        let remainingAmount = Math.round((amount - totalSplit) * 100) / 100;
  
        selectedRoommates.forEach((name, index) => {
          balances[name] += splitAmount;
          if (index === 0) {
            balances[name] += remainingAmount;
          }
        });
        totalAmount += amount;
  
        // Re-create the expense item visually
        const expenseList = document.getElementById("expenseList");
        const expenseItem = document.createElement("div");
        expenseItem.textContent = `Item: $${amount.toFixed(2)}`;
        expenseList.appendChild(expenseItem);
      });
  
      // If no expenses remain, hide "Show Final Results"
      if (allExpenses.length > 0) {
        document.getElementById("showResultsBtn").classList.remove("hidden");
      } else {
        document.getElementById("showResultsBtn").classList.add("hidden");
      }
  
      // Clear any displayed results
      document.getElementById("resultList").innerHTML = "";
      document.getElementById("clearResultsBtn").classList.add("hidden");
    }
  
    // ======== NEW: Modify an existing expense ========
    window.modifyExpense = function () {
      const idx = parseInt(document.getElementById("expenseIndex").value, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= allExpenses.length) {
        alert("Invalid expense number.");
        return;
      }
  
      const oldExpense = allExpenses[idx];
      const newAmountStr = prompt("Enter new amount:", oldExpense.amount.toString());
      if (newAmountStr === null) return; // User canceled
  
      const newAmount = parseFloat(newAmountStr);
      if (isNaN(newAmount) || newAmount <= 0) {
        alert("Invalid new amount.");
        return;
      }
  
      // For simplicity, let's also let them update the roommates
      // (You could skip this if you only want to edit the amount.)
      const newRoommatesStr = prompt(
        "Enter comma-separated roommate names:",
        oldExpense.roommates.join(", ")
      );
      if (newRoommatesStr === null) return; // User canceled
  
      // Convert comma list to array
      const newRoommates = newRoommatesStr
        .split(",")
        .map(r => r.trim())
        .filter(r => r);
  
      if (newRoommates.length === 0) {
        alert("No valid roommate names entered.");
        return;
      }
  
      // Update that expense in our array
      oldExpense.amount = newAmount;
      oldExpense.roommates = newRoommates;
  
      // Recalculate everything
      recalcAll();
    };
  
    // ======== NEW: Delete an existing expense ========
    window.deleteExpense = function () {
      const idx = parseInt(document.getElementById("expenseIndex").value, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= allExpenses.length) {
        alert("Invalid expense number.");
        return;
      }
  
      // Remove from our array
      allExpenses.splice(idx, 1);
  
      // Recalculate everything
      recalcAll();
    };
  });
  