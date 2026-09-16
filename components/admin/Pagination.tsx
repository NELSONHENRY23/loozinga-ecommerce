import Link from "next/link";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    basePath: string;
}

export default function Pagination({currentPage, totalPages, basePath,}: PaginationProps){
    if (totalPages <= 1 ) return null;

    const page = Math.min(Math.max(currentPage, 1), totalPages);

    const pageNumbers = Array.from({length: totalPages}, (_, index) => index + 1).filter((number) => number === 1 || number === totalPages || Math.abs(number - page) <= 2);

    const linkStyle = "rounded border px-3 py-2 text-sm hover:bg-gray-100";

    const activeStyle = "bg-blue-600 text-white hover:bg-blue-600";

    return(
        <nav
            aria-label="Pagination"
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
            {/* Previous */}
            {
                page > 1 ? (
                    <Link 
                        href={`${basePath}?page=${page - 1}`}
                        className={linkStyle}
                    >
                    Previous</Link>
                ): (
                    <span className={`${linkStyle} cursor-not-allowed opacity-50`}>
                        Previous
                    </span>
                )
            }

            {/* Page Numbers */}
            {
                pageNumbers.map((number, index) => (
                    <div
                       key={number}
                       className="flex items-center gap-2"
                    >
                        {
                            index > 0 && number - pageNumbers[index - 1] > 1 && (<span>...</span>)
                        }
                        <Link
                           href={`${basePath}?page=${number}`}
                           aria-current={page === number ? "page" : undefined}
                           className={`${linkStyle} ${page === number ? activeStyle : ""}`}
                        >
                        {number}
                        </Link>
                    </div>
                ))
            }

            {/* Next */}
            {
                page < totalPages ? (
                    <Link 
                        href={`${basePath}?page=${page + 1}`}
                        className={linkStyle}
                    >
                        Next
                    </Link>
                ) : (
                    <span className={`${linkStyle} cursor-not-allowed opacity-50`}>
                        Next
                    </span>
                )
            }
        </nav>
    )
}