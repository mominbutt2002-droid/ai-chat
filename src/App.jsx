import { ChatWidget } from './components/chat/ChatWidget.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';

export default function App() {
  return (
    <>
      <ThemeToggle className="theme-toggle--floating" />
      <main className="demo-page">
        <span className="demo-page__badge">Демо-страница</span>
        <h1>ОблакоСервис — облачная платформа для бизнеса</h1>
        <p>
          Это учебный лендинг: контент страницы остаётся на фоне, а чат с ИИ-агентом открывается
          виджетом в правом нижнем углу, как в Jivo.
        </p>
        <p>
          Нажмите на зелёную кнопку чата, чтобы продолжить диалог из мок-истории, отправить своё
          сообщение или выбрать быстрый ответ.
        </p>
        <p>
          Ответы агента имитируются локально: задержка 0,8–1,2 с и шаблоны по ключевым словам
          (API, стоимость, оператор).
        </p>
      </main>
      <ChatWidget />
    </>
  );
}
