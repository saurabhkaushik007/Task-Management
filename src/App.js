import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as XLSX from 'xlsx'
import './App.css';


const App = () => {
  const [taskLists, setTaskLists] = useState([
    {
      id: 'list1',
      title: 'To Do',
      tasks: [
        { id: 'task1', title: 'Task 1', draggableId: 'task1', isEditing: false },
        { id: 'task2', title: 'Task 2', draggableId: 'task2', isEditing: false },
      ],
    },
    {
      id: 'list2',
      title: 'In Progress',
      tasks: [
        { id: 'task3', title: 'Task 3', draggableId: 'task3', isEditing: false },
        { id: 'task4', title: 'Task 4', draggableId: 'task4', isEditing: false },
      ],
    },
    {
      id: 'list3',
      title: 'Completed',
      tasks: [
        { id: 'task5', title: 'Task 5', draggableId: 'task5', isEditing: false },
        { id: 'task6', title: 'Task 6', draggableId: 'task6', isEditing: false },
      ],
    },
  ]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceListIndex = taskLists.findIndex((list) => list.id === source.droppableId);
    const destinationListIndex = taskLists.findIndex((list) => list.id === destination.droppableId);

    const sourceList = { ...taskLists[sourceListIndex] };
    const destinationList = { ...taskLists[destinationListIndex] };

    const taskIndex = sourceList.tasks.findIndex((task) => task.draggableId === draggableId);
    const task = sourceList.tasks[taskIndex];
    task.isEditing = false;
    sourceList.tasks.splice(taskIndex, 1);
    destinationList.tasks.splice(destination.index, 0, task);

    const updatedTaskLists = [...taskLists];
    updatedTaskLists[sourceListIndex] = sourceList;
    updatedTaskLists[destinationListIndex] = destinationList;

    setTaskLists(updatedTaskLists);
  };

  const handleAddTask = (listId, taskTitle) => {
    if (taskTitle.trim() === '') {
      return;
    }

    const listIndex = taskLists.findIndex((list) => list.id === listId);

    if (listIndex !== -1) {
      const task = {
        id: Date.now(),
        title: taskTitle,
        draggableId: `task${Date.now()}`,
        isEditing: false,
      };
      const updatedTaskLists = [...taskLists];
      updatedTaskLists[listIndex].tasks.push(task);
      setTaskLists(updatedTaskLists);
    }
  };

  const handleDeleteTask = (listId, taskId) => {
    const updatedTaskLists = taskLists.map((list) => {
      if (list.id === listId) {
        const updatedTasks = list.tasks.filter((task) => task.id !== taskId);
        return { ...list, tasks: updatedTasks };
      }
      return list;
    });

    setTaskLists(updatedTaskLists);
  };

  const handleEditTask = (listId, taskId) => {
    const listIndex = taskLists.findIndex((list) => list.id === listId);

    if (listIndex !== -1) {
      const updatedTaskLists = [...taskLists];
      const taskIndex = updatedTaskLists[listIndex].tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        updatedTaskLists[listIndex].tasks[taskIndex].isEditing = true;
        setTaskLists(updatedTaskLists);
      }
    }
  };

  const handleUpdateTask = (listId, taskId, newTitle) => {
    const listIndex = taskLists.findIndex((list) => list.id === listId);

    if (listIndex !== -1) {
      const updatedTaskLists = [...taskLists];
      const taskIndex = updatedTaskLists[listIndex].tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        updatedTaskLists[listIndex].tasks[taskIndex].title = newTitle;
        updatedTaskLists[listIndex].tasks[taskIndex].isEditing = false;
        setTaskLists(updatedTaskLists);
      }
    }
  };

  const handleCancelEditTask = (listId, taskId) => {
    const listIndex = taskLists.findIndex((list) => list.id === listId);

    if (listIndex !== -1) {
      const updatedTaskLists = [...taskLists];
      const taskIndex = updatedTaskLists[listIndex].tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        updatedTaskLists[listIndex].tasks[taskIndex].isEditing = false;
        setTaskLists(updatedTaskLists);
      }
    }
  };

  const handleExportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(taskLists.flatMap((list) => list.tasks));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    XLSX.writeFile(workbook, 'task_list.xlsx');
  };

  return (
    <div className="app">
      <h1 className="app-title">Task Management</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="task-lists">
          {taskLists.map((list) => (
            <div key={list.id} className="task-list">
              <h2 className="list-title">{list.title}</h2>
              <Droppable droppableId={list.id} key={list.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="task-cards"
                  >
                    {list.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.draggableId} index={index}>
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className="task-card"
                          >
                            {task.isEditing ? (
                              <form
                                className="edit-form"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const newTitle = e.target.elements.taskTitle.value;
                                  handleUpdateTask(list.id, task.id, newTitle);
                                }}
                              >
                                <input
                                  type="text"
                                  name="taskTitle"
                                  defaultValue={task.title}
                                  className="task-input"
                                />
                                <div className="edit-form-buttons">
                                  <button type="submit" className="update-button">
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => handleCancelEditTask(list.id, task.id)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="task-title">{task.title}</div>
                                <div className="task-actions">
                                  <button
                                    className="edit-button"
                                    onClick={() => handleEditTask(list.id, task.id)}
                                  >
                                    Update
                                  </button>
                                  <button
                                    className="delete-button"
                                    onClick={() => handleDeleteTask(list.id, task.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <form
                className="add-task-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const taskTitle = e.target.elements.taskTitle.value;
                  handleAddTask(list.id, taskTitle);
                  e.target.elements.taskTitle.value = '';
                }}
              >
                <input
                  type="text"
                  name="taskTitle"
                  placeholder="Enter task title"
                  className="task-input"
                />
                <button type="submit" className="add-button">
                  Add Task
                </button>
              </form>
            </div>
          ))}
        </div>
      </DragDropContext>
      <button onClick={handleExportToExcel} className="export-button">
        Export to Excel
      </button>
    </div>
  );
};

export default App;
