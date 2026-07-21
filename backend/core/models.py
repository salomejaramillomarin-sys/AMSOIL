from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UsuarioManager(BaseUserManager):
    def create_user(self, codigo, password=None, **extra_fields):
        if not codigo:
            raise ValueError("El usuario debe tener un código.")
        usuario = self.model(codigo=codigo, **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, codigo, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True.")

        return self.create_user(codigo, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    class Idioma(models.TextChoices):
        ESPANOL = "ES", "Español"
        INGLES = "EN", "Inglés"

    class Pais(models.TextChoices):
        COSTA_RICA = "CR", "Costa Rica"
        REPUBLICA_DOMINICANA = "RD", "República Dominicana"
        PUERTO_RICO = "PR", "Puerto Rico"
        ESTADOS_UNIDOS = "US", "Estados Unidos"

    codigo = models.CharField(max_length=30, unique=True)
    nombre = models.CharField(max_length=100, blank=True)
    idioma = models.CharField(max_length=2, choices=Idioma.choices, default=Idioma.ESPANOL)
    pais = models.CharField(max_length=2, choices=Pais.choices, default=Pais.PUERTO_RICO)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "codigo"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.codigo


class Producto(models.Model):
    class Categoria(models.TextChoices):
        RECICLAJE = "cod-reciclaje", "Código para reciclaje"
        PETROLEO = "petroleo", "Petróleo sin reciclaje"
        GRASA = "grasa", "Grasa lubricante"
        IVU = "ivu", "IVU"

    codigo = models.CharField(max_length=30, unique=True)
    categoria = models.CharField(max_length=20, choices=Categoria.choices)
    factor = models.DecimalField(max_digits=10, decimal_places=2)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="productos_creados",
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ["codigo"]

    def __str__(self):
        return self.codigo


class Factura(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="facturas",
    )
    empleado = models.CharField(max_length=100, blank=True, default="")
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Factura"
        verbose_name_plural = "Facturas"
        ordering = ["-fecha_hora"]

    def __str__(self):
        return f"Factura #{self.pk} - {self.fecha_hora:%Y-%m-%d %H:%M}"


class FacturaLinea(models.Model):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name="lineas")
    # Se guarda tanto la referencia al producto (para trazabilidad) como una
    # copia de sus datos al momento de facturar, para que el historial no
    # cambie si el producto se edita o elimina después.
    producto = models.ForeignKey(
        Producto,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lineas_factura",
    )
    codigo_producto = models.CharField(max_length=30)
    cantidad = models.PositiveIntegerField()
    reciclaje = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    petroleo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    grasa = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ivu = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Línea de factura"
        verbose_name_plural = "Líneas de factura"

    def __str__(self):
        return f"{self.codigo_producto} x{self.cantidad}"
