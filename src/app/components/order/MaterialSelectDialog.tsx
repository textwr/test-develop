import { useEffect, useMemo, useState } from "react";
import type { ItemInfo } from "@/app/api/itemApi";
import type { UnitPriceStandardRecord } from "@/app/api/unitPriceStandardApi";
import { AppButton } from "@/app/components/common/AppButton";
import { LoadingOverlay } from "@/app/components/common/LoadingOverlay";
import { SelectionDialogFrame } from "@/app/components/order/SelectionDialogFrame";
import { resolvePurchaseUnitPrice } from "@/app/utils/purchaseOrderUtils";
import { cn } from "@/app/utils/cn";

type MaterialSelectDialogProps = {
  clientNumber: string;
  isLoading: boolean;
  items: ItemInfo[];
  open: boolean;
  unitPrices: UnitPriceStandardRecord[];
  onClose: () => void;
  onConfirm: (selectedItems: ItemInfo[]) => void;
};

type DisplayItem = {
  id: string;
  item: ItemInfo;
  unitPrice: number | null;
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

/**
 * 다중 선택 다이얼로그는 같은 행을 다시 클릭하면 선택이 해제되어야 하므로
 * 현재 선택 배열을 불변 방식으로 갱신하는 공통 토글 함수를 분리한다.
 */
function toggleSelectedId(currentIds: string[], targetId: string) {
  return currentIds.includes(targetId) ? currentIds.filter((id) => id !== targetId) : [...currentIds, targetId];
}

/**
 * 발주 품목 선택 다이얼로그는 계정구분과 검색어 조합으로 빠르게 좁혀야 하므로
 * 화면 렌더링 전에 표시용 행 데이터를 한 번 정규화해 둔다.
 */
function buildDisplayItems(clientNumber: string, items: ItemInfo[], unitPrices: UnitPriceStandardRecord[]): DisplayItem[] {
  return items.map((item, index) => ({
    id: item.id ?? `${item.품번 ?? "item"}-${index}`,
    item,
    unitPrice: resolvePurchaseUnitPrice(clientNumber, item.품번?.trim() ?? "", unitPrices),
  }));
}

/**
 * 발주 등록/수정 화면에서 품목 마스터를 선택할 수 있는 다이얼로그다.
 * 구매 단가와 계정구분까지 함께 보여 줘서 사용자가 발주 품목을 빠르게 확인하고 고를 수 있게 한다.
 */
export function MaterialSelectDialog({
  clientNumber,
  isLoading,
  items,
  open,
  onClose,
  onConfirm,
  unitPrices,
}: MaterialSelectDialogProps) {
  const [category, setCategory] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setCategory("전체");
      setKeyword("");
      setPage(1);
      setPageSize(20);
      setSelectedIds([]);
    }
  }, [open]);

  const categoryOptions = useMemo(() => {
    const values = items
      .map((item) => item.계정구분?.trim())
      .filter((value): value is string => Boolean(value));

    return ["전체", ...new Set(values)];
  }, [items]);

  const allDisplayItems = useMemo(
    () => buildDisplayItems(clientNumber, items, unitPrices),
    [clientNumber, items, unitPrices],
  );

  const displayItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return allDisplayItems.filter(({ item }) => {
      const matchesCategory = category === "전체" ? true : item.계정구분 === category;

      if (!normalizedKeyword) {
        return matchesCategory;
      }

      const itemCode = item.품번?.toLowerCase() ?? "";
      const itemName = item.품명?.toLowerCase() ?? "";
      const spec = item.규격?.toLowerCase() ?? "";
      return matchesCategory && (
        itemCode.includes(normalizedKeyword) ||
        itemName.includes(normalizedKeyword) ||
        spec.includes(normalizedKeyword)
      );
    });
  }, [allDisplayItems, category, keyword]);

  const pageCount = Math.max(1, Math.ceil(displayItems.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedItems = displayItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const isAllChecked = pagedItems.length > 0 && pagedItems.every((displayItem) => selectedIds.includes(displayItem.id));

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  return (
    <SelectionDialogFrame
      description="발주에 추가할 품목을 선택하세요."
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
              disabled={selectedIds.length === 0}
              onClick={() => {
                const nextItems = allDisplayItems
                  .filter((displayItem) => selectedIds.includes(displayItem.id))
                  .map((displayItem) => displayItem.item);
                onConfirm(nextItems);
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
      title="품목 선택"
      toolbar={
        <div className="flex items-center gap-3">
          <select
            className="h-[54px] w-[192px] rounded-[14px] border border-[#edf0f5] bg-[#f3f4f6] px-5 text-[15px] text-[#7b8190] outline-none"
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            value={category}
          >
            {categoryOptions.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
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
          message="품목 목록을 불러오는 중입니다."
        />
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[72px] bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">
                <input
                  checked={isAllChecked}
                  className="h-4 w-4 rounded border-[#d1d5db]"
                  onChange={(event) => {
                    setSelectedIds((current) => {
                      if (event.target.checked) {
                        const pageIds = pagedItems.map((displayItem) => displayItem.id);
                        return Array.from(new Set([...current, ...pageIds]));
                      }

                      const pageIds = new Set(pagedItems.map((displayItem) => displayItem.id));
                      return current.filter((id) => !pageIds.has(id));
                    });
                  }}
                  type="checkbox"
                />
              </th>
              <th className="w-[90px] bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">No.</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">품번</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">품명</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">계정구분</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">규격</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">단위</th>
              <th className="bg-[#5364d2] px-4 py-4 text-center text-[15px] font-semibold text-white">구매단가</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.length > 0 ? (
              pagedItems.map((displayItem, index) => {
                const { item, unitPrice } = displayItem;
                const isSelected = selectedIds.includes(displayItem.id);

                return (
                  <tr
                    className={cn(
                      "cursor-pointer border-b border-[#dfe3ea] text-[15px] text-[#4b5563] last:border-b-0 hover:bg-[#f7f8ff]",
                      isSelected && "bg-[#dfeaff]",
                    )}
                    key={displayItem.id}
                    onClick={() => setSelectedIds((current) => toggleSelectedId(current, displayItem.id))}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        checked={isSelected}
                        className="h-4 w-4 rounded border-[#d1d5db]"
                        onChange={() => setSelectedIds((current) => toggleSelectedId(current, displayItem.id))}
                        onClick={(event) => event.stopPropagation()}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">{(safePage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-4 text-center">{item.품번 ?? "-"}</td>
                    <td className="px-4 py-4 text-center">{item.품명 ?? "-"}</td>
                    <td className="px-4 py-4 text-center">{item.계정구분 ?? "-"}</td>
                    <td className="px-4 py-4 text-center">{item.규격 ?? "-"}</td>
                    <td className="px-4 py-4 text-center">{item.포장단위 ?? item.폭단위 ?? "-"}</td>
                    <td className="px-4 py-4 text-center">{unitPrice === null ? "-" : unitPrice.toLocaleString("ko-KR")}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-4 py-10 text-center text-[14px] text-[#9ca3af]"
                  colSpan={8}
                >
                  표시할 품목이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SelectionDialogFrame>
  );
}
