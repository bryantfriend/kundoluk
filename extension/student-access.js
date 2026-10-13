/* English guidance only: never reads credential values or activates reset controls. */
(() => {
  const glossary = new Map([
    ['Менин классым','My class'], ['Мой класс','My class'], ['Мои классы','My classes'],
    ['Жылдык окуу табели','Annual school report'], ['Портфолио','Portfolio'],
    ['Окуучулар','Students'], ['Ученики','Students'], ['Учащиеся','Students'],
    ['Пароль','Password'], ['Новый пароль','New password'],
    ['Повторите пароль','Repeat password'], ['Подтвердите пароль','Confirm password'],
    ['Сбросить пароль','Reset password'], ['Сброс пароля','Password reset'],
    ['Сменить пароль','Change password'], ['Изменить пароль','Change password'],
    ['Сохранить','Save'], ['Сактоо','Save'],
    ['Отмена','Cancel'], ['Жокко чыгаруу','Cancel'],
    ['Логин','Login ID'], ['ПИН','Personal identification number (not necessarily a password)']
  ]);
  const normalized = new Map([...glossary].map(([k,v])=>[k.toLocaleLowerCase(),v]));
  function labels() {
    const found=new Map();
    for(const e of document.querySelectorAll('button, a, label, [role="button"], [role="treeitem"], h1, h2, h3, h4, h5, h6, .info-label')) {
      if(!e.getClientRects().length)continue;
      // Inspect labels only. Never inspect inputs, student rows, or credential values.
      const raw=(e.getAttribute('aria-label') || globalThis.KundolukEnglish?.originalText(e) || e.textContent || '').replace(/\s+/g,' ').trim();
      const text=raw.replace(/[\uE000-\uF8FF]/g,'').trim();
      const translated=normalized.get(text.toLocaleLowerCase());
      if(translated)found.set(text,translated);
    }
    return [...found];
  }
  globalThis.KundolukStudentAccess={labels};
})();
