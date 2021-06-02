import React from "react";

interface IFakeTodosProp {
  loadFake: boolean;
  changeTodo: () => void;
}

export const FakeTodos: React.FC<IFakeTodosProp> = React.memo((props) => {
  return (
    <div className={"fake-todos"}>
      <h2 className={"fake-todos__title"}>
        {!props.loadFake ? "Загрузить Fake Todos?" : "Вернуть Todo?"}
      </h2>
      <div className="fake-todos__button">
        <button className={"fake-todos__btn"} onClick={props.changeTodo}>
          Да
        </button>
      </div>
    </div>
  );
});
