package com.cineverse.dto;

/**
 * PagedResponse<T> — Wrapper for paginated API responses.
 *
 * Shape:
 * {
 *   "data": [...],
 *   "page": 1,
 *   "pageSize": 20,
 *   "totalItems": 100,
 *   "totalPages": 5,
 *   "hasNext": true,
 *   "hasPrev": false
 * }
 *
 * Added by: Koushik-31368
 */
public class PagedResponse<T> {

    private final java.util.List<T> data;
    private final int  page;
    private final int  pageSize;
    private final long totalItems;
    private final int  totalPages;
    private final boolean hasNext;
    private final boolean hasPrev;

    public PagedResponse(java.util.List<T> data, int page, int pageSize, long totalItems) {
        this.data       = data;
        this.page       = page;
        this.pageSize   = pageSize;
        this.totalItems = totalItems;
        this.totalPages = pageSize > 0 ? (int) Math.ceil((double) totalItems / pageSize) : 0;
        this.hasNext    = page < this.totalPages;
        this.hasPrev    = page > 1;
    }

    public static <T> PagedResponse<T> of(java.util.List<T> data, int page, int pageSize, long total) {
        return new PagedResponse<>(data, page, pageSize, total);
    }

    public java.util.List<T> getData()    { return data;       }
    public int  getPage()                 { return page;       }
    public int  getPageSize()             { return pageSize;   }
    public long getTotalItems()           { return totalItems; }
    public int  getTotalPages()           { return totalPages; }
    public boolean isHasNext()            { return hasNext;    }
    public boolean isHasPrev()            { return hasPrev;    }
}
