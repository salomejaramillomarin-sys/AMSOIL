from django.core.management.base import BaseCommand

from core.models import Usuario


class Command(BaseCommand):
    help = "Crea un usuario de prueba (codigo=admin, password=admin123) si no existe."

    def handle(self, *args, **options):
        codigo = "admin"
        password = "admin123"

        if Usuario.objects.filter(codigo=codigo).exists():
            self.stdout.write(self.style.WARNING(f"El usuario '{codigo}' ya existe, no se crea de nuevo."))
            return

        Usuario.objects.create_superuser(codigo=codigo, password=password, nombre="Administrador")
        self.stdout.write(self.style.SUCCESS(f"Usuario de prueba creado: codigo='{codigo}' password='{password}'"))
