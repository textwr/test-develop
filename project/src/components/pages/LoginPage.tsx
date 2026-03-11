import { useState } from "react";
import type { FormEvent } from "react";
import { AppButton } from "../common/AppButton";
import { AppField } from "../common/AppField";
import { PasswordField } from "../common/PasswordField";

type LoginPageProps = {
  backgroundImage: string;
  logoImage: string;
  onLogin: (credentials: { userId: string; password: string }) => void;
};

export function LoginPage({ backgroundImage, logoImage, onLogin }: LoginPageProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin({ password, userId });
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `linear-gradient(rgba(16, 23, 42, 0.18), rgba(16, 23, 42, 0.18)), url(${backgroundImage})` }}
    >
      <form
        className="login-card"
        onSubmit={handleSubmit}
      >
        <img
          alt="상우하이텍"
          className="login-card__logo"
          src={logoImage}
        />
        <h1 className="login-card__title">상우하이텍</h1>
        <p className="login-card__subtitle">관리자 로그인</p>

        <div className="login-card__fields">
          <AppField
            autoComplete="username"
            label="사용자 ID"
            onChange={(event) => setUserId(event.target.value)}
            placeholder="아이디를 입력하세요"
            value={userId}
          />
          <PasswordField
            autoComplete="current-password"
            label="비밀번호"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            value={password}
          />
        </div>

        <AppButton
          fullWidth
          type="submit"
        >
          로그인
        </AppButton>

        <p className="login-card__notice">
          ※주요업무 보안정보/계약서와 견적서는 외부유출이 엄격히 금지된 정보입니다.
        </p>
      </form>
    </div>
  );
}
