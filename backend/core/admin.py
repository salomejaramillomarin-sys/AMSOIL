from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Factura, FacturaLinea, Producto, Usuario


class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ["codigo", "nombre", "idioma", "pais", "is_staff", "is_active"]
    list_filter = ["is_staff", "is_active"]
    search_fields = ["codigo", "nombre"]
    ordering = ["codigo"]
    fieldsets = (
        (None, {"fields": ("codigo", "password")}),
        ("Información personal", {"fields": ("nombre", "idioma", "pais")}),
        (
            "Permisos",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Fechas", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("codigo", "password1", "password2"),
            },
        ),
    )
    readonly_fields = ["date_joined"]


class FacturaLineaInline(admin.TabularInline):
    model = FacturaLinea
    extra = 0
    readonly_fields = [
        "producto",
        "codigo_producto",
        "cantidad",
        "reciclaje",
        "petroleo",
        "grasa",
        "ivu",
        "costo",
        "total",
    ]
    can_delete = False


@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ["id", "empleado", "fecha_hora", "usuario"]
    inlines = [FacturaLineaInline]


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ["codigo", "categoria", "factor", "costo", "creado_por", "creado_en"]
    list_filter = ["categoria"]
    search_fields = ["codigo"]


admin.site.register(Usuario, UsuarioAdmin)
