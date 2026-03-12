import { useState } from "react";
import type { FormEvent } from "react";
import { AppButton } from "@/app/components/common/AppButton";
import { AppField } from "@/app/components/common/AppField";
import { PasswordField } from "@/app/components/common/PasswordField";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-white/18 backdrop-brightness-[0.92]" />
      <form
        className="relative z-10 w-full max-w-[452px] rounded-[20px] bg-white/92 px-7 pb-6 pt-14 shadow-[0_18px_44px_rgba(15,23,42,0.12)] backdrop-blur-[2px]"
        onSubmit={handleSubmit}
      >
        <img
          alt="상우하이텍"
          className="mx-auto mb-5 h-[82px] w-[82px] object-contain"
          src={logoImage}
        />
        <h1 className="text-center text-[26px] font-bold tracking-[-0.03em] text-[#0f172a]">상우하이텍</h1>
        <p className="mb-11 mt-8 text-center text-[18px] font-medium text-[#475569]">관리자 로그인</p>

        <div className="grid gap-4">
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

        <div className="mt-9">
          <AppButton
            className="text-[18px] font-medium"
            fullWidth
            type="submit"
          >
            로그인
          </AppButton>
        </div>

        <p className="mt-6 text-center text-[14px] leading-5 text-[#ef4444]">
          ※주요업무 보안정보/계약서와 견적서는 외부유출이 엄격히
          <br />
          금지된 정보입니다.
        </p>
      </form>
    </div>
  );
}
