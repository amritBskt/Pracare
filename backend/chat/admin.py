from django.contrib import admin
from .models import ChatMessage, ChatSession   # example model

admin.site.register(ChatMessage)
admin.site.register(ChatSession)