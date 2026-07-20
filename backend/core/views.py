from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Factura, Producto
from .serializers import (
    AjustesSerializer,
    FacturaCreateSerializer,
    FacturaSerializer,
    LoginSerializer,
    ProductoSerializer,
)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data["usuario"]
        token, _ = Token.objects.get_or_create(user=usuario)
        return Response(
            {
                "token": token.key,
                "usuario": {
                    "codigo": usuario.codigo,
                    "nombre": usuario.nombre,
                    "idioma": usuario.idioma,
                    "pais": usuario.pais,
                },
            }
        )


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductoListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductoSerializer

    def get_queryset(self):
        queryset = Producto.objects.all()
        categoria = self.request.query_params.get("categoria")
        search = self.request.query_params.get("search")

        if categoria and categoria != "todos":
            queryset = queryset.filter(categoria=categoria)
        if search:
            queryset = queryset.filter(codigo__icontains=search.strip())

        return queryset

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)


class ProductoDetailView(generics.RetrieveDestroyAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    lookup_field = "codigo"


class FacturaListCreateView(generics.ListCreateAPIView):
    queryset = Factura.objects.prefetch_related("lineas").all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return FacturaCreateSerializer
        return FacturaSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        factura = serializer.save()
        return Response(FacturaSerializer(factura).data, status=status.HTTP_201_CREATED)


class FacturaDetailView(generics.RetrieveAPIView):
    queryset = Factura.objects.prefetch_related("lineas").all()
    serializer_class = FacturaSerializer


class AjustesView(APIView):
    def get(self, request):
        return Response(AjustesSerializer(request.user).data)

    def put(self, request):
        serializer = AjustesSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
