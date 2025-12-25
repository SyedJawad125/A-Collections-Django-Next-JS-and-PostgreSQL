from rest_framework.views import APIView
from rest_framework.response import Response
from utils.reusable_functions import (create_response, get_first_error)
from rest_framework import status
from utils.response_messages import *
from utils.helpers import paginate_data
from utils.enums import *


class BaseView(APIView):
    serializer_class = None
    filterset_class = None
    list_serializer = None
    select_related_args = ()
    prefetch_related_args = ()
    module = None
    extra_filters = {}

    def post_(self, request):
        try:
            serialized_data = self.serializer_class(data=request.data, context={'request': request})
            if serialized_data.is_valid():
                obj = serialized_data.save(created_by=request.user)
                serialized_resp = self.serializer_class(obj, context={'request': request}).data
                return Response(create_response(SUCCESSFUL, serialized_resp), status=status.HTTP_201_CREATED)
            else:
                return Response(create_response(get_first_error(serialized_data.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_400_BAD_REQUEST)


    def get_(self, request):
        try:
            if request.query_params.get('api_type') and request.query_params.get('api_type') in ['list', 'cards'] and self.list_serializer:
                self.serializer_class = self.list_serializer
            if request.query_params.get('id'):
                instance = self.serializer_class.Meta.model.objects.filter(deleted=False, id=request.query_params.get('id', None),
                                                                           **self.extra_filters).first()
                if not instance:
                    return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
                serialized_data = self.serializer_class(instance, context={'request': request}).data
                count = 1
            else:
                order = request.query_params.get('order', 'desc')
                order_by = request.query_params.get('order_by', "created_at")
                if order and order_by:
                    if order == "desc":
                        order_by = f"-{order_by}"
                    else:
                        order_by = order_by
                instances = self.serializer_class.Meta.model.objects.filter(deleted=False,
                                                                            **self.extra_filters).order_by(order_by)
                if self.filterset_class:
                    filtered_instances = self.filterset_class(request.GET, queryset=instances).qs
                    data, count = paginate_data(filtered_instances, request)
                else:
                    data, count = paginate_data(instances, request)
                serialized_data = self.serializer_class(data, many=True, context={'request': request}).data
            return Response(create_response(SUCCESSFUL, serialized_data, count), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch_(self, request):
        try:
            if request.query_params.get('id'):
                instance = self.serializer_class.Meta.model.objects.filter(deleted=False, id=request.query_params.get('id', None)).first()
                if instance:
                    serialized_data = self.serializer_class(instance, data=request.data, partial=True,
                                                            context={'request': request, 'id': instance.id})
                    if serialized_data.is_valid():
                        resp = serialized_data.save(updated_by=request.user)
                        serialized_resp = self.serializer_class(resp, context={'request': request}).data
                        return Response(create_response(SUCCESSFUL, serialized_resp), status=status.HTTP_200_OK)
                    else:
                        return Response(create_response(get_first_error(serialized_data.errors)),
                                        status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            else:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_400_BAD_REQUEST)

    def delete_(self, request):
        try:
            if request.query_params.get('id'):
                instance = self.serializer_class.Meta.model.objects.filter(deleted=False, id=request.query_params.get('id', None)).first()
                if instance:
                    instance.deleted = True
                    instance.updated_by = request.user
                    instance.save()
                    serialized_resp = self.serializer_class(instance).data
                    return Response(create_response(SUCCESSFUL, serialized_resp), status=status.HTTP_200_OK)
                else:
                    return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            else:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
