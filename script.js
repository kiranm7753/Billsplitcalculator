document.addEventListener("DOMContentLoaded", function () {
    const roommates = ["DEEKSHITH", "NAGI", "NANDITH", "PAVAN", "RAVI", "SASI", "SUNDAR"];
    const nonVegGroup = ["PAVAN", "SASI", "RAVI", "NANDITH"];
    const eggGroup = ["NAGI", "PAVAN", "SASI", "RAVI", "NANDITH"];

    let balances = {};
    let totalAmount = 0;

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
        const selectedRoommates = Array.from(document.querySelectorAll(".roommate-checkbox:checked")).map(cb => cb.value);

        if (selectedRoommates.length === roommates.length) {
            document.getElementById("selectAll").checked = true;
        } else if (selectedRoommates.length === nonVegGroup.length && selectedRoommates.every(name => nonVegGroup.includes(name))) {
            document.getElementById("selectNonVeg").checked = true;
        } else if (selectedRoommates.length === eggGroup.length && selectedRoommates.every(name => eggGroup.includes(name))) {
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

        const expenseList = document.getElementById("expenseList");
        const expenseItem = document.createElement("div");
        expenseItem.textContent = `Item: $${amount.toFixed(2)}`;
        expenseList.appendChild(expenseItem);

        document.getElementById("amount").value = "";
        resetSelection();
        document.getElementById("selectCustom").checked = true;
        document.getElementById("showResultsBtn").classList.remove("hidden");
    };

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

    window.clearResults = function () {
        location.reload();
    };
});
