import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "SUPPORT BOT",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Обзор",
            url: "/",
          },
        ],
      },
      {
        title: "Тикеты",
        url: "/tickets",
        icon: Icons.Table,
        items: [
          {
            title: "Все тикеты",
            url: "/tickets",
          },
          {
            title: "Новые",
            url: "/tickets?status=new",
          },
          {
            title: "В работе",
            url: "/tickets?status=open",
          },
        ],
      },
      {
        title: "Пользователи",
        url: "/users",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Менеджеры",
        url: "/managers",
        icon: Icons.User,
        items: [],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Settings",
        icon: Icons.Authentication,
        items: [
          {
            title: "Настройки",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
];
