const form = document.querySelector("#todo-form");
const inputTodo = document.querySelector("#todo-input");
const taskList = document.querySelector("#task-list");

let currentTask = [];
form.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const value = Object.fromEntries(new FormData(form));
  //   const task = {
  //     ...value,
  //     completed: false,
  //   };
  if (value.title.trim() === "") {
    alert("Không được bỏ trống nhiệm vụ");
    return;
  }
  if (currentTask.includes(value.title.trim())) {
    alert("Nhiệm vụ đã tồn tại");
    return;
  }
  const task = Object.assign({}, value, { completed: false });
  axios
    .post("http://localhost:3000/tasks", task)
    .then((newTask) => {
      renderTodo();
      form.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});
function renderTodo() {
  taskList.innerHTML = "";
  axios
    .get("http://localhost:3000/tasks")
    .then((task) => {
      currentTask = task.data.map((t) => {
        return t.title;
      });
      const tasks = task.data;
      tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";
        taskItem.dataset.id = task.id;
        if (task.completed) taskItem.classList.add("completed");

        const taskTitle = document.createElement("div");
        taskTitle.className = "task-title";
        taskTitle.textContent = task.title;

        const taskAction = document.createElement("div");
        taskAction.className = "task-action";

        const editBtn = document.createElement("div");
        editBtn.className = "task-btn edit";
        editBtn.textContent = "Edit";

        const doneBtn = document.createElement("div");
        doneBtn.className = "task-btn done";
        doneBtn.textContent = task.completed
          ? "Mark as undone"
          : "Mark as done";

        const deleteBtn = document.createElement("div");
        deleteBtn.className = "task-btn delete";
        deleteBtn.textContent = "Delete";

        taskItem.append(taskTitle, taskAction);
        taskAction.append(editBtn, doneBtn, deleteBtn);
        taskList.prepend(taskItem);
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
}
taskList.addEventListener("click", (e) => {
  const deleteItem = e.target.closest(".task-btn.delete");
  if (deleteItem) {
    const li = deleteItem.closest(".task-item");
    const id = li?.dataset?.id;
    if (li && confirm("Bạn có muốn xoá nhiệm vụ này không")) {
      try {
        axios.delete(`http://localhost:3000/tasks/${id}`);
        li.remove();
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  // edit
  const editTitle = e.target.closest(".task-btn.edit");
  if (editTitle) {
    const liTitle = editTitle.closest(".task-item");
    const taskTitle = liTitle.querySelector(".task-title").innerHTML;
    console.log(taskTitle);
    const idTitle = liTitle?.dataset?.id;
    if (liTitle) {
      try {
        const inputTitle = window.prompt("Sửa Nhiệm Vụ Đi", taskTitle);
        if (inputTitle.trim() === "") {
          alert("Không được bỏ trống nhiệm vụ");
          return;
        }
        if (currentTask.includes(inputTitle.trim())) {
          alert("Nhiệm vụ đã tồn tại");
          return;
        }
        axios.patch(`http://localhost:3000/tasks/${idTitle}`, {
          title: inputTitle,
        });
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  // done
  const done = e.target.closest(".task-btn.done");
  if (done) {
    const li = done.closest(".task-item");
    const id = li?.dataset?.id;
    if (li) {
      const isCompleted = li.classList.toggle("completed");
      axios.patch(`http://localhost:3000/tasks/${id}`, {
        completed: isCompleted,
      });
    }
  }
});
document.addEventListener("DOMContentLoaded", renderTodo);
