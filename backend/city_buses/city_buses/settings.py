

from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url
from pathlib import Path


load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")



DEBUG = True

ALLOWED_HOSTS = []



INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'rest_framework',
    'api',
    'stops',
    'bus_route_number',
    'route_stops',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'corsheaders.middleware.CorsMiddleware',   
    
]

ROOT_URLCONF = 'city_buses.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'city_buses.wsgi.application'



DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL')
    )
}

DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'

# GDAL_LIBRARY_PATH = os.path.join(BASE_DIR, 'venv', 'Lib', 'site-packages', 'osgeo', 'gdal.dll')
GEOS_LIBRARY_PATH = os.getenv("GEOS_LIBRARY_PATH")#r'C:\Users\samar\Infosys\city_bus_app\backend\venv\Lib\site-packages\osgeo\geos_c.dll'
GDAL_LIBRARY_PATH = os.getenv("GDAL_LIBRARY_PATH")#r'C:\Users\samar\Infosys\city_bus_app\backend\venv\Lib\site-packages\osgeo\gdal.dll'
# GEOS_LIBRARY_PATH = r'D:\project1\city_bus_app\backend\venv\Lib\site-packages\osgeo\geos_c.dll'
# GDAL_LIBRARY_PATH = r'D:\project1\city_bus_app\backend\venv\Lib\site-packages\osgeo\gdal.dll'


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True



STATIC_URL = 'static/'
CORS_ALLOW_ALL_ORIGINS = True
