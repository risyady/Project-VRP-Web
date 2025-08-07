# Project VRP Web

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=vuedotjs&logoColor=black" alt="Pinia">
</p>

A web-based admin panel for managing and visualizing solutions to the Vehicle Routing Problem (VRP). This application serves as an interface for the VRP solver backend, allowing administrators to manage courier and package data and run optimizations to determine the most efficient delivery routes.

## ✨ Key Features

- **User Authentication**: Secure login system for administrators.
- **Courier Management**: CRUD (Create, Read, Update, Delete) operations for courier data.
- **Package Management**: CRUD operations for package data to be shipped.
- **Route Optimization**: Execute VRP optimization processes via API and receive the results.
- **Map Visualization**: Display depot locations, customers (packages), and optimized routes on an interactive map.

## 🚀 Tech Stack

- **Framework**: [Vue.js 3](https://vuejs.org/) (with Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Linting & Formatting**: ESLint & Prettier

## 📋 Prerequisites

Before you begin, make sure you have the following software installed:
- [Node.js](https://nodejs.org/en/) (v18.x or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- The VRP Solver backend API must be running.

## ⚙️ Installation & Configuration

Follow these steps to run this project in your local environment.

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/risyady/Project-VRP-Web.git
    cd Project-VRP-Web
    ```

2.  **Install project dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Copy the `.envcopy` file into a new file named `.env`.
    ```bash
    cp .envcopy .env
    ```
    Then, open the `.env` file and adjust the values as needed.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will run and can be accessed at `http://localhost:5173` (or another available port).

5.  **Build for Production:**
    To create the production version of the application, run the following command:
    ```bash
    npm run build
    ```
    This command will create a `dist` directory containing all the static files ready for deployment.

## 📄 Environment Variables

This project requires several environment variables to run correctly. Make sure your `.env` file has the following keys:

- `VITE_API_BASE_URL`: The base URL of the VRP Solver API backend.
  Example: `http://localhost:5000/api/v1`

- `VITE_DEPOT_COORDS`: Geographical coordinates (latitude, longitude) of the main depot or warehouse. These coordinates are used as the starting and ending points for all routes.  
  Example: `-0.922474,100.445834`

---