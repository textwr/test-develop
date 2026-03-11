import { AppButton } from "@/app/components/common/AppButton";

type PlaceholderPageProps = {
  groupLabel: string;
  title: string;
};

export function PlaceholderPage({ groupLabel, title }: PlaceholderPageProps) {
  return (
    <section className="flex min-h-[calc(100vh-110px)] items-start">
      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">{groupLabel}</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-500">
          이 메뉴는 현재 프로토타입 더미 페이지입니다. 공용 레이아웃과 네비게이션 구조는 연결되어 있으며,
          실제 업무 로직은 같은 Tailwind 기반 공용 컴포넌트 구조를 따라 이후 단계에서 확장할 수 있습니다.
        </p>
        <div className="mt-6">
          <AppButton variant="secondary">더미 기능 안내</AppButton>
        </div>
      </div>
    </section>
  );
}
