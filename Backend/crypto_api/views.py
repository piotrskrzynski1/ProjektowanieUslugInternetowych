from django.shortcuts import render

# Create your views here.
import requests
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from .models import WatchlistItem
from .serializers import WatchlistItemSerializer, UserSerializer, RegisterSerializer

# authorizacja i rejestracja
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
        if not user:
            return Response({'detail': 'Nieprawidłowy login lub hasło'}, status=400)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {'access': str(refresh.access_token), 'refresh': str(refresh)}
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {'access': str(refresh.access_token), 'refresh': str(refresh)}
            }, status=201)
        return Response(serializer.errors, status=400)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass
        return Response(status=204)

# --- WATCHLIST CRUD & COINGECKO ---
class WatchlistViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WatchlistItemSerializer

    def get_queryset(self):
        return WatchlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        db_data = serializer.data

        if not db_data:
            return Response({"watchlist": []})

        coin_ids = ",".join([item['coin_id'] for item in db_data])
        cg_url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={coin_ids}"
        
        try:
            market_data = requests.get(cg_url, timeout=5).json()
            market_dict = {coin['id']: coin for coin in market_data}
        except:
            market_dict = {}

        for item in db_data:
            item['market'] = market_dict.get(item['coin_id'])

        return Response({"watchlist": db_data})

# wyszukiwanie monet przez CoinGecko API
class CoinSearchView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        query = request.query_params.get('search', '')
        if not query:
            return Response({'coins': []})
        
        url = f"https://api.coingecko.com/api/v3/search?query={query}"
        try:
            data = requests.get(url, timeout=5).json()
            # Форматируем под интерфейс AvailableCoin на фронте
            coins = [{'id': c['id'], 'symbol': c['symbol'], 'name': c['name'], 'image': c['thumb']} for c in data.get('coins', [])[:10]]
            return Response({'coins': coins})
        except:
            return Response({'coins': []})