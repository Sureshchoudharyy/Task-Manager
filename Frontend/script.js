const API_URL = "http://localhost:8080/api/tasks";

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    //On Button click
    document.getElementById("add-task-btn").addEventListener("click", addTask);

    // Enter key from any input inside the form
    document.querySelector(".form-container").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // prevent accidental form submit
            addTask();
        }
    });

    // Set min due date to today
    const dueDateInput = document.getElementById("dueDate");
    const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
    dueDateInput.setAttribute("min", today);
});

// Fetch and render all tasks
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch tasks");

        const tasks = await response.json();

        // Clear UI blocks
        document.getElementById("pending-tasks").innerHTML = "";
        document.getElementById("done-tasks").innerHTML = "";

        tasks.forEach(task => {
            renderTask(task);
        });

    } catch (error) {
        alert("Error loading tasks:", error);
    }
}

// Render a single task in correct block
function renderTask(task, shouldScroll = false, highlight = false) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-card");
    taskElement.dataset.id = task.id;

    taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description || ""}</p>
        <p><strong>Due Date :</strong> ${task.dueDate || "No date"}</p>
        <p><strong>Status :</strong> ${task.status}</p>
        <div class="task-actions">
            ${task.status !== "Done" ? `<button class="done-btn">Mark Done</button>` : ""}
            <button class="delete-btn">Delete</button>
        </div>
    `;

    if (task.status !== "Done") {
        taskElement.querySelector(".done-btn").addEventListener("click", () => markDone(task.id, task));
    }
    taskElement.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));

    if (task.status === "Done") {
        document.getElementById("done-tasks").appendChild(taskElement);
    } else {
        document.getElementById("pending-tasks").appendChild(taskElement);
    }

    if (shouldScroll) {
        taskElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (highlight) {
        taskElement.classList.add("highlight");
        setTimeout(() => {
            taskElement.classList.remove("highlight");
        }, 2000);
    }

    return taskElement;
}

// Add new task
async function addTask() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const status = document.getElementById("status").value;

    if (!title) {
        alert("Task title is required!");
        return;
    }

    const newTask = { title, description, status, dueDate };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        });

        if (!response.ok) throw new Error("Failed to add task");

        const savedTask = await response.json();
        renderTask(savedTask, true, true); // scroll + highlight new task

        // Reset form
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("dueDate").value = "";
        document.getElementById("status").value = "Pending";
    } catch (error) {
        alert("Error adding task:", error);
    }
}

// Mark a task as Done
async function markDone(id, task) {
    try {
        const updatedTask = { ...task, status: "Done" };

        const response = await fetch(`${API_URL}?id=${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) throw new Error("Failed to update task");

        const savedTask = await response.json();

        // Refresh UI
        document.querySelector(`[data-id='${id}']`)?.remove();
        renderTask(savedTask);
    } catch (error) {
        alert("Error updating task:", error);
    }
}

// Delete a task
async function deleteTask(id) {
    try {

        //don't delete from db directly, delete from UI only

        // const response = await fetch(`${API_URL}?id=${id}`, {
        //     method: "DELETE"
        // });

        // if (!response.ok) throw new Error("Failed to delete task");

        document.querySelector(`[data-id='${id}']`)?.remove();
    } catch (error) {
        alert("Error deleting task:", error);
    }
}
