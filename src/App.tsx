import React, { useEffect, useState } from "react";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { FakeTodos } from "./components/FakeTodos";

export interface Itodos {
  id: number;
  title: string;
  completed: boolean;
}
export interface IFakeTodos {
  userId?: number;
  id: number;
  title: string;
  completed: boolean;
}
export interface responseCompleted {
  [key: number]: IFakeTodos;
}

export enum SortName {
  up = "ASC",
  down = "DESC",
}
export enum CompletedName {
  all = "all",
  completed = "completed",
  unfulfilled = "unfulfilled",
}
export type eventSelectType = React.ChangeEvent<HTMLSelectElement>;

interface INewTodo {
  id: number;
  title: string;
  completed: boolean;
  userId?: number;
}
const linkTodo = "https://jsonplaceholder.typicode.com/todos/";

function App() {
  const [todos, setTodos] = useState<Array<Itodos>>([]);
  const [sort, setSort] = useState<SortName>(SortName.down);
  const [completed, setCompleted] = useState<CompletedName>(CompletedName.all);
  const [loadFake, setLoadFake] = useState<boolean>(false);
  const [fakeTodo, setFakeTodo] = useState<Array<IFakeTodos>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let newTodos = JSON.parse(localStorage.getItem("todos") || "[]");
    let newSort = JSON.parse(localStorage.getItem("sort") || SortName.down);
    setTodos(newTodos);
    setSort(newSort);
  }, []); //Получаю Тудушки, если были в Локал Стороже
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("sort", JSON.stringify(sort));
  }, [todos, sort]); //При каждом обновлении Личных ТУдушек и метода вывода записываю в Локал Стораж
  useEffect(() => {
    if (loadFake && fakeTodo.length === 0) {
      setLoading(true);
      let response = fetchApi<Array<IFakeTodos>>(`${linkTodo}?_limit=10`).then(
        (res) => {
          setFakeTodo(res);
          setLoading(false);
        }
      );
    }
  }, [loadFake]); //Получаем фейковы тудушки по просьбе пользователя
  const onAddNewTodo = (title: string) => {
    //Общий объект
    const newTodo: INewTodo = {
      id: Date.now(),
      title,
      completed: false,
    };
    if (!loadFake) {
      //Для личный ТУДУШЕК
      setTodos((prev) => {
        return [newTodo, ...prev];
      });
    } else {
      //Фейковые Тудушку
      newTodo.userId = 1;
      let response = fetchApi<Array<IFakeTodos>>(
        `${linkTodo}`,
        "POST",
        newTodo
      ).then((res) => {
        setFakeTodo((prev) => {
          return prev.concat(res);
        });
      });
    }
  };
  const onCompletedHandler = (id: number) => {
    if (loadFake) {
      //При фейковой запросе Тудушек отмечаем выполненые/невыполненые
      let newBody: Array<IFakeTodos> = fakeTodo
        .filter((fake) => fake.id === id)
        .map((fake) => ({
          ...fake,
          completed: !fake.completed,
        }));
      let response = fetchApi<responseCompleted>(
        `${linkTodo}`,
        "PATCH",
        newBody,
        id
      );
      response.then((res) => {
        setFakeTodo((prev) => {
          return prev.map((item) => {
            if (item.id === res[0].id) {
              return {
                ...item,
                completed: !item.completed,
              };
            }
            return item;
          });
        });
      });
    } else {
      //В личных Тудушках отмечаем выполненые/невыполненые
      setTodos((prev) => {
        return prev.map((todo) => {
          if (todo.id === id) {
            return {
              ...todo,
              completed: !todo.completed,
            };
          }
          return todo;
        });
      });
    }
  };
  const onDeleteTodo = (id: number) => {
    if (!loadFake) {
      //При удаление личных Тудушек - спрашиваем подтверждениие
      let answer = completedHandlerString<Itodos>(todos, id);
      confirmDeleteTodo(answer, setTodos, id);
    } else {
      //При удаление личных Тудушек - спрашиваем подтверждениие
      let answer = completedHandlerString<IFakeTodos>(fakeTodo, id);
      confirmDeleteTodo(answer, setFakeTodo, id, true);
    }
  };
  const onChangeSort = (e: eventSelectType) => {
    let newValue = e.target.value;
    // @ts-ignore
    setSort(newValue);
  };
  const onChangeCompleted = (e: eventSelectType) => {
    let newValue = e.target.value;
    // @ts-ignore
    setCompleted(newValue);
  };
  const onChangeMyTodos = () => {
    setLoadFake((prev) => !prev);
  };
  return (
    <>
      <FakeTodos changeTodo={onChangeMyTodos} loadFake={loadFake} />
      <div className={"todo"}>
        <div className={"todo__body"}>
          <TodoForm
            addTodo={onAddNewTodo}
            sort={sort}
            completed={completed}
            onChangeSort={onChangeSort}
            onChangeCompleted={onChangeCompleted}
            countMyTodos={todos.length}
            countFakeTodos={fakeTodo.length}
            loadFake={loadFake}
          />
          <TodoList
            todos={!loadFake ? todos : fakeTodo}
            deleteTodo={onDeleteTodo}
            onChangeCompleted={onCompletedHandler}
            sort={sort}
            completed={completed}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}

export default App;

function completedHandlerString<T>(array: Array<T>, id: number): string {
  return array
    .filter((todo: T) => {
      // @ts-ignore
      return todo.id === id;
    })
    .map((todo: T) => {
      // @ts-ignore
      return todo.completed;
    })
    .join();
}
function confirmQuestion(
  title: string,
  func: any,
  id: number,
  fake: boolean = false
) {
  if (window.confirm(title)) {
    switch (fake) {
      case false:
        func((prev: any) => {
          return prev.filter((num: Itodos | IFakeTodos) => num.id !== id);
        });
        break;
      case true:
        let response = fetchApi<Array<IFakeTodos>>(
          `${linkTodo}${id}`,
          "DELETE"
        ).then((res) => {
          func((prev: Array<IFakeTodos>) => {
            return prev.filter((num: IFakeTodos) => num.id !== id);
          });
        });
        break;
      default:
        break;
    }
    // if (!fake) {
    //   func((prev: any) => {
    //     return prev.filter((num: Itodos | IFakeTodos) => num.id !== id);
    //   });
    // } else {
    //   let response = fetchApi<Array<IFakeTodos>>(
    //     `${linkTodo}${id}`,
    //     "DELETE"
    //   ).then((res) => {
    //     func((prev: Array<IFakeTodos>) => {
    //       return prev.filter((num: IFakeTodos) => num.id !== id);
    //     });
    //   });
    // }
  }
}

function confirmDeleteTodo(
  completed: string,
  func: any,
  id: number,
  fake: boolean = false
) {
  let done = "Вы дейсвтиетльно выполнили эту задачу?";
  let undone = "Вы же еще не выполнили эту задачу?";
  switch (fake) {
    case false:
      if (completed === "true") {
        confirmQuestion(done, func, id);
      } else if (completed === "false") {
        confirmQuestion(undone, func, id);
      }
      break;
    case true:
      if (completed === "true") {
        confirmQuestion(done, func, id, fake);
      } else if (completed === "false") {
        confirmQuestion(undone, func, id, fake);
      }
      break;
    default:
      break;
  }
}

async function fetchApi<T>(
  url: string,
  method: string = "GET",
  body?: Array<IFakeTodos> | IFakeTodos | null,
  id?: number
): Promise<T> {
  let link = id ? `${url}${id}` : `${url}`;
  let response = await fetch(`${link}`, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  if (!response.ok) {
    throw new Error("Все пропало, до следующей перезагрузки");
  }
  return (await response.json()) as Promise<T>;
}
