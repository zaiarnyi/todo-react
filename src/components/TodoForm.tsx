import React, { useState } from "react";
import { CompletedName, eventSelectType, SortName } from "../App";

interface IPropType {
  addTodo: (title: string) => void;
  sort: SortName;
  completed: CompletedName;
  onChangeSort: (e: eventSelectType) => void;
  onChangeCompleted: (e: eventSelectType) => void;
  countMyTodos: number;
  loadFake: boolean;
  countFakeTodos: number;
}

export const TodoForm: React.FC<IPropType> = React.memo((props) => {
  const [title, setTitle] = useState<string>("");
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value.trim());
  };
  const OnKeyPressHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.length > 0) {
      props.addTodo(title);
      setTitle("");
    }
  };
  const newTodoHandler = () => {
    props.addTodo(title);
    setTitle("");
  };
  let blocked = !props.countMyTodos && !props.countFakeTodos;
  return (
    <div className={"todo-form"}>
      <div className="todo-form__body">
        <div className={"todo-form__field"}>
          <input
            type="text"
            id={"title"}
            className={
              title.length > 0 ? "todo-form__input empty" : "todo-form__input"
            }
            autoComplete={"off"}
            value={title}
            onChange={onChangeInput}
            onKeyPress={OnKeyPressHandler}
          />
          <label htmlFor="title" className={"todo-form__label"}>
            Введите задачу
          </label>
        </div>
        <div className={"todo-form__button"}>
          <button
            onClick={newTodoHandler}
            className={"todo-form__btn"}
            type={"submit"}
            disabled={!(title.length > 0)}
          >
            Отправить
          </button>
        </div>
      </div>
      <div className="todo-form__optional">
        <span>
          {!props.loadFake ? props.countMyTodos : props.countFakeTodos} -
          {!props.loadFake ? " Ваших " : " Fake "}
          записей
        </span>
        <div className="optional__items">
          <div className="optional__sort">
            <select
              value={props.sort}
              onChange={props.onChangeSort}
              disabled={blocked}
              title={"Добавте минимум одну задачу"}
            >
              <option value={SortName.up}>{SortName.up}</option>
              <option value={SortName.down}>{SortName.down}</option>
            </select>
          </div>
          <div className="optional__completed">
            <select
              value={props.completed}
              onChange={props.onChangeCompleted}
              disabled={blocked}
            >
              <option value={CompletedName.all}>All</option>
              <option value={CompletedName.completed}>Completed</option>
              <option value={CompletedName.unfulfilled}>Unfulfilled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
});
