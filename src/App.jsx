import { ChatWidget } from './components/chat/ChatWidget.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { supportAgentConfig } from '../shared/supportAgent.config.js';

export default function App() {
  const { shopName, workshopPhone } = supportAgentConfig;

  return (
    <>
      <ThemeToggle className="theme-toggle--floating" />
      <main className="demo-page">
        <span className="demo-page__badge">Интернет-магазин</span>
        <h1>{shopName} — автотовары с доставкой</h1>
        <p>
          Масла, фильтры, тормозные системы, аккумуляторы, шины и запчасти. В чате консультант
          отвечает только по товарам. Вопросы по ремонту в сервисе — по телефону мастерской{' '}
          {workshopPhone}.
        </p>
        <p>
          Откройте виджет в правом нижнем углу: можно продолжить демо-диалог или задать свой
          вопрос (ответ через Gemini, если настроен backend).
        </p>
      </main>
      <ChatWidget />
    </>
  );
}
