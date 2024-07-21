document
  .getElementById("availabilityForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const tutorId = document.getElementById("tutorId").value;
    const availability = document.getElementById("availability").value;
    const responseDiv = document.getElementById("response");
    const previewDiv = document.getElementById("preview");
    const previewList = document.getElementById("previewList");

    try {
      const response = await fetch("http://localhost:3000/parse-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tutorId, availability }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      previewList.innerHTML = "";

      data.parsedAvailability.forEach((entry) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${entry.day}: ${entry.startTime} : ${entry.endTime}`;
        previewList.appendChild(listItem);
      });

      previewDiv.classList.remove("hidden");
      previewDiv.dataset.parsedAvailability = JSON.stringify(
        data.parsedAvailability
      );
      responseDiv.textContent = "";
    } catch (error) {
      responseDiv.textContent = "Error: " + error.message;
      responseDiv.className = "response error";
    }
  });

document
  .getElementById("confirmButton")
  .addEventListener("click", async function () {
    const tutorId = document.getElementById("tutorId").value;
    const parsedAvailability = JSON.parse(
      document.getElementById("preview").dataset.parsedAvailability
    );
    const responseDiv = document.getElementById("response");
    console.log(parsedAvailability);
    try {
      const response = await fetch("http://localhost:3000/set-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId,
          availability: parsedAvailability,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      responseDiv.textContent = "Time Slots Saved Succsesfully";
      responseDiv.className = "response success";
      document.getElementById("preview").classList.add("hidden");
    } catch (error) {
      responseDiv.textContent = "Error: " + error.message;
      responseDiv.className = "response error";
    }
  });
