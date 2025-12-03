# Music Picker (音乐挑选器)

Music Picker is a web application designed to analyze audio files and online audio links to determine their suitability as office nap wake-up music. It quantitatively evaluates music based on various audio features to ensure a perfect balance between energy and comfort, helping you wake up refreshed without being jarred.

Music Picker 是一个网络应用程序，旨在分析音频文件和在线音频链接，以确定其作为办公室午休唤醒音乐的适用性。它根据各种音频特征对音乐进行量化评估，以确保能量与舒适度之间的完美平衡，帮助您清醒醒来而不会感到刺耳。

## Glance （一瞥）
<img width="2152" height="3602" alt="image" src="https://github.com/user-attachments/assets/7c036916-e51a-4c20-a779-85546e764ea8" />

<img width="2156" height="3598" alt="image" src="https://github.com/user-attachments/assets/a696eb6b-77ed-47f5-890e-40c063bda9c7" />


## ✨ Features (功能特性)

*   **Audio Analysis (音频分析)**:
    *   Analyzes **BPM (Tempo)**, **RMS Energy**, **Spectral Centroid (Brightness)**, **Zero Crossing Rate (Noisiness)**, and **Onset Strength (Impact)**.
    *   分析 **BPM (节奏)**、**RMS 能量**、**频谱质心 (亮度)**、**过零率 (噪度)** 和 **起始强度 (冲击力)**。
*   **Suitability Scoring (适用性评分)**:
    *   Provides a 0-10 score indicating how suitable the track is for waking up.
    *   提供 0-10 分的评分，指示曲目作为唤醒音乐的适用程度。
*   **Detailed Visualization (详细可视化)**:
    *   Displays analysis results using an intuitive Radar Chart.
    *   使用直观的雷达图展示分析结果。
*   **Bilingual Support (双语支持)**:
    *   Fully localized interface in English and Chinese.
    *   完全本地化的中英文界面。
*   **URL Support (链接支持)**:
    *   Analyze local files or audio from direct URLs.
    *   支持分析本地文件或直接 URL 链接的音频。
*   **Recommendations (音乐推荐)**:
    *   Suggests alternative tracks if the uploaded audio is not suitable.
    *   如果上传的音频不合适，会推荐替代曲目。
*   **History Tracking (历史记录)**:
    *   Keeps a temporary session history of your analyzed tracks.
    *   保留您分析过的曲目的临时会话历史记录。

## 🛠️ Tech Stack (技术栈)

### Frontend (前端)
*   **Framework**: [Next.js](https://nextjs.org/) (React)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **State Management**: React Context API

### Backend (后端)
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **Audio Processing**: [Librosa](https://librosa.org/), NumPy, SciPy
*   **Server**: Uvicorn

## 🚀 Getting Started (快速开始)

### Prerequisites (先决条件)
*   Node.js (v18+)
*   Python (v3.8+)

### 1. Clone the Repository (克隆仓库)
```bash
git clone https://github.com/thatscode/MusicPicker.git
cd MusicPicker
```

### 2. Backend Setup (后端设置)
Navigate to the backend directory and set up the Python environment.
进入后端目录并设置 Python 环境。

```bash
cd backend

# Create a virtual environment (创建虚拟环境)
python -m venv venv

# Activate the virtual environment (激活虚拟环境)
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies (安装依赖)
pip install -r requirements.txt

# Run the server (运行服务器)
uvicorn main:app --reload --port 8000
```
The backend API will be available at `http://localhost:8000`.
后端 API 将在 `http://localhost:8000` 上运行。

### 3. Frontend Setup (前端设置)
Open a new terminal, navigate to the frontend directory, and start the development server.
打开一个新的终端，进入前端目录，并启动开发服务器。

```bash
cd frontend

# Install dependencies (安装依赖)
npm install

# Run the development server (运行开发服务器)
npm run dev
```
The application will be available at `http://localhost:3000`.
应用程序将在 `http://localhost:3000` 上运行。

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
