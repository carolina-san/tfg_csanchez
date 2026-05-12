# 🌍 Dashboard 3D para la monitorización de La Laguna de Torrevieja

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

> **Trabajo Fin de Grado (TFG)** - Grado en Ingeniería Multimedia  
> **Escuela Politécnica Superior** - Universidad de Alicante (Mayo 2026)  
> **Autor:** Carolina Sánchez Abad  
> **Tutores:** Jose García Rodríguez y David Mulero Pérez

---

## 📖 Descripción del Proyecto

Este proyecto consiste en una **Single Page Application (SPA)** interactiva que funciona como un **Gemelo Digital (Digital Twin)** del ecosistema del Parque Natural de las Lagunas de La Mata y Torrevieja. 

Su objetivo principal es facilitar la gestión técnica del parque y la toma de decisiones por parte de biólogos, ambientólogos y la Administración Pública. Para ello, el sistema visualiza datos ambientales (temperatura, ruido y humedad) recolectados en tiempo real por una red de sensores IoT (proyecto Chan-Twin), integrándolos sobre un mapa interactivo en 3D del terreno.

La interfaz destaca por ser intuitiva, accesible y minimalista, evitando la complejidad habitual de los Sistemas de Información Geográfica (SIG) tradicionales, y permitiendo analizar grandes volúmenes de datos mediante mapas de calor dinámicos y gráficas detalladas.

## ✨ Funcionalidades Principales

*   🗺️ **Visor 3D Interactivo:** Representación topográfica del parque utilizando una malla 3D optimizada.
*   📍 **Geoposicionamiento de Sensores:** Marcadores interactivos ubicados de forma precisa sobre el terreno 3D adaptándose al relieve de la laguna.
*   📊 **Datos en Tiempo Real e Históricos:** Visualización del último valor registrado por cada sensor y exploración de su evolución a través de gráficas interactivas.
*   🌡️ **Mapas de Calor (Heatmaps) Dinámicos:** Generación en tiempo real de mapas de calor interpolados (mediante el algoritmo de Ponderación Inversa a la Distancia - IDW) que se proyectan de forma dinámica sobre la topografía 3D.
*   📈 **Análisis y Comparativa de Datos:** Panel analítico avanzado con gráficas de líneas y barras que permite filtrar por sensor, explorar rangos de fechas personalizados y comparar diferentes métricas en el tiempo.
*   ♿ **Accesibilidad Inclusiva:** Diseño *responsive*, modo claro/oscuro y cumplimiento del nivel AA de las directrices WCAG 2.1 (incluyendo soporte para lectores de pantalla mediante etiquetas semánticas y ARIA).

## 🛠️ Tecnologías Utilizadas

### Frontend & Interfaz
*   **React** + **TypeScript**: Motor y lógica de la aplicación bajo una arquitectura basada en componentes.
*   **Tailwind CSS**: Estilos de utilidad, diseño responsive y maquetación de la guía de estilo.
*   **Recharts**: Visualización de datos vectoriales (gráficas de evolución y comparativas).

### Entorno 3D
*   **Three.js** & **React Three Fiber (R3F)**: Renderizado y gestión declarativa de la escena 3D y *raycasting*.
*   **@react-three/drei**: Utilidades avanzadas para la escena, controles de cámara (*OrbitControls*) y carga de modelos.

### Gestión de Datos & Build
*   **SWR**: Gestión del estado global asíncrono y caché en base al patrón *Stale-While-Revalidate*.
*   **Axios**: Consumo eficiente de la API REST externa de sensores.
*   **Vite**: Empaquetador extremadamente rápido con *Hot Module Replacement* (HMR).

### Herramientas de Modelado (Fase de Diseño)
*   **QGIS**: Extracción de datos geoespaciales y procesamiento de los Modelos Digitales del Terreno (MDT).
*   **Blender**: Corrección topológica, reducción poligonal, mapeo UV y exportación final del modelo 3D (`.glb`).

## 📁 Arquitectura del Proyecto

El proyecto sigue una arquitectura modular estricta que separa la lógica de negocio de la interfaz visual gráfica:

```text
src/
├── components/     # Componentes de UI modulares y reutilizables
│   ├── charts/     # Gráficas (EvolutionChart, ComparisonChart...)
│   ├── map/        # Entorno 3D, proyecciones y marcadores (Map, Heatmap...)
│   ├── sensor/     # Componentes y paneles informativos del sensor
│   └── ui/         # Componentes base, botones y diseño layout
├── hooks/          # Hooks personalizados (ej. useSensorData para gestión reactiva)
├── pages/          # Vistas principales de la SPA (Dashboard y Datos)
└── services/       # Capa de servicio y comunicación HTTP (sensor-service.ts)
```

## 🚀 Instalación y Ejecución Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/3dperceptionlab/tfg_csanchez.git
    cd tfg_csanchez
    ```

2.  **Instalar las dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    *La aplicación de desarrollo estará disponible típicamente en `http://localhost:5173`.*

4.  **Generar la versión optimizada de producción (build):**
    ```bash
    npm run build
    npm run preview
    ```

## 📄 Créditos y Licencia

Este proyecto ha sido íntegramente desarrollado por **Carolina Sánchez Abad** como Trabajo Fin de Grado en la **Escuela Politécnica Superior** de la **Universidad de Alicante**, bajo la supervisión y tutorización de **Jose García Rodríguez** y **David Mulero Pérez** (Departamento de Tecnología Informática y Computación).

Se agradece de manera especial al proyecto **Chan-Twin** y a la plataforma **Sensing Tools** la provisión de los datos subyacentes recolectados por su red de sensores ambientales IoT en el Parque Natural.
