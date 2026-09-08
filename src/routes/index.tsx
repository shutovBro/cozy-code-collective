import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const GameApp = lazy(() => import("../GameApp"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "БЕЛКА — казахстанская карточная игра онлайн" },
      {
        name: "description",
        content:
          "Играйте в Белку против ботов: 4 игрока, 2 команды, 32 карты, валеты — постоянные козыри. Статистика, достижения и три темы стола.",
      },
      { property: "og:title", content: "БЕЛКА — карточная игра" },
      {
        property: "og:description",
        content: "Классическая Белка против умных ботов. Играйте прямо в браузере.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Loader() {
  return (
    <div className="felt-table flex h-full w-full items-center justify-center">
      <span className="anim-pulse-gold text-5xl text-[#c9a227]">♠</span>
    </div>
  );
}

function Index() {
  return (
    <main className="h-full w-full">
      <ClientOnly fallback={<Loader />}>
        <Suspense fallback={<Loader />}>
          <GameApp />
        </Suspense>
      </ClientOnly>
    </main>
  );
}
