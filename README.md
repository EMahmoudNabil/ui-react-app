# 🛠️ Product Management Frontend (React + MUI + TypeScript)

This is the frontend for a product management application built with **React**, **TypeScript**, **Material UI (MUI)**, and **React Query**. It allows users to manage products and their associated components in an interactive and responsive RTL interface.

---

## 🚀 Features

* ✅ Add, update, and select products
* ✅ Add and manage components for each product
* ✅ RTL support for Arabic interface
* ✅ Responsive design with Material UI
* ✅ Efficient data fetching with React Query

---

## 🧰 Tech Stack

* React + TypeScript
* Material UI (MUI)
* React Query
* Emotion (with stylis-plugin-rtl)
* JSS (with jss-rtl)
* Axios

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/product-management-frontend.git

# 2. Navigate to the project folder
cd product-management-frontend

# 3. Install dependencies
npm install
```

---

## ▶️ Run the App

```bash
npm run dev     # For Vite
# OR
npm start       # For Create React App (if used)
```

---

## 📁 Project Structure

```
src/
├── api/              # API integration (products, components)
├── components/       # Reusable UI components
├── pages/            # Main pages (e.g., ProductPage)
├── types/            # TypeScript type definitions
├── App.tsx           # App entry point
├── main.tsx          # Vite or CRA main entry
```

---

## 🌐 RTL Configuration

RTL support is implemented using:

* `@emotion/react`
* `@emotion/cache`
* `stylis-plugin-rtl`
* `jss-rtl`

Theme is customized using MUI's `createTheme()` with direction set to `rtl`.

---

## 🌍 Backend Integration

Make sure your backend API is running at:

```
http://localhost:7022/api
```

You can update the base URL in `src/api/axios.ts` if needed.

---

## 📮 Notes

* CORS must be enabled on the backend.
* Authentication is not included in this frontend.

---

## 👨‍💻 Author

* Name: Mahmoud Nabil Rashad
* Email: [your-email@example.com](mailto:e.mahmoudnabil@gmail.com)
* LinkedIn: [linkedin.com/in/mahmoud-nabil](https://www.linkedin.com/in/mahmoud-nabil)

---

## 📄 License

This project is licensed under the MIT License.
