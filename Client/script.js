document
  .getElementById("availabilityForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const tutorId = document.getElementById("tutorId").value;
    const availability = document.getElementById("availability").value;
    const responseDiv = document.getElementById("response");

    try {
      const response = await fetch("http://localhost:3000/set-availability", {
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

      responseDiv.textContent = "Success: " + JSON.stringify(data);
      responseDiv.className = "response success";
    } catch (error) {
      responseDiv.textContent = "Error: " + error.message;
      responseDiv.className = "response error";
    }
  });
