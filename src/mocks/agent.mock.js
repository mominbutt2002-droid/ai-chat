import { supportAgentConfig } from '../../shared/supportAgent.config.js';

const { agentName, agentRole, agentInitials, shopName } = supportAgentConfig;

export const mockAgent = {
  id: 'mock-agent-1',
  name: agentName,
  role: agentRole,
  initials: agentInitials,
  status: 'online',
  statusLabel: 'В сети',
  greeting:
    `Здравствуйте! Я ${agentName}, консультант «${shopName}». Помогу подобрать автотовары: масла, фильтры, тормоза, АКБ, шины и запчасти. Напишите марку и модель авто — или выберите быстрый вопрос.`,
};
