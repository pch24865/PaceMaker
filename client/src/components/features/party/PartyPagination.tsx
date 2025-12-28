import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
  currentPage: number;   // 현재 보고 있는 페이지
  totalPages: number;    // 전체 페이지 수 (lastPage)
  onPageChange: (page: number) => void; // 페이지 클릭 시 실행할 함수
}

export function PartyPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  
  // [로직] 현재 페이지 주변의 번호들을 계산해서 배열로 만드는 함수
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // 한 번에 보여줄 페이지 개수 (조절 가능)

    // 보여줄 시작 페이지와 끝 페이지 계산
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 끝 페이지가 부족하면 시작 페이지를 앞으로 당김
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <Pagination className="my-8">
      <PaginationContent>
        {/* 1. 이전 버튼 */}
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            // 첫 페이지면 클릭 안 되게 흐리게 처리
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* 2. 페이지 번호들 (반복문) */}
        {getPageNumbers().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage} // 현재 페이지는 진하게 표시
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* 3. 다음 버튼 */}
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            // 마지막 페이지면 클릭 안 되게 흐리게 처리
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}