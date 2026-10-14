/** Общие настройки агента (фронт + backend). */
export const supportAgentConfig = {
  shopName: 'АвтоДеталь',
  workshopName: 'АвтоМастер',
  workshopPhone: '+7 (495) 123-45-67',
  workshopPhoneTel: '+74951234567',
  agentName: 'Алексей',
  agentRole: 'Консультант по автотоварам',
  agentInitials: 'АЛ',
};

export function buildWorkshopRedirectMessage() {
  const { workshopName, workshopPhone } = supportAgentConfig;
  return `По этому вопросу лучше подскажут в автомастерской «${workshopName}». Позвоните: ${workshopPhone} (пн–сб, 9:00–20:00).`;
}
