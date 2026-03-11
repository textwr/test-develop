import { useEffect, useMemo, useState } from "react";
import type { ClientInfo } from "@/app/api/clientApi";
import { AppButton } from "@/app/components/common/AppButton";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { cn } from "@/app/utils/cn";
import { SelectionDialogFrame } from "@/app/components/order/SelectionDialogFrame";

type ClientSelectDialogProps = {
  clients: ClientInfo[];
  isLoading: boolean;
  open: boolean;
  onClose: () => void;
  onSelect: (client: ClientInfo) => void;
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function ClientSelectDialog({ clients, isLoading, open, onClose, onSelect }: ClientSelectDialogProps) {
  const [searchField, setSearchField] = useState<"all" | "거래처번호" | "거래처명">("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedClientNumber, setSelectedClientNumber] = useState("");

  useEffect(() => {
    if (!open) {
      setKeyword("");
      setPage(1);
      setPageSize(20);
      setSelectedClientNumber("");
      setSearchField("all");
    }
  }, [open]);

  const filteredClients = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return clients;
    }

    return clients.filter((client) => {
      const clientNumber = client.거래처번호?.toLowerCase() ?? "";
      const clientName = client.거래처명?.toLowerCase() ?? "";

      if (searchField === "거래처번호") {
        return clientNumber.includes(normalizedKeyword);
      }

      if (searchField === "거래처명") {
        return clientName.includes(normalizedKeyword);
      }

      return clientNumber.includes(normalizedKeyword) || clientName.includes(normalizedKeyword);
    });
  }, [clients, keyword, searchField]);

  const pageCount = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedClients = filteredClients.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selectedClient = filteredClients.find((client) => client.거래처번호 === selectedClientNumber);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  return (
    <SelectionDialogFrame
      description="거래처를 선택하세요."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-[14px] text-[#5d6678]">
            <select
              className="h-[48px] min-w-[96px] rounded-[12px] border border-[#e7e9f0] bg-[#f3f4f6] px-5 text-[15px] outline-none"
              onChange={(event) => {
                setPage(1);
                setPageSize(Number(event.target.value));
              }}
              value={pageSize}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
            <span>
              Page {safePage} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <AppButton
                className="!min-h-10 !rounded-full !px-2 text-[24px] text-[#111827]"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                size="sm"
                variant="ghost"
              >
                ‹
              </AppButton>
              <span className="inline-flex min-w-[42px] justify-center rounded-[12px] bg-[#e5e7eb] px-4 py-2.5 text-[15px] font-semibold text-[#4b5563]">
                {safePage}
              </span>
              <AppButton
                className="!min-h-10 !rounded-full !px-2 text-[24px] text-[#111827]"
                disabled={safePage >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                size="sm"
                variant="ghost"
              >
                ›
              </AppButton>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AppButton
              className="min-w-[110px] !rounded-[14px] border-[#d1d5db] !text-[15px]"
              onClick={onClose}
              size="sm"
              variant="outline"
            >
              닫기
            </AppButton>
            <AppButton
              className="min-w-[110px] !rounded-[14px] !text-[15px]"
              disabled={!selectedClient}
              onClick={() => {
                if (selectedClient) {
                  onSelect(selectedClient);
                }
              }}
              size="sm"
              variant="dark"
            >
              선택
            </AppButton>
          </div>
        </div>
      }
      onClose={onClose}
      open={open}
      title="거래처 선택"
      toolbar={
        <div className="flex items-center gap-3">
          <select
            className="h-[54px] w-[192px] rounded-[14px] border border-[#edf0f5] bg-[#f3f4f6] px-5 text-[15px] text-[#7b8190] outline-none"
            onChange={(event) => {
              setPage(1);
              setSearchField(event.target.value as "all" | "거래처번호" | "거래처명");
            }}
            value={searchField}
          >
            <option value="all">카테고리</option>
            <option value="거래처번호">거래처번호</option>
            <option value="거래처명">거래처명</option>
          </select>
          <div className="flex flex-1 items-center gap-4">
            <input
              className="h-[54px] w-full rounded-[14px] border border-[#edf0f5] bg-[#f3f4f6] px-5 text-[15px] text-[#4b5563] outline-none placeholder:text-[#989fb0]"
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="검색어를 입력하세요"
              value={keyword}
            />
            <span className="inline-flex h-[54px] w-[54px] items-center justify-center rounded-[14px] text-[#111827]">
              <svg
                fill="none"
                height="26"
                viewBox="0 0 24 24"
                width="26"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L16.65 16.65M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
          </div>
        </div>
      }
    >
      <div className="relative overflow-hidden rounded-[0px] border border-[#dfe3ea] border-x-0 border-b-0">
        <LoadingOverlay
          isVisible={isLoading}
          message="거래처 목록을 불러오는 중입니다."
        />
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[100px] bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">No.</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">거래처번호</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">거래처명</th>
            </tr>
          </thead>
          <tbody>
            {pagedClients.length > 0 ? (
              pagedClients.map((client, index) => {
                const isSelected = client.거래처번호 === selectedClientNumber;
                return (
                  <tr
                    className={cn(
                      "cursor-pointer border-b border-[#dfe3ea] text-[15px] text-[#4b5563] last:border-b-0 hover:bg-[#f7f8ff]",
                      isSelected && "bg-[#dfeaff]",
                    )}
                    key={client.id ?? `${client.거래처번호}-${index}`}
                    onClick={() => setSelectedClientNumber(client.거래처번호 ?? "")}
                  >
                    <td className="px-4 py-4 text-center">{(safePage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-4 text-center text-[16px]">{client.거래처번호 ?? "-"}</td>
                    <td className="px-4 py-4 text-center text-[16px]">{client.거래처명 ?? "-"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-4 py-10 text-center text-[14px] text-[#9ca3af]"
                  colSpan={3}
                >
                  표시할 거래처가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SelectionDialogFrame>
  );
}
