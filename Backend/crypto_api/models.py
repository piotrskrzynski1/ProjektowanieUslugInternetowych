from django.db import models

# Create your models here.
import uuid
from django.contrib.auth.models import User

class WatchlistItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    coin_id = models.CharField(max_length=100)
    notes = models.TextField(blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'coin_id')
        ordering = ['-added_at']