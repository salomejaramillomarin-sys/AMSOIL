from decimal import Decimal

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Factura, FacturaLinea, Producto, Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["codigo", "nombre", "idioma", "pais"]


class LoginSerializer(serializers.Serializer):
    codigo = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        usuario = authenticate(
            request=self.context.get("request"),
            codigo=attrs["codigo"].strip(),
            password=attrs["password"],
        )
        if usuario is None:
            raise serializers.ValidationError("Código o contraseña incorrectos.")
        if not usuario.is_active:
            raise serializers.ValidationError("Este usuario está inactivo.")

        attrs["usuario"] = usuario
        return attrs


class AjustesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["idioma", "pais"]


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ["codigo", "categoria", "factor", "costo", "creado_en"]
        read_only_fields = ["creado_en"]

    def validate_codigo(self, value):
        return value.strip().upper()


class FacturaLineaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacturaLinea
        fields = [
            "codigo_producto",
            "cantidad",
            "reciclaje",
            "petroleo",
            "grasa",
            "ivu",
            "costo",
            "total",
        ]


class FacturaSerializer(serializers.ModelSerializer):
    lineas = FacturaLineaSerializer(many=True, read_only=True)

    class Meta:
        model = Factura
        fields = ["id", "empleado", "fecha_hora", "lineas"]


class FacturaLineaInputSerializer(serializers.Serializer):
    codigo = serializers.CharField()
    cantidad = serializers.IntegerField(min_value=1)


class FacturaCreateSerializer(serializers.Serializer):
    empleado = serializers.CharField(max_length=100)
    lineas = FacturaLineaInputSerializer(many=True)

    def validate_empleado(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Ingresa el nombre del empleado que atendió.")
        return value

    def validate_lineas(self, value):
        if not value:
            raise serializers.ValidationError("Agrega al menos un producto a la factura.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        usuario = request.user if request.user.is_authenticated else None

        codigos = [linea["codigo"].strip().upper() for linea in validated_data["lineas"]]
        productos_por_codigo = {p.codigo: p for p in Producto.objects.filter(codigo__in=codigos)}

        faltantes = [codigo for codigo in codigos if codigo not in productos_por_codigo]
        if faltantes:
            raise serializers.ValidationError(
                {"lineas": f"Producto(s) no encontrado(s): {', '.join(sorted(set(faltantes)))}"}
            )

        factura = Factura.objects.create(usuario=usuario, empleado=validated_data["empleado"])

        lineas_a_crear = []
        for linea, codigo in zip(validated_data["lineas"], codigos):
            producto = productos_por_codigo[codigo]
            cantidad = linea["cantidad"]
            factor = producto.factor
            costo_unitario = producto.costo
            total = (Decimal(cantidad) * costo_unitario).quantize(Decimal("0.01"))
            cantidad_por_factor = (Decimal(cantidad) * factor).quantize(Decimal("0.01"))

            lineas_a_crear.append(
                FacturaLinea(
                    factura=factura,
                    producto=producto,
                    codigo_producto=producto.codigo,
                    cantidad=cantidad,
                    reciclaje=cantidad_por_factor if producto.categoria == Producto.Categoria.RECICLAJE else None,
                    petroleo=cantidad_por_factor if producto.categoria == Producto.Categoria.PETROLEO else None,
                    grasa=cantidad_por_factor if producto.categoria == Producto.Categoria.GRASA else None,
                    ivu=cantidad_por_factor if producto.categoria == Producto.Categoria.IVU else None,
                    costo=costo_unitario,
                    total=total,
                )
            )

        FacturaLinea.objects.bulk_create(lineas_a_crear)
        return factura
