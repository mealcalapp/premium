const table = document.getElementById("mealTable");

  // ===== Table Generator =====
  function generateTable() {
    const memberCount = parseInt(document.getElementById("memberCount").value) || 0;
    const tbody = table.querySelector("tbody");
      tbody.innerHTML = "";

      for (let i = 1; i <= memberCount; i++) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${i}</td>
          <td style="text-align: center;">
            <input type="text" placeholder="Name ${i}" style="text-align: center;">
          </td>
          <td><input type="number" value=""></td>
          <td><input type="number" value=""></td>
          <td><input type="number" value="" step=""></td>
          <td class="mealCost"></td>
          <td><input type="number" value=""></td>
          <td class="total"></td>
          <td class="due dueCell"></td>
          <td class="refund refundCell"></td>
        `;
        tbody.appendChild(row);
      }
      updateRates();
    }
    // ===== Calculation =====
    function updateTable() {
      const rows = table.querySelectorAll("tbody tr");
      let totalDue = 0;
      let totalRefund = 0;

      rows.forEach(row => {
        const deposit = parseFloat(row.cells[2].querySelector("input").value) || 0;
        const meal = parseFloat(row.cells[3].querySelector("input").value) || 0;
        const rate = parseFloat(row.cells[4].querySelector("input").value) || 0;
        const addCost = parseFloat(row.cells[6].querySelector("input").value) || 0;

        const mealCost = meal * rate;
        const total = mealCost + addCost;
        const diff = deposit - total;

        row.querySelector(".mealCost").textContent = mealCost.toFixed(2);
        row.querySelector(".total").textContent = total.toFixed(2);

        const dueCell = row.querySelector(".dueCell");
        const refundCell = row.querySelector(".refundCell");

        if (diff < 0) {
          const dueAmt = Math.abs(diff);
          dueCell.textContent = dueAmt.toFixed(0);
          refundCell.textContent = "";
          totalDue += dueAmt;
        } else if (diff > 0) {
          refundCell.textContent = diff.toFixed(0);
          dueCell.textContent = "";
          totalRefund += diff;
        } else {
          dueCell.textContent = "";
          refundCell.textContent = "";
        }
      });

      // Update Due & Refund headers
      document.querySelector(".dueHead").innerHTML = `Due: ${totalDue.toFixed(0)}`;
      document.querySelector(".refundHead").innerHTML = `Refund: ${totalRefund.toFixed(0)}`;
    }

    // Bottom controller elements
    const totalMeal = document.getElementById("totalMeal");
    const bazarCost = document.getElementById("bazarCost");
    const mealRateBox = document.getElementById("mealRateBox");
    const additionalCost = document.getElementById("additionalCost");
    const addCostRateBox = document.getElementById("addCostRateBox");

    function updateRates() {
      const meal = parseFloat(totalMeal.value) || 0;
      const bazar = parseFloat(bazarCost.value) || 0;
      const addCost = parseFloat(additionalCost.value) || 0;
      const memberCount = parseInt(document.getElementById("memberCount").value) || 1;

      // Calculate meal rate
      let mealRate = meal > 0 ? bazar / meal : 0;
      mealRate = parseFloat(mealRate.toFixed(2)); 

      if (mealRate % 1 === 0) {
        mealRate = mealRate;
      } else if (mealRate % 1 < 0.1) {
        mealRate = Math.floor(mealRate) + 0.1;
      } else {
        mealRate = mealRate + 0.1;
      }
      mealRateBox.value = mealRate.toFixed(2);

      // Update all rows meal rate
      document.querySelectorAll("#mealTable tbody tr").forEach(row => {
        row.cells[4].querySelector("input").value = mealRate.toFixed(2);
      });

      let addRate = addCost / memberCount;
      addRate = (addRate % 1 >= 0.1) ? Math.ceil(addRate) : Math.floor(addRate);
      addCostRateBox.value = addRate;
      document.querySelectorAll("#mealTable tbody tr").forEach(row => {
        row.cells[6].querySelector("input").value = addRate.toFixed();
      });
      updateTable();
    }

      document.addEventListener("input", e => {
        if (e.target.tagName === "INPUT") {
          if (["totalMeal", "bazarCost", "additionalCost"].includes(e.target.id)) updateRates();
          else updateTable();
        }
      });

    // ===== Manager Star =====
    const managerInput = document.getElementById("managerInput");
    const mealTable = document.getElementById("mealTable");

    function updateStars() {
      const managerName = managerInput.value.trim().toLowerCase();
      document.querySelectorAll("#mealTable tbody tr").forEach(row => {
        const nameInput = row.cells[1]?.querySelector("input");
        if (!nameInput) return;
        const nameText = nameInput.value.trim().toLowerCase();
        let star = row.querySelector(".star");
        if (star) star.remove();

        if (managerName && nameText === managerName) {
          star = document.createElement("span");
          star.textContent = "★";
          star.className = "star";
          nameInput.insertAdjacentElement("afterend", star);
        }
      });
    }

    // Manager input change
    managerInput.addEventListener("input", updateStars);
    mealTable.addEventListener("input", (e) => {
      if (e.target.matches("tbody tr td:nth-child(2) input")) {
        updateStars();
      }
    });

    // Comparison Part 
    function compareRates() {
      const currentMealRate = parseFloat(document.getElementById("mealRateBox")?.value || 0);
      const currentAddRate = parseFloat(document.getElementById("addCostRateBox")?.value || 0);
      const prevMealRate = parseFloat(document.getElementById("prevMealRate").value || 0);
      const prevAddRate = parseFloat(document.getElementById("prevAddCostRate").value || 0);

      let mealChange = "";
      let addChange = "";

      if (prevMealRate > 0) {
        const diff = currentMealRate - prevMealRate; // difference in taka
        mealChange = getChangeText("Meal Rate", diff, prevMealRate);
      }

      if (prevAddRate > 0) {
        const diff = currentAddRate - prevAddRate; // difference in taka
        addChange = getChangeText("Additional Cost", diff, prevAddRate);
      }

      document.getElementById("comparisonResult").innerHTML = mealChange + "<br>" + addChange;
    }

    function getChangeText(label, diff, prevValue) {
      const diffText = Math.abs(diff).toFixed(2) + " tk"; // show 2 decimal points
      const prevText = prevValue.toFixed(2); // also formatted to 2 decimals

      if (diff > 0) {
        return `${label}: <span style="color:red;">↑ Increased ${diffText} than previous (${prevText})</span>`;
      } else if (diff < 0) {
        return `${label}: <span style="color:green;">↓ Decreased ${diffText} than previous (${prevText})</span>`;
      } else {
        return `${label}: <span style="color:gray;">No change than previous (${prevText})</span>`;
      }
    }

    // ===== PDF Save =====
    document.getElementById("pdfBtn").addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape" });
      const table = document.getElementById("mealTable");
      const rows = table.querySelectorAll("tr");
      const body = [];
      let head = [];

      rows.forEach((row, idx) => {
        const cols = row.querySelectorAll("th, td");
        const rowData = Array.from(cols).map(col => {
          const input = col.querySelector("input");
          return input ? input.value : col.textContent.trim();
        });
        if(idx === 0) head = rowData; // first row = header
        else body.push(rowData);
      });

      doc.autoTable({
        startY: 10,
        head: [head],
        body: body,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3, halign: "center", valign: "middle" },
        headStyles: { 
          fillColor: [237, 242, 247], 
          textColor: [45, 55, 72],    
          fontStyle: "bold"
        },
        didParseCell: function (data) {
          if (data.section === 'head') {
            const headerText = data.cell.raw.toLowerCase();
            if (headerText.includes('due')) {
              data.cell.styles.textColor = [178, 34, 34]; // red (#b22222)
            }
            if (headerText.includes('refund')) {
              data.cell.styles.textColor = [21, 87, 36]; // green (#155724)
            }
          }
        },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text("Designed by SK", data.settings.margin.left, pageHeight - 5);
        }
      });

      doc.save("MealSheet.pdf");
    });

    // CSV Export (Clean & Ordered)
    document.getElementById("saveBtn").addEventListener("click", () => {
      let csv = "";
      const rows = table.querySelectorAll("tr");

      rows.forEach((row, rowIndex) => {
        const cols = row.querySelectorAll("th, td");
        const values = Array.from(cols).map(col => {
          const input = col.querySelector("input");
          let val = input ? input.value.trim() : col.textContent.trim();
          if (val.includes(",")) val = `"${val}"`;
          return val;
        });

        csv += values.join(",") + "\n";
      });

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "MealSheet.csv";
      link.click();
    });

  generateTable(); 
    // Notice
  function updateNotice() {
    const month = document.getElementById("monthInput").value || "নভেম্বর";
    const date = document.getElementById("dateInput").value || "৫";
    const bkash = document.getElementById("bkashInput").value || "01761561321";
    
    document.getElementById("noticeBox").innerHTML = `
      ${month} মাসের ${date} তারিখের মধ্যে সকল লেনদেন পরিশোধ করবেন, ধন্যবাদ।
      <span style="display: flex; align-items: center;">
        <img src="https://www.logo.wine/a/logo/BKash/BKash-Icon2-Logo.wine.svg" alt="bKash" style="height:30px; vertical-align: middle;">
        bKash (+charge): ${bkash}
      </span>
    `;
  }

  // Button Animation
  const buttons = document.querySelectorAll(".shine-btn");
  buttons.forEach(btn => {
    function triggerShine() {
      btn.classList.remove("animate");
      void btn.offsetWidth; // restart animation
      btn.classList.add("animate");
    }

    btn.addEventListener("mouseenter", triggerShine);
    btn.addEventListener("click", triggerShine);
  });

  // Notice-box Automatic Month
  document.addEventListener("DOMContentLoaded", () => {
      const marquee = document.getElementById("monthMarquee");
      const now = new Date();
      const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      const customText = "Time Left";
      marquee.textContent = `${monthYear} — ${customText}`;
    });