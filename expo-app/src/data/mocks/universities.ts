// ЗАГЛУШКА: контакты психологической службы ВГМУ и её сотрудники вымышлены (handoff/docs/10-placeholders.md).
// Названия и города вузов настоящие. У остальных вузов контактов нет: новые телефоны и адреса не выдумываем,
// перед публикацией сюда попадут проверенные данные служб ВГМУ, БГМУ, ГрГМУ и ГомГМУ.
import type { UniversitiesRepo, University } from '@/data/repos/UniversitiesRepo';

const UNIVERSITIES: University[] = [
  {
    id: 'vsmu',
    shortName: 'ВГМУ',
    fullName: 'Витебский государственный медицинский университет',
    city: 'Витебск',
    service: {
      name: 'Психологическая служба ВГМУ',
      address: 'Учебный корпус № 1, кабинет 214',
      hours: 'Пн–Пт 9:00–17:00',
      phone: '+375 212 00-00-00',
      verifiedAt: '2026-09-01',
      staff: [
        {
          id: 'vsmu-1',
          name: 'Наталья Бусько',
          nameDative: 'Наталье Бусько',
          role: 'Психолог',
          format: 'очно',
          phone: '+375 212 00-00-01',
        },
        {
          id: 'vsmu-2',
          name: 'Сергей Ровба',
          nameDative: 'Сергею Ровбе',
          role: 'Психолог',
          format: 'очно и онлайн',
          phone: '+375 212 00-00-02',
        },
      ],
    },
  },
  {
    id: 'bsmu',
    shortName: 'БГМУ',
    fullName: 'Белорусский государственный медицинский университет',
    city: 'Минск',
    service: null,
  },
  {
    id: 'grsmu',
    shortName: 'ГрГМУ',
    fullName: 'Гродненский государственный медицинский университет',
    city: 'Гродно',
    service: null,
  },
  {
    id: 'gomsmu',
    shortName: 'ГомГМУ',
    fullName: 'Гомельский государственный медицинский университет',
    city: 'Гомель',
    service: null,
  },
  {
    id: 'other',
    shortName: 'Другой вуз',
    fullName: 'Укажу позже или выберу общий список служб',
    city: null,
    service: null,
  },
];

export const mockUniversitiesRepo: UniversitiesRepo = {
  all: () => UNIVERSITIES,
  byId: (id) => UNIVERSITIES.find((university) => university.id === id) ?? null,
  fresh: async () => null,
};

