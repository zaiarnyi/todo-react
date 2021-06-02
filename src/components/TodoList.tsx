import React from "react";
import { CompletedName, IFakeTodos, Itodos, SortName } from "../App";
import { Loading } from "./loading";

interface ITodoListProp {
  todos: Array<Itodos> | Array<IFakeTodos> | [];
  deleteTodo: (id: number) => void;
  onChangeCompleted: (id: number) => void;
  completed: CompletedName;
  loading: boolean;
  sort: SortName;
}

export const TodoList: React.FC<ITodoListProp> = React.memo((props) => {
  let text =
    props.completed === "all" || props.completed === "unfulfilled"
      ? "У Вас нет ни одной задачи"
      : "У Вас нет ни одной выполненой задачи";

  let todoCompleted; //for completed
  switch (props.completed) {
    case "unfulfilled":
      todoCompleted = [...props.todos.filter((todo) => !todo.completed)];
      break;
    case "completed":
      todoCompleted = [...props.todos.filter((todo) => todo.completed)];
      break;
    case "all":
    default:
      todoCompleted = [...props.todos];
      break;
  }
  switch (props.sort) {
    case "DESC":
      todoCompleted = [...todoCompleted].sort((a, b) => b.id - a.id);
      break;
    case "ASC":
    default:
      todoCompleted = [...todoCompleted].sort((a, b) => a.id - b.id);
      break;
  }

  if (todoCompleted.length === 0) {
    return (
      <div className={"center todo-list"}>
        {props.loading ? <Loading /> : text}
      </div>
    );
  }

  return (
    <div className={"todo-list"}>
      {todoCompleted.map((item) => {
        let styles = !item.completed
          ? "todo-list__text"
          : "todo-list__text through";
        return (
          <div className="todo-list__item" key={item.id}>
            <label className={"todo-list__title"}>
              <input
                type="checkbox"
                className={"todo-list__checkbox"}
                checked={item.completed}
                onChange={props.onChangeCompleted.bind(null, item.id)}
              />
              <span className={styles}>{item.title}</span>
            </label>
            <div className="todo-list__button">
              <button
                className={"todo-list__btn"}
                onClick={props.deleteTodo.bind(null, item.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});
