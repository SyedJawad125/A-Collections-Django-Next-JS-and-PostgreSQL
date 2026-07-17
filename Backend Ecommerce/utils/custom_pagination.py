# from rest_framework.pagination import LimitOffsetPagination


# class CustomPagination(LimitOffsetPagination):
#     def paginate_queryset(self, queryset, request, view=None):
#         self.limit = self.get_limit(request)
#         if self.limit is None:
#             return None

#         self.count = self.get_count(queryset)
#         self.offset = self.get_offset(request)
#         self.request = request
#         if self.count > self.limit and self.template is not None:
#             self.display_page_controls = True

#         if self.count == 0 or self.offset > self.count:
#             return list(), self.count
#         return list(queryset[self.offset:self.offset + self.limit]), self.count






from rest_framework.pagination import LimitOffsetPagination


class CustomPagination(LimitOffsetPagination):
    """
    FIX: the original implementation returned a bare `None` when no `limit`
    could be resolved, but returned a `(list, count)` tuple in every other
    branch. Every caller in views.py does:

        data, count = paginate_data(queryset, request)

    which unpacks a 2-tuple. If `self.limit` ever comes back `None` (e.g. no
    `limit` query param and no `default_limit` configured), the old code
    would blow up with:  TypeError: cannot unpack non-iterable NoneType

    Now every branch returns a 2-tuple, so unpacking never fails.
    """

    def paginate_queryset(self, queryset, request, view=None):
        self.limit = self.get_limit(request)
        if self.limit is None:
            # FIX: was `return None` — now always a (list, count) tuple.
            return list(queryset), self.get_count(queryset)

        self.count = self.get_count(queryset)
        self.offset = self.get_offset(request)
        self.request = request
        if self.count > self.limit and self.template is not None:
            self.display_page_controls = True

        if self.count == 0 or self.offset > self.count:
            return list(), self.count
        return list(queryset[self.offset:self.offset + self.limit]), self.count