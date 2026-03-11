import { useState } from "react";
import { AppButton } from "../common/AppButton";

type PlaceholderPageProps = {
  groupLabel: string;
  title: string;
};

export function PlaceholderPage({ groupLabel, title }: PlaceholderPageProps) {
  const [message, setMessage] = useState("이 메뉴는 더미 페이지로 연결되어 있습니다.");

  const handleClick = () => {
    const nextMessage = `${title} 기능은 현재 프로토타입 더미 기능으로만 준비되어 있습니다.`;
    setMessage(nextMessage);
    console.log("[placeholder] Dummy page requested.", {
      groupLabel,
      title,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <section className="placeholder-page">
      <div className="placeholder-page__card">
        <p className="placeholder-page__eyebrow">{groupLabel}</p>
        <h1 className="placeholder-page__title">{title}</h1>
        <p className="placeholder-page__description">
          공용 레이아웃과 페이지 이동 구조는 먼저 연결해 두었고, 실제 업무 로직은 이후 단계에서 같은 공용
          컴포넌트 체계로 확장할 수 있도록 준비했습니다.
        </p>
        <p className="placeholder-page__message">{message}</p>
        <AppButton
          onClick={handleClick}
          variant="secondary"
        >
          더미 기능 실행
        </AppButton>
      </div>
    </section>
  );
}
