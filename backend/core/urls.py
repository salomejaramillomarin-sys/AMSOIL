from django.urls import path

from . import views

urlpatterns = [
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("productos/", views.ProductoListCreateView.as_view(), name="productos-list"),
    path("productos/<str:codigo>/", views.ProductoDetailView.as_view(), name="productos-detail"),
    path("facturas/", views.FacturaListCreateView.as_view(), name="facturas-list"),
    path("facturas/<int:pk>/", views.FacturaDetailView.as_view(), name="facturas-detail"),
    path("ajustes/", views.AjustesView.as_view(), name="ajustes"),
]
